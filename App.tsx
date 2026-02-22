import React, { useState, useEffect } from 'react';
import FileUpload from './components/FileUpload';
import EvaluationReportView from './components/EvaluationReportView';
import Dashboard from './components/Dashboard';
import Auth from './components/Auth';
import LandingPage from './components/LandingPage';
import { UploadedFile, EvaluationReport, HistoryItem, UserProfile } from './types';
import { evaluateAnswerSheet } from './services/geminiService';
import { supabase } from './supabase';
import { 
  Moon, 
  Sun, 
  LogOut, 
  LayoutDashboard, 
  FileText, 
  PlusCircle, 
  Settings, 
  CreditCard,
  ChevronRight,
  ShieldCheck,
  Zap,
  Loader2,
  AlertCircle,
  Sparkles,
  ArrowRight,
  History
} from 'lucide-react';

const MAX_FILE_SIZE_MB = 3;
const ADMIN_EMAIL = 'aarshiv.ai@gmail.com';

type ViewMode = 'uploader' | 'dashboard' | 'report';

const App: React.FC = () => {
  const [currentProfile, setCurrentProfile] = useState<UserProfile | null>(null);
  const [isAuthLoading, setIsAuthLoading] = useState(true);
  const [showAuth, setShowAuth] = useState(false);
  const [viewMode, setViewMode] = useState<ViewMode>('uploader');
  const [qpFiles, setQpFiles] = useState<UploadedFile[]>([]);
  const [keyFiles, setKeyFiles] = useState<UploadedFile[]>([]);
  const [studentFiles, setStudentFiles] = useState<UploadedFile[]>([]);
  
  const [isLoading, setIsLoading] = useState(false);
  const [currentReport, setCurrentReport] = useState<EvaluationReport | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('theme') as 'light' | 'dark' || 'light';
    }
    return 'light';
  });

  useEffect(() => {
    const root = window.document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    localStorage.setItem('theme', theme);
  }, [theme]);

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (session?.user) {
        const isAdmin = session.user.email === ADMIN_EMAIL;
        
        const { data: profile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', session.user.id)
          .single();
        
        if (profile) {
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
      setError("Please upload both the Question Paper and Student Answer Sheets.");
      return;
    }

    if (currentProfile.credits <= 0 && currentProfile.email !== ADMIN_EMAIL) {
      setError("Insufficient credits. Please top up your account.");
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

  const handleSignOut = async () => {
    await supabase.auth.signOut();
  };

  if (isAuthLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-background">
        <div className="relative">
          <div className="w-16 h-16 border-4 border-brand-500/20 rounded-full"></div>
          <div className="w-16 h-16 border-4 border-brand-500 border-t-transparent rounded-full animate-spin absolute inset-0"></div>
        </div>
        <p className="mt-6 text-sm font-semibold tracking-widest uppercase text-muted-foreground animate-pulse">Initializing System</p>
      </div>
    );
  }

  if (!currentProfile) {
    if (showAuth) {
      return (
        <div className="relative">
          <button 
            onClick={() => setShowAuth(false)}
            className="fixed top-8 left-8 z-[60] flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowRight size={16} className="rotate-180" />
            Back to Home
          </button>
          <Auth />
        </div>
      );
    }
    return <LandingPage onGetStarted={() => setShowAuth(true)} />;
  }

  return (
    <div className="min-h-screen bg-background text-foreground transition-colors duration-500 mesh-gradient">
      {/* Unique Floating Header */}
      <header className="fixed top-6 left-1/2 -translate-x-1/2 z-50 w-[95%] max-w-7xl no-print">
        <div className="glass rounded-3xl border border-border/50 shadow-2xl px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-10">
            <div 
              className="flex items-center gap-3 cursor-pointer group" 
              onClick={() => setViewMode('uploader')}
            >
              <div className="w-10 h-10 bg-brand-500 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-brand-500/30 group-hover:rotate-12 transition-transform duration-500">
                <Sparkles size={20} />
              </div>
              <div className="flex flex-col">
                <span className="text-lg font-bold tracking-tight leading-none">NextGenEval</span>
                <span className="text-[10px] font-bold text-brand-600 uppercase tracking-widest">AI Core v2.5</span>
              </div>
            </div>

            <nav className="hidden md:flex items-center bg-muted/50 p-1 rounded-2xl border border-border/50">
              <button 
                onClick={() => setViewMode('uploader')}
                className={`flex items-center gap-2 px-6 py-2.5 text-xs font-bold rounded-xl transition-all duration-300 ${viewMode === 'uploader' || viewMode === 'report' ? 'bg-background text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}
              >
                <Zap size={14} />
                Evaluate
              </button>
              <button 
                onClick={() => setViewMode('dashboard')}
                className={`flex items-center gap-2 px-6 py-2.5 text-xs font-bold rounded-xl transition-all duration-300 ${viewMode === 'dashboard' ? 'bg-background text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}
              >
                <History size={14} />
                Vault
              </button>
            </nav>
          </div>
          
          <div className="flex items-center gap-4">
            <button className="hidden sm:inline-flex items-center justify-center rounded-2xl px-5 py-2.5 text-xs font-bold transition-all duration-300 active:scale-95 bg-foreground text-background hover:opacity-90 shadow-lg shadow-foreground/10">
              Book a Demo
            </button>
            <div className="hidden lg:flex items-center gap-4 bg-muted/30 px-4 py-2 rounded-2xl border border-border/50">
              <div className="flex flex-col items-end">
                <span className="text-xs font-bold">{currentProfile.name}</span>
                <span className="text-[10px] font-bold text-brand-600 flex items-center gap-1">
                  <CreditCard size={10} /> {currentProfile.credits} Credits
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button 
                onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
                className="w-10 h-10 rounded-2xl hover:bg-muted transition-colors flex items-center justify-center text-muted-foreground"
                title="Toggle Theme"
              >
                {theme === 'light' ? <Moon size={20} /> : <Sun size={20} />}
              </button>
              <button 
                onClick={handleSignOut}
                className="w-10 h-10 rounded-2xl hover:bg-destructive/10 hover:text-destructive transition-colors flex items-center justify-center text-muted-foreground"
                title="Sign Out"
              >
                <LogOut size={20} />
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="pt-36 pb-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        {viewMode === 'uploader' && (
          <div className="animate-fade-in">
            <div className="max-w-4xl mx-auto mb-16 text-center">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-brand-500/10 text-brand-600 text-[10px] font-bold uppercase tracking-widest mb-6 border border-brand-500/20">
                <Sparkles size={12} />
                Powered by Gemini 3.1 Pro
              </div>
              <h1 className="text-5xl md:text-6xl font-black tracking-tight mb-6 leading-[1.1]">
                Precision Grading <br />
                <span className="text-brand-500">Simplified.</span>
              </h1>
              <p className="text-muted-foreground text-lg max-w-2xl mx-auto font-medium">
                Upload your institutional documents and let our advanced AI models handle the auditing with professional accuracy.
              </p>
            </div>

            {error && (
              <div className="max-w-4xl mx-auto mb-10 p-5 bg-destructive/10 border border-destructive/20 text-destructive rounded-3xl flex items-center gap-4 text-sm font-semibold animate-fade-in">
                <div className="w-10 h-10 rounded-2xl bg-destructive/10 flex items-center justify-center shrink-0">
                  <AlertCircle size={20} />
                </div>
                {error}
              </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 max-w-6xl mx-auto">
              <div className="lg:col-span-7 space-y-10">
                <FileUpload 
                  label="Question Paper" 
                  files={qpFiles} 
                  onFilesSelected={(f) => handleFileSelection(f, setQpFiles)} 
                  required
                />
                <FileUpload 
                  label="Answer Key (Optional)" 
                  files={keyFiles} 
                  onFilesSelected={(f) => handleFileSelection(f, setKeyFiles)} 
                />
              </div>
              <div className="lg:col-span-5 space-y-10">
                <FileUpload 
                  label="Student Scripts" 
                  files={studentFiles} 
                  onFilesSelected={(f) => handleFileSelection(f, setStudentFiles)} 
                  required
                />
                
                <div className="bg-card text-card-foreground rounded-3xl border border-border/50 shadow-[0_8px_30px_rgb(0,0,0,0.04)] transition-all duration-500 hover:shadow-[0_20px_40px_rgb(0,0,0,0.08)] hover:border-brand-500/20 p-8 bg-foreground text-background dark:bg-card dark:text-card-foreground">
                  <h3 className="text-xs font-bold uppercase tracking-widest mb-8 opacity-60">Evaluation Summary</h3>
                  <div className="space-y-6 mb-10">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium opacity-70">Total Scripts</span>
                      <span className="text-lg font-bold">{studentFiles.length}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium opacity-70">Compute Cost</span>
                      <span className="text-lg font-bold text-brand-500">1 Credit</span>
                    </div>
                    <div className="h-[1px] bg-background/10 dark:bg-border"></div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium opacity-70">Estimated Time</span>
                      <span className="text-lg font-bold">~15s</span>
                    </div>
                  </div>

                  <button 
                    onClick={processEvaluation}
                    disabled={isLoading || qpFiles.length === 0 || studentFiles.length === 0}
                    className="w-full inline-flex items-center justify-center rounded-2xl px-6 py-3 text-sm font-semibold transition-all duration-300 active:scale-95 disabled:opacity-50 disabled:pointer-events-none bg-brand-500 text-white hover:bg-brand-600 shadow-lg shadow-brand-500/20 h-16 text-lg group disabled:opacity-30"
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="w-6 h-6 mr-3 animate-spin" />
                        Processing...
                      </>
                    ) : (
                      <>
                        Start Evaluation
                        <ArrowRight size={20} className="ml-2 group-hover:translate-x-1 transition-transform" />
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>

            <div className="mt-24 grid grid-cols-1 sm:grid-cols-3 gap-8 max-w-5xl mx-auto">
              {[
                { icon: ShieldCheck, title: "Institutional Grade", desc: "Security-first architecture designed for sensitive academic data." },
                { icon: Zap, title: "Instant Audit", desc: "Real-time processing with detailed question-level feedback." },
                { icon: FileText, title: "Export Ready", desc: "Generate professional PDF reports for institutional records." }
              ].map((feature, i) => (
                <div key={i} className="bg-card text-card-foreground rounded-3xl border border-border/50 shadow-[0_8px_30px_rgb(0,0,0,0.04)] transition-all duration-500 hover:shadow-[0_20px_40px_rgb(0,0,0,0.08)] hover:border-brand-500/20 p-8 text-center group">
                  <div className="w-14 h-14 bg-brand-500/10 text-brand-500 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-500">
                    <feature.icon size={28} />
                  </div>
                  <h3 className="font-bold text-lg mb-3">{feature.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{feature.desc}</p>
                </div>
              ))}
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
          <EvaluationReportView 
            report={currentReport} 
            onReset={() => { setViewMode('uploader'); setCurrentReport(null); }} 
          />
        )}
      </main>

      <footer className="border-t border-border/50 py-16 no-print">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <div className="flex items-center justify-center gap-3 mb-6">
            <div className="w-8 h-8 bg-brand-500 rounded-xl flex items-center justify-center text-white font-bold text-sm">N</div>
            <span className="font-bold tracking-tight text-xl">NextGenEval</span>
          </div>
          <p className="text-sm text-muted-foreground mb-8">Empowering institutions with high-precision AI evaluation.</p>
          <div className="flex items-center justify-center gap-8 text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground/50">
            <span>Privacy Policy</span>
            <span>Terms of Service</span>
            <span>Security Audit</span>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default App;
