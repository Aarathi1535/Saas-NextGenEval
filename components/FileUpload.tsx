import React from 'react';
import { UploadedFile } from '../types';
import { 
  Upload, 
  File, 
  X, 
  CheckCircle2, 
  AlertCircle, 
  Image as ImageIcon,
  FileText,
  CloudUpload,
  Info,
  Loader2
} from 'lucide-react';

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
    <div className="w-full animate-fade-in">
      <div className="flex justify-between items-center mb-4 px-2">
        <div className="flex items-center gap-2">
          <label className="text-sm font-bold text-foreground tracking-tight">
            {label}
          </label>
          {required && (
            <span className="flex items-center justify-center w-5 h-5 rounded-full bg-destructive/10 text-destructive text-[10px] font-bold">
              *
            </span>
          )}
        </div>
        <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-muted border border-border/50">
          <FileText size={10} className="text-muted-foreground" />
          <span className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider">
            {files.length} {files.length === 1 ? 'File' : 'Files'}
          </span>
        </div>
      </div>
      
      <div className="space-y-4">
        <label className="relative flex flex-col items-center justify-center w-full h-56 border-2 border-dashed border-border rounded-[2rem] cursor-pointer hover:border-brand-500 hover:bg-brand-500/5 transition-all duration-500 group bg-muted/20 overflow-hidden">
          {/* Decorative Background Pattern */}
          <div className="absolute inset-0 opacity-[0.03] pointer-events-none group-hover:opacity-[0.05] transition-opacity">
            <div className="absolute inset-0" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, currentColor 1px, transparent 0)', backgroundSize: '24px 24px' }}></div>
          </div>

          <div className="relative z-10 flex flex-col items-center justify-center p-8 text-center">
            <div className="w-16 h-16 bg-background border border-border rounded-3xl flex items-center justify-center mb-6 group-hover:scale-110 group-hover:rotate-3 group-hover:border-brand-500 transition-all duration-500 shadow-xl shadow-black/5">
              <CloudUpload className="w-8 h-8 text-muted-foreground group-hover:text-brand-500 transition-colors" />
            </div>
            <h4 className="text-base font-bold text-foreground mb-2">Drop your documents here</h4>
            <p className="text-xs text-muted-foreground font-medium max-w-[200px] leading-relaxed">
              Support for PDF and high-res images up to 3MB each.
            </p>
          </div>
          <input type="file" className="hidden" multiple={multiple} onChange={handleChange} accept="image/*,application/pdf" />
        </label>
        
        {files.length > 0 && (
          <div className="grid grid-cols-1 gap-3">
            {files.map((f, idx) => (
              <div key={idx} className="flex items-center gap-4 p-5 bg-card border border-border/50 rounded-3xl animate-fade-in shadow-sm group hover:border-brand-500/30 transition-colors">
                <div className="w-12 h-12 rounded-2xl border border-border bg-muted flex items-center justify-center text-muted-foreground shrink-0 overflow-hidden shadow-inner">
                  {f.file.type.includes('image') ? (
                    <img src={f.preview} alt="Preview" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                  ) : (
                    <FileText size={24} className="group-hover:text-brand-500 transition-colors" />
                  )}
                </div>
                <div className="flex-grow min-w-0">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-bold text-foreground truncate pr-4">{f.file.name}</span>
                    <span className="text-[10px] font-black text-muted-foreground/60 uppercase tracking-tighter">
                      {(f.file.size / (1024 * 1024)).toFixed(2)} MB
                    </span>
                  </div>
                  <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                    <div 
                      className={`h-full transition-all duration-1000 ease-out ${f.status === 'complete' ? 'bg-brand-500' : f.status === 'error' ? 'bg-destructive' : 'bg-brand-400 animate-pulse'}`}
                      style={{ width: `${f.progress}%` }}
                    />
                  </div>
                </div>
                <div className="shrink-0 ml-2">
                  {f.status === 'complete' ? (
                    <div className="w-8 h-8 rounded-full bg-emerald-500/10 text-emerald-500 flex items-center justify-center">
                      <CheckCircle2 size={18} />
                    </div>
                  ) : f.status === 'error' ? (
                    <div className="w-8 h-8 rounded-full bg-destructive/10 text-destructive flex items-center justify-center">
                      <AlertCircle size={18} />
                    </div>
                  ) : (
                    <div className="w-8 h-8 flex items-center justify-center">
                      <Loader2 className="w-6 h-6 text-brand-500 animate-spin" />
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {files.length === 0 && (
          <div className="flex items-center gap-3 px-4 py-3 rounded-2xl bg-brand-500/5 border border-brand-500/10 text-[10px] font-bold text-brand-700/60 uppercase tracking-widest">
            <Info size={14} />
            Mandatory for institutional processing
          </div>
        )}
      </div>
    </div>
  );
};

export default FileUpload;
