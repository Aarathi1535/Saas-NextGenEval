
import React, { useState } from 'react';
import { supabase } from '../supabase';

const Auth: React.FC = () => {
  const [isLogin, setIsLogin] = useState(true);
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
      if (isLogin) {
        const { error: signInError } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (signInError) throw signInError;
      } else {
        // Sign up
        const { data, error: signUpError } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: { 
              full_name: name 
            },
          },
        });
        
        if (signUpError) throw signUpError;

        if (data.user) {
          // Initialize profile in public.profiles
          // We use upsert to handle cases where the user might have been created but insertion failed previously
          const { error: profileError } = await supabase.from('profiles').upsert({
            id: data.user.id,
            name: name, // Uses the state variable from the input
            email: email,
            credits: 5,
            freeTrialUsed: false,
            joinedDate: Date.now(),
            role: 'institution'
          }, { onConflict: 'id' });

          if (profileError) {
            console.error("Profile creation error:", profileError);
            // If the error is that it already exists, we can ignore it and let the user log in
            if (!profileError.message.includes("already exists")) {
               throw new Error("Institutional profile initialization failed. Please try signing in.");
            }
          }

          if (data.session) {
            setSuccess("Institutional account activated.");
          } else {
            setSuccess("Registration successful! You can now sign in.");
            setIsLogin(true);
          }
        }
      }
    } catch (err: any) {
      console.error("Auth error:", err);
      setError(err.message || 'Authentication failure.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4 sm:p-6">
      <div className="w-full max-w-md bg-white rounded-[40px] shadow-2xl border border-slate-100 p-8 sm:p-12 animate-in fade-in slide-in-from-bottom-8 duration-700">
        <div className="text-center mb-8 sm:mb-10">
          <div className="w-16 h-16 bg-indigo-600 rounded-2xl flex items-center justify-center text-white font-black text-3xl mx-auto mb-6 shadow-xl shadow-indigo-200">N</div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tighter">
            {isLogin ? 'Welcome Back' : 'Join NextGenEval'}
          </h1>
          <p className="text-slate-400 font-bold uppercase tracking-widest text-[10px] mt-2">
            Professional AI Grading Portal
          </p>
        </div>

        {error && (
          <div className="mb-6 p-4 rounded-xl text-xs font-bold uppercase tracking-widest flex items-center gap-3 animate-shake bg-red-50 text-red-600 border border-red-100">
            <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            <span className="flex-1">{error}</span>
          </div>
        )}

        {success && (
          <div className="mb-6 p-4 rounded-xl text-xs font-bold uppercase tracking-widest flex items-center gap-3 animate-in fade-in bg-emerald-50 text-emerald-600 border border-emerald-100">
            <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" /></svg>
            {success}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
          {!isLogin && (
            <div className="space-y-1">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Institution Name</label>
              <input 
                type="text" 
                required 
                value={name}
                onChange={(e) => setName(e.target.value)}
                disabled={loading}
                className="w-full px-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all font-medium disabled:opacity-50"
                placeholder="e.g., St. Mary's Academy"
              />
            </div>
          )}
          <div className="space-y-1">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Email Address</label>
            <input 
              type="email" 
              required 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={loading}
              className="w-full px-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all font-medium disabled:opacity-50"
              placeholder="admin@institution.edu"
            />
          </div>
          <div className="space-y-1">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Security Key (Password)</label>
            <input 
              type="password" 
              required 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={loading}
              className="w-full px-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all font-medium disabled:opacity-50"
              placeholder="••••••••"
            />
          </div>

          <button 
            type="submit"
            disabled={loading}
            className="w-full py-5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl font-black text-sm uppercase tracking-[0.2em] shadow-xl shadow-indigo-100 transition-all active:scale-95 mt-4 disabled:opacity-50 flex items-center justify-center gap-3"
          >
            {loading && <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />}
            {isLogin ? 'Sign In' : 'Register Institution'}
          </button>
        </form>

        <div className="mt-8 text-center">
          <button 
            onClick={() => { setIsLogin(!isLogin); setError(null); setSuccess(null); }}
            disabled={loading}
            className="text-slate-400 font-black text-[10px] uppercase tracking-widest hover:text-indigo-600 transition-colors disabled:opacity-50"
          >
            {isLogin ? "New user? Create Institutional Account" : "Already registered? Sign In"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Auth;
