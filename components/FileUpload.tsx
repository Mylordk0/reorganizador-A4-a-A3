import React, { useCallback } from 'react';
import { Upload, FileText } from 'lucide-react';

interface FileUploadProps {
  onFileSelect: (file: File) => void;
  isLoading: boolean;
}

export const FileUpload: React.FC<FileUploadProps> = ({ onFileSelect, isLoading }) => {
  const handleDrop = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      if (isLoading) return;
      if (e.dataTransfer.files && e.dataTransfer.files[0]) {
        const file = e.dataTransfer.files[0];
        if (file.type === 'application/pdf') {
          onFileSelect(file);
        } else {
          alert('Por favor sube solo archivos PDF.');
        }
      }
    },
    [onFileSelect, isLoading]
  );

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      onFileSelect(e.target.files[0]);
    }
  };

  return (
    <div
      onDrop={handleDrop}
      onDragOver={(e) => e.preventDefault()}
      className={`border-2 border-dashed rounded-xl p-8 flex flex-col items-center justify-center transition-all duration-300
        ${isLoading 
          ? 'border-slate-700 bg-slate-900/50 opacity-50 cursor-not-allowed' 
          : 'border-slate-600 hover:border-blue-500 bg-slate-800/30 hover:bg-slate-800/50 cursor-pointer'
        }
      `}
    >
      <input
        type="file"
        accept="application/pdf"
        onChange={handleChange}
        disabled={isLoading}
        className="hidden"
        id="pdf-upload"
      />
      <label htmlFor="pdf-upload" className="flex flex-col items-center cursor-pointer w-full h-full">
        <div className="bg-slate-700/50 p-4 rounded-full mb-4">
          {isLoading ? (
             <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
          ) : (
            <Upload className="w-8 h-8 text-blue-400" />
          )}
        </div>
        <h3 className="text-lg font-semibold text-slate-200 mb-1">
          {isLoading ? 'Procesando...' : 'Arrastra tu PDF aquí'}
        </h3>
        <p className="text-sm text-slate-400 text-center max-w-xs">
          Soporta archivos PDF A4 estándar. Convertiremos automáticamente a formato A3 de imposición.
        </p>
        {!isLoading && (
          <span className="mt-4 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium rounded-lg transition-colors">
            O selecciona archivo
          </span>
        )}
      </label>
    </div>
  );
};
