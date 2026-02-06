
import React, { useState } from 'react';
import { supabase } from '../supabase';

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
        // Strict email check for Admin Portal
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
          // Allow Admin to sign up if the account doesn't exist yet
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
              credits: 999999, // Admin gets unlimited-ish credits
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
        // General Institutional Portal
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
            // Even if signing up here, if it's the admin email, give them the admin role
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
      setError(msg.includes('Invalid login credentials') ? 'Invalid credentials. If you haven\'t created an account yet, please use the Sign Up option.' : msg);
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
    setIsLogin(true); // Default to login when switching
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-black p-6">
      <div className="scanline"></div>
      <div className="w-full max-w-md bg-[#050505] rounded-sm border border-[#1a1a1a] p-12 lg:p-16 pro-card relative overflow-hidden">
        <div className="absolute top-0 right-0 w-24 h-24 bg-[#00ff9d]/5 blur-3xl rounded-full translate-x-12 -translate-y-12"></div>
        
        <div className="text-center mb-16 relative z-10">
          <div className="w-16 h-16 bg-[#00ff9d] rounded-sm flex items-center justify-center text-black font-black text-3xl mx-auto mb-8 shadow-[0_0_40px_rgba(0,255,157,0.3)]">N</div>
          <h1 className="text-4xl font-black text-white tracking-tighter mb-2">
            {isAdminPortal ? (isLogin ? 'ADMIN LOGIN' : 'ADMIN SIGN UP') : (isLogin ? 'LOGIN' : 'SIGN UP')}
          </h1>
          <p className="text-[#00ff9d] font-black uppercase tracking-[0.4em] text-[9px] opacity-70">
            {isAdminPortal ? 'SYSTEM CREATOR ACCESS' : 'INSTITUTIONAL PORTAL'}
          </p>
        </div>

        {error && (
          <div className="mb-10 p-4 bg-red-500/10 border border-red-500/20 text-red-500 text-[10px] font-black uppercase tracking-widest text-center animate-shake">
            {error}
          </div>
        )}

        {success && (
          <div className="mb-10 p-4 bg-emerald-500/10 border border-emerald-500/20 text-[#00ff9d] text-[10px] font-black uppercase tracking-widest text-center">
            {success}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-8 relative z-10">
          {!isLogin && !isAdminPortal && (
            <div className="space-y-3">
              <label className="text-[10px] font-black text-zinc-600 uppercase tracking-widest">Institution Name</label>
              <input 
                type="text" 
                required 
                value={name}
                onChange={(e) => setName(e.target.value)}
                disabled={loading}
                className="w-full px-5 py-5 input-pro rounded-sm text-xs font-bold disabled:opacity-50"
                placeholder="ST. MARY'S ACADEMY"
              />
            </div>
          )}
          <div className="space-y-3">
            <label className="text-[10px] font-black text-zinc-600 uppercase tracking-widest">Email Address</label>
            <input 
              type="email" 
              required 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={loading}
              className="w-full px-5 py-5 input-pro rounded-sm text-xs font-bold disabled:opacity-50"
              placeholder={isAdminPortal ? "aarshiv.ai@gmail.com" : "admin@institution.edu"}
            />
          </div>
          <div className="space-y-3">
            <label className="text-[10px] font-black text-zinc-600 uppercase tracking-widest">Password</label>
            <input 
              type="password" 
              required 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={loading}
              className="w-full px-5 py-5 input-pro rounded-sm text-xs font-bold disabled:opacity-50"
              placeholder="••••••••"
            />
          </div>

          <button 
            type="submit"
            disabled={loading}
            className="w-full py-6 btn-pro rounded-sm mt-8 disabled:opacity-50 flex items-center justify-center gap-3"
          >
            {loading && <div className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin" />}
            {isLogin ? 'Login' : 'Sign Up'}
          </button>
        </form>

        <div className="mt-12 text-center relative z-10 space-y-4">
          <button 
            onClick={() => { setIsLogin(!isLogin); setError(null); setSuccess(null); }}
            disabled={loading}
            className="text-zinc-700 font-black text-[9px] uppercase tracking-[0.2em] hover:text-[#00ff9d] transition-colors block w-full"
          >
            {isLogin ? "Need an account? Sign Up" : "Already have an account? Login"}
          </button>
          
          <button 
            onClick={toggleAdmin}
            disabled={loading}
            className="text-zinc-800 font-black text-[8px] uppercase tracking-[0.3em] hover:text-[#00ff9d] transition-all opacity-40 hover:opacity-100"
          >
            {isAdminPortal ? "Institutional Portal" : "Creator Admin Portal"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Auth;
