
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
        const { data, error: signUpError } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: { name: name, full_name: name },
          },
        });
        
        if (signUpError) throw signUpError;

        if (data.user) {
          const { error: profileError } = await supabase.from('profiles').upsert({
            id: data.user.id,
            name: name,
            email: email,
            credits: 5,
            freeTrialUsed: false,
            joinedDate: Date.now(),
            role: 'institution'
          }, { onConflict: 'id' });

          if (profileError) throw profileError;

          if (data.session) {
            setSuccess("Institutional node activated.");
          } else {
            setSuccess("Node registered. Authorization required.");
            setIsLogin(true);
          }
        }
      }
    } catch (err: any) {
      setError(err.message || 'Access Denied.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#050505] p-6">
      <div className="w-full max-w-md bg-[#0a0a0a] rounded-3xl border border-[#1a1a1a] p-10 lg:p-14 card-3d">
        <div className="text-center mb-12">
          <div className="w-16 h-16 bg-[#00ff9d] rounded flex items-center justify-center text-black font-black text-3xl mx-auto mb-6 shadow-[0_0_30px_rgba(0,255,157,0.3)]">N</div>
          <h1 className="text-4xl font-black text-white tracking-tighter mb-2">
            {isLogin ? 'AUTH_GATE' : 'NODE_INIT'}
          </h1>
          <p className="text-[#00ff9d] font-bold uppercase tracking-[0.3em] text-[10px]">
            Institutional Access Protocol
          </p>
        </div>

        {error && (
          <div className="mb-8 p-4 bg-red-900/20 border border-red-900/40 rounded-lg text-red-500 text-[10px] font-black uppercase tracking-widest text-center animate-shake">
            {error}
          </div>
        )}

        {success && (
          <div className="mb-8 p-4 bg-emerald-900/20 border border-emerald-900/40 rounded-lg text-[#00ff9d] text-[10px] font-black uppercase tracking-widest text-center">
            {success}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {!isLogin && (
            <div className="space-y-2">
              <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest ml-1">Institution Entity</label>
              <input 
                type="text" 
                required 
                value={name}
                onChange={(e) => setName(e.target.value)}
                disabled={loading}
                className="w-full px-5 py-4 input-dark rounded-xl font-medium disabled:opacity-50"
                placeholder="e.g. ST. JUDE UNIVERSITY"
              />
            </div>
          )}
          <div className="space-y-2">
            <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest ml-1">Admin Identifier</label>
            <input 
              type="email" 
              required 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={loading}
              className="w-full px-5 py-4 input-dark rounded-xl font-medium disabled:opacity-50"
              placeholder="admin@institution.edu"
            />
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest ml-1">Security Cipher</label>
            <input 
              type="password" 
              required 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={loading}
              className="w-full px-5 py-4 input-dark rounded-xl font-medium disabled:opacity-50"
              placeholder="••••••••"
            />
          </div>

          <button 
            type="submit"
            disabled={loading}
            className="w-full py-5 btn-neon rounded-xl mt-6 disabled:opacity-50 flex items-center justify-center gap-3"
          >
            {loading && <div className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin" />}
            {isLogin ? 'GRANT ACCESS' : 'INITIALIZE NODE'}
          </button>
        </form>

        <div className="mt-10 text-center">
          <button 
            onClick={() => { setIsLogin(!isLogin); setError(null); setSuccess(null); }}
            disabled={loading}
            className="text-zinc-500 font-black text-[10px] uppercase tracking-widest hover:text-[#00ff9d] transition-colors"
          >
            {isLogin ? "PROCEED TO REGISTRATION" : "BACK TO LOGIN GATE"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Auth;
