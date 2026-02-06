
import React, { useState, useEffect } from 'react';
import { HistoryItem, UserProfile } from '../types';
import { supabase } from '../supabase';

interface DashboardProps {
  history: HistoryItem[];
  profile: UserProfile;
  onViewReport: (item: HistoryItem) => void;
  onDeleteReport: (id: string) => void;
  onNewEvaluation: () => void;
}

const Dashboard: React.FC<DashboardProps> = ({ history, profile, onViewReport, onDeleteReport, onNewEvaluation }) => {
  const [activeTab, setActiveTab] = useState<'history' | 'admin'>('history');
  const [allUsers, setAllUsers] = useState<UserProfile[]>([]);
  const [allEvaluations, setAllEvaluations] = useState<any[]>([]);
  const [loadingAdmin, setLoadingAdmin] = useState(false);

  useEffect(() => {
    if (profile.role === 'admin' && activeTab === 'admin') {
      fetchAdminData();
    }
  }, [activeTab, profile.role]);

  const fetchAdminData = async () => {
    setLoadingAdmin(true);
    try {
      const { data: users } = await supabase.from('profiles').select('*');
      const { data: evals } = await supabase.from('evaluations').select('*, profiles(name)');
      if (users) setAllUsers(users);
      if (evals) setAllEvaluations(evals);
    } catch (err) {
      console.error("Admin fetch error", err);
    } finally {
      setLoadingAdmin(false);
    }
  };

  return (
    <div className="animate-in fade-in slide-in-from-bottom-8 duration-700">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-12">
        <div className="lg:col-span-8 bg-[#0a0a0a] border border-[#1a1a1a] p-10 rounded-2xl flex flex-col md:flex-row items-center justify-between gap-10 card-3d">
          <div className="flex-1">
            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-500 mb-2">Available Credits</p>
            <h2 className="text-6xl font-black neon-text mb-6">{profile.credits}</h2>
            <div className="flex gap-4">
              <button className="px-6 py-2.5 btn-neon rounded-lg text-[10px]">Purchase Credits</button>
              <button className="px-6 py-2.5 border border-[#222] text-zinc-400 rounded-lg text-[10px] font-black uppercase hover:border-[#00ff9d] hover:text-[#00ff9d] transition-all">Redeem Voucher</button>
            </div>
          </div>
          <div className="text-right hidden md:block">
            <p className="text-[10px] font-black uppercase text-zinc-500 mb-1">Standard Rate</p>
            <p className="text-3xl font-black text-white">$0.50 <span className="text-[10px] text-zinc-500">/ SHEET</span></p>
          </div>
        </div>

        <div className="lg:col-span-4 bg-[#0a0a0a] border border-[#1a1a1a] p-10 rounded-2xl flex flex-col justify-between card-3d">
           <div>
             <p className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-500 mb-2">Total Output</p>
             <h3 className="text-3xl font-black text-white">{profile.totalEvaluations} AUDITS</h3>
           </div>
           <div className="mt-8">
              <div className="flex justify-between text-[10px] font-black uppercase mb-3">
                <span className="text-zinc-500">Node Status</span>
                <span className="text-[#00ff9d] pulse-neon">ACTIVE</span>
              </div>
              <div className="w-full h-1 bg-[#1a1a1a] rounded-full overflow-hidden">
                 <div className="h-full bg-[#00ff9d] shadow-[0_0_10px_rgba(0,255,157,0.5)]" style={{ width: '100%' }}></div>
              </div>
           </div>
        </div>
      </div>

      <div className="flex flex-col md:flex-row justify-between items-center mb-10 gap-6">
        <div className="flex gap-2 p-1 bg-[#0a0a0a] border border-[#1a1a1a] rounded-xl">
           <button 
             onClick={() => setActiveTab('history')}
             className={`px-6 py-3 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'history' ? 'bg-[#141414] text-[#00ff9d] neon-text shadow-xl' : 'text-zinc-500 hover:text-white'}`}
           >
             Batch History
           </button>
           {profile.role === 'admin' && (
             <button 
               onClick={() => setActiveTab('admin')}
               className={`px-6 py-3 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'admin' ? 'bg-[#141414] text-[#00ff9d] neon-text shadow-xl' : 'text-zinc-500 hover:text-white'}`}
             >
               Admin Console
             </button>
           )}
        </div>
        <button 
          onClick={onNewEvaluation}
          disabled={profile.credits <= 0}
          className={`px-8 py-4 rounded-xl btn-neon shadow-2xl flex items-center gap-3 text-[11px] ${profile.credits <= 0 ? 'opacity-30 grayscale cursor-not-allowed' : ''}`}
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="4" d="M12 4v16m8-8H4" /></svg>
          INIT NEW BATCH
        </button>
      </div>

      <div className="bg-[#0a0a0a] border border-[#1a1a1a] rounded-2xl overflow-hidden card-3d">
        {activeTab === 'history' ? (
          history.length === 0 ? (
            <div className="py-32 text-center">
              <div className="w-16 h-16 border border-[#222] rounded-2xl flex items-center justify-center mx-auto mb-6 text-zinc-700">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
              </div>
              <p className="text-zinc-600 font-black uppercase text-[10px] tracking-[0.5em]">No data records found in vault</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-[#0f0f0f] text-zinc-500 text-[10px] font-black uppercase tracking-widest border-b border-[#1a1a1a]">
                    <th className="px-10 py-6">IDENTIFIER / TIMESTAMP</th>
                    <th className="px-10 py-6">SUBJECT</th>
                    <th className="px-10 py-6 text-center">ACCURACY</th>
                    <th className="px-10 py-6 text-center">PAGES</th>
                    <th className="px-10 py-6 text-right">OPERATIONS</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#1a1a1a]">
                  {history.map((item) => (
                    <tr key={item.id} className="hover:bg-[#141414] transition-colors group">
                      <td className="px-10 py-8">
                        <p className="font-black text-white text-[13px] uppercase tracking-tight mb-1 truncate max-w-[150px]">{item.report.studentInfo.name}</p>
                        <p className="text-[9px] text-zinc-600 font-bold uppercase tracking-wider">{new Date(item.timestamp).toLocaleString()}</p>
                      </td>
                      <td className="px-10 py-8">
                        <span className="px-3 py-1 bg-black border border-[#222] rounded text-[10px] font-black text-zinc-300 uppercase tracking-widest">
                          {item.report.studentInfo.subject}
                        </span>
                      </td>
                      <td className="px-10 py-8 text-center">
                        <span className={`font-black text-[14px] ${item.report.percentage >= 40 ? 'neon-text' : 'text-red-500'}`}>
                          {item.report.percentage.toFixed(1)}%
                        </span>
                      </td>
                      <td className="px-10 py-8 text-center font-black text-zinc-400 text-[11px]">
                        {item.pages_processed}
                      </td>
                      <td className="px-10 py-8 text-right">
                        <div className="flex justify-end gap-2">
                          <button onClick={() => onViewReport(item)} className="p-3 text-zinc-600 hover:text-[#00ff9d] transition-all">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                          </button>
                          <button onClick={() => onDeleteReport(item.id)} className="p-3 text-zinc-800 hover:text-red-500 transition-all">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )
        ) : (
          <div className="overflow-x-auto">
             <table className="w-full text-left">
                <thead>
                  <tr className="bg-[#0f0f0f] text-zinc-500 text-[10px] font-black uppercase tracking-widest border-b border-[#1a1a1a]">
                     <th className="px-10 py-6">ENTITY</th>
                     <th className="px-10 py-6">ROLE</th>
                     <th className="px-10 py-6">CREDITS</th>
                     <th className="px-10 py-6 text-center">TOTAL AUDITS</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#1a1a1a] text-[12px]">
                  {allUsers.map(user => (
                    <tr key={user.id} className="hover:bg-[#141414] transition-colors">
                      <td className="px-10 py-6">
                        <p className="font-black text-white uppercase">{user.name}</p>
                        <p className="text-[10px] text-zinc-600">{user.email}</p>
                      </td>
                      <td className="px-10 py-6">
                        <span className={`px-2 py-0.5 rounded text-[9px] font-black uppercase ${user.role === 'admin' ? 'bg-[#00ff9d] text-black' : 'bg-[#1a1a1a] text-zinc-500'}`}>{user.role}</span>
                      </td>
                      <td className="px-10 py-6 font-black text-[#00ff9d]">{user.credits}</td>
                      <td className="px-10 py-6 text-center font-black text-white">{user.totalEvaluations}</td>
                    </tr>
                  ))}
                </tbody>
             </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
