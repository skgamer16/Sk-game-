import React from 'react';
import { Volume2, VolumeX, Pause, Shield, Zap, Sparkles, Clock, Flame, ChevronDown } from 'lucide-react';
import { GameMode } from '../types/game';

interface HUDProps {
  score: number;
  combo: number;
  multiplier: number;
  overdriveCharge: number;
  shields: number;
  distance: number;
  mode: GameMode;
  timeRemaining?: number;
  isMuted: boolean;
  isOverdrive: boolean;
  onToggleMute: () => void;
  onPause: () => void;
  onJump: () => void;
  onSlide: () => void;
  onSlash: () => void;
  onOverdrive: () => void;
  touchControls: boolean;
  touchLayout?: 'split' | 'right-cluster' | 'left-cluster';
}

export const HUD: React.FC<HUDProps> = ({
  score,
  combo,
  multiplier,
  overdriveCharge,
  shields,
  distance,
  mode,
  timeRemaining = 60,
  isMuted,
  isOverdrive,
  onToggleMute,
  onPause,
  onJump,
  onSlide,
  onSlash,
  onOverdrive,
  touchControls,
}) => {
  const overdrivePercent = Math.min(100, Math.max(0, overdriveCharge));
  const isOverdriveReady = overdrivePercent >= 100 || isOverdrive;

  return (
    <div className="pointer-events-none absolute inset-0 flex flex-col justify-between p-3 md:p-6 select-none overflow-hidden font-tech">
      {/* Top Bar */}
      <div className="flex items-start justify-between gap-4">
        {/* Score & Multiplier */}
        <div className="flex flex-col">
          <div className="flex items-center gap-2">
            <span className="font-cyber text-2xl md:text-4xl font-black tracking-wider text-white drop-shadow-[0_0_12px_rgba(6,182,212,0.8)]">
              {score.toLocaleString()}
            </span>
            {multiplier > 1 && (
              <span
                className={`animate-pulse rounded-md px-2 py-0.5 text-xs md:text-sm font-cyber font-bold ${
                  multiplier >= 8
                    ? 'bg-gradient-to-r from-amber-500 to-pink-500 text-white shadow-lg shadow-pink-500/50'
                    : multiplier >= 4
                    ? 'bg-pink-600 text-white shadow-md shadow-pink-600/40'
                    : 'bg-cyan-600 text-white shadow-md shadow-cyan-600/40'
                }`}
              >
                x{multiplier}
              </span>
            )}
          </div>

          <div className="flex items-center gap-4 text-xs md:text-sm text-cyan-300 font-semibold tracking-wide">
            <span className="flex items-center gap-1">
              <Zap className="h-3.5 w-3.5 text-cyan-400" />
              {Math.floor(distance)}m
            </span>
            {mode === 'rush60' && (
              <span className="flex items-center gap-1 text-amber-400 font-cyber">
                <Clock className="h-3.5 w-3.5" />
                {Math.max(0, Math.ceil(timeRemaining))}s
              </span>
            )}
          </div>
        </div>

        {/* Top Center: Combo Bar */}
        {combo > 1 && (
          <div className="flex flex-col items-center">
            <div className="flex items-center gap-1.5 animate-bounce">
              <Flame className="h-4 w-4 md:h-5 md:w-5 text-amber-400 fill-amber-400 drop-shadow-[0_0_8px_rgba(245,158,11,0.8)]" />
              <span className="font-cyber text-lg md:text-2xl font-black text-amber-300 drop-shadow-[0_0_10px_rgba(245,158,11,0.7)]">
                {combo} COMBO
              </span>
            </div>
            <div className="h-1.5 w-24 md:w-36 bg-slate-800/80 rounded-full overflow-hidden border border-amber-500/30">
              <div className="h-full bg-gradient-to-r from-amber-400 to-pink-500 transition-all duration-75 rounded-full w-full" />
            </div>
          </div>
        )}

        {/* Top Right: Shields & Quick Actions */}
        <div className="flex items-center gap-3">
          {/* Shields */}
          {mode !== 'zen' && (
            <div className="flex items-center gap-1 bg-slate-900/70 backdrop-blur-md px-2.5 py-1.5 rounded-lg border border-cyan-500/30">
              {Array.from({ length: 3 }).map((_, i) => (
                <Shield
                  key={i}
                  className={`h-4 w-4 md:h-5 md:w-5 transition-all duration-300 ${
                    i < shields
                      ? 'text-cyan-400 fill-cyan-400/80 drop-shadow-[0_0_6px_rgba(6,182,212,0.8)]'
                      : 'text-slate-600 fill-slate-800'
                  }`}
                />
              ))}
            </div>
          )}

          {/* Audio Mute & Pause */}
          <div className="pointer-events-auto flex items-center gap-1.5 bg-slate-900/80 backdrop-blur-md p-1 rounded-lg border border-slate-700">
            <button
              onClick={onToggleMute}
              className="p-1.5 rounded-md hover:bg-slate-800 text-slate-300 hover:text-white transition-colors cursor-pointer"
              title={isMuted ? 'Unmute' : 'Mute'}
            >
              {isMuted ? <VolumeX className="h-4 w-4 text-red-400" /> : <Volume2 className="h-4 w-4 text-cyan-400" />}
            </button>
            <button
              onClick={onPause}
              className="p-1.5 rounded-md hover:bg-slate-800 text-slate-300 hover:text-white transition-colors cursor-pointer"
              title="Pause [ESC]"
            >
              <Pause className="h-4 w-4 text-amber-400" />
            </button>
          </div>
        </div>
      </div>

      {/* Middle/Bottom: Overdrive Charge Bar */}
      <div className="flex flex-col items-center gap-1.5 px-4 mb-2">
        <div className="w-full max-w-md flex items-center gap-2 bg-slate-900/80 backdrop-blur-md px-3 py-1.5 rounded-xl border border-slate-700/60 shadow-lg">
          <Sparkles
            className={`h-4 w-4 transition-all duration-300 ${
              isOverdriveReady ? 'text-amber-400 animate-spin fill-amber-400' : 'text-slate-400'
            }`}
          />
          <div className="flex-1 h-2.5 bg-slate-800 rounded-full overflow-hidden relative">
            <div
              className={`h-full transition-all duration-100 rounded-full ${
                isOverdrive
                  ? 'bg-gradient-to-r from-amber-400 via-pink-500 to-cyan-400 animate-pulse'
                  : isOverdriveReady
                  ? 'bg-gradient-to-r from-amber-400 to-yellow-300 shadow-[0_0_10px_rgba(251,191,36,0.8)]'
                  : 'bg-gradient-to-r from-cyan-500 to-blue-500'
              }`}
              style={{ width: `${overdrivePercent}%` }}
            />
          </div>
          <span className="font-cyber text-xs font-bold text-amber-400 whitespace-nowrap min-w-[60px] text-right">
            {isOverdrive ? 'ACTIVE!' : isOverdriveReady ? 'READY!' : `${Math.floor(overdrivePercent)}%`}
          </span>
        </div>
      </div>

      {/* Mobile Touch Controls */}
      {touchControls && (
        <div className="pointer-events-auto flex items-end justify-between gap-4 pb-2">
          {/* Left Controls: Slide & Jump */}
          <div className="flex items-center gap-3">
            <button
              onPointerDown={(e) => {
                e.preventDefault();
                onSlide();
              }}
              className="flex h-16 w-16 md:h-18 md:w-18 active:scale-90 flex-col items-center justify-center rounded-2xl bg-gradient-to-b from-slate-800/90 to-slate-950/90 border-2 border-cyan-500/50 text-cyan-300 shadow-lg shadow-cyan-950/50 backdrop-blur-md cursor-pointer transition-transform"
            >
              <ChevronDown className="h-6 w-6" />
              <span className="text-[10px] font-cyber font-bold uppercase tracking-wider">Slide</span>
            </button>

            <button
              onPointerDown={(e) => {
                e.preventDefault();
                onJump();
              }}
              className="flex h-18 w-18 md:h-20 md:w-20 active:scale-90 flex-col items-center justify-center rounded-2xl bg-gradient-to-b from-cyan-600/90 to-blue-700/90 border-2 border-cyan-300 text-white shadow-xl shadow-cyan-500/30 backdrop-blur-md cursor-pointer transition-transform"
            >
              <Zap className="h-7 w-7 fill-white" />
              <span className="text-[11px] font-cyber font-extrabold uppercase tracking-wider">Jump</span>
            </button>
          </div>

          {/* Right Controls: Slash & Overdrive */}
          <div className="flex items-center gap-3">
            {isOverdriveReady && (
              <button
                onPointerDown={(e) => {
                  e.preventDefault();
                  onOverdrive();
                }}
                className="flex h-16 w-16 md:h-18 md:w-18 active:scale-90 animate-pulse flex-col items-center justify-center rounded-2xl bg-gradient-to-b from-amber-500/90 to-pink-600/90 border-2 border-amber-300 text-white shadow-xl shadow-amber-500/50 backdrop-blur-md cursor-pointer transition-transform"
              >
                <Sparkles className="h-6 w-6 fill-white" />
                <span className="text-[10px] font-cyber font-black uppercase tracking-wider">Hyper</span>
              </button>
            )}

            <button
              onPointerDown={(e) => {
                e.preventDefault();
                onSlash();
              }}
              className="flex h-18 w-18 md:h-20 md:w-20 active:scale-90 flex-col items-center justify-center rounded-2xl bg-gradient-to-b from-pink-600/90 to-rose-700/90 border-2 border-pink-300 text-white shadow-xl shadow-pink-500/40 backdrop-blur-md cursor-pointer transition-transform"
            >
              <Flame className="h-7 w-7 fill-white" />
              <span className="text-[11px] font-cyber font-extrabold uppercase tracking-wider">Slash</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
