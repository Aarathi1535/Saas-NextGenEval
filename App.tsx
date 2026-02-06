
import React, { useState, useEffect } from 'react';
import FileUpload from './components/FileUpload';
import EvaluationReportView from './components/EvaluationReportView';
import Dashboard from './components/Dashboard';
import Auth from './components/Auth';
import { UploadedFile, EvaluationReport, HistoryItem, UserProfile } from './types';
import { evaluateAnswerSheet } from './services/geminiService';
import { supabase } from './supabase';

const MAX_FILE_SIZE_MB = 3;

type ViewMode = 'uploader' | 'dashboard' | 'report';

const App: React.FC = () => {
  const [currentProfile, setCurrentProfile] = useState<UserProfile | null>(null);
  const [isAuthLoading, setIsAuthLoading] = useState(true);
  const [viewMode, setViewMode] = useState<ViewMode>('uploader');
  const [qpFiles, setQpFiles] = useState<UploadedFile[]>([]);
  const [keyFiles, setKeyFiles] = useState<UploadedFile[]>([]);
  const [studentFiles, setStudentFiles] = useState<UploadedFile[]>([]);
  
  const [isLoading, setIsLoading] = useState(false);
  const [currentReport, setCurrentReport] = useState<EvaluationReport | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [history, setHistory] = useState<HistoryItem[]>([]);

  // Auth State Listener
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.debug("NextGenEval Auth Event:", event);
      if (session?.user) {
        setIsAuthLoading(true);
        await fetchProfile(session.user.id);
      } else {
        setCurrentProfile(null);
        setHistory([]);
        setIsAuthLoading(false);
      }
    });

    const checkInitialSession = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user) {
          await fetchProfile(session.user.id);
        } else {
          setIsAuthLoading(false);
        }
      } catch (err) {
        console.error("Session check error:", err);
        setIsAuthLoading(false);
      }
    };
    
    checkInitialSession();

    return () => subscription.unsubscribe();
  }, []);

  const fetchProfile = async (userId: string, retries = 5) => {
    try {
      const { data, error: fetchError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .maybeSingle();
      
      if (fetchError) throw fetchError;

      if (!data) {
        if (retries > 0) {
          console.debug(`Profile pending for ${userId}, retrying in 1s...`);
          await new Promise(resolve => setTimeout(resolve, 1000));
          return fetchProfile(userId, retries - 1);
        }
        // If still not found, we might need the user to re-login or check Auth.tsx logic
        console.warn("Profile record not found after retries.");
        setIsAuthLoading(false);
        return;
      }
      
      setCurrentProfile(data);
      await fetchHistory(userId);
    } catch (err) {
      console.error("Profile fetch sequence failed:", err);
    } finally {
      setIsAuthLoading(false);
    }
  };

  const fetchHistory = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('evaluations')
        .select('*')
        .eq('institution_id', userId)
        .order('timestamp', { ascending: false });
      if (error) throw error;
      setHistory(data || []);
    } catch (err) {
      console.error("History fetch error:", err);
    }
  };

  const handleLogout = async () => {
    setIsAuthLoading(true);
    await supabase.auth.signOut();
  };

  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = (err) => reject(err);
    });
  };

  const simulateProgress = async (fileId: string, type: 'qp' | 'key' | 'student') => {
    const updateProgress = (p: number) => {
      const updater = (prev: UploadedFile[]): UploadedFile[] => 
        prev.map(f => f.file.name === fileId ? { 
          ...f, 
          progress: p, 
          status: (p === 100 ? 'complete' : 'uploading') as any 
        } : f);
      
      if (type === 'qp') setQpFiles(updater);
      else if (type === 'key') setKeyFiles(updater);
      else setStudentFiles(updater);
    };

    for (let p = 0; p <= 100; p += 25) {
      updateProgress(p);
      await new Promise(r => setTimeout(r, 60));
    }
  };

  const handleFileSelection = (type: 'qp' | 'key' | 'student') => async (files: File[]) => {
    setError(null);
    const validFiles = files.filter(f => {
      if (f.size > MAX_FILE_SIZE_MB * 1024 * 1024) {
        setError(`"${f.name}" exceeds ${MAX_FILE_SIZE_MB}MB.`);
        return false;
      }
      return true;
    });

    const newFiles = await Promise.all(validFiles.map(async (file) => {
      const preview = await fileToBase64(file);
      return { file, preview, progress: 0, status: 'uploading' as const };
    }));

    if (type === 'qp') setQpFiles(prev => [...prev, ...newFiles]);
    if (type === 'key') setKeyFiles(prev => [...prev, ...newFiles]);
    if (type === 'student') setStudentFiles(prev => [...prev, ...newFiles]);

    newFiles.forEach(f => simulateProgress(f.file.name, type));
  };

  const runEvaluation = async () => {
    if (!currentProfile) return;
    if (qpFiles.length === 0 || studentFiles.length === 0) {
      setError("Input Error: Mandatory Question Paper & Student Sheets required.");
      return;
    }

    if (currentProfile.credits < studentFiles.length) {
      setError(`Insufficient Credits: Batch requires ${studentFiles.length} credits. You have ${currentProfile.credits}.`);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const qpBase64 = qpFiles.map(f => f.preview);
      const keyBase64 = keyFiles.map(f => f.preview);
      const studentBase64 = studentFiles.map(f => f.preview);

      const result = await evaluateAnswerSheet(qpBase64, keyBase64, studentBase64);
      
      const { data, error: dbError } = await supabase.from('evaluations').insert({
        institution_id: currentProfile.id,
        timestamp: Date.now(),
        report: result,
        pages_processed: studentFiles.length
      }).select().single();

      if (dbError) throw dbError;

      const { error: creditError } = await supabase.from('profiles').update({
        credits: currentProfile.credits - studentFiles.length,
        totalEvaluations: currentProfile.totalEvaluations + studentFiles.length,
        freeTrialUsed: true
      }).eq('id', currentProfile.id);

      if (creditError) console.warn("Credit update failed", creditError);

      setHistory(prev => [data, ...prev]);
      setCurrentProfile({
        ...currentProfile, 
        credits: currentProfile.credits - studentFiles.length,
        totalEvaluations: currentProfile.totalEvaluations + studentFiles.length,
        freeTrialUsed: true
      });
      setCurrentReport(result);
      setViewMode('report');
    } catch (err: any) {
      setError(err.message || "An institutional evaluation error occurred. Please retry.");
    } finally {
      setIsLoading(false);
    }
  };

  const startNew = () => {
    setQpFiles([]);
    setKeyFiles([]);
    setStudentFiles([]);
    setCurrentReport(null);
    setViewMode('uploader');
    setError(null);
  };

  if (isAuthLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 bg-indigo-600 rounded-2xl flex items-center justify-center text-white font-black text-3xl mx-auto shadow-xl shadow-indigo-100 animate-pulse">N</div>
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">Institutional Verification in Progress...</p>
        </div>
      </div>
    );
  }

  if (!currentProfile) {
    return <Auth />;
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 selection:bg-indigo-500/30 flex flex-col overflow-x-hidden">
      <nav className="border-b border-slate-200 px-6 sm:px-10 py-4 sm:py-5 flex justify-between items-center sticky top-0 bg-white/80 backdrop-blur-2xl z-50 no-print">
        <div className="flex items-center gap-4 cursor-pointer group" onClick={startNew}>
          <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white font-black text-2xl shadow-lg group-hover:bg-indigo-700 transition-all">N</div>
          <div className="leading-tight">
            <span className="text-xl font-black text-slate-900 block tracking-tighter">NextGenEval</span>
            <span className="text-[10px] text-indigo-600 font-black uppercase tracking-[0.2em]">Institutional SaaS</span>
          </div>
        </div>
        
        <div className="flex items-center gap-6">
          <div className="hidden sm:flex items-center gap-1 p-1 bg-slate-100 rounded-2xl border border-slate-200">
            <button 
              onClick={() => setViewMode('uploader')}
              className={`px-6 py-2 text-[11px] font-black rounded-xl transition-all tracking-wider ${viewMode === 'uploader' || viewMode === 'report' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-900'}`}
            >
              AUDIT
            </button>
            <button 
              onClick={() => setViewMode('dashboard')}
              className={`px-6 py-2 text-[11px] font-black rounded-xl transition-all tracking-wider ${viewMode === 'dashboard' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-900'}`}
            >
              DASHBOARD
            </button>
          </div>
          
          <div className="flex items-center gap-3 sm:pl-6 sm:border-l sm:border-slate-200">
            <div className="text-right hidden sm:block">
              <p className="text-[11px] font-black text-slate-900 uppercase leading-none truncate max-w-[150px]">{currentProfile.name}</p>
              <p className="text-[9px] text-indigo-600 font-black uppercase tracking-widest mt-1">CREDITS: {currentProfile.credits}</p>
            </div>
            <button onClick={handleLogout} className="w-10 h-10 rounded-full bg-slate-100 hover:bg-red-50 hover:text-red-500 transition-all flex items-center justify-center text-slate-400">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
            </button>
          </div>
        </div>
      </nav>

      <main className="flex-grow max-w-6xl mx-auto w-full px-6 sm:px-8 py-10 sm:py-16">
        {viewMode === 'uploader' && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="text-center mb-12 sm:mb-20">
              <h1 className="text-4xl sm:text-6xl font-black text-slate-900 mb-6 tracking-tighter leading-[0.9]">
                Institutional <br /> <span className="text-indigo-600">Grading Hub.</span>
              </h1>
              <p className="text-slate-500 font-medium max-w-xl mx-auto leading-relaxed text-lg sm:text-xl">
                Deploying professional academic criteria to automate high-stakes evaluation across all educational domains.
              </p>
            </div>

            <div className="bg-white shadow-2xl rounded-[48px] p-8 sm:p-16 border border-slate-100 space-y-16">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                <FileUpload label="Question Paper" required files={qpFiles} onFilesSelected={handleFileSelection('qp')} />
                <FileUpload label="Marking Scheme (Optional)" files={keyFiles} onFilesSelected={handleFileSelection('key')} />
              </div>
              
              <FileUpload label="Handwritten Student Scripts" required files={studentFiles} onFilesSelected={handleFileSelection('student')} />

              {error && (
                <div className="p-6 bg-red-50 border border-red-100 rounded-3xl text-red-700 text-sm font-black flex items-center gap-5 animate-shake">
                   <div className="w-12 h-12 bg-red-100 rounded-2xl flex items-center justify-center shrink-0">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                   </div>
                   <div className="flex flex-col">
                      <span className="uppercase tracking-tight">{error}</span>
                   </div>
                </div>
              )}

              <div className="pt-8">
                <button
                  onClick={runEvaluation}
                  disabled={isLoading || qpFiles.length === 0 || studentFiles.length === 0 || currentProfile.credits < studentFiles.length}
                  className={`w-full py-6 sm:py-8 rounded-[32px] font-black text-xl sm:text-2xl transition-all flex items-center justify-center gap-5 shadow-2xl ${
                    isLoading 
                    ? 'bg-slate-100 text-slate-400 cursor-not-allowed' 
                    : 'bg-indigo-600 text-white hover:bg-indigo-700 active:scale-[0.97]'
                  }`}
                >
                  {isLoading ? (
                    <>
                      <div className="w-7 h-7 border-4 border-slate-300 border-t-indigo-600 rounded-full animate-spin"></div>
                      PROCESSING INSTITUTIONAL AUDIT...
                    </>
                  ) : (
                    <>
                      <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="4" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                      INITIATE EVALUATION ({studentFiles.length} SHEETS)
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}

        {viewMode === 'dashboard' && (
          <Dashboard 
            history={history} 
            profile={currentProfile}
            onViewReport={(item) => { setCurrentReport(item.report); setViewMode('report'); }} 
            onDeleteReport={async (id) => {
              const { error } = await supabase.from('evaluations').delete().eq('id', id);
              if (!error) setHistory(prev => prev.filter(item => item.id !== id));
            }}
            onNewEvaluation={startNew}
          />
        )}

        {viewMode === 'report' && currentReport && (
          <EvaluationReportView report={currentReport} onReset={startNew} />
        )}
      </main>

      <footer className="py-24 mt-auto text-center no-print border-t border-slate-100 bg-white/50 px-4">
        <div className="w-16 h-1.5 bg-slate-200 mx-auto mb-10 rounded-full"></div>
        <p className="text-slate-400 text-[11px] font-black uppercase tracking-[0.5em] mb-3">&copy; 2025 NEXTGENEVAL • INSTITUTIONAL AI GRADING SAAS</p>
      </footer>
    </div>
  );
};

export default App;
