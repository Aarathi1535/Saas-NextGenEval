import React, { useState } from 'react';
import { supabase } from '../supabase';
import { 
  Mail, 
  Lock, 
  User, 
  Building2, 
  ArrowRight, 
  ShieldCheck, 
  AlertCircle,
  Loader2,
  CheckCircle2
} from 'lucide-react';

const ADMIN_EMAIL = 'aarshiv.ai@gmail.com';

const Auth: React.FC = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [isAdminPortal, setIsAdminPortal] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      if (isAdminPortal) {
        if (email.toLowerCase() !== ADMIN_EMAIL.toLowerCase()) {
          throw new Error('Access Denied: This portal is reserved for the system creator.');
        }

        if (isLogin) {
          const { error: signInError } = await supabase.auth.signInWithPassword({
            email,
            password,
          });
          if (signInError) throw signInError;
        } else {
          const { data, error: signUpError } = await supabase.auth.signUp({
            email,
            password,
            options: {
              data: { name: 'System Creator', full_name: 'System Creator' },
            },
          });
          
          if (signUpError) throw signUpError;

          if (data.user) {
            const { error: profileError } = await supabase.from('profiles').upsert({
              id: data.user.id,
              name: 'System Creator',
              email: email,
              credits: 999999,
              freeTrialUsed: true,
              joinedDate: Date.now(),
              role: 'admin'
            }, { onConflict: 'id' });

            if (profileError) throw profileError;

            if (data.session) {
              setSuccess("Creator account initialized and logged in.");
            } else {
              setSuccess("Creator account registered. Please verify email or login.");
              setIsLogin(true);
            }
          }
        }
      } else {
        if (isLogin) {
          const { error: signInError } = await supabase.auth.signInWithPassword({
            email,
            password,
          });
          if (signInError) throw signInError;
        } else {
          const { data, error: signUpError } = await supabase.auth.signUp({
            email,
            password,
            options: {
              data: { name: name, full_name: name },
            },
          });
          
          if (signUpError) throw signUpError;

          if (data.user) {
            const isCreator = email.toLowerCase() === ADMIN_EMAIL.toLowerCase();
            const { error: profileError } = await supabase.from('profiles').upsert({
              id: data.user.id,
              name: name,
              email: email,
              credits: isCreator ? 999999 : 5,
              freeTrialUsed: false,
              joinedDate: Date.now(),
              role: isCreator ? 'admin' : 'institution'
            }, { onConflict: 'id' });

            if (profileError) throw profileError;

            if (data.session) {
              setSuccess("Account created successfully.");
            } else {
              setSuccess("Registration successful. Check your email or try logging in.");
              setIsLogin(true);
            }
          }
        }
      }
    } catch (err: any) {
      const msg = err.message || 'Authentication failed.';
      setError(msg.includes('Invalid login credentials') ? 'Invalid credentials. Please check your email and password.' : msg);
    } finally {
      setLoading(false);
    }
  };

  const toggleAdmin = () => {
    setIsAdminPortal(!isAdminPortal);
    setError(null);
    setSuccess(null);
    setEmail('');
    setPassword('');
    setIsLogin(true);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-6">
      <div className="w-full max-w-md animate-fade-in">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-primary rounded-2xl flex items-center justify-center text-primary-foreground font-bold text-3xl mx-auto mb-6 shadow-xl shadow-primary/20">N</div>
          <h1 className="text-3xl font-bold tracking-tight mb-2">
            {isAdminPortal ? 'Admin Portal' : 'NextGenEval'}
          </h1>
          <p className="text-muted-foreground">
            {isAdminPortal 
              ? 'System creator access only' 
              : isLogin ? 'Welcome back to your dashboard' : 'Start your institutional journey'}
          </p>
        </div>

        <div className="bg-card text-card-foreground rounded-3xl border border-border/50 shadow-[0_8px_30px_rgb(0,0,0,0.04)] transition-all duration-500 hover:shadow-[0_20px_40px_rgb(0,0,0,0.08)] hover:border-brand-500/20 p-8 sm:p-10">
          {error && (
            <div className="mb-6 p-4 bg-destructive/10 border border-destructive/20 text-destructive rounded-2xl flex items-center gap-3 text-sm font-medium">
              <AlertCircle size={18} />
              {error}
            </div>
          )}

          {success && (
            <div className="mb-6 p-4 bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 rounded-2xl flex items-center gap-3 text-sm font-medium">
              <CheckCircle2 size={18} />
              {success}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            {!isLogin && !isAdminPortal && (
              <div className="space-y-2">
                <label className="text-sm font-medium ml-1">Institution Name</label>
                <div className="relative">
                  <Building2 className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
                  <input 
                    type="text" 
                    required 
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    disabled={loading}
                    className="flex h-14 w-full rounded-2xl border border-border bg-background/50 px-5 py-2 text-sm transition-all duration-300 placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 pl-11"
                    placeholder="e.g. St. Mary's Academy"
                  />
                </div>
              </div>
            )}
            
            <div className="space-y-2">
              <label className="text-sm font-medium ml-1">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
                <input 
                  type="email" 
                  required 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={loading}
                  className="flex h-14 w-full rounded-2xl border border-border bg-background/50 px-5 py-2 text-sm transition-all duration-300 placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 pl-11"
                  placeholder="admin@institution.edu"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium ml-1">Password</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
                <input 
                  type="password" 
                  required 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={loading}
                  className="flex h-14 w-full rounded-2xl border border-border bg-background/50 px-5 py-2 text-sm transition-all duration-300 placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 pl-11"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <button 
              type="submit"
              disabled={loading}
              className="w-full inline-flex items-center justify-center rounded-2xl px-6 py-3 text-sm font-semibold transition-all duration-300 active:scale-95 disabled:opacity-50 disabled:pointer-events-none bg-foreground text-background hover:opacity-90 shadow-lg shadow-foreground/10 h-14 mt-4 shadow-lg shadow-primary/10"
            >
              {loading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <span className="flex items-center gap-2">
                  {isLogin ? 'Sign In' : 'Create Account'}
                  <ArrowRight size={18} />
                </span>
              )}
            </button>
          </form>

          <div className="mt-8 pt-8 border-t border-border space-y-4">
            <button 
              onClick={() => { setIsLogin(!isLogin); setError(null); setSuccess(null); }}
              disabled={loading}
              className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors block w-full text-center"
            >
              {isLogin ? "Don't have an account? Sign Up" : "Already have an account? Sign In"}
            </button>
            
            <button 
              onClick={toggleAdmin}
              disabled={loading}
              className="text-xs font-semibold text-muted-foreground/50 hover:text-primary transition-all block w-full text-center"
            >
              {isAdminPortal ? "Switch to Institutional Portal" : "Access Creator Admin Portal"}
            </button>
          </div>
        </div>

        <div className="mt-8 flex items-center justify-center gap-6 text-muted-foreground/40">
          <div className="flex items-center gap-1">
            <ShieldCheck size={14} />
            <span className="text-[10px] font-bold uppercase tracking-wider">Secure Access</span>
          </div>
          <div className="w-1 h-1 rounded-full bg-border"></div>
          <div className="flex items-center gap-1">
            <CheckCircle2 size={14} />
            <span className="text-[10px] font-bold uppercase tracking-wider">AI Verified</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Auth;
