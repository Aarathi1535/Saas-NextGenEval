
import React, { useState, useEffect } from 'react';
import FileUpload from './components/FileUpload';
import EvaluationReportView from './components/EvaluationReportView';
import Dashboard from './components/Dashboard';
import Auth from './components/Auth';
import { UploadedFile, EvaluationReport, HistoryItem, UserProfile } from './types';
import { evaluateAnswerSheet } from './services/geminiService';
import { supabase } from './supabase';

const MAX_FILE_SIZE_MB = 3;
const ADMIN_EMAIL = 'aarshiv.ai@gmail.com';

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

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (session?.user) {
        // Special check for Creator/Admin
        const isAdmin = session.user.email === ADMIN_EMAIL;
        
        const { data: profile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', session.user.id)
          .single();
        
        if (profile) {
          // Sync admin role if email matches even if DB is different
          const finalProfile = isAdmin ? { ...profile, role: 'admin' as const } : profile;
          setCurrentProfile(finalProfile);
          fetchHistory(profile.id);
        }
      } else {
        setCurrentProfile(null);
        setHistory([]);
      }
      setIsAuthLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchHistory = async (userId: string) => {
    const { data } = await supabase
      .from('evaluations')
      .select('*')
      .eq('institution_id', userId)
      .order('timestamp', { ascending: false });
    
    if (data) {
      setHistory(data.map(item => ({
        ...item,
        report: typeof item.report === 'string' ? JSON.parse(item.report) : item.report
      })));
    }
  };

  const handleFileSelection = (files: File[], setter: React.Dispatch<React.SetStateAction<UploadedFile[]>>) => {
    const newFiles = files.map(file => {
      const isTooLarge = file.size > MAX_FILE_SIZE_MB * 1024 * 1024;
      return {
        file,
        preview: URL.createObjectURL(file),
        progress: isTooLarge ? 0 : 100,
        status: isTooLarge ? 'error' as const : 'complete' as const
      };
    });
    setter(prev => [...prev, ...newFiles]);
  };

  const processEvaluation = async () => {
    if (!currentProfile) return;
    if (qpFiles.length === 0 || studentFiles.length === 0) {
      setError("CRITICAL: Mandatory documents (Question Paper + Student Scripts) missing.");
      return;
    }

    if (currentProfile.credits <= 0 && currentProfile.email !== ADMIN_EMAIL) {
      setError("EXHAUSTED: Zero credits remaining. Contact administrator.");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const toBase64 = (file: File): Promise<string> => new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = error => reject(error);
      });

      const qpB64 = await Promise.all(qpFiles.map(f => toBase64(f.file)));
      const keyB64 = await Promise.all(keyFiles.map(f => toBase64(f.file)));
      const studentB64 = await Promise.all(studentFiles.map(f => toBase64(f.file)));

      const report = await evaluateAnswerSheet(qpB64, keyB64, studentB64);
      setCurrentReport(report);

      const { error: saveError } = await supabase.from('evaluations').insert({
        institution_id: currentProfile.id,
        timestamp: Date.now(),
        report,
        pages_processed: qpFiles.length + keyFiles.length + studentFiles.length
      });

      if (saveError) throw saveError;

      // Deduct credit only if not admin
      if (currentProfile.email !== ADMIN_EMAIL) {
          const newCredits = currentProfile.credits - 1;
          await supabase.from('profiles').update({
            credits: newCredits,
            totalEvaluations: currentProfile.totalEvaluations + 1,
            freeTrialUsed: true
          }).eq('id', currentProfile.id);
          setCurrentProfile({ ...currentProfile, credits: newCredits, totalEvaluations: currentProfile.totalEvaluations + 1 });
      } else {
          setCurrentProfile({ ...currentProfile, totalEvaluations: currentProfile.totalEvaluations + 1 });
      }

      fetchHistory(currentProfile.id);
      setViewMode('report');
    } catch (err: any) {
      setError(err.message || "ENGINE_ERROR: Institutional processing failure.");
    } finally {
      setIsLoading(false);
    }
  };

  const deleteReport = async (id: string) => {
    const { error } = await supabase.from('evaluations').delete().eq('id', id);
    if (!error && currentProfile) {
      fetchHistory(currentProfile.id);
    }
  };

  if (isAuthLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-black">
        <div className="w-12 h-12 border-2 border-t-[#00ff9d] border-transparent rounded-full animate-spin mb-4"></div>
        <p className="text-[10px] font-black uppercase tracking-[0.6em] text-[#00ff9d] animate-pulse">Initializing Security Protocol</p>
      </div>
    );
  }

  if (!currentProfile) {
    return <Auth />;
  }

  return (
    <div className="min-h-screen bg-black text-white selection:bg-[#00ff9d] selection:text-black">
      <div className="scanline"></div>
      
      {/* High-fidelity Pro Navbar */}
      <nav className="glass-nav sticky top-0 z-50 no-print">
        <div className="max-w-[1440px] mx-auto px-8 h-20 flex items-center justify-between">
          <div className="flex items-center gap-5 cursor-pointer group" onClick={() => setViewMode('uploader')}>
            <div className="w-10 h-10 bg-[#00ff9d] rounded-sm flex items-center justify-center text-black font-black text-xl shadow-[0_0_20px_rgba(0,255,157,0.4)] transition-all">N</div>
            <div>
              <h1 className="text-xl font-bold tracking-tight">NEXTGEN<span className="text-[#00ff9d]">EVAL</span></h1>
              <div className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-[#00ff9d] animate-pulse"></div>
                <p className="text-[8px] text-[#00ff9d] font-black uppercase tracking-[0.4em]">PRO_SYSTEM</p>
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-10">
            <div className="hidden lg:flex gap-1">
              <button 
                onClick={() => setViewMode('uploader')}
                className={`px-5 py-2 text-[10px] font-black uppercase tracking-widest rounded transition-all ${viewMode === 'uploader' || viewMode === 'report' ? 'text-[#00ff9d] border-b-2 border-[#00ff9d]' : 'text-zinc-500 hover:text-white'}`}
              >
                EVALUATION
              </button>
              <button 
                onClick={() => setViewMode('dashboard')}
                className={`px-5 py-2 text-[10px] font-black uppercase tracking-widest rounded transition-all ${viewMode === 'dashboard' ? 'text-[#00ff9d] border-b-2 border-[#00ff9d]' : 'text-zinc-500 hover:text-white'}`}
              >
                VAULT
              </button>
            </div>
            
            <div className="flex items-center gap-6 border-l border-[#1a1a1a] pl-8">
              <div className="text-right hidden sm:block">
                <p className="text-[10px] font-bold text-white uppercase">{currentProfile.name}</p>
                <p className="text-[9px] text-[#00ff9d] font-black tracking-widest">CREDITS: {currentProfile.credits}</p>
              </div>
              <button 
                onClick={() => supabase.auth.signOut()}
                className="w-10 h-10 rounded-sm border border-[#1a1a1a] hover:bg-red-500/10 hover:border-red-500 hover:text-red-500 transition-all flex items-center justify-center text-zinc-600"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
              </button>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-[1440px] mx-auto px-8 py-16">
        {viewMode === 'uploader' && (
          <div className="animate-in fade-in slide-in-from-bottom-12 duration-1000">
            <div className="mb-20">
               <span className="text-[10px] font-black text-[#00ff9d] uppercase tracking-[0.5em] mb-4 block">INSTITUTIONAL GRADE EVALUATION</span>
               <h2 className="text-6xl lg:text-8xl font-black tracking-tighter mb-8 leading-[0.9]">
                 AUTOMATE <br /> <span className="text-[#00ff9d] neon-text">EVERY SCRIPT.</span>
               </h2>
               <div className="max-w-xl h-1 bg-[#1a1a1a] rounded-full overflow-hidden">
                 <div className="h-full bg-[#00ff9d] w-24 neon-glow"></div>
               </div>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-12 gap-12 items-start">
              <div className="xl:col-span-8 space-y-12">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                  <FileUpload label="QUESTION PAPER" files={qpFiles} onFilesSelected={(f) => handleFileSelection(f, setQpFiles)} required />
                  <FileUpload label="ANSWER KEY" files={keyFiles} onFilesSelected={(f) => handleFileSelection(f, setKeyFiles)} />
                </div>
                <FileUpload label="STUDENT ANSWER SHEETS" files={studentFiles} onFilesSelected={(f) => handleFileSelection(f, setStudentFiles)} required />
              </div>

              <div className="xl:col-span-4 sticky top-32">
                <div className="pro-card p-10 rounded-sm">
                  <h3 className="text-[10px] font-black uppercase tracking-[0.3em] mb-10 text-zinc-500">SYSTEM_SUMMARY</h3>
                  <div className="space-y-6 mb-12">
                    <div className="flex justify-between items-center py-3 border-b border-[#1a1a1a]">
                      <span className="text-[9px] font-bold text-zinc-500 uppercase">BATCH_SIZE</span>
                      <span className="text-[11px] font-black text-white">{studentFiles.length} SCRIPTS</span>
                    </div>
                    <div className="flex justify-between items-center py-3 border-b border-[#1a1a1a]">
                      <span className="text-[9px] font-bold text-zinc-500 uppercase">COMPUTE_COST</span>
                      <span className="text-[11px] font-black text-[#00ff9d]">1 CREDIT</span>
                    </div>
                    <div className="flex justify-between items-center py-3 border-b border-[#1a1a1a]">
                      <span className="text-[9px] font-bold text-zinc-500 uppercase">LATENCY_EST</span>
                      <span className="text-[11px] font-black text-white">~15 SEC</span>
                    </div>
                  </div>

                  {error && (
                    <div className="mb-8 p-4 bg-red-500/10 border border-red-500/30 text-red-500 text-[10px] font-black uppercase tracking-widest animate-shake">
                      {error}
                    </div>
                  )}

                  <button 
                    onClick={processEvaluation}
                    disabled={isLoading || qpFiles.length === 0 || studentFiles.length === 0}
                    className={`w-full py-6 rounded-sm btn-pro text-[11px] ${isLoading || qpFiles.length === 0 || studentFiles.length === 0 ? 'opacity-20 grayscale cursor-not-allowed' : ''}`}
                  >
                    {isLoading ? (
                      <div className="flex items-center justify-center gap-3">
                        <div className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin"></div>
                        CORE_PROCESSING...
                      </div>
                    ) : (
                      'EXECUTE EVALUATION'
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {viewMode === 'dashboard' && (
          <Dashboard 
            history={history} 
            profile={currentProfile}
            onViewReport={(item) => { setCurrentReport(item.report); setViewMode('report'); }}
            onDeleteReport={deleteReport}
            onNewEvaluation={() => setViewMode('uploader')}
          />
        )}

        {viewMode === 'report' && currentReport && (
          <EvaluationReportView report={currentReport} onReset={() => setViewMode('uploader')} />
        )}
      </main>

      <footer className="py-24 border-t border-[#1a1a1a] text-center no-print">
        <div className="flex flex-col items-center gap-4">
          <p className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.4em]">
            Developed from the minds of <span className="text-[#00ff9d] neon-text">Aarshiv.ai</span>
          </p>
          <p className="text-[8px] font-bold text-zinc-800 uppercase tracking-[0.8em]">
            NEXTGENEVAL • INSTITUTIONAL CORE v2.5 • © 2024
          </p>
        </div>
      </footer>
    </div>
  );
};

export default App;
