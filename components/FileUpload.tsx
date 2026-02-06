
import React from 'react';
import { UploadedFile } from '../types';

interface FileUploadProps {
  label: string;
  onFilesSelected: (files: File[]) => void;
  files: UploadedFile[];
  multiple?: boolean;
  required?: boolean;
}

const FileUpload: React.FC<FileUploadProps> = ({ label, onFilesSelected, files, multiple = true, required = false }) => {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      onFilesSelected(Array.from(e.target.files));
    }
  };

  return (
    <div className="w-full">
      <div className="flex justify-between items-center mb-3">
        <label className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.2em] ml-1">
          {label} {required && <span className="text-[#00ff9d]">*</span>}
        </label>
        <span className="text-[9px] text-zinc-700 font-black uppercase">
          COUNT: {files.length}
        </span>
      </div>
      
      <div className="space-y-4">
        <label className="relative flex flex-col items-center justify-center w-full h-40 border-2 border-dashed border-[#222] rounded-xl cursor-pointer hover:border-[#00ff9d] hover:bg-[#00ff9d]/5 transition-all group bg-[#0a0a0a]">
          <div className="flex flex-col items-center justify-center p-6 text-center">
            <div className="w-12 h-12 bg-black border border-[#222] rounded flex items-center justify-center mb-3 group-hover:neon-glow group-hover:border-[#00ff9d] transition-all">
              <svg className="w-6 h-6 text-zinc-600 group-hover:text-[#00ff9d] transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
              </svg>
            </div>
            <p className="text-[10px] text-white font-black uppercase tracking-widest">UPLOAD_DOCUMENT</p>
            <p className="mt-1 text-[8px] text-zinc-600 font-bold uppercase tracking-tighter">MAX_PAYLOAD: 3MB / PDF_IMG</p>
          </div>
          <input type="file" className="hidden" multiple={multiple} onChange={handleChange} accept="image/*,application/pdf" />
        </label>
        
        {files.length > 0 && (
          <div className="grid grid-cols-1 gap-3">
            {files.map((f, idx) => (
              <div key={idx} className="flex items-center gap-4 p-4 bg-[#0a0a0a] border border-[#1a1a1a] rounded-xl animate-in fade-in slide-in-from-left-2 duration-300">
                <div className="w-10 h-10 rounded border border-[#222] bg-black flex items-center justify-center text-zinc-500 shrink-0 overflow-hidden">
                  {f.file.type.includes('image') ? (
                    <img src={f.preview} alt="Preview" className="w-full h-full object-cover opacity-50" />
                  ) : (
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 16h1v1h-1v-1zm1-11H7v14h10V9h-4V5zm-1 4h3l-3-3v3z" /></svg>
                  )}
                </div>
                <div className="flex-grow min-w-0">
                  <span className="text-[10px] font-black text-white truncate tracking-tight uppercase block mb-1.5">{f.file.name}</span>
                  <div className="h-1 w-full bg-[#1a1a1a] rounded-full overflow-hidden">
                    <div 
                      className={`h-full transition-all duration-1000 ${f.status === 'complete' ? 'bg-[#00ff9d] neon-glow' : 'bg-white'}`}
                      style={{ width: `${f.progress}%` }}
                    />
                  </div>
                </div>
                {f.status === 'complete' && (
                  <div className="text-[#00ff9d]">
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default FileUpload;
