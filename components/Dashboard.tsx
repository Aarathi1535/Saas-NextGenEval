
import React, { useState, useEffect } from 'react';
import { HistoryItem, UserProfile } from '../types';
import { supabase } from '../supabase';

const ADMIN_EMAIL = 'aarshiv.ai@gmail.com';

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

  const isSystemAdmin = profile.email === ADMIN_EMAIL;

  useEffect(() => {
    if (isSystemAdmin && activeTab === 'admin') {
      fetchAdminData();
    }
  }, [activeTab, isSystemAdmin]);

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
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-16">
        <div className="lg:col-span-8 pro-card p-12 rounded-sm flex flex-col md:flex-row items-center justify-between gap-12 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-48 h-48 bg-[#00ff9d]/5 rounded-full blur-3xl -translate-y-24 translate-x-24"></div>
          <div className="flex-1 relative z-10">
            <p className="text-[10px] font-black uppercase tracking-[0.4em] text-zinc-600 mb-3">INSTITUTIONAL_CREDITS</p>
            <h2 className="text-7xl font-black neon-text mb-10">{isSystemAdmin ? 'UNLIMITED' : profile.credits}</h2>
            <div className="flex gap-4">
              <button className="px-8 py-3 btn-pro rounded-sm text-[10px]">ADD_CREDITS</button>
              <button className="px-8 py-3 border border-[#1a1a1a] text-zinc-500 rounded-sm text-[10px] font-black uppercase tracking-widest hover:border-[#00ff9d] hover:text-[#00ff9d] transition-all">BILLING_HIST</button>
            </div>
          </div>
          <div className="text-right hidden md:block relative z-10">
            <p className="text-[10px] font-black uppercase text-zinc-600 mb-2">NETWORK_RATE</p>
            <p className="text-4xl font-bold text-white tracking-tighter">$0.50 <span className="text-[10px] text-zinc-600">/ SHEET</span></p>
          </div>
        </div>

        <div className="lg:col-span-4 pro-card p-12 rounded-sm flex flex-col justify-between">
           <div>
             <p className="text-[10px] font-black uppercase tracking-[0.4em] text-zinc-600 mb-3">TOTAL_OUTPUT</p>
             <h3 className="text-4xl font-black text-white">{profile.totalEvaluations} AUDITS</h3>
           </div>
           <div className="mt-10">
              <div className="flex justify-between text-[10px] font-black uppercase mb-4">
                <span className="text-zinc-600 tracking-widest">SYSTEM_LINK</span>
                <span className="text-[#00ff9d] animate-pulse">OPTIMIZED</span>
              </div>
              <div className="w-full h-1 bg-[#1a1a1a] rounded-full">
                 <div className="h-full bg-[#00ff9d] shadow-[0_0_15px_rgba(0,255,157,0.4)] w-full"></div>
              </div>
           </div>
        </div>
      </div>

      <div className="flex flex-col md:flex-row justify-between items-center mb-12 gap-8">
        <div className="flex gap-1 p-1 bg-[#0a0a0a] border border-[#1a1a1a] rounded-sm">
           <button 
             onClick={() => setActiveTab('history')}
             className={`px-8 py-3 rounded-sm text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'history' ? 'bg-[#141414] text-[#00ff9d] neon-text shadow-xl' : 'text-zinc-600 hover:text-white'}`}
           >
             VAULT_RECORDS
           </button>
           {isSystemAdmin && (
             <button 
               onClick={() => setActiveTab('admin')}
               className={`px-8 py-3 rounded-sm text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'admin' ? 'bg-[#141414] text-[#00ff9d] neon-text shadow-xl' : 'text-zinc-600 hover:text-white'}`}
             >
               SYSTEM_CREATOR
             </button>
           )}
        </div>
        <button 
          onClick={onNewEvaluation}
          disabled={!isSystemAdmin && profile.credits <= 0}
          className={`px-10 py-5 rounded-sm btn-pro shadow-2xl flex items-center gap-4 text-[10px] ${!isSystemAdmin && profile.credits <= 0 ? 'opacity-20 grayscale cursor-not-allowed' : ''}`}
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="4" d="M12 4v16m8-8H4" /></svg>
          INITIALIZE_BATCH
        </button>
      </div>

      <div className="pro-card rounded-sm overflow-hidden">
        {activeTab === 'history' ? (
          history.length === 0 ? (
            <div className="py-40 text-center">
              <p className="text-zinc-800 font-black uppercase text-[10px] tracking-[1em]">VAULT_EMPTY</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-[#0f0f0f] text-zinc-600 text-[9px] font-black uppercase tracking-[0.2em] border-b border-[#1a1a1a]">
                    <th className="px-10 py-6">IDENTIFIER</th>
                    <th className="px-10 py-6">COURSE_CODE</th>
                    <th className="px-10 py-6 text-center">PRECISION_SCORE</th>
                    <th className="px-10 py-6 text-center">PAGES</th>
                    <th className="px-10 py-6 text-right">OPERATIONS</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#1a1a1a]">
                  {history.map((item) => (
                    <tr key={item.id} className="hover:bg-[#0d0d0d] transition-colors">
                      <td className="px-10 py-8">
                        <p className="font-bold text-white text-[13px] tracking-tight mb-1 uppercase">{item.report.studentInfo.name}</p>
                        <p className="text-[9px] text-zinc-700 font-black uppercase tracking-wider">{new Date(item.timestamp).toLocaleString()}</p>
                      </td>
                      <td className="px-10 py-8">
                        <span className="px-3 py-1 bg-black border border-[#1a1a1a] rounded-sm text-[10px] font-bold text-zinc-500 uppercase tracking-widest">
                          {item.report.studentInfo.subject}
                        </span>
                      </td>
                      <td className="px-10 py-8 text-center">
                        <span className={`font-black text-[15px] ${item.report.percentage >= 40 ? 'text-[#00ff9d] neon-text' : 'text-red-500'}`}>
                          {item.report.percentage.toFixed(1)}%
                        </span>
                      </td>
                      <td className="px-10 py-8 text-center font-bold text-zinc-600 text-[11px]">
                        {item.pages_processed}
                      </td>
                      <td className="px-10 py-8 text-right">
                        <div className="flex justify-end gap-3">
                          <button onClick={() => onViewReport(item)} className="w-10 h-10 rounded-sm border border-[#1a1a1a] flex items-center justify-center text-zinc-600 hover:text-[#00ff9d] hover:border-[#00ff9d] transition-all">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                          </button>
                          <button onClick={() => onDeleteReport(item.id)} className="w-10 h-10 rounded-sm border border-[#1a1a1a] flex items-center justify-center text-zinc-800 hover:text-red-500 hover:border-red-500 transition-all">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
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
                  <tr className="bg-[#0f0f0f] text-zinc-600 text-[9px] font-black uppercase tracking-[0.2em] border-b border-[#1a1a1a]">
                     <th className="px-10 py-6">ENTITY_NAME</th>
                     <th className="px-10 py-6">RANK</th>
                     <th className="px-10 py-6">CREDIT_CAP</th>
                     <th className="px-10 py-6 text-center">AGGREGATE_AUDITS</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#1a1a1a] text-[12px]">
                  {allUsers.map(user => (
                    <tr key={user.id} className="hover:bg-[#0d0d0d] transition-colors">
                      <td className="px-10 py-7">
                        <p className="font-bold text-white uppercase tracking-tight">{user.name || '---'}</p>
                        <p className="text-[9px] text-zinc-700 font-black">{user.email}</p>
                      </td>
                      <td className="px-10 py-7">
                        <span className={`px-2 py-0.5 rounded-sm text-[9px] font-black uppercase ${user.role === 'admin' ? 'bg-[#00ff9d] text-black' : 'bg-[#1a1a1a] text-zinc-600'}`}>{user.role}</span>
                      </td>
                      <td className="px-10 py-7 font-black text-[#00ff9d] tracking-tighter text-sm">{user.email === ADMIN_EMAIL ? 'INF' : user.credits}</td>
                      <td className="px-10 py-7 text-center font-bold text-white text-sm">{user.totalEvaluations}</td>
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
