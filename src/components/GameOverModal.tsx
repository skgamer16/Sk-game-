import React, { useEffect, useState } from 'react';
import confetti from 'canvas-confetti';
import { RotateCcw, Home, Share2, Check, Trophy, Zap, Flame, Sparkles, ShieldAlert } from 'lucide-react';
import { GameMode } from '../types/game';

interface GameOverModalProps {
  runData: {
    score: number;
    distance: number;
    maxCombo: number;
    shards: number;
    bossesDefeated: number;
    grade: 'SSS' | 'SS' | 'S' | 'A' | 'B' | 'C';
    isNewHighScore: boolean;
  };
  mode: GameMode;
  onRestart: () => void;
  onHome: () => void;
}

export const GameOverModal: React.FC<GameOverModalProps> = ({
  runData,
  mode,
  onRestart,
  onHome,
}) => {
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (runData.isNewHighScore) {
      try {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#06b6d4', '#ec4899', '#fbbf24', '#ffffff'],
        });
      } catch {
        // Ignored
      }
    }
  }, [runData.isNewHighScore]);

  const handleShare = () => {
    const text = `🎮 Just scored ${runData.score.toLocaleString()} pts (Grade: ${runData.grade}) on SK! Max combo: ${runData.maxCombo}x 🔥 #SKGame`;
    if (navigator.clipboard) {
      navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const getGradeColor = (grade: string) => {
    switch (grade) {
      case 'SSS':
        return 'text-amber-400 border-amber-400 bg-amber-950/40 shadow-amber-500/50';
      case 'SS':
        return 'text-pink-400 border-pink-400 bg-pink-950/40 shadow-pink-500/50';
      case 'S':
        return 'text-cyan-400 border-cyan-400 bg-cyan-950/40 shadow-cyan-500/50';
      case 'A':
        return 'text-emerald-400 border-emerald-400 bg-emerald-950/40 shadow-emerald-500/50';
      case 'B':
        return 'text-blue-400 border-blue-400 bg-blue-950/40 shadow-blue-500/50';
      default:
        return 'text-slate-400 border-slate-400 bg-slate-900/40 shadow-slate-500/50';
    }
  };

  return (
    <div className="absolute inset-0 z-30 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md select-none font-tech animate-fade-in">
      <div className="w-full max-w-md bg-gradient-to-b from-slate-900 to-slate-950 border-2 border-slate-700/80 rounded-3xl p-6 md:p-8 shadow-2xl flex flex-col items-center text-center relative overflow-hidden">
        {/* Top Glow Accent */}
        <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-48 h-48 bg-cyan-500/20 rounded-full blur-3xl pointer-events-none" />

        {/* Header */}
        <div className="flex items-center gap-2 mb-1">
          <ShieldAlert className="h-6 w-6 text-pink-500" />
          <h2 className="font-cyber text-2xl md:text-3xl font-black tracking-wider text-white">
            RUN TERMINATED
          </h2>
        </div>
        <p className="font-cyber text-xs uppercase tracking-widest text-slate-400 mb-5">
          MODE: {mode.replace('_', ' ')}
        </p>

        {/* Grade Badge */}
        <div className="relative mb-6">
          <div
            className={`w-20 h-20 md:w-24 md:h-24 rounded-2xl border-2 flex items-center justify-center shadow-xl ${getGradeColor(
              runData.grade
            )}`}
          >
            <span className="font-cyber text-4xl md:text-5xl font-black">
              {runData.grade}
            </span>
          </div>
          {runData.isNewHighScore && (
            <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 bg-amber-500 text-slate-950 px-2.5 py-0.5 rounded-full font-cyber text-[10px] font-black tracking-wide whitespace-nowrap shadow-md">
              NEW RECORD!
            </div>
          )}
        </div>

        {/* Final Score */}
        <div className="mb-6 w-full">
          <div className="text-xs text-slate-400 uppercase tracking-wider font-semibold mb-0.5">
            Final Score
          </div>
          <div className="font-cyber text-4xl md:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-pink-400 to-amber-300 drop-shadow-[0_0_15px_rgba(6,182,212,0.6)]">
            {runData.score.toLocaleString()}
          </div>
        </div>

        {/* Stats Grid */}
        <div className="w-full grid grid-cols-2 gap-2.5 mb-6 text-left">
          <div className="bg-slate-900/90 border border-slate-800 p-2.5 rounded-xl flex items-center gap-2.5">
            <Zap className="h-4 w-4 text-cyan-400 shrink-0" />
            <div>
              <div className="text-[10px] text-slate-400 uppercase font-bold">Distance</div>
              <div className="font-cyber text-sm font-bold text-white">{runData.distance}m</div>
            </div>
          </div>

          <div className="bg-slate-900/90 border border-slate-800 p-2.5 rounded-xl flex items-center gap-2.5">
            <Flame className="h-4 w-4 text-amber-400 shrink-0" />
            <div>
              <div className="text-[10px] text-slate-400 uppercase font-bold">Max Combo</div>
              <div className="font-cyber text-sm font-bold text-white">{runData.maxCombo}x</div>
            </div>
          </div>

          <div className="bg-slate-900/90 border border-slate-800 p-2.5 rounded-xl flex items-center gap-2.5">
            <Sparkles className="h-4 w-4 text-pink-400 shrink-0" />
            <div>
              <div className="text-[10px] text-slate-400 uppercase font-bold">Shards Earned</div>
              <div className="font-cyber text-sm font-bold text-white">+{runData.shards}</div>
            </div>
          </div>

          <div className="bg-slate-900/90 border border-slate-800 p-2.5 rounded-xl flex items-center gap-2.5">
            <Trophy className="h-4 w-4 text-yellow-400 shrink-0" />
            <div>
              <div className="text-[10px] text-slate-400 uppercase font-bold">Bosses Slain</div>
              <div className="font-cyber text-sm font-bold text-white">{runData.bossesDefeated}</div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="w-full flex flex-col gap-2.5">
          <button
            onClick={onRestart}
            className="flex items-center justify-center gap-2 w-full py-3.5 px-6 rounded-2xl bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-cyber text-base font-bold shadow-lg shadow-cyan-500/30 hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer border border-cyan-300/40"
          >
            <RotateCcw className="h-5 w-5" />
            <span>PLAY AGAIN [ SPACE ]</span>
          </button>

          <div className="flex items-center gap-2">
            <button
              onClick={handleShare}
              className="flex-1 flex items-center justify-center gap-1.5 py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 font-cyber text-xs font-bold transition-all cursor-pointer"
            >
              {copied ? <Check className="h-4 w-4 text-emerald-400" /> : <Share2 className="h-4 w-4" />}
              <span>{copied ? 'COPIED!' : 'SHARE'}</span>
            </button>

            <button
              onClick={onHome}
              className="flex-1 flex items-center justify-center gap-1.5 py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 font-cyber text-xs font-bold transition-all cursor-pointer"
            >
              <Home className="h-4 w-4" />
              <span>MAIN MENU</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
