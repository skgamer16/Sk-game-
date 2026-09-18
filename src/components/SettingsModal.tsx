import React from 'react';
import { Settings as SettingsIcon, X, Volume2, Sparkles, Smartphone, Eye } from 'lucide-react';
import { GameSettings } from '../types/game';

interface SettingsModalProps {
  settings: GameSettings;
  onUpdateSettings: (newSettings: Partial<GameSettings>) => void;
  onClose: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  settings,
  onUpdateSettings,
  onClose,
}) => {
  return (
    <div className="absolute inset-0 z-30 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md select-none font-tech animate-fade-in">
      <div className="w-full max-w-lg bg-gradient-to-b from-slate-900 to-slate-950 border-2 border-slate-700/80 rounded-3xl p-6 shadow-2xl flex flex-col max-h-[90vh] relative">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <SettingsIcon className="h-6 w-6 text-slate-300" />
            <h2 className="font-cyber text-xl md:text-2xl font-black text-white">
              SYSTEM SETTINGS
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Settings Form */}
        <div className="flex-1 overflow-y-auto space-y-4 my-4 pr-1">
          {/* Audio Section */}
          <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-3">
            <div className="flex items-center gap-2 text-cyan-300 font-cyber text-xs font-bold">
              <Volume2 className="h-4 w-4" />
              AUDIO SYNTHESIS
            </div>

            <div>
              <div className="flex justify-between text-xs text-slate-400 mb-1">
                <span>Sound FX Volume</span>
                <span className="font-code">{Math.round(settings.soundVolume * 100)}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={settings.soundVolume}
                onChange={(e) => onUpdateSettings({ soundVolume: parseFloat(e.target.value) })}
                className="w-full accent-cyan-400 h-1.5 bg-slate-800 rounded-lg cursor-pointer"
              />
            </div>

            <div>
              <div className="flex justify-between text-xs text-slate-400 mb-1">
                <span>Music Synth Volume</span>
                <span className="font-code">{Math.round(settings.musicVolume * 100)}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={settings.musicVolume}
                onChange={(e) => onUpdateSettings({ musicVolume: parseFloat(e.target.value) })}
                className="w-full accent-pink-400 h-1.5 bg-slate-800 rounded-lg cursor-pointer"
              />
            </div>
          </div>

          {/* Visual Effects & Shake */}
          <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-3">
            <div className="flex items-center gap-2 text-pink-300 font-cyber text-xs font-bold">
              <Sparkles className="h-4 w-4" />
              JUICE & SCREEN SHAKE
            </div>

            <div className="flex items-center justify-between">
              <div>
                <div className="text-xs font-bold text-white">Screen Shake FX</div>
                <div className="text-[11px] text-slate-400">Tactile impact feedback on slashes and hits</div>
              </div>
              <button
                onClick={() => onUpdateSettings({ screenShake: !settings.screenShake })}
                className={`px-3 py-1 rounded-lg font-cyber text-xs font-bold border transition-colors cursor-pointer ${
                  settings.screenShake
                    ? 'bg-pink-950/60 border-pink-500/50 text-pink-300'
                    : 'bg-slate-800 border-slate-700 text-slate-400'
                }`}
              >
                {settings.screenShake ? 'ON' : 'OFF'}
              </button>
            </div>

            {settings.screenShake && (
              <div>
                <div className="flex justify-between text-xs text-slate-400 mb-1">
                  <span>Shake Intensity</span>
                  <span className="font-code">{settings.shakeStrength.toFixed(1)}x</span>
                </div>
                <input
                  type="range"
                  min="0.4"
                  max="1.6"
                  step="0.1"
                  value={settings.shakeStrength}
                  onChange={(e) => onUpdateSettings({ shakeStrength: parseFloat(e.target.value) })}
                  className="w-full accent-pink-400 h-1.5 bg-slate-800 rounded-lg cursor-pointer"
                />
              </div>
            )}
          </div>

          {/* Controls & Display */}
          <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-3">
            <div className="flex items-center gap-2 text-amber-300 font-cyber text-xs font-bold">
              <Smartphone className="h-4 w-4" />
              TOUCH CONTROLS & HUD
            </div>

            <div className="flex items-center justify-between">
              <div>
                <div className="text-xs font-bold text-white">Touch Action Buttons</div>
                <div className="text-[11px] text-slate-400">On-screen buttons for mobile devices</div>
              </div>
              <button
                onClick={() => onUpdateSettings({ touchControls: !settings.touchControls })}
                className={`px-3 py-1 rounded-lg font-cyber text-xs font-bold border transition-colors cursor-pointer ${
                  settings.touchControls
                    ? 'bg-amber-950/60 border-amber-500/50 text-amber-300'
                    : 'bg-slate-800 border-slate-700 text-slate-400'
                }`}
              >
                {settings.touchControls ? 'SHOW' : 'HIDE'}
              </button>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-xs text-slate-300">
                <Eye className="h-4 w-4 text-cyan-400" />
                <span>Show FPS Counter</span>
              </div>
              <button
                onClick={() => onUpdateSettings({ showFps: !settings.showFps })}
                className={`px-3 py-1 rounded-lg font-cyber text-xs font-bold border transition-colors cursor-pointer ${
                  settings.showFps
                    ? 'bg-cyan-950/60 border-cyan-500/50 text-cyan-300'
                    : 'bg-slate-800 border-slate-700 text-slate-400'
                }`}
              >
                {settings.showFps ? 'ON' : 'OFF'}
              </button>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="pt-2 border-t border-slate-800 flex justify-end">
          <button
            onClick={onClose}
            className="px-6 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-cyber text-xs font-bold transition-all cursor-pointer"
          >
            SAVE & CLOSE
          </button>
        </div>
      </div>
    </div>
  );
};
