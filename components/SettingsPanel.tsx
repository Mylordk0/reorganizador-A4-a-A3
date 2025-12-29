import React from 'react';
import { ImpositionSettings } from '../types';
import { Settings2, MoveHorizontal, MoveVertical, Minimize, Columns, ArrowLeftRight } from 'lucide-react';

interface SettingsPanelProps {
  settings: ImpositionSettings;
  onUpdate: (newSettings: ImpositionSettings) => void;
}

export const SettingsPanel: React.FC<SettingsPanelProps> = ({ settings, onUpdate }) => {
  const handleChange = (key: keyof ImpositionSettings, value: number | boolean) => {
    onUpdate({ ...settings, [key]: value });
  };

  return (
    <div className="glass-panel p-6 rounded-xl space-y-6">
      <div className="flex items-center gap-2 border-b border-slate-700 pb-4">
        <Settings2 className="w-5 h-5 text-blue-400" />
        <h2 className="text-lg font-semibold">Configuración de Alineación</h2>
      </div>

      <div className="space-y-5">
        {/* Horizontal Offset */}
        <div>
          <label className="flex items-center justify-between text-sm text-slate-300 mb-2">
            <span className="flex items-center gap-2"><MoveHorizontal className="w-4 h-4" /> Desplazamiento X (Global)</span>
            <span className="font-mono text-blue-400">{settings.xOffsetMm} mm</span>
          </label>
          <input
            type="range"
            min="-50"
            max="50"
            step="0.5"
            value={settings.xOffsetMm}
            onChange={(e) => handleChange('xOffsetMm', parseFloat(e.target.value))}
            className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-blue-500"
          />
        </div>

         {/* Duplex Correction */}
         <div className="bg-slate-800/50 p-3 rounded-lg border border-slate-700/50">
          <label className="flex items-center justify-between text-sm text-yellow-100/80 mb-2">
            <span className="flex items-center gap-2"><ArrowLeftRight className="w-4 h-4" /> Corrección Dorso (mm)</span>
            <span className="font-mono text-yellow-400">{settings.duplexCorrection} mm</span>
          </label>
          <input
            type="range"
            min="-20"
            max="20"
            step="0.5"
            value={settings.duplexCorrection}
            onChange={(e) => handleChange('duplexCorrection', parseFloat(e.target.value))}
            className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-yellow-500"
          />
          <p className="text-[10px] text-slate-400 mt-2 leading-tight">
            Ajusta SOLO las páginas traseras. Úsalo si la imagen del reverso no coincide con el frente al imprimir a doble cara.
          </p>
        </div>

        {/* Vertical Offset */}
        <div>
          <label className="flex items-center justify-between text-sm text-slate-300 mb-2">
            <span className="flex items-center gap-2"><MoveVertical className="w-4 h-4" /> Desplazamiento Y</span>
            <span className="font-mono text-blue-400">{settings.yOffsetMm} mm</span>
          </label>
          <input
            type="range"
            min="-50"
            max="50"
            step="0.5"
            value={settings.yOffsetMm}
            onChange={(e) => handleChange('yOffsetMm', parseFloat(e.target.value))}
            className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-blue-500"
          />
        </div>

        {/* Gutter */}
        <div>
          <label className="flex items-center justify-between text-sm text-slate-300 mb-2">
            <span className="flex items-center gap-2"><Columns className="w-4 h-4" /> Separación Central (mm)</span>
            <span className="font-mono text-blue-400">{settings.gutterMm} mm</span>
          </label>
          <input
            type="range"
            min="0"
            max="20"
            step="1"
            value={settings.gutterMm}
            onChange={(e) => handleChange('gutterMm', parseFloat(e.target.value))}
            className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-blue-500"
          />
        </div>

        {/* Scale */}
        <div>
          <label className="flex items-center justify-between text-sm text-slate-300 mb-2">
            <span className="flex items-center gap-2"><Minimize className="w-4 h-4" /> Escala (%)</span>
            <span className="font-mono text-blue-400">{Math.round(settings.scale * 100)}%</span>
          </label>
          <input
            type="range"
            min="0.8"
            max="1.2"
            step="0.01"
            value={settings.scale}
            onChange={(e) => handleChange('scale', parseFloat(e.target.value))}
            className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-blue-500"
          />
        </div>

        {/* Guides Toggle */}
        <div className="flex items-center justify-between pt-2">
          <span className="text-sm text-slate-300">Dibujar línea central y etiquetas</span>
          <button
            onClick={() => handleChange('drawCenterLine', !settings.drawCenterLine)}
            className={`w-11 h-6 flex items-center rounded-full transition-colors duration-200 ${
              settings.drawCenterLine ? 'bg-blue-600' : 'bg-slate-700'
            }`}
          >
            <span
              className={`w-4 h-4 bg-white rounded-full shadow-md transform transition-transform duration-200 ${
                settings.drawCenterLine ? 'translate-x-6' : 'translate-x-1'
              }`}
            />
          </button>
        </div>
      </div>
    </div>
  );
};