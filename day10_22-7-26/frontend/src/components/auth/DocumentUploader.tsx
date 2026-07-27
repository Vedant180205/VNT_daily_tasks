import React, { useRef } from 'react';
import { X, UploadCloud, FileText } from 'lucide-react';

interface DocumentUploaderProps {
  label: string;
  maxFiles?: number;
  files: File[];
  onChange: (files: File[]) => void;
  disabled?: boolean;
}

export const DocumentUploader: React.FC<DocumentUploaderProps> = ({ label, maxFiles = 2, files, onChange, disabled }) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const [limitError, setLimitError] = React.useState(false);
  const [typeError, setTypeError] = React.useState(false);

  const isDuplicate = (file: File, index: number) => {
    // Check if there is an identical file earlier in the files array
    const firstIndex = files.findIndex(f => f.name === file.name && f.size === file.size);
    return firstIndex !== -1 && firstIndex !== index; 
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const selectedFiles = Array.from(e.target.files);
      
      const combinedCount = files.length + selectedFiles.length;
      if (combinedCount > maxFiles) {
        setLimitError(true);
        if (inputRef.current) inputRef.current.value = '';
        return;
      }
      setLimitError(false);
      
      // Check file types
      const allowedTypes = ['image/jpeg', 'image/png', 'application/pdf'];
      const hasInvalidType = selectedFiles.some(file => !allowedTypes.includes(file.type));
      if (hasInvalidType) {
        setTypeError(true);
        if (inputRef.current) inputRef.current.value = '';
        return;
      }
      setTypeError(false);

      const totalFiles = [...files, ...selectedFiles].slice(0, maxFiles);
      
      onChange(totalFiles);
      if (inputRef.current) inputRef.current.value = '';
    }
  };

  const removeFile = (indexToRemove: number) => {
    onChange(files.filter((_, idx) => idx !== indexToRemove));
  };

  return (
    <div className="space-y-2 pt-2">
      <label className="text-sm font-medium text-text">{label}</label>
      
      {files.length < maxFiles && (
        <div 
          onClick={() => !disabled && inputRef.current?.click()}
          className={`border-2 border-dashed border-border rounded-lg p-6 flex flex-col items-center justify-center cursor-pointer hover:bg-border/30 transition-colors ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
          <UploadCloud className="w-8 h-8 text-muted mb-2" />
          <p className="text-sm text-muted text-center">Click to upload documents (Max {maxFiles})</p>
          <p className="text-xs text-muted/70 mt-1 text-center">PDF, JPG, PNG up to 5MB</p>
        </div>
      )}

      {limitError && (
        <p className="text-xs text-danger font-medium mt-1">Cannot add files. Maximum of {maxFiles} documents allowed.</p>
      )}
      
      {typeError && (
        <p className="text-xs text-danger font-medium mt-1">Invalid file type. Only PDF, JPG, and PNG are allowed.</p>
      )}

      <input 
        type="file" 
        ref={inputRef} 
        onChange={handleFileChange} 
        accept="image/png, image/jpeg, application/pdf" 
        multiple={maxFiles > 1} 
        className="hidden" 
        disabled={disabled}
      />

      {files.length > 0 && (
        <div className="flex gap-2 flex-wrap mt-3">
          {files.map((file, idx) => {
            const isPdf = file.type === 'application/pdf';
            const url = isPdf ? '' : URL.createObjectURL(file);
            const duplicate = isDuplicate(file, idx);
            return (
              <div key={idx} className={`relative w-24 h-24 rounded-md overflow-hidden border-2 group ${duplicate ? 'border-danger' : 'border-border'} flex items-center justify-center bg-background-alt`}>
                {isPdf ? (
                  <div className="flex flex-col items-center justify-center p-2 text-center">
                    <FileText className="w-8 h-8 text-blue-500 mb-1" />
                    <span className="text-[10px] text-muted line-clamp-1 w-full" title={file.name}>{file.name}</span>
                  </div>
                ) : (
                  <img 
                    src={url} 
                    alt="Preview" 
                    className={`w-full h-full object-cover ${duplicate ? 'opacity-50' : ''}`}
                  />
                )}
                
                {duplicate && (
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none bg-black/40">
                    <span className="bg-danger text-white text-[10px] font-bold px-1 rounded">Duplicate</span>
                  </div>
                )}
                {!disabled && (
                  <button 
                    type="button" 
                    onClick={() => removeFile(idx)}
                    className="absolute top-1 right-1 bg-black/60 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity z-10"
                  >
                    <X size={12} />
                  </button>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
