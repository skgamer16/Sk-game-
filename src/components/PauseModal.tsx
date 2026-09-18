import React from 'react';
import { Play, RotateCcw, Home, Volume2, Sparkles, Smartphone } from 'lucide-react';
import { GameSettings } from '../types/game';

interface PauseModalProps {
  onResume: () => void;
  onRestart: () => void;
  onHome: () => void;
  settings: GameSettings;
  onUpdateSettings: (newSettings: Partial<GameSettings>) => void;
  isMuted: boolean;
  onToggleMute: () => void;
}

export const PauseModal: React.FC<PauseModalProps> = ({
  onResume,
  onRestart,
  onHome,
  settings,
  onUpdateSettings,
  isMuted,
  onToggleMute,
}) => {
  return (
    <div className="absolute inset-0 z-30 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md select-none font-tech animate-fade-in">
      <div className="w-full max-w-md bg-gradient-to-b from-slate-900 to-slate-950 border-2 border-cyan-500/40 rounded-3xl p-6 md:p-8 shadow-2xl flex flex-col items-center text-center relative overflow-hidden">
        {/* Header */}
        <h2 className="font-cyber text-2xl md:text-3xl font-black tracking-wider text-white mb-6 drop-shadow-[0_0_10px_rgba(6,182,212,0.6)]">
          // SYSTEM PAUSED
        </h2>

        {/* Action Buttons */}
        <div className="w-full flex flex-col gap-2.5 mb-6">
          <button
            onClick={onResume}
            className="flex items-center justify-center gap-2 w-full py-3.5 px-6 rounded-2xl bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-cyber text-base font-bold shadow-lg shadow-cyan-500/30 hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer border border-cyan-300/40"
          >
            <Play className="h-5 w-5 fill-white" />
            <span>RESUME [ ESC ]</span>
          </button>

          <button
            onClick={onRestart}
            className="flex items-center justify-center gap-2 w-full py-3 px-6 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-cyber text-sm font-bold transition-all cursor-pointer"
          >
            <RotateCcw className="h-4 w-4" />
            <span>RESTART RUN [ R ]</span>
          </button>

          <button
            onClick={onHome}
            className="flex items-center justify-center gap-2 w-full py-3 px-6 rounded-2xl bg-slate-800/80 hover:bg-slate-700 text-slate-300 border border-slate-700/80 font-cyber text-sm font-bold transition-all cursor-pointer"
          >
            <Home className="h-4 w-4" />
            <span>QUIT TO MENU</span>
          </button>
        </div>

        {/* In-Game Quick Settings */}
        <div className="w-full bg-slate-900/90 border border-slate-800 p-4 rounded-2xl flex flex-col gap-3 text-left">
          <div className="text-xs text-slate-400 font-cyber uppercase tracking-wider font-bold">
            Audio & FX
          </div>

          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-300 flex items-center gap-1.5">
              <Volume2 className="h-4 w-4 text-cyan-400" />
              Master Sound
            </span>
            <button
              onClick={onToggleMute}
              className={`px-3 py-1 rounded-lg text-xs font-cyber font-bold border transition-colors cursor-pointer ${
                isMuted
                  ? 'bg-red-950/60 border-red-500/50 text-red-400'
                  : 'bg-cyan-950/60 border-cyan-500/50 text-cyan-300'
              }`}
            >
              {isMuted ? 'MUTED' : 'ACTIVE'}
            </button>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-300 flex items-center gap-1.5">
              <Sparkles className="h-4 w-4 text-pink-400" />
              Screen Shake
            </span>
            <button
              onClick={() => onUpdateSettings({ screenShake: !settings.screenShake })}
              className={`px-3 py-1 rounded-lg text-xs font-cyber font-bold border transition-colors cursor-pointer ${
                settings.screenShake
                  ? 'bg-pink-950/60 border-pink-500/50 text-pink-300'
                  : 'bg-slate-800 border-slate-700 text-slate-400'
              }`}
            >
              {settings.screenShake ? 'ENABLED' : 'DISABLED'}
            </button>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-300 flex items-center gap-1.5">
              <Smartphone className="h-4 w-4 text-amber-400" />
              Touch Controls
            </span>
            <button
              onClick={() => onUpdateSettings({ touchControls: !settings.touchControls })}
              className={`px-3 py-1 rounded-lg text-xs font-cyber font-bold border transition-colors cursor-pointer ${
                settings.touchControls
                  ? 'bg-amber-950/60 border-amber-500/50 text-amber-300'
                  : 'bg-slate-800 border-slate-700 text-slate-400'
              }`}
            >
              {settings.touchControls ? 'VISIBLE' : 'HIDDEN'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
