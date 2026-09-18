import React from 'react';
import { Award, X, Sparkles, CheckCircle2, Zap, Flame, Trophy, Compass, Crosshair, Activity, Gem } from 'lucide-react';
import { Achievement } from '../types/game';

interface AchievementsModalProps {
  achievements: Achievement[];
  onClose: () => void;
}

export const AchievementsModal: React.FC<AchievementsModalProps> = ({
  achievements,
  onClose,
}) => {
  const getIcon = (iconName: string) => {
    switch (iconName) {
      case 'Zap':
        return <Zap className="h-5 w-5 text-cyan-400" />;
      case 'Flame':
        return <Flame className="h-5 w-5 text-amber-400" />;
      case 'Award':
        return <Award className="h-5 w-5 text-pink-400" />;
      case 'Compass':
        return <Compass className="h-5 w-5 text-blue-400" />;
      case 'Trophy':
        return <Trophy className="h-5 w-5 text-yellow-400" />;
      case 'Gem':
        return <Gem className="h-5 w-5 text-emerald-400" />;
      case 'Crosshair':
        return <Crosshair className="h-5 w-5 text-rose-400" />;
      default:
        return <Activity className="h-5 w-5 text-purple-400" />;
    }
  };

  const unlockedCount = achievements.filter((a) => a.unlocked).length;

  return (
    <div className="absolute inset-0 z-30 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md select-none font-tech animate-fade-in">
      <div className="w-full max-w-xl bg-gradient-to-b from-slate-900 to-slate-950 border-2 border-pink-500/40 rounded-3xl p-6 shadow-2xl flex flex-col max-h-[90vh] relative">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <Award className="h-6 w-6 text-pink-400" />
            <div>
              <h2 className="font-cyber text-xl md:text-2xl font-black text-white">
                BADGES & TRIALS
              </h2>
              <p className="text-xs text-slate-400">
                Unlocked {unlockedCount} / {achievements.length} Badges
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* List */}
        <div className="flex-1 overflow-y-auto space-y-2.5 my-4 pr-1 min-h-[260px]">
          {achievements.map((a) => {
            const percent = Math.min(100, Math.floor((a.progress / a.target) * 100));

            return (
              <div
                key={a.id}
                className={`p-3.5 rounded-2xl border transition-all ${
                  a.unlocked
                    ? 'border-pink-500/40 bg-pink-950/20'
                    : 'border-slate-800 bg-slate-900/60'
                }`}
              >
                <div className="flex items-start justify-between gap-3 mb-2">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-xl bg-slate-800 border border-slate-700">
                      {getIcon(a.icon)}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-cyber font-bold text-sm text-white">
                          {a.title}
                        </span>
                        {a.unlocked && (
                          <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
                        )}
                      </div>
                      <p className="text-xs text-slate-400">{a.description}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-1 font-cyber text-xs font-bold text-amber-400 bg-amber-950/40 border border-amber-500/30 px-2 py-1 rounded-lg shrink-0">
                    <Sparkles className="h-3.5 w-3.5" />
                    <span>+{a.rewardShards}</span>
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="w-full flex items-center gap-2">
                  <div className="flex-1 h-1.5 bg-slate-800 rounded-full overflow-hidden">
                    <div
                      className={`h-full transition-all duration-300 rounded-full ${
                        a.unlocked ? 'bg-pink-500' : 'bg-cyan-500'
                      }`}
                      style={{ width: `${percent}%` }}
                    />
                  </div>
                  <span className="text-[10px] font-cyber text-slate-400">
                    {a.unlocked ? 'COMPLETED' : `${a.progress} / ${a.target}`}
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="pt-2 border-t border-slate-800 flex justify-end">
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
