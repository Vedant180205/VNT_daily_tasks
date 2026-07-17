import React, { useRef } from 'react';
import { X, UploadCloud } from 'lucide-react';

interface ImageUploaderProps {
  label: string;
  maxFiles?: number;
  files: File[];
  onChange: (files: File[]) => void;
  disabled?: boolean;
  existingImages?: string[];
  onRemoveExisting?: (url: string) => void;
  onErrorChange?: (hasError: boolean) => void;
}

export const ImageUploader: React.FC<ImageUploaderProps> = ({ label, maxFiles = 1, files, onChange, disabled, existingImages = [], onRemoveExisting, onErrorChange }) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const [limitError, setLimitError] = React.useState(false);
  
  const totalCount = files.length + existingImages.length;

  const getExistingFilename = (url: string) => {
    const parts = url.split('/');
    const fullFileName = parts[parts.length - 1]; // e.g. 1783421902158-966155675-my_dog.jpg
    const nameParts = fullFileName.split('-');
    if (nameParts.length >= 3) {
      return nameParts.slice(2).join('-');
    }
    return '';
  };

  const existingNames = existingImages.map(getExistingFilename).filter(Boolean);

  const isDuplicate = (file: File, index: number) => {
    const safeName = file.name.replace(/[^a-zA-Z0-9.\-_]/g, '_');
    if (existingNames.includes(safeName)) return true;
    
    // Check if there is an identical file earlier in the `files` array
    const firstIndex = files.findIndex(f => f.name === file.name && f.size === file.size);
    return firstIndex !== index; 
  };

  React.useEffect(() => {
    if (onErrorChange) {
      const hasDuplicates = files.some((file, idx) => isDuplicate(file, idx));
      onErrorChange(hasDuplicates);
    }
  }, [files, existingImages, onErrorChange]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const selectedFiles = Array.from(e.target.files);
      
      const combinedCount = files.length + existingImages.length + selectedFiles.length;
      if (combinedCount > maxFiles) {
        setLimitError(true);
        if (inputRef.current) inputRef.current.value = '';
        return;
      }
      
      setLimitError(false);

      const remainingSlots = Math.max(0, maxFiles - existingImages.length);
      const totalFiles = [...files, ...selectedFiles].slice(0, remainingSlots);
      
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
      
      {totalCount < maxFiles && (
        <div 
          onClick={() => !disabled && inputRef.current?.click()}
          className={`border-2 border-dashed border-border rounded-lg p-6 flex flex-col items-center justify-center cursor-pointer hover:bg-border/30 transition-colors ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
          <UploadCloud className="w-8 h-8 text-muted mb-2" />
          <p className="text-sm text-muted">Click to upload {maxFiles > 1 ? 'images' : 'an image'} (Max {maxFiles})</p>
          <p className="text-xs text-muted/70 mt-1">PNG, JPG up to 2MB</p>
        </div>
      )}

      {limitError && (
        <p className="text-xs text-danger font-medium mt-1">Cannot add files. Maximum of {maxFiles} images allowed.</p>
      )}

      <input 
        type="file" 
        ref={inputRef} 
        onChange={handleFileChange} 
        accept="image/png, image/jpeg" 
        multiple={maxFiles > 1} 
        className="hidden" 
        disabled={disabled}
      />

      {(files.length > 0 || existingImages.length > 0) && (
        <div className="flex gap-2 flex-wrap mt-3">
          {existingImages.map((url, idx) => (
            <div key={`existing-${idx}`} className="relative w-20 h-20 rounded-md overflow-hidden border border-border group">
              <img 
                src={`http://localhost:3000${url}`} 
                alt="Existing Preview" 
                className="w-full h-full object-cover"
              />
              {!disabled && onRemoveExisting && (
                <button 
                  type="button" 
                  onClick={() => onRemoveExisting(url)}
                  className="absolute top-1 right-1 bg-black/60 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <X size={12} />
                </button>
              )}
            </div>
          ))}
          
          {files.map((file, idx) => {
            const url = URL.createObjectURL(file);
            const duplicate = isDuplicate(file, idx);
            return (
              <div key={idx} className={`relative w-20 h-20 rounded-md overflow-hidden border-2 group ${duplicate ? 'border-danger' : 'border-border'}`}>
                <img 
                  src={url} 
                  alt="Preview" 
                  className={`w-full h-full object-cover ${duplicate ? 'opacity-50' : ''}`}
                />
                {duplicate && (
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
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
