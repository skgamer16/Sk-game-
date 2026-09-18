import React from 'react';
import { Play, Trophy, ShoppingBag, Award, HelpCircle, Settings as SettingsIcon, Volume2, VolumeX, Sparkles, Zap, Shield, Flame } from 'lucide-react';
import { GameMode } from '../types/game';

interface StartScreenProps {
  selectedMode: GameMode;
  onSelectMode: (mode: GameMode) => void;
  onStartGame: () => void;
  onOpenLeaderboard: () => void;
  onOpenCosmetics: () => void;
  onOpenAchievements: () => void;
  onOpenHowToPlay: () => void;
  onOpenSettings: () => void;
  isMuted: boolean;
  onToggleMute: () => void;
  highScore: number;
  shardsBank: number;
}

export const StartScreen: React.FC<StartScreenProps> = ({
  selectedMode,
  onSelectMode,
  onStartGame,
  onOpenLeaderboard,
  onOpenCosmetics,
  onOpenAchievements,
  onOpenHowToPlay,
  onOpenSettings,
  isMuted,
  onToggleMute,
  highScore,
  shardsBank,
}) => {
  const modes: { id: GameMode; title: string; desc: string; icon: React.ReactNode; color: string }[] = [
    {
      id: 'endless',
      title: 'ENDLESS SURGE',
      desc: 'Escalating cyber highway with drone waves and titan boss invasions.',
      icon: <Zap className="h-5 w-5 text-cyan-400" />,
      color: 'border-cyan-500/60 bg-cyan-950/30 text-cyan-300',
    },
    {
      id: 'rush60',
      title: '60S TIME TRIAL',
      desc: 'High-density shard frenzy! Maximize your score multiplier in 60 seconds.',
      icon: <Flame className="h-5 w-5 text-amber-400" />,
      color: 'border-amber-500/60 bg-amber-950/30 text-amber-300',
    },
    {
      id: 'boss_rush',
      title: 'BOSS GAUNTLET',
      desc: 'Direct confrontation with cyber dreadnoughts and bullet patterns.',
      icon: <Shield className="h-5 w-5 text-pink-400" />,
      color: 'border-pink-500/60 bg-pink-950/30 text-pink-300',
    },
    {
      id: 'zen',
      title: 'ZEN GLIDE',
      desc: 'Invulnerable flow state. Infinite rails, relaxing neon synth vibes.',
      icon: <Sparkles className="h-5 w-5 text-emerald-400" />,
      color: 'border-emerald-500/60 bg-emerald-950/30 text-emerald-300',
    },
  ];

  return (
    <div className="absolute inset-0 z-20 flex flex-col items-center justify-between p-4 md:p-8 bg-gradient-to-b from-slate-950/90 via-slate-900/80 to-slate-950/95 backdrop-blur-sm select-none font-tech overflow-y-auto">
      {/* Top Bar: Currency, High Score & Sound */}
      <div className="w-full max-w-4xl flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 bg-slate-900/80 px-3 py-1.5 rounded-xl border border-cyan-500/30 text-cyan-300 font-cyber text-sm">
            <Sparkles className="h-4 w-4 text-cyan-400" />
            <span>{shardsBank}</span>
            <span className="text-[10px] text-slate-400">SHARDS</span>
          </div>

          <div className="hidden sm:flex items-center gap-1.5 bg-slate-900/80 px-3 py-1.5 rounded-xl border border-amber-500/30 text-amber-300 font-cyber text-sm">
            <Trophy className="h-4 w-4 text-amber-400" />
            <span>BEST: {highScore.toLocaleString()}</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onToggleMute}
            className="p-2 bg-slate-900/80 hover:bg-slate-800 text-slate-300 hover:text-white rounded-xl border border-slate-700 transition-colors cursor-pointer"
            title={isMuted ? 'Unmute' : 'Mute'}
          >
            {isMuted ? <VolumeX className="h-5 w-5 text-red-400" /> : <Volume2 className="h-5 w-5 text-cyan-400" />}
          </button>
          <button
            onClick={onOpenSettings}
            className="p-2 bg-slate-900/80 hover:bg-slate-800 text-slate-300 hover:text-white rounded-xl border border-slate-700 transition-colors cursor-pointer"
            title="Settings"
          >
            <SettingsIcon className="h-5 w-5 text-slate-300" />
          </button>
        </div>
      </div>

      {/* Main Center Hero */}
      <div className="my-auto flex flex-col items-center text-center max-w-2xl px-2">
        {/* Animated Cyber Logo */}
        <div className="relative mb-2">
          <h1 className="font-cyber text-6xl md:text-8xl font-black tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-pink-500 to-amber-400 drop-shadow-[0_0_25px_rgba(6,182,212,0.8)]">
            SK
          </h1>
          <div className="absolute -inset-1 -z-10 blur-2xl opacity-40 bg-gradient-to-r from-cyan-500 via-pink-500 to-amber-500" />
        </div>

        <p className="font-cyber text-xs md:text-sm tracking-widest text-cyan-300 uppercase font-semibold mb-6">
          KINETIC ARCADE RUNNER // HYPER-MOMENTUM
        </p>

        {/* Game Mode Selector */}
        <div className="w-full grid grid-cols-2 gap-2.5 md:gap-3 mb-6">
          {modes.map((m) => {
            const isSelected = selectedMode === m.id;
            return (
              <button
                key={m.id}
                onClick={() => onSelectMode(m.id)}
                className={`flex flex-col items-start p-3 rounded-xl border text-left transition-all duration-200 cursor-pointer ${
                  isSelected
                    ? `${m.color} ring-2 ring-cyan-400 shadow-lg shadow-cyan-950/80 scale-[1.02]`
                    : 'border-slate-800 bg-slate-900/60 hover:bg-slate-800/60 text-slate-400'
                }`}
              >
                <div className="flex items-center gap-2 mb-1">
                  {m.icon}
                  <span className="font-cyber text-xs md:text-sm font-bold text-white tracking-wide">
                    {m.title}
                  </span>
                </div>
                <p className="text-[11px] md:text-xs text-slate-400 line-clamp-2 leading-tight">
                  {m.desc}
                </p>
              </button>
            );
          })}
        </div>

        {/* Big Start Button */}
        <button
          onClick={onStartGame}
          className="group relative flex items-center justify-center gap-3 w-full max-w-sm py-4 px-8 rounded-2xl bg-gradient-to-r from-cyan-500 via-blue-600 to-pink-600 text-white font-cyber text-lg md:text-xl font-black tracking-wider shadow-2xl shadow-cyan-500/40 hover:shadow-cyan-400/60 hover:scale-105 active:scale-95 transition-all duration-200 cursor-pointer overflow-hidden border border-cyan-300/40"
        >
          <Play className="h-6 w-6 fill-white transition-transform group-hover:scale-110" />
          <span>START RUN</span>
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700 ease-in-out" />
        </button>

        <span className="mt-3 text-xs text-slate-400 font-code">
          Press <span className="text-cyan-300 font-bold">[ SPACE ]</span> or <span className="text-cyan-300 font-bold">[ ENTER ]</span> to launch
        </span>
      </div>

      {/* Bottom Navigation Grid */}
      <div className="w-full max-w-xl grid grid-cols-4 gap-2 pt-4">
        <button
          onClick={onOpenLeaderboard}
          className="flex flex-col items-center justify-center p-2.5 rounded-xl bg-slate-900/80 hover:bg-slate-800 border border-slate-700/80 text-slate-300 hover:text-amber-300 transition-all cursor-pointer hover:border-amber-500/50"
        >
          <Trophy className="h-5 w-5 mb-1 text-amber-400" />
          <span className="font-cyber text-[10px] md:text-xs uppercase font-bold">Ranks</span>
        </button>

        <button
          onClick={onOpenCosmetics}
          className="flex flex-col items-center justify-center p-2.5 rounded-xl bg-slate-900/80 hover:bg-slate-800 border border-slate-700/80 text-slate-300 hover:text-cyan-300 transition-all cursor-pointer hover:border-cyan-500/50"
        >
          <ShoppingBag className="h-5 w-5 mb-1 text-cyan-400" />
          <span className="font-cyber text-[10px] md:text-xs uppercase font-bold">Exosuits</span>
        </button>

        <button
          onClick={onOpenAchievements}
          className="flex flex-col items-center justify-center p-2.5 rounded-xl bg-slate-900/80 hover:bg-slate-800 border border-slate-700/80 text-slate-300 hover:text-pink-300 transition-all cursor-pointer hover:border-pink-500/50"
        >
          <Award className="h-5 w-5 mb-1 text-pink-400" />
          <span className="font-cyber text-[10px] md:text-xs uppercase font-bold">Badges</span>
        </button>

        <button
          onClick={onOpenHowToPlay}
          className="flex flex-col items-center justify-center p-2.5 rounded-xl bg-slate-900/80 hover:bg-slate-800 border border-slate-700/80 text-slate-300 hover:text-emerald-300 transition-all cursor-pointer hover:border-emerald-500/50"
        >
          <HelpCircle className="h-5 w-5 mb-1 text-emerald-400" />
          <span className="font-cyber text-[10px] md:text-xs uppercase font-bold">Guide</span>
        </button>
      </div>
    </div>
  );
};
