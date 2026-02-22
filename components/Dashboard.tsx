import React, { useState, useEffect } from 'react';
import { HistoryItem, UserProfile } from '../types';
import { supabase } from '../supabase';
import { 
  History, 
  ShieldCheck, 
  CreditCard, 
  Plus, 
  Eye, 
  Trash2, 
  Users, 
  TrendingUp,
  Search,
  ChevronRight,
  MoreVertical,
  ArrowUpRight,
  ArrowDownRight,
  Loader2,
  Calendar,
  BookOpen,
  FileText,
  AlertCircle
} from 'lucide-react';

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
  const [loadingAdmin, setLoadingAdmin] = useState(false);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const isSystemAdmin = profile.email === ADMIN_EMAIL;

  useEffect(() => {
    if (isSystemAdmin && activeTab === 'admin') {
      fetchAdminData();
    }
  }, [activeTab, isSystemAdmin]);

  const fetchAdminData = async () => {
    setLoadingAdmin(true);
    try {
      const { data: users } = await supabase.from('profiles').select('*').order('joinedDate', { ascending: false });
      if (users) setAllUsers(users);
    } catch (err) {
      console.error("Admin fetch error", err);
    } finally {
      setLoadingAdmin(false);
    }
  };

  const handleAdjustCredits = async (userId: string, amount: number) => {
    setActionLoading(userId);
    try {
      const targetUser = allUsers.find(u => u.id === userId);
      if (!targetUser) return;
      
      const newCredits = Math.max(0, targetUser.credits + amount);
      const { error } = await supabase
        .from('profiles')
        .update({ credits: newCredits })
        .eq('id', userId);

      if (error) throw error;
      
      setAllUsers(prev => prev.map(u => u.id === userId ? { ...u, credits: newCredits } : u));
    } catch (err) {
      console.error("Failed to adjust credits", err);
    } finally {
      setActionLoading(null);
    }
  };

  const filteredHistory = history.filter(item => 
    item.report.studentInfo.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.report.studentInfo.subject.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="animate-fade-in space-y-10">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="bg-card text-card-foreground rounded-3xl border border-border/50 shadow-[0_8px_30px_rgb(0,0,0,0.04)] transition-all duration-500 hover:shadow-[0_20px_40px_rgb(0,0,0,0.08)] hover:border-brand-500/20 p-8 relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-8 text-brand-500/10 group-hover:scale-110 transition-transform duration-500">
            <CreditCard size={80} />
          </div>
          <div className="relative z-10">
            <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-4">Available Credits</p>
            <div className="flex items-baseline gap-2">
              <h3 className="text-4xl font-black tracking-tight">{isSystemAdmin ? '∞' : profile.credits}</h3>
              <span className="text-xs font-bold text-brand-600">UNITS</span>
            </div>
            <div className="mt-6 flex items-center gap-2 text-[10px] font-bold text-emerald-500 bg-emerald-500/10 w-fit px-3 py-1 rounded-full border border-emerald-500/20">
              <ShieldCheck size={12} />
              Verified Balance
            </div>
          </div>
        </div>

        <div className="bg-card text-card-foreground rounded-3xl border border-border/50 shadow-[0_8px_30px_rgb(0,0,0,0.04)] transition-all duration-500 hover:shadow-[0_20px_40px_rgb(0,0,0,0.08)] hover:border-brand-500/20 p-8 relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-8 text-brand-500/10 group-hover:scale-110 transition-transform duration-500">
            <TrendingUp size={80} />
          </div>
          <div className="relative z-10">
            <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-4">Total Audits</p>
            <div className="flex items-baseline gap-2">
              <h3 className="text-4xl font-black tracking-tight">{profile.totalEvaluations}</h3>
              <span className="text-xs font-bold text-brand-600">RECORDS</span>
            </div>
            <div className="mt-6 flex items-center gap-2 text-[10px] font-bold text-brand-600 bg-brand-500/10 w-fit px-3 py-1 rounded-full border border-brand-500/20">
              <History size={12} />
              Lifetime Activity
            </div>
          </div>
        </div>

        <div className="bg-card text-card-foreground rounded-3xl border border-border/50 shadow-[0_8px_30px_rgb(0,0,0,0.04)] transition-all duration-500 hover:shadow-[0_20px_40px_rgb(0,0,0,0.08)] hover:border-brand-500/20 p-8 bg-brand-500 text-white relative overflow-hidden group border-none">
          <div className="absolute top-0 right-0 p-8 text-white/10 group-hover:scale-110 transition-transform duration-500">
            <Plus size={80} />
          </div>
          <div className="relative z-10 h-full flex flex-col justify-between">
            <div>
              <p className="text-xs font-bold opacity-70 uppercase tracking-widest mb-4">Quick Action</p>
              <h3 className="text-2xl font-bold leading-tight">Ready to evaluate <br />a new batch?</h3>
            </div>
            <button 
              onClick={onNewEvaluation}
              className="mt-8 w-full bg-white text-brand-600 rounded-2xl py-4 text-sm font-black uppercase tracking-widest hover:bg-white/90 transition-all shadow-xl shadow-black/10 active:scale-95"
            >
              Start New Batch
            </button>
          </div>
        </div>
      </div>

      {/* Main Content Section */}
      <div className="bg-card text-card-foreground rounded-3xl border border-border/50 shadow-[0_8px_30px_rgb(0,0,0,0.04)] transition-all duration-500 hover:shadow-[0_20px_40px_rgb(0,0,0,0.08)] hover:border-brand-500/20 overflow-hidden">
        <div className="p-8 border-b border-border/50 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="flex items-center gap-2 p-1.5 bg-muted rounded-2xl w-fit border border-border/50">
            <button 
              onClick={() => setActiveTab('history')}
              className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs font-bold transition-all duration-300 ${activeTab === 'history' ? 'bg-background shadow-lg text-foreground' : 'text-muted-foreground hover:text-foreground'}`}
            >
              <FileText size={14} />
              Evaluation Vault
            </button>
            {isSystemAdmin && (
              <button 
                onClick={() => setActiveTab('admin')}
                className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs font-bold transition-all duration-300 ${activeTab === 'admin' ? 'bg-background shadow-lg text-foreground' : 'text-muted-foreground hover:text-foreground'}`}
              >
                <Users size={14} />
                Admin Panel
              </button>
            )}
          </div>

          {activeTab === 'history' && (
            <div className="relative group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-brand-500 transition-colors" size={18} />
              <input 
                type="text" 
                placeholder="Search by student or subject..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="flex h-14 w-full rounded-2xl border border-border bg-background/50 px-5 py-2 text-sm transition-all duration-300 placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 pl-12 w-full lg:w-80 h-12"
              />
            </div>
          )}
        </div>

        <div className="overflow-x-auto">
          {activeTab === 'history' ? (
            filteredHistory.length === 0 ? (
              <div className="py-32 text-center">
                <div className="w-20 h-20 bg-muted rounded-3xl flex items-center justify-center mx-auto mb-6 text-muted-foreground/30">
                  <History size={32} />
                </div>
                <h3 className="font-bold text-xl mb-2">No records found</h3>
                <p className="text-muted-foreground text-sm max-w-xs mx-auto leading-relaxed">Your evaluation history will appear here once you complete your first audit.</p>
                <button 
                  onClick={onNewEvaluation}
                  className="mt-8 text-brand-600 font-bold text-sm hover:underline"
                >
                  Start your first evaluation
                </button>
              </div>
            ) : (
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-muted/30 text-muted-foreground text-[10px] font-bold uppercase tracking-widest border-b border-border/50">
                    <th className="px-8 py-5">Student Identity</th>
                    <th className="px-8 py-5">Course / Subject</th>
                    <th className="px-8 py-5 text-center">Performance</th>
                    <th className="px-8 py-5 text-center">Pages</th>
                    <th className="px-8 py-5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/50">
                  {filteredHistory.map((item) => (
                    <tr key={item.id} className="hover:bg-muted/20 transition-colors group">
                      <td className="px-8 py-6">
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 rounded-xl bg-brand-500/10 text-brand-600 flex items-center justify-center font-bold text-xs">
                            {item.report.studentInfo.name.charAt(0)}
                          </div>
                          <div className="flex flex-col">
                            <span className="font-bold text-sm group-hover:text-brand-600 transition-colors">{item.report.studentInfo.name}</span>
                            <div className="flex items-center gap-2 text-[10px] text-muted-foreground font-medium mt-0.5">
                              <Calendar size={10} />
                              {new Date(item.timestamp).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-8 py-6">
                        <div className="flex items-center gap-2">
                          <BookOpen size={14} className="text-muted-foreground" />
                          <span className="text-xs font-bold text-muted-foreground uppercase tracking-tight">
                            {item.report.studentInfo.subject}
                          </span>
                        </div>
                      </td>
                      <td className="px-8 py-6">
                        <div className="flex flex-col items-center gap-2">
                          <span className={`font-black text-lg leading-none ${item.report.percentage >= 40 ? 'text-emerald-500' : 'text-destructive'}`}>
                            {item.report.percentage.toFixed(1)}%
                          </span>
                          <div className="w-20 h-1.5 bg-muted rounded-full overflow-hidden">
                            <div 
                              className={`h-full transition-all duration-1000 ${item.report.percentage >= 40 ? 'bg-emerald-500' : 'bg-destructive'}`} 
                              style={{ width: `${item.report.percentage}%` }}
                            />
                          </div>
                        </div>
                      </td>
                      <td className="px-8 py-6 text-center font-bold text-muted-foreground text-xs">
                        {item.pages_processed}
                      </td>
                      <td className="px-8 py-6 text-right">
                        <div className="flex justify-end gap-2">
                          <button 
                            onClick={() => onViewReport(item)} 
                            className="w-10 h-10 rounded-xl hover:bg-brand-500 hover:text-white transition-all duration-300 text-muted-foreground flex items-center justify-center border border-transparent hover:shadow-lg hover:shadow-brand-500/20"
                            title="View Detailed Report"
                          >
                            <Eye size={18} />
                          </button>
                          <button 
                            onClick={() => onDeleteReport(item.id)} 
                            className="w-10 h-10 rounded-xl hover:bg-destructive hover:text-white transition-all duration-300 text-muted-foreground flex items-center justify-center border border-transparent hover:shadow-lg hover:shadow-destructive/20"
                            title="Delete Record"
                          >
                            <Trash2 size={18} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-muted/30 text-muted-foreground text-[10px] font-bold uppercase tracking-widest border-b border-border/50">
                    <th className="px-8 py-5">Institution Entity</th>
                    <th className="px-8 py-5">Access Level</th>
                    <th className="px-8 py-5 text-center">Credit Balance</th>
                    <th className="px-8 py-5 text-center">Total Audits</th>
                    <th className="px-8 py-5 text-right">Administrative Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/50">
                  {allUsers.map(user => (
                    <tr key={user.id} className={`hover:bg-muted/20 transition-colors ${user.email === ADMIN_EMAIL ? 'bg-brand-500/5' : ''}`}>
                      <td className="px-8 py-6">
                        <div className="flex flex-col">
                          <span className="font-bold text-sm">{user.name || 'Unnamed Institution'}</span>
                          <span className="text-xs text-muted-foreground font-medium">{user.email}</span>
                        </div>
                      </td>
                      <td className="px-8 py-6">
                        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${user.role === 'admin' ? 'bg-brand-500 text-white' : 'bg-muted text-muted-foreground'}`}>
                          {user.role === 'admin' && <ShieldCheck size={10} />}
                          {user.role}
                        </span>
                      </td>
                      <td className="px-8 py-6 text-center">
                        <span className="font-black text-brand-600 text-lg tracking-tight">
                          {user.email === ADMIN_EMAIL ? '∞' : user.credits}
                        </span>
                      </td>
                      <td className="px-8 py-6 text-center font-bold text-sm">{user.totalEvaluations}</td>
                      <td className="px-8 py-6 text-right">
                        {user.email !== ADMIN_EMAIL && (
                          <div className="flex justify-end gap-3">
                            <button 
                              onClick={() => handleAdjustCredits(user.id, 50)}
                              disabled={actionLoading === user.id}
                              className="px-4 py-2 bg-muted hover:bg-brand-500 hover:text-white rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all disabled:opacity-50 shadow-sm"
                            >
                              +50 Credits
                            </button>
                            <button 
                              onClick={() => handleAdjustCredits(user.id, -50)}
                              disabled={actionLoading === user.id}
                              className="px-4 py-2 bg-muted hover:bg-destructive hover:text-white rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all disabled:opacity-50 shadow-sm"
                            >
                              -50 Credits
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {loadingAdmin && (
                <div className="py-20 flex flex-col items-center justify-center gap-4">
                  <Loader2 className="w-10 h-10 text-brand-500 animate-spin" />
                  <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Fetching Institution Data</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
