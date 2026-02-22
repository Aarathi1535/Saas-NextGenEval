import React from 'react';
import { EvaluationReport } from '../types';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Cell } from 'recharts';
import { 
  ArrowLeft, 
  Printer, 
  Plus, 
  User, 
  BookOpen, 
  Hash, 
  MessageSquare, 
  CheckCircle2, 
  AlertCircle,
  TrendingUp,
  FileText,
  Award,
  ChevronRight,
  Info,
  Calendar,
  GraduationCap,
  ShieldCheck
} from 'lucide-react';

interface EvaluationReportViewProps {
  report: EvaluationReport;
  onReset: () => void;
}

const EvaluationReportView: React.FC<EvaluationReportViewProps> = ({ report, onReset }) => {
  const barData = report.grades.map(g => ({
    name: `Q${g.questionNumber}`,
    score: g.marksObtained,
    total: g.totalMarks
  }));

  const handleDownload = () => window.print();

  const RadialGauge = ({ score, max, size = 240 }: { score: number, max: number, size?: number }) => {
    const percentage = Math.min(100, Math.max(0, (score / max) * 100));
    const radius = size * 0.4;
    const strokeWidth = 16;
    const circumference = 2 * Math.PI * radius;
    const strokeDashoffset = circumference - (percentage / 100) * circumference;

    return (
      <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
        <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="transform -rotate-90">
          <circle cx={size / 2} cy={size / 2} r={radius} stroke="currentColor" strokeWidth={strokeWidth} fill="transparent" className="text-muted/30" />
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke="currentColor"
            strokeWidth={strokeWidth}
            fill="transparent"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            className={`transition-all duration-1000 ease-out ${percentage >= 40 ? 'text-brand-500' : 'text-destructive'}`}
            style={{ filter: `drop-shadow(0 0 8px ${percentage >= 40 ? 'rgba(34, 197, 94, 0.3)' : 'rgba(239, 68, 68, 0.3)'})` }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
          <div className="flex items-baseline gap-1">
            <span className="text-6xl font-black tracking-tighter">{score}</span>
            <span className="text-xl font-bold text-muted-foreground">/{max}</span>
          </div>
          <div className="mt-2 px-3 py-1 rounded-full bg-muted text-[10px] font-black uppercase tracking-widest text-muted-foreground border border-border/50">
            Total Score
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="animate-fade-in max-w-6xl mx-auto space-y-10">
      {/* Header Section */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-8 no-print">
        <div className="space-y-4">
          <button 
            onClick={onReset} 
            className="group flex items-center gap-2 text-xs font-bold text-muted-foreground hover:text-brand-600 transition-all uppercase tracking-widest"
          >
            <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center group-hover:bg-brand-500 group-hover:text-white transition-all">
              <ArrowLeft size={14} />
            </div>
            Back to Dashboard
          </button>
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-brand-500 rounded-3xl flex items-center justify-center text-white shadow-xl shadow-brand-500/20">
              <GraduationCap size={32} />
            </div>
            <div>
              <h1 className="text-4xl md:text-5xl font-black tracking-tight leading-none">Academic Audit</h1>
              <p className="text-muted-foreground font-bold text-sm mt-2 flex items-center gap-2">
                <Calendar size={14} />
                Generated on {new Date().toLocaleDateString(undefined, { dateStyle: 'long' })}
              </p>
            </div>
          </div>
        </div>
        <div className="flex gap-4 w-full lg:w-auto">
          <button 
            onClick={handleDownload} 
            className="flex-1 lg:flex-none inline-flex items-center justify-center rounded-2xl px-6 py-3 text-sm font-semibold transition-all duration-300 active:scale-95 disabled:opacity-50 disabled:pointer-events-none bg-muted hover:bg-muted/80 h-14 px-8 gap-3 text-xs font-bold uppercase tracking-widest shadow-sm"
          >
            <Printer size={18} />
            Export PDF
          </button>
          <button 
            onClick={onReset} 
            className="flex-1 lg:flex-none inline-flex items-center justify-center rounded-2xl px-6 py-3 text-sm font-semibold transition-all duration-300 active:scale-95 disabled:opacity-50 disabled:pointer-events-none bg-brand-500 text-white hover:bg-brand-600 shadow-lg shadow-brand-500/20 h-14 px-8 gap-3 text-xs font-bold uppercase tracking-widest shadow-xl shadow-brand-500/20"
          >
            <Plus size={18} />
            New Evaluation
          </button>
        </div>
      </div>

      {/* Top Grid: Student Info & Score */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        <div className="lg:col-span-8 bg-card text-card-foreground rounded-3xl border border-border/50 shadow-[0_8px_30px_rgb(0,0,0,0.04)] transition-all duration-500 hover:shadow-[0_20px_40px_rgb(0,0,0,0.08)] hover:border-brand-500/20 p-10 flex flex-col justify-between relative overflow-hidden">
          <div className="absolute top-0 right-0 p-10 text-brand-500/5">
            <User size={120} />
          </div>
          
          <div className="relative z-10">
            <div className="flex items-center gap-3 text-brand-600 mb-10">
              <Info size={18} />
              <h2 className="text-xs font-black uppercase tracking-[0.2em]">Institutional Identity</h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
              <div className="space-y-2">
                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Student Name</p>
                <p className="text-2xl font-black tracking-tight">{report.studentInfo.name}</p>
              </div>
              <div className="space-y-2">
                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Roll Number</p>
                <p className="text-2xl font-black tracking-tight">{report.studentInfo.rollNumber || 'N/A'}</p>
              </div>
              <div className="space-y-2">
                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Course / Subject</p>
                <p className="text-2xl font-black tracking-tight text-brand-600">{report.studentInfo.subject}</p>
              </div>
            </div>
          </div>

          <div className="mt-12 flex items-center gap-6 p-6 bg-muted/30 rounded-[2rem] border border-border/50">
            <div className="flex -space-x-3">
              {[1, 2, 3].map(i => (
                <div key={i} className="w-10 h-10 rounded-full border-4 border-background bg-muted flex items-center justify-center text-[10px] font-bold text-muted-foreground">
                  AI
                </div>
              ))}
            </div>
            <p className="text-xs font-bold text-muted-foreground leading-relaxed">
              This report has been audited by three independent AI sub-models to ensure maximum grading accuracy and fairness.
            </p>
          </div>
        </div>

        <div className="lg:col-span-4 bg-card text-card-foreground rounded-3xl border border-border/50 shadow-[0_8px_30px_rgb(0,0,0,0.04)] transition-all duration-500 hover:shadow-[0_20px_40px_rgb(0,0,0,0.08)] hover:border-brand-500/20 p-10 flex flex-col items-center justify-center text-center">
          <RadialGauge score={report.totalScore} max={report.maxScore} />
          <div className="mt-8 space-y-4">
            <div className={`inline-flex items-center gap-2 px-6 py-2 rounded-full text-[11px] font-black tracking-widest uppercase border ${report.percentage >= 40 ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-600' : 'bg-destructive/10 border-destructive/20 text-destructive'}`}>
              {report.percentage >= 40 ? <CheckCircle2 size={14} /> : <AlertCircle size={14} />}
              {report.percentage >= 40 ? 'Merit Secured' : 'Review Required'}
            </div>
            <p className="text-xs font-bold text-muted-foreground">
              Final Percentage: <span className="text-foreground">{report.percentage.toFixed(1)}%</span>
            </p>
          </div>
        </div>
      </div>

      {/* Middle Grid: Performance Chart & Feedback */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        <div className="lg:col-span-7 bg-card text-card-foreground rounded-3xl border border-border/50 shadow-[0_8px_30px_rgb(0,0,0,0.04)] transition-all duration-500 hover:shadow-[0_20px_40px_rgb(0,0,0,0.08)] hover:border-brand-500/20 p-10">
          <div className="flex items-center justify-between mb-12">
            <div className="flex items-center gap-3 text-muted-foreground">
              <TrendingUp size={18} />
              <h2 className="text-xs font-black uppercase tracking-[0.2em]">Performance Matrix</h2>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-brand-500"></div>
                <span className="text-[10px] font-bold text-muted-foreground uppercase">Pass</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-destructive"></div>
                <span className="text-[10px] font-bold text-muted-foreground uppercase">Fail</span>
              </div>
            </div>
          </div>
          
          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={barData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <XAxis 
                  dataKey="name" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{fill: 'currentColor', fontSize: 11, fontWeight: 700}} 
                  className="text-muted-foreground"
                />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{fill: 'currentColor', fontSize: 11, fontWeight: 700}} 
                  className="text-muted-foreground"
                />
                <Tooltip 
                  cursor={{fill: 'currentColor', opacity: 0.05}} 
                  contentStyle={{
                    backgroundColor: 'hsl(var(--card))', 
                    border: '1px solid hsl(var(--border))', 
                    borderRadius: '20px', 
                    fontSize: '12px',
                    fontWeight: 'bold',
                    boxShadow: '0 20px 40px -10px rgb(0 0 0 / 0.1)'
                  }} 
                />
                <Bar dataKey="score" radius={[8, 8, 8, 8]} barSize={36}>
                  {barData.map((entry, index) => (
                    <Cell 
                      key={`cell-${index}`} 
                      fill={entry.score / entry.total >= 0.4 ? 'hsl(var(--brand-500))' : 'rgb(239 68 68)'} 
                      fillOpacity={0.9}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="lg:col-span-5 bg-card text-card-foreground rounded-3xl border border-border/50 shadow-[0_8px_30px_rgb(0,0,0,0.04)] transition-all duration-500 hover:shadow-[0_20px_40px_rgb(0,0,0,0.08)] hover:border-brand-500/20 p-10 flex flex-col bg-foreground text-background dark:bg-card dark:text-card-foreground">
          <div className="flex items-center gap-3 text-brand-500 mb-8">
            <MessageSquare size={20} />
            <h2 className="text-xs font-black uppercase tracking-[0.2em]">Executive Summary</h2>
          </div>
          <div className="flex-grow flex items-center">
            <p className="text-2xl font-bold leading-relaxed italic opacity-90">
              "{report.generalFeedback}"
            </p>
          </div>
          <div className="mt-12 pt-8 border-t border-background/10 dark:border-border flex items-center justify-between">
             <div className="flex items-center gap-3 text-[10px] font-black uppercase tracking-widest opacity-50">
               <Award size={18} className="text-brand-500" />
               AI Verified
             </div>
             <div className="w-12 h-12 rounded-2xl bg-brand-500/20 flex items-center justify-center text-brand-500">
               <ShieldCheck size={24} />
             </div>
          </div>
        </div>
      </div>

      {/* Bottom Table: Detailed Breakdown */}
      <div className="bg-card text-card-foreground rounded-3xl border border-border/50 shadow-[0_8px_30px_rgb(0,0,0,0.04)] transition-all duration-500 hover:shadow-[0_20px_40px_rgb(0,0,0,0.08)] hover:border-brand-500/20 overflow-hidden mb-20">
        <div className="p-8 border-b border-border/50 bg-muted/30 flex items-center justify-between">
           <div className="flex items-center gap-3 text-muted-foreground">
             <FileText size={20} />
             <h2 className="text-xs font-black uppercase tracking-[0.2em]">Detailed Question Breakdown</h2>
           </div>
           <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest bg-background px-4 py-1.5 rounded-full border border-border/50">
             {report.grades.length} Questions Audited
           </span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-muted/50 text-muted-foreground text-[10px] font-black uppercase tracking-widest border-b border-border/50">
                <th className="px-10 py-6">Question</th>
                <th className="px-10 py-6 w-1/3">Student Response</th>
                <th className="px-10 py-6 text-center">Score</th>
                <th className="px-10 py-6 w-1/3">AI Observations</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/50">
              {report.grades.map((grade, idx) => (
                <tr key={idx} className="hover:bg-muted/10 transition-colors group">
                  <td className="px-10 py-10 align-top">
                    <div className="w-12 h-12 rounded-2xl bg-muted flex items-center justify-center font-black text-sm text-muted-foreground group-hover:bg-brand-500 group-hover:text-white transition-all duration-500">
                      Q{grade.questionNumber}
                    </div>
                  </td>
                  <td className="px-10 py-10 align-top">
                    <div className="space-y-6">
                      <p className="text-base font-bold leading-relaxed">{grade.studentAnswer}</p>
                      <div className="p-6 bg-muted/50 rounded-[2rem] border border-border/50 relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-4 opacity-5">
                          <CheckCircle2 size={40} />
                        </div>
                        <p className="text-[10px] font-black text-brand-600 uppercase tracking-widest mb-3">Expected Schema</p>
                        <p className="text-sm text-muted-foreground leading-relaxed font-medium italic">{grade.correctAnswer}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-10 py-10 align-top text-center">
                    <div className="inline-flex flex-col items-center gap-2">
                      <span className={`text-xl font-black ${grade.marksObtained / grade.totalMarks >= 0.4 ? 'text-brand-600' : 'text-destructive'}`}>
                        {grade.marksObtained}
                      </span>
                      <div className="w-8 h-[2px] bg-border"></div>
                      <span className="text-xs font-bold text-muted-foreground">{grade.totalMarks}</span>
                    </div>
                  </td>
                  <td className="px-10 py-10 align-top">
                    <div className="flex gap-4 p-6 bg-brand-500/5 rounded-[2rem] border border-brand-500/10">
                      <MessageSquare size={18} className="text-brand-500 shrink-0 mt-1" />
                      <p className="text-sm text-muted-foreground leading-relaxed font-medium">{grade.feedback}</p>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default EvaluationReportView;
