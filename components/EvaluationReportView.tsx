
import React from 'react';
import { EvaluationReport } from '../types';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip } from 'recharts';

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

  const RadialGauge = ({ score, max, size = 200 }: { score: number, max: number, size?: number }) => {
    const percentage = Math.min(100, Math.max(0, (score / max) * 100));
    const radius = size * 0.4;
    const strokeWidth = 10;
    const circumference = 2 * Math.PI * radius;
    const strokeDashoffset = circumference - (percentage / 100) * circumference;

    return (
      <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
        <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="transform -rotate-90">
          <circle cx={size / 2} cy={size / 2} r={radius} stroke="#141414" strokeWidth={strokeWidth} fill="transparent" />
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke="#00ff9d"
            strokeWidth={strokeWidth}
            fill="transparent"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            className="transition-all duration-1000 ease-out"
            style={{ filter: 'drop-shadow(0 0 5px rgba(0, 255, 157, 0.8))' }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
          <span className="text-4xl font-black text-white tracking-tighter neon-text">{score}</span>
          <div className="w-10 h-[2px] bg-[#00ff9d] my-1"></div>
          <span className="text-lg font-black text-zinc-600">{max}</span>
        </div>
      </div>
    );
  };

  return (
    <div className="animate-in fade-in slide-in-from-bottom-10 duration-1000 print-container">
      <div className="flex flex-col lg:flex-row justify-between items-start mb-16 gap-10 no-print">
        <div className="space-y-4">
          <button onClick={onReset} className="text-[#00ff9d] font-black text-[10px] uppercase tracking-[0.3em] flex items-center gap-2 hover:opacity-70 transition-all">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
            BACK_TO_CORE
          </button>
          <h1 className="text-5xl font-black text-white tracking-tighter">Academic_Audit.</h1>
        </div>
        <div className="flex gap-4 w-full lg:w-auto">
          <button onClick={handleDownload} className="flex-1 lg:flex-none bg-transparent border border-[#222] text-white px-8 py-4 rounded-xl font-black text-[10px] uppercase tracking-widest hover:border-[#00ff9d] transition-all">
            PRINT_RECORD
          </button>
          <button onClick={onReset} className="flex-1 lg:flex-none btn-neon px-8 py-4 rounded-xl">
            NEW_BATCH
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-8">
        <div className="lg:col-span-8 bg-[#0a0a0a] border border-[#1a1a1a] p-10 rounded-2xl card-3d">
          <div className="flex items-center gap-4 mb-12">
            <div className="w-12 h-12 bg-black border border-[#222] rounded flex items-center justify-center text-[#00ff9d]">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path></svg>
            </div>
            <h2 className="text-[11px] font-black uppercase tracking-[0.3em] text-zinc-500">Subject Identity</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-y-10 gap-x-12">
            <div>
              <p className="text-[9px] font-black text-zinc-600 uppercase tracking-widest mb-1">Entity Name</p>
              <p className="text-lg font-black text-white uppercase truncate">{report.studentInfo.name}</p>
            </div>
            <div>
              <p className="text-[9px] font-black text-zinc-600 uppercase tracking-widest mb-1">Roll_ID</p>
              <p className="text-lg font-black text-white">{report.studentInfo.rollNumber || '---'}</p>
            </div>
            <div>
              <p className="text-[9px] font-black text-zinc-600 uppercase tracking-widest mb-1">Course Code</p>
              <p className="text-lg font-black text-[#00ff9d] uppercase truncate">{report.studentInfo.subject}</p>
            </div>
          </div>
        </div>

        <div className="lg:col-span-4 bg-[#0a0a0a] border border-[#1a1a1a] p-10 rounded-2xl flex flex-col items-center justify-center card-3d">
          <RadialGauge score={report.totalScore} max={report.maxScore} />
          <div className={`mt-8 px-6 py-2 rounded-full text-[10px] font-black tracking-[0.2em] uppercase border ${report.percentage >= 40 ? 'bg-[#00ff9d]/10 border-[#00ff9d]/30 text-[#00ff9d]' : 'bg-red-900/10 border-red-900/30 text-red-500'}`}>
            {report.percentage >= 40 ? 'MERIT SECURED' : 'REVIEW NEEDED'}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-8">
        <div className="lg:col-span-7 bg-[#0a0a0a] border border-[#1a1a1a] p-10 rounded-2xl card-3d">
          <h2 className="text-[11px] font-black uppercase tracking-[0.3em] text-zinc-500 mb-10">Grade Matrix</h2>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={barData} margin={{ top: 0, right: 0, left: -25, bottom: 0 }}>
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#444', fontSize: 10, fontWeight: 900}} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#444', fontSize: 10, fontWeight: 900}} />
                <Tooltip cursor={{fill: 'rgba(255,255,255,0.05)'}} contentStyle={{backgroundColor: '#000', border: '1px solid #222', borderRadius: '8px', color: '#fff', fontSize: '10px'}} />
                <Bar dataKey="score" fill="#00ff9d" radius={[2, 2, 0, 0]} barSize={24} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="lg:col-span-5 bg-black border border-[#1a1a1a] p-10 rounded-2xl card-3d flex flex-col">
          <h2 className="text-[11px] font-black uppercase tracking-[0.3em] text-[#00ff9d] mb-6">Expert Feedback</h2>
          <p className="text-lg leading-relaxed italic text-zinc-400 font-medium">
            "{report.generalFeedback}"
          </p>
          <div className="mt-auto pt-10 text-[9px] font-black uppercase tracking-[0.4em] text-zinc-800 flex items-center gap-3">
             <div className="w-1.5 h-1.5 rounded-full bg-[#00ff9d] neon-glow animate-pulse"></div>
             Node Verified Evaluation
          </div>
        </div>
      </div>

      <div className="bg-[#0a0a0a] border border-[#1a1a1a] rounded-2xl overflow-hidden mb-20 card-3