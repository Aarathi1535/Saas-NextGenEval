
import React, { useState } from 'react';
import { supabase } from '../supabase';

const ADMIN_EMAIL = 'aarshiv.ai@gmail.com';

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
          // creator@admin gets special role
          const role = email === ADMIN_EMAIL ? 'admin' : 'institution';
          const initialCredits = email === ADMIN_EMAIL ? 999999 : 5;

          const { error: profileError } = await supabase.from('profiles').upsert({
            id: data.user.id,
            name: name || (email === ADMIN_EMAIL ? 'Creator Admin' : ''),
            email: email,
            credits: initialCredits,
            freeTrialUsed: false,
            joinedDate: Date.now(),
            role: role
          }, { onConflict: 'id' });

          if (profileError) throw profileError;

          if (data.session) {
            setSuccess("Access Granted. Node Linked.");
          } else {
            setSuccess("Node registered. Verification required.");
            setIsLogin(true);
          }
        }
      }
    } catch (err: any) {
      setError(err.message || 'GATE_DENIED: Credential Mismatch.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-black p-6">
      <div className="scanline"></div>
      <div className="w-full max-w-md bg-[#050505] rounded-sm border border-[#1a1a1a] p-12 lg:p-16 pro-card relative overflow-hidden">
        <div className="absolute top-0 right-0 w-24 h-24 bg-[#00ff9d]/5 blur-3xl rounded-full translate-x-12 -translate-y-12"></div>
        
        <div className="text-center mb-16 relative z-10">
          <div className="w-16 h-16 bg-[#00ff9d] rounded-sm flex items-center justify-center text-black font-black text-3xl mx-auto mb-8 shadow-[0_0_40px_rgba(0,255,157,0.3)]">N</div>
          <h1 className="text-4xl font-black text-white tracking-tighter mb-2">
            {isLogin ? 'SECURITY_GATE' : 'NODE_INIT'}
          </h1>
          <p className="text-[#00ff9d] font-black uppercase tracking-[0.4em] text-[9px] opacity-70">
            PRO INSTITUTIONAL ACCESS
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
          {!isLogin && (
            <div className="space-y-3">
              <label className="text-[10px] font-black text-zinc-600 uppercase tracking-widest">ENTITY_IDENTIFIER</label>
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
            <label className="text-[10px] font-black text-zinc-600 uppercase tracking-widest">ADMIN_LOGIN</label>
            <input 
              type="email" 
              required 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={loading}
              className="w-full px-5 py-5 input-pro rounded-sm text-xs font-bold disabled:opacity-50"
              placeholder="admin@institution.edu"
            />
          </div>
          <div className="space-y-3">
            <label className="text-[10px] font-black text-zinc-600 uppercase tracking-widest">SECURITY_CIPHER</label>
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
            {isLogin ? 'GRANT_ACCESS' : 'INITIALIZE_NODE'}
          </button>
        </form>

        <div className="mt-12 text-center relative z-10">
          <button 
            onClick={() => { setIsLogin(!isLogin); setError(null); setSuccess(null); }}
            disabled={loading}
            className="text-zinc-700 font-black text-[9px] uppercase tracking-[0.2em] hover:text-[#00ff9d] transition-colors"
          >
            {isLogin ? "PROCEED_TO_REGISTRATION" : "RETURN_TO_SECURITY_GATE"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Auth;
