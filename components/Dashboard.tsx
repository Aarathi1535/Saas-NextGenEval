
import React, { useState, useEffect } from 'react';
import { HistoryItem, BillingInfo, UserProfile } from '../types';
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
    <div className="animate-in fade-in slide-in-from-bottom-3 duration-700">
      {/* Credit Status & Pricing */}
      <div className="mb-10 flex flex-col lg:flex-row gap-6">
        <div className="flex-1 bg-gradient-to-br from-indigo-600 to-violet-700 p-8 rounded-[32px] text-white shadow-xl shadow-indigo-100 flex items-center justify-between overflow-hidden relative group">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-y-32 translate-x-32"></div>
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.2em] opacity-80 mb-2">Institutional Credits Available</p>
            <h2 className="text-5xl font-black tracking-tighter mb-4">{profile.credits}</h2>
            <div className="flex gap-4">
              <button className="px-5 py-2.5 bg-white text-indigo-700 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-50 transition-all">Purchase Plan</button>
              <button className="px-5 py-2.5 bg-indigo-500/30 border border-white/20 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-indigo-500/40 transition-all">Redeem Coupon</button>
            </div>
          </div>
          <div className="hidden sm:block text-right">
             <p className="text-[10px] font-black uppercase tracking-widest opacity-80">Charge per sheet</p>
             <p className="text-2xl font-black">$0.50</p>
          </div>
        </div>

        <div className="lg:w-80 bg-white p-8 rounded-[32px] border border-slate-100 shadow-xl flex flex-col justify-between">
           <div>
             <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Global Usage</p>
             <h3 className="text-2xl font-black text-slate-800 tracking-tighter">{profile.totalEvaluations} Sheets</h3>
           </div>
           <div className="mt-6">
              <div className="flex justify-between text-[10px] font-black text-slate-400 uppercase mb-2">
                <span>Free Trial Used</span>
                <span className={profile.freeTrialUsed ? 'text-red-500' : 'text-emerald-500'}>{profile.freeTrialUsed ? 'YES' : 'NO'}</span>
              </div>
              <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                 <div className="h-full bg-indigo-500" style={{ width: profile.freeTrialUsed ? '100%' : '0%' }}></div>
              </div>
           </div>
        </div>
      </div>

      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-6">
        <div className="flex gap-4 p-1 bg-slate-100 rounded-2xl border border-slate-200">
           <button 
             onClick={() => setActiveTab('history')}
             className={`px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'history' ? 'bg-white shadow-sm text-indigo-600' : 'text-slate-500'}`}
           >
             Institutional Vault
           </button>
           {profile.role === 'admin' && (
             <button 
               onClick={() => setActiveTab('admin')}
               className={`px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'admin' ? 'bg-white shadow-sm text-indigo-600' : 'text-slate-500'}`}
             >
               System Admin
             </button>
           )}
        </div>
        <button 
          onClick={onNewEvaluation}
          disabled={profile.credits <= 0}
          className={`w-full sm:w-auto px-8 py-4 rounded-2xl font-black shadow-xl transition-all active:scale-95 flex items-center justify-center gap-3 uppercase text-[11px] tracking-widest ${profile.credits > 0 ? 'bg-indigo-600 text-white hover:bg-indigo-700' : 'bg-slate-200 text-slate-400 cursor-not-allowed'}`}
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="4" d="M12 4v16m8-8H4" /></svg>
          New Evaluation Batch
        </button>
      </div>

      {activeTab === 'history' ? (
        <div className="bg-white rounded-[32px] border border-slate-100 shadow-xl overflow-hidden">
          <div className="px-10 py-6 border-b border-slate-50 bg-slate-50/50 flex justify-between items-center">
            <h2 className="text-[11px] font-black text-slate-800 uppercase tracking-widest">Evaluation Records</h2>
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">SOC2 TYPE II COMPLIANT</span>
          </div>
          
          {history.length === 0 ? (
            <div className="p-24 text-center">
              <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto mb-6 text-slate-300">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
              </div>
              <p className="text-slate-400 font-black uppercase text-[10px] tracking-widest">No institutional records found</p>
            </div>
          ) : (
            <div className="overflow-x-auto scrollbar-thin">
              <table className="w-full text-left min-w-[640px]">
                <thead>
                  <tr className="bg-slate-50 text-slate-400 text-[10px] font-black uppercase tracking-widest">
                    <th className="px-10 py-5">Student / Batch</th>
                    <th className="px-10 py-5">Course</th>
                    <th className="px-10 py-5 text-center">Perf. Score</th>
                    <th className="px-10 py-5 text-center">Sheets</th>
                    <th className="px-10 py-5 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {history.map((item) => (
                    <tr key={item.id} className="hover:bg-indigo-50/30 transition-colors group">
                      <td className="px-10 py-7">
                        <p className="font-black text-slate-900 text-[13px] tracking-tight mb-1 uppercase truncate max-w-[150px]">{item.report.studentInfo.name}</p>
                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">{new Date(item.timestamp).toLocaleDateString()}</p>
                      </td>
                      <td className="px-10 py-7">
                        <span className="px-3 py-1 bg-indigo-50 rounded-lg text-[10px] font-black text-indigo-600 uppercase tracking-widest">
                          {item.report.studentInfo.subject}
                        </span>
                      </td>
                      <td className="px-10 py-7 text-center">
                        <div className="flex flex-col items-center">
                          <span className={`font-black text-[14px] tracking-tighter ${item.report.percentage >= 40 ? 'text-indigo-600' : 'text-red-500'}`}>
                            {item.report.percentage.toFixed(1)}%
                          </span>
                          <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">ACCURACY</p>
                        </div>
                      </td>
                      <td className="px-10 py-7 text-center">
                        <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest whitespace-nowrap">{item.pages_processed} PAGES</span>
                      </td>
                      <td className="px-10 py-7 text-right">
                        <div className="flex justify-end gap-2">
                          <button onClick={() => onViewReport(item)} className="p-3 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-all">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                          </button>
                          <button onClick={() => onDeleteReport(item.id)} className="p-3 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      ) : (
        /* Admin View */
        <div className="space-y-6">
           <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white p-8 rounded-[32px] border border-slate-100 shadow-xl">
                 <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Total System Users</p>
                 <p className="text-4xl font-black text-slate-900">{allUsers.length}</p>
              </div>
              <div className="bg-white p-8 rounded-[32px] border border-slate-100 shadow-xl">
                 <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Total System Evaluations</p>
                 <p className="text-4xl font-black text-slate-900">{allEvaluations.length}</p>
              </div>
              <div className="bg-white p-8 rounded-[32px] border border-slate-100 shadow-xl">
                 <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Active Trial Instances</p>
                 <p className="text-4xl font-black text-indigo-600">{allUsers.filter(u => !u.freeTrialUsed).length}</p>
              </div>
           </div>

           <div className="bg-white rounded-[32px] border border-slate-100 shadow-xl overflow-hidden">
             <div className="px-10 py-6 border-b border-slate-50 bg-indigo-50/30 flex justify-between items-center">
                <h2 className="text-[11px] font-black text-slate-800 uppercase tracking-widest">Global Institutional Performance</h2>
                {loadingAdmin && <div className="w-4 h-4 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>}
             </div>
             <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="bg-slate-50 text-slate-400 text-[10px] font-black uppercase tracking-widest">
                       <th className="px-10 py-5">Institution</th>
                       <th className="px-10 py-5">Role</th>
                       <th className="px-10 py-5">Credits</th>
                       <th className="px-10 py-5 text-center">Total Sheets</th>
                       <th className="px-10 py-5 text-right">Joined</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-[12px]">
                    {allUsers.map(user => (
                      <tr key={user.id} className="hover:bg-slate-50">
                        <td className="px-10 py-5">
                          <p className="font-bold text-slate-900 uppercase">{user.name}</p>
                          <p className="text-[10px] text-slate-400">{user.email}</p>
                        </td>
                        <td className="px-10 py-5">
                          <span className={`px-2 py-0.5 rounded-md text-[9px] font-black uppercase ${user.role === 'admin' ? 'bg-indigo-600 text-white' : 'bg-slate-200 text-slate-500'}`}>{user.role}</span>
                        </td>
                        <td className="px-10 py-5 font-bold text-slate-600">{user.credits}</td>
                        <td className="px-10 py-5 text-center font-black text-indigo-600">{user.totalEvaluations}</td>
                        <td className="px-10 py-5 text-right text-slate-400 font-medium">{new Date(user.joinedDate).toLocaleDateString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
             </div>
           </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
