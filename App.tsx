
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

  // Auth State Listener to handle session persistence and profile loading
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (session?.user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', session.user.id)
          .single();
        
        if (profile) {
          setCurrentProfile(profile);
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
      setError("Please upload at least the Question Paper and Student Answer Sheet.");
      return;
    }

    if (currentProfile.credits <= 0) {
      setError("Insufficient institutional credits. Please top up.");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // Convert files to base64 for Gemini API processing
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

      // Save evaluation results to Supabase for historical tracking
      const { error: saveError } = await supabase.from('evaluations').insert({
        institution_id: currentProfile.id,
        timestamp: Date.now(),
        report,
        pages_processed: qpFiles.length + keyFiles.length + studentFiles.length
      });

      if (saveError) throw saveError;

      // Deduct institutional credit and update usage statistics
      const newCredits = currentProfile.credits - 1;
      const { error: updateError } = await supabase.from('profiles').update({
        credits: newCredits,
        totalEvaluations: currentProfile.totalEvaluations + 1,
        freeTrialUsed: true
      }).eq('id', currentProfile.id);

      if (updateError) throw updateError;

      setCurrentProfile({ ...currentProfile, credits: newCredits, totalEvaluations: currentProfile.totalEvaluations + 1, freeTrialUsed: true });
      fetchHistory(currentProfile.id);
      setViewMode('report');
    } catch (err: any) {
      console.error("Evaluation error:", err);
      setError(err.message || "Evaluation failed. Please check your files and try again.");
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
    return <div className="min-h-screen flex items-center justify-center bg-slate-50 font-black text-slate-400 uppercase tracking-widest animate-pulse">Initializing Neural Link...</div>;
  }

  if (!currentProfile) {
    return <Auth />;
  }

  return (
    <div className="min-h-screen bg-[#fcfcfd] text-[#001219]">
      {/* Navigation Header */}
      <nav className="bg-white/80 backdrop-blur-md sticky top-0 z-50 border-b border-slate-100 no-print">
        <div className="max-w-7xl mx-auto px-6 sm:px-10 h-20 sm:h-24 flex items-center justify-between">
          <div className="flex items-center gap-3 sm:gap-4 cursor-pointer" onClick={() => setViewMode('uploader')}>
             <div className="w-10 h-10 sm:w-12 sm:h-12 bg-[#001219] rounded-xl flex items-center justify-center text-white font-black text-xl shadow-lg">N</div>
             <div>
                <h1 className="font-black text-lg sm:text-xl tracking-tighter leading-none">NextGenEval</h1>
                <p className="text-[9px] sm:text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">Institutional Grade AI</p>
             </div>
          </div>
          <div className="flex items-center gap-6 sm:gap-10">
             <button 
               onClick={() => setViewMode('dashboard')}
               className={`text-[10px] sm:text-[11px] font-black uppercase tracking-widest transition-all ${viewMode === 'dashboard' ? 'text-[#006a4e]' : 'text-slate-400 hover:text-slate-600'}`}
             >
               Vault
             </button>
             <button 
                onClick={() => supabase.auth.signOut()}
                className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400 hover:text-red-500 hover:bg-red-50 transition-all border border-slate-100"
             >
               <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
             </button>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-6 sm:px-10 py-10 sm:py-16">
        {viewMode === 'uploader' && (
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12 sm:mb-16">
              <h2 className="text-4xl sm:text-5xl font-black tracking-tighter mb-4">Paper Digitization & Scoring</h2>
              <p className="text-slate-400 font-medium text-base sm:text-lg">Deploy professional AI to grade complex academic assessments with institutional accuracy.</p>
            </div>

            {error && (
              <div className="mb-8 p-6 bg-red-50 border border-red-100 rounded-2xl flex items-start gap-4 animate-in fade-in slide-in-from-top-4">
                <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center text-red-600 shrink-0">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                </div>
                <div>
                   <p className="text-[10px] font-black text-red-600 uppercase tracking-widest mb-1">System Error</p>
                   <p className="text-red-700 font-bold text-sm">{error}</p>
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 sm:gap-12 mb-12 sm:mb-16">
              <div className="space-y-8 sm:space-y-12">
                <FileUpload 
                  label="Question Paper (Master)" 
                  files={qpFiles} 
                  onFilesSelected={(f) => handleFileSelection(f, setQpFiles)}
                  required 
                />
                <FileUpload 
                  label="Answer Key (Optional Reference)" 
                  files={keyFiles} 
                  onFilesSelected={(f) => handleFileSelection(f, setKeyFiles)}
                />
              </div>
              <div className="bg-white p-6 sm:p-10 rounded-[32px] border border-slate-100 shadow-xl">
                <FileUpload 
                  label="Student Answer Sheets" 
                  files={studentFiles} 
                  onFilesSelected={(f) => handleFileSelection(f, setStudentFiles)}
                  required 
                />
              </div>
            </div>

            <button 
              onClick={processEvaluation}
              disabled={isLoading || qpFiles.length === 0 || studentFiles.length === 0}
              className={`w-full py-6 sm:py-8 rounded-[24px] sm:rounded-[32px] text-lg sm:text-xl font-black uppercase tracking-[0.3em] transition-all shadow-2xl relative overflow-hidden group ${isLoading || qpFiles.length === 0 || studentFiles.length === 0 ? 'bg-slate-100 text-slate-400 cursor-not-allowed' : 'bg-[#001219] text-white hover:bg-[#006a4e]'}`}
            >
              {isLoading ? (
                <div className="flex items-center justify-center gap-4">
                  <div className="w-6 h-6 border-4 border-white/20 border-t-white rounded-full animate-spin" />
                  ANALYZING SCRIPT...
                </div>
              ) : (
                <div className="flex items-center justify-center gap-4">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                  EXECUTE EVALUATION
                </div>
              )}
            </button>
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
          <EvaluationReportView 
            report={currentReport} 
            onReset={() => setViewMode('uploader')} 
          />
        )}
      </main>

      <footer className="py-12 border-t border-slate-100 text-center no-print">
         <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.4em]">NextGenEval • Secured Institutional Protocol • © 2024</p>
      </footer>
    </div>
  );
};

export default App;
