import React, { useState } from 'react';
import { Trophy, X, Zap, Flame, Sparkles, Trash2 } from 'lucide-react';
import { HighScoreEntry, GameMode } from '../types/game';

interface LeaderboardModalProps {
  highScores: HighScoreEntry[];
  onClose: () => void;
  onClearScores: () => void;
}

export const LeaderboardModal: React.FC<LeaderboardModalProps> = ({
  highScores,
  onClose,
  onClearScores,
}) => {
  const [selectedTab, setSelectedTab] = useState<GameMode>('endless');

  const filteredScores = highScores.filter((s) => s.mode === selectedTab);

  const getRankBadge = (rank: number) => {
    switch (rank) {
      case 1:
        return <span className="text-xl">🥇</span>;
      case 2:
        return <span className="text-xl">🥈</span>;
      case 3:
        return <span className="text-xl">🥉</span>;
      default:
        return <span className="font-cyber font-bold text-slate-400">#{rank}</span>;
    }
  };

  return (
    <div className="absolute inset-0 z-30 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md select-none font-tech animate-fade-in">
      <div className="w-full max-w-xl bg-gradient-to-b from-slate-900 to-slate-950 border-2 border-amber-500/40 rounded-3xl p-6 shadow-2xl flex flex-col max-h-[90vh] relative">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <Trophy className="h-6 w-6 text-amber-400" />
            <h2 className="font-cyber text-xl md:text-2xl font-black text-white">
              HALL OF RUNNERS
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Mode Tabs */}
        <div className="grid grid-cols-4 gap-1.5 my-4 bg-slate-950 p-1 rounded-xl border border-slate-800">
          {(['endless', 'rush60', 'boss_rush', 'zen'] as GameMode[]).map((mode) => (
            <button
              key={mode}
              onClick={() => setSelectedTab(mode)}
              className={`py-1.5 px-2 rounded-lg font-cyber text-[10px] md:text-xs font-bold uppercase transition-all cursor-pointer ${
                selectedTab === mode
                  ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/30'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              {mode === 'rush60' ? '60s Rush' : mode.replace('_', ' ')}
            </button>
          ))}
        </div>

        {/* Scores List */}
        <div className="flex-1 overflow-y-auto space-y-2 pr-1 min-h-[220px]">
          {filteredScores.length === 0 ? (
            <div className="h-48 flex flex-col items-center justify-center text-slate-500">
              <Zap className="h-8 w-8 mb-2 stroke-1" />
              <p className="font-cyber text-sm">NO RECORDS RECORDED YET</p>
              <p className="text-xs text-slate-600 mt-1">Start a run in this mode to claim your spot!</p>
            </div>
          ) : (
            filteredScores.map((entry, idx) => (
              <div
                key={entry.id || idx}
                className="flex items-center justify-between p-3 rounded-xl bg-slate-900/80 border border-slate-800 hover:border-slate-700 transition-colors"
              >
                {/* Rank & Name */}
                <div className="flex items-center gap-3">
                  <div className="w-8 flex items-center justify-center">
                    {getRankBadge(idx + 1)}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-cyber font-bold text-white text-sm md:text-base">
                        {entry.name || 'PILOT'}
                      </span>
                      <span className="text-[10px] px-1.5 py-0.5 rounded font-cyber font-bold bg-cyan-950 border border-cyan-500/40 text-cyan-300">
                        {entry.grade}
                      </span>
                    </div>
                    <div className="flex items-center gap-3 text-xs text-slate-400 mt-0.5">
                      <span className="flex items-center gap-1">
                        <Zap className="h-3 w-3 text-cyan-400" />
                        {entry.distance}m
                      </span>
                      <span className="flex items-center gap-1">
                        <Flame className="h-3 w-3 text-amber-400" />
                        {entry.maxCombo}x
                      </span>
                      <span className="flex items-center gap-1">
                        <Sparkles className="h-3 w-3 text-pink-400" />
                        {entry.shards}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Score */}
                <div className="text-right">
                  <span className="font-cyber text-base md:text-xl font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-pink-400">
                    {entry.score.toLocaleString()}
                  </span>
                  <div className="text-[10px] text-slate-500">{entry.date}</div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="pt-4 mt-2 border-t border-slate-800 flex items-center justify-between">
          <button
            onClick={() => {
              if (window.confirm('Clear all local high score records?')) {
                onClearScores();
              }
            }}
            className="flex items-center gap-1.5 text-xs text-slate-500 hover:text-red-400 transition-colors cursor-pointer"
          >
            <Trash2 className="h-3.5 w-3.5" />
            <span>Reset Leaderboard</span>
          </button>

          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-cyber text-xs font-bold transition-all cursor-pointer"
          >
            CLOSE
          </button>
        </div>
      </div>
    </div>
  );
};
