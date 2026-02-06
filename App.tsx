
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
      setError("Input validation failed: Question Paper and Student Scripts are mandatory.");
      return;
    }

    if (currentProfile.credits <= 0) {
      setError("Zero credits available. Please contact billing for institutional recharge.");
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
      setError(err.message || "Engine failure: Institutional evaluation aborted.");
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
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#050505]">
        <div className="w-16 h-16 border-t-2 border-r-2 border-[#00ff9d] rounded-full animate-spin neon-glow mb-6"></div>
        <p className="text-[10px] font-black uppercase tracking-[0.5em] text-[#00ff9d] pulse-neon">Establishing Neural Link</p>
      </div>
    );
  }

  if (!currentProfile) {
    return <Auth />;
  }

  return (
    <div className="min-h-screen bg-[#050505] text-white selection:bg-[#00ff9d] selection:text-black">
      {/* Navigation */}
      <nav className="glass sticky top-0 z-50 no-print">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-4 cursor-pointer group" onClick={() => setViewMode('uploader')}>
            <div className="w-10 h-10 bg-[#00ff9d] rounded flex items-center justify-center text-black font-black text-xl shadow-[0_0_15px_rgba(0,255,157,0.3)] group-hover:neon-glow transition-all">N</div>
            <div className="hidden sm:block">
              <h1 className="text-lg font-black tracking-tighter leading-none">NEXTGENEVAL</h1>
              <p className="text-[8px] text-[#00ff9d] font-bold uppercase tracking-[0.3em] mt-1">Institutional Audit v2.5</p>
            </div>
          </div>
          
          <div className="flex items-center gap-8">
            <div className="flex gap-1 p-1 bg-black border border-[#222] rounded-lg">
              <button 
                onClick={() => setViewMode('uploader')}
                className={`px-4 py-1.5 text-[10px] font-black uppercase tracking-widest rounded transition-all ${viewMode === 'uploader' || viewMode === 'report' ? 'bg-[#00ff9d] text-black' : 'text-zinc-500 hover:text-white'}`}
              >
                CORE
              </button>
              <button 
                onClick={() => setViewMode('dashboard')}
                className={`px-4 py-1.5 text-[10px] font-black uppercase tracking-widest rounded transition-all ${viewMode === 'dashboard' ? 'bg-[#00ff9d] text-black' : 'text-zinc-500 hover:text-white'}`}
              >
                VAULT
              </button>
            </div>
            
            <div className="flex items-center gap-4 border-l border-[#222] pl-6">
              <div className="text-right hidden md:block">
                <p className="text-[10px] font-black uppercase">{currentProfile.name}</p>
                <p className="text-[9px] text-[#00ff9d] font-bold">CREDITS: {currentProfile.credits}</p>
              </div>
              <button 
                onClick={() => supabase.auth.signOut()}
                className="w-10 h-10 rounded border border-[#222] hover:border-red-500 hover:text-red-500 transition-all flex items-center justify-center text-zinc-600"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
              </button>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-6 py-12 lg:py-20">
        {viewMode === 'uploader' && (
          <div className="animate-in fade-in slide-in-from-bottom-8 duration-1000">
            <header className="text-center mb-16 lg:mb-24">
              <h2 className="text-5xl lg:text-7xl font-black tracking-tighter mb-6">
                Automated <span className="neon-text">Paper Audit.</span>
              </h2>
              <p className="text-zinc-500 font-medium max-w-2xl mx-auto text-lg lg:text-xl leading-relaxed">
                Professional-grade AI evaluation system designed for rigorous institutional grading standards and accuracy.
              </p>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
              <div className="lg:col-span-8 space-y-10">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                  <FileUpload label="Question Paper (Master)" files={qpFiles} onFilesSelected={(f) => handleFileSelection(f, setQpFiles)} required />
                  <FileUpload label="Answer Key (Optional)" files={keyFiles} onFilesSelected={(f) => handleFileSelection(f, setKeyFiles)} />
                </div>
                <FileUpload label="Handwritten Student Answer Sheets" files={studentFiles} onFilesSelected={(f) => handleFileSelection(f, setStudentFiles)} required />
              </div>

              <div className="lg:col-span-4 sticky top-32">
                <div className="card-3d p-8 rounded-2xl bg-[#0a0a0a] border-[#1a1a1a]">
                  <h3 className="text-xs font-black uppercase tracking-[0.2em] mb-6 text-zinc-500">Audit Summary</h3>
                  <div className="space-y-4 mb-8">
                    <div className="flex justify-between items-center py-2 border-b border-[#1a1a1a]">
                      <span className="text-[10px] font-bold text-zinc-400 uppercase">Input Files</span>
                      <span className="text-[10px] font-black text-[#00ff9d]">{qpFiles.length + keyFiles.length + studentFiles.length}</span>
                    </div>
                    <div className="flex justify-between items-center py-2 border-b border-[#1a1a1a]">
                      <span className="text-[10px] font-bold text-zinc-400 uppercase">Process Cost</span>
                      <span className="text-[10px] font-black text-[#00ff9d]">1 Credit</span>
                    </div>
                  </div>

                  {error && (
                    <div className="p-4 bg-red-900/20 border border-red-900/40 rounded-lg text-red-500 text-[10px] font-black uppercase tracking-widest mb-6 animate-shake">
                      {error}
                    </div>
                  )}

                  <button 
                    onClick={processEvaluation}
                    disabled={isLoading || qpFiles.length === 0 || studentFiles.length === 0}
                    className={`w-full py-5 rounded-lg btn-neon ${isLoading || qpFiles.length === 0 || studentFiles.length === 0 ? 'opacity-30 grayscale cursor-not-allowed' : ''}`}
                  >
                    {isLoading ? (
                      <div className="flex items-center justify-center gap-3">
                        <div className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin"></div>
                        SYSTEM BUSY
                      </div>
                    ) : (
                      'EXECUTE AUDIT'
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

      <footer className="py-20 border-t border-[#1a1a1a] text-center no-print">
        <p className="text-[9px] font-black text-zinc-700 uppercase tracking-[0.6em]">NEXTGENEVAL • INSTITUTIONAL SECURITY PROTOCOL • © 2024</p>
      </footer>
    </div>
  );
};

export default App;
