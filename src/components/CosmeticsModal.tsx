import React, { useState } from 'react';
import { ShoppingBag, X, Sparkles, Check, Lock } from 'lucide-react';
import { SkinOption, TrailOption } from '../types/game';
import { sound } from '../game/audio';

interface CosmeticsModalProps {
  skins: SkinOption[];
  trails: TrailOption[];
  equippedSkin: string;
  equippedTrail: string;
  shardsBank: number;
  onEquipSkin: (skinId: string) => void;
  onEquipTrail: (trailId: string) => void;
  onBuySkin: (skinId: string) => void;
  onBuyTrail: (trailId: string) => void;
  onClose: () => void;
}

export const CosmeticsModal: React.FC<CosmeticsModalProps> = ({
  skins,
  trails,
  equippedSkin,
  equippedTrail,
  shardsBank,
  onEquipSkin,
  onEquipTrail,
  onBuySkin,
  onBuyTrail,
  onClose,
}) => {
  const [tab, setTab] = useState<'skins' | 'trails'>('skins');

  return (
    <div className="absolute inset-0 z-30 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md select-none font-tech animate-fade-in">
      <div className="w-full max-w-2xl bg-gradient-to-b from-slate-900 to-slate-950 border-2 border-cyan-500/40 rounded-3xl p-6 shadow-2xl flex flex-col max-h-[90vh] relative">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <ShoppingBag className="h-6 w-6 text-cyan-400" />
            <h2 className="font-cyber text-xl md:text-2xl font-black text-white">
              CYBERNETIC ARSENAL
            </h2>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5 bg-slate-950 px-3 py-1.5 rounded-xl border border-cyan-500/40 text-cyan-300 font-cyber text-xs">
              <Sparkles className="h-4 w-4 text-cyan-400" />
              <span>{shardsBank} SHARDS</span>
            </div>

            <button
              onClick={onClose}
              className="p-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors cursor-pointer"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Category Tabs */}
        <div className="grid grid-cols-2 gap-2 my-4 bg-slate-950 p-1 rounded-xl border border-slate-800">
          <button
            onClick={() => setTab('skins')}
            className={`py-2 rounded-lg font-cyber text-xs font-bold uppercase transition-all cursor-pointer ${
              tab === 'skins'
                ? 'bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/30'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Exo-Suits
          </button>
          <button
            onClick={() => setTab('trails')}
            className={`py-2 rounded-lg font-cyber text-xs font-bold uppercase transition-all cursor-pointer ${
              tab === 'trails'
                ? 'bg-pink-500 text-slate-950 shadow-md shadow-pink-500/30'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Neon Trails
          </button>
        </div>

        {/* Items Grid */}
        <div className="flex-1 overflow-y-auto space-y-3 pr-1 min-h-[260px]">
          {tab === 'skins' ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {skins.map((s) => {
                const isEquipped = equippedSkin === s.id;
                const canAfford = shardsBank >= s.price;

                return (
                  <div
                    key={s.id}
                    className={`p-4 rounded-2xl border flex flex-col justify-between transition-all ${
                      isEquipped
                        ? 'border-cyan-400 bg-cyan-950/20 shadow-lg shadow-cyan-950/50'
                        : 'border-slate-800 bg-slate-900/60'
                    }`}
                  >
                    <div>
                      {/* Color Preview & Badge */}
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <div
                            className="w-7 h-7 rounded-lg border border-white/20 shadow-md"
                            style={{
                              backgroundColor: s.primaryColor,
                              boxShadow: `0 0 12px ${s.glowColor}`,
                            }}
                          />
                          <span className="font-cyber font-bold text-sm text-white">{s.name}</span>
                        </div>
                        <span className="text-[10px] font-cyber uppercase px-2 py-0.5 rounded bg-slate-800 text-slate-300">
                          {s.suitClass}
                        </span>
                      </div>

                      <p className="text-xs text-slate-400 mb-4">{s.description}</p>
                    </div>

                    {/* Action Button */}
                    {s.unlocked ? (
                      <button
                        onClick={() => {
                          onEquipSkin(s.id);
                          sound.playUIClick();
                        }}
                        disabled={isEquipped}
                        className={`w-full py-2 rounded-xl font-cyber text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                          isEquipped
                            ? 'bg-cyan-500 text-slate-950 cursor-default'
                            : 'bg-slate-800 hover:bg-slate-700 text-cyan-300'
                        }`}
                      >
                        {isEquipped ? (
                          <>
                            <Check className="h-4 w-4" />
                            EQUIPPED
                          </>
                        ) : (
                          'EQUIP'
                        )}
                      </button>
                    ) : (
                      <button
                        onClick={() => {
                          if (canAfford) {
                            onBuySkin(s.id);
                            sound.playHyperShard();
                          }
                        }}
                        disabled={!canAfford}
                        className={`w-full py-2 rounded-xl font-cyber text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                          canAfford
                            ? 'bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-md shadow-amber-500/30'
                            : 'bg-slate-800 text-slate-500 cursor-not-allowed'
                        }`}
                      >
                        <Lock className="h-3.5 w-3.5" />
                        <span>UNLOCK ({s.price} SHARDS)</span>
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {trails.map((t) => {
                const isEquipped = equippedTrail === t.id;
                const canAfford = shardsBank >= t.price;

                return (
                  <div
                    key={t.id}
                    className={`p-4 rounded-2xl border flex flex-col justify-between transition-all ${
                      isEquipped
                        ? 'border-pink-400 bg-pink-950/20 shadow-lg shadow-pink-950/50'
                        : 'border-slate-800 bg-slate-900/60'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <div
                            className="w-7 h-7 rounded-full border border-white/20 shadow-md"
                            style={{
                              backgroundColor: t.color,
                              boxShadow: `0 0 12px ${t.color}`,
                            }}
                          />
                          <span className="font-cyber font-bold text-sm text-white">{t.name}</span>
                        </div>
                        <span className="text-[10px] font-cyber uppercase px-2 py-0.5 rounded bg-slate-800 text-slate-300">
                          {t.type}
                        </span>
                      </div>
                      <p className="text-xs text-slate-400 mb-4">{t.description}</p>
                    </div>

                    {t.unlocked ? (
                      <button
                        onClick={() => {
                          onEquipTrail(t.id);
                          sound.playUIClick();
                        }}
                        disabled={isEquipped}
                        className={`w-full py-2 rounded-xl font-cyber text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                          isEquipped
                            ? 'bg-pink-500 text-slate-950 cursor-default'
                            : 'bg-slate-800 hover:bg-slate-700 text-pink-300'
                        }`}
                      >
                        {isEquipped ? (
                          <>
                            <Check className="h-4 w-4" />
                            EQUIPPED
                          </>
                        ) : (
                          'EQUIP'
                        )}
                      </button>
                    ) : (
                      <button
                        onClick={() => {
                          if (canAfford) {
                            onBuyTrail(t.id);
                            sound.playHyperShard();
                          }
                        }}
                        disabled={!canAfford}
                        className={`w-full py-2 rounded-xl font-cyber text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                          canAfford
                            ? 'bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-md shadow-amber-500/30'
                            : 'bg-slate-800 text-slate-500 cursor-not-allowed'
                        }`}
                      >
                        <Lock className="h-3.5 w-3.5" />
                        <span>UNLOCK ({t.price} SHARDS)</span>
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
