import React, { useState, useEffect } from 'react';
import { FileUpload } from './components/FileUpload';
import { SettingsPanel } from './components/SettingsPanel';
import { ChatBot } from './components/ChatBot';
import { processPdf } from './services/pdfService';
import { INITIAL_SETTINGS } from './constants';
import { ImpositionSettings, AppState } from './types';
import { Download, Printer, RotateCcw, AlertCircle, ExternalLink } from 'lucide-react';

const App: React.FC = () => {
  const [settings, setSettings] = useState<ImpositionSettings>(INITIAL_SETTINGS);
  const [file, setFile] = useState<File | null>(null);
  const [appState, setAppState] = useState<AppState>(AppState.IDLE);
  const [processedPdfUrl, setProcessedPdfUrl] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleFileSelect = async (selectedFile: File) => {
    setFile(selectedFile);
    await runProcessing(selectedFile, settings);
  };

  const handleSettingsUpdate = async (newSettings: ImpositionSettings) => {
    setSettings(newSettings);
    // Debounce processing if file exists
    if (file) {
      await runProcessing(file, newSettings);
    }
  };

  const runProcessing = async (inputFile: File, currentSettings: ImpositionSettings) => {
    try {
      setAppState(AppState.PROCESSING);
      setErrorMsg(null);
      
      const buffer = await inputFile.arrayBuffer();
      const processedBytes = await processPdf(new Uint8Array(buffer), currentSettings);
      
      const blob = new Blob([processedBytes], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      
      // Clean up old URL
      if (processedPdfUrl) URL.revokeObjectURL(processedPdfUrl);
      
      setProcessedPdfUrl(url);
      setAppState(AppState.COMPLETED);
    } catch (err) {
      console.error(err);
      setErrorMsg("Error procesando el PDF. Asegúrate de que no esté protegido con contraseña.");
      setAppState(AppState.ERROR);
    }
  };

  return (
    <div className="flex h-screen w-full bg-slate-950 text-slate-100 overflow-hidden">
      {/* Left Sidebar - Controls */}
      <aside className="w-80 lg:w-96 flex flex-col border-r border-slate-800 bg-slate-900 overflow-y-auto">
        <div className="p-6 border-b border-slate-800">
          <div className="flex items-center gap-3 mb-1">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center">
              <Printer className="w-5 h-5 text-white" />
            </div>
            <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400">
              ImpositionPro
            </h1>
          </div>
          <p className="text-xs text-slate-500">A4 to A3 Precision Tool</p>
        </div>

        <div className="p-6 space-y-8 flex-1">
          {/* Section 1: Upload */}
          <div className="space-y-3">
            <h2 className="text-sm uppercase tracking-wider text-slate-500 font-semibold">1. Archivo Fuente</h2>
            <FileUpload 
              onFileSelect={handleFileSelect} 
              isLoading={appState === AppState.PROCESSING} 
            />
            {file && (
               <div className="flex items-center gap-2 text-xs text-emerald-400 bg-emerald-400/10 p-2 rounded border border-emerald-400/20">
                 <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                 {file.name} cargado
               </div>
            )}
          </div>

          {/* Section 2: Settings */}
          <div className="space-y-3">
            <h2 className="text-sm uppercase tracking-wider text-slate-500 font-semibold">2. Calibración</h2>
            <SettingsPanel settings={settings} onUpdate={handleSettingsUpdate} />
          </div>

          {/* Actions */}
          {processedPdfUrl && (
            <div className="pt-4 border-t border-slate-800 space-y-2">
               <a 
                 href={processedPdfUrl} 
                 download={`imposition-${file?.name || 'result'}`}
                 className="flex items-center justify-center gap-2 w-full bg-blue-600 hover:bg-blue-500 text-white font-medium py-3 rounded-lg shadow-lg shadow-blue-500/20 transition-all transform hover:-translate-y-0.5"
               >
                 <Download className="w-4 h-4" />
                 Descargar A3 PDF
               </a>
               <a
                  href={processedPdfUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center justify-center gap-2 w-full bg-slate-800 hover:bg-slate-700 text-slate-300 text-sm font-medium py-2 rounded-lg transition-colors"
               >
                 <ExternalLink className="w-3 h-3" />
                 Abrir en Nueva Pestaña
               </a>
               <p className="text-center text-xs text-slate-500 mt-2">
                 Listo para imprimir
               </p>
            </div>
          )}
        </div>
      </aside>

      {/* Main Content - Preview */}
      <main className="flex-1 flex flex-col relative bg-slate-950/50">
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 pointer-events-none"></div>
        
        {/* Header */}
        <header className="h-16 border-b border-slate-800 flex items-center justify-between px-8 bg-slate-900/50 backdrop-blur-sm z-10">
          <div className="flex items-center gap-4">
             <span className="text-sm text-slate-400">Vista Previa</span>
             {appState === AppState.PROCESSING && (
               <span className="text-xs px-2 py-0.5 bg-blue-500/10 text-blue-400 rounded-full animate-pulse border border-blue-500/20">Procesando...</span>
             )}
          </div>
          <button 
            onClick={() => { setSettings(INITIAL_SETTINGS); setFile(null); setProcessedPdfUrl(null); }}
            className="text-xs text-slate-500 hover:text-white flex items-center gap-1 transition-colors"
          >
            <RotateCcw className="w-3 h-3" /> Reiniciar
          </button>
        </header>

        {/* Content Area */}
        <div className="flex-1 overflow-hidden relative flex">
          {/* PDF Preview Frame */}
          <div className="flex-1 flex items-center justify-center bg-slate-950 p-8 overflow-auto">
            {processedPdfUrl ? (
              <div className="w-full h-full relative rounded-lg shadow-2xl overflow-hidden border border-slate-800 bg-white">
                 <embed
                    src={`${processedPdfUrl}#toolbar=0&view=Fit`} 
                    type="application/pdf"
                    className="w-full h-full"
                 />
                 <div className="absolute bottom-4 right-4 bg-black/70 text-white text-xs px-3 py-1 rounded backdrop-blur pointer-events-none">
                    Usa "Abrir en Nueva Pestaña" si no ves el PDF
                 </div>
              </div>
            ) : (
              <div className="text-center space-y-4 max-w-md">
                <div className="w-20 h-20 bg-slate-900 rounded-2xl mx-auto flex items-center justify-center border border-slate-800">
                  <Printer className="w-10 h-10 text-slate-700" />
                </div>
                <h3 className="text-xl font-medium text-slate-300">Esperando archivo</h3>
                <p className="text-slate-500">
                  Sube tu PDF (A4 Frentes y Dorsos intercalados) para reacomodarlo en A3 listo para corte.
                </p>
              </div>
            )}
            
            {errorMsg && (
              <div className="absolute top-8 left-1/2 -translate-x-1/2 bg-red-500/90 text-white px-4 py-2 rounded-lg shadow-xl flex items-center gap-2 backdrop-blur-md">
                <AlertCircle className="w-5 h-5" />
                {errorMsg}
              </div>
            )}
          </div>

          {/* Right Panel - Chat Assistant */}
          <div className="w-80 border-l border-slate-800 bg-slate-900/80 backdrop-blur-md z-20 flex flex-col">
            <ChatBot settings={settings} />
          </div>
        </div>
      </main>
    </div>
  );
};

export default App;