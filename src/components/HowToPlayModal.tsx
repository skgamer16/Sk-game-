import React from 'react';
import { HelpCircle, X, Zap, ChevronDown, Flame, Sparkles, ShieldCheck, Keyboard, Smartphone } from 'lucide-react';

interface HowToPlayModalProps {
  onClose: () => void;
}

export const HowToPlayModal: React.FC<HowToPlayModalProps> = ({ onClose }) => {
  return (
    <div className="absolute inset-0 z-30 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md select-none font-tech animate-fade-in">
      <div className="w-full max-w-2xl bg-gradient-to-b from-slate-900 to-slate-950 border-2 border-emerald-500/40 rounded-3xl p-6 shadow-2xl flex flex-col max-h-[90vh] relative">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <HelpCircle className="h-6 w-6 text-emerald-400" />
            <h2 className="font-cyber text-xl md:text-2xl font-black text-white">
              PILOT FLIGHT MANUAL
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto space-y-4 my-4 pr-1">
          {/* Action Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {/* Jump */}
            <div className="p-3.5 rounded-2xl bg-slate-900/80 border border-slate-800 flex items-start gap-3">
              <div className="p-2.5 rounded-xl bg-cyan-950/60 border border-cyan-500/40 text-cyan-400">
                <Zap className="h-5 w-5" />
              </div>
              <div>
                <h3 className="font-cyber font-bold text-sm text-cyan-300">
                  JUMP & DOUBLE JUMP
                </h3>
                <p className="text-xs text-slate-400 mt-1">
                  Leap over laser spikes and gap drops. Tap again in mid-air to somersault double jump onto high rails.
                </p>
              </div>
            </div>

            {/* Slide */}
            <div className="p-3.5 rounded-2xl bg-slate-900/80 border border-slate-800 flex items-start gap-3">
              <div className="p-2.5 rounded-xl bg-amber-950/60 border border-amber-500/40 text-amber-400">
                <ChevronDown className="h-5 w-5" />
              </div>
              <div>
                <h3 className="font-cyber font-bold text-sm text-amber-300">
                  LOW SLIDE & DIVE
                </h3>
                <p className="text-xs text-slate-400 mt-1">
                  Duck underneath low plasma beams. In mid-air, sliding causes an instant fast-fall dive.
                </p>
              </div>
            </div>

            {/* Air-Dash / Slash */}
            <div className="p-3.5 rounded-2xl bg-slate-900/80 border border-slate-800 flex items-start gap-3">
              <div className="p-2.5 rounded-xl bg-pink-950/60 border border-pink-500/40 text-pink-400">
                <Flame className="h-5 w-5" />
              </div>
              <div>
                <h3 className="font-cyber font-bold text-sm text-pink-300">
                  AIR-DASH & PARRY
                </h3>
                <p className="text-xs text-slate-400 mt-1">
                  Slash through airborne drones to reset jumps! Slashing incoming missiles deflects them back at the boss.
                </p>
              </div>
            </div>

            {/* Rail Grind */}
            <div className="p-3.5 rounded-2xl bg-slate-900/80 border border-slate-800 flex items-start gap-3">
              <div className="p-2.5 rounded-xl bg-blue-950/60 border border-blue-500/40 text-blue-400">
                <ShieldCheck className="h-5 w-5" />
              </div>
              <div>
                <h3 className="font-cyber font-bold text-sm text-blue-300">
                  RAIL GRINDING
                </h3>
                <p className="text-xs text-slate-400 mt-1">
                  Land on glowing light rails to auto-grind at hyper speed, shower sparks, and charge your Overdrive meter.
                </p>
              </div>
            </div>
          </div>

          {/* Hyper Overdrive Banner */}
          <div className="p-4 rounded-2xl bg-gradient-to-r from-amber-950/40 via-pink-950/40 to-cyan-950/40 border border-amber-500/50 flex items-center gap-3">
            <Sparkles className="h-8 w-8 text-amber-400 shrink-0 animate-spin" />
            <div>
              <h3 className="font-cyber font-bold text-sm text-amber-300">
                HYPER OVERDRIVE MODE
              </h3>
              <p className="text-xs text-slate-300 mt-0.5">
                Collect shards and slice hazards to fill the gauge. When ready, unleash Overdrive for total invincibility, shard vacuum, and 5x score multiplier!
              </p>
            </div>
          </div>

          {/* Control Mapping Chart */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2">
            <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800">
              <div className="flex items-center gap-2 mb-2 text-cyan-300 font-cyber text-xs font-bold">
                <Keyboard className="h-4 w-4" />
                KEYBOARD CONTROLS
              </div>
              <ul className="text-xs text-slate-400 space-y-1.5 font-code">
                <li><strong className="text-white">Jump / Double Jump:</strong> [ W ] / [ ↑ ] / [ SPACE ]</li>
                <li><strong className="text-white">Slide / Fast Fall:</strong> [ S ] / [ ↓ ]</li>
                <li><strong className="text-white">Slash / Air-Dash:</strong> [ SHIFT ] / [ J ] / [ X ]</li>
                <li><strong className="text-white">Hyper Overdrive:</strong> [ E ] / [ K ]</li>
                <li><strong className="text-white">Pause:</strong> [ ESC ] / [ P ]</li>
              </ul>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800">
              <div className="flex items-center gap-2 mb-2 text-pink-300 font-cyber text-xs font-bold">
                <Smartphone className="h-4 w-4" />
                TOUCH & MOBILE
              </div>
              <ul className="text-xs text-slate-400 space-y-1.5">
                <li><strong className="text-white">On-Screen Buttons:</strong> Ergonomic Jump, Slide, Slash & Hyper buttons.</li>
                <li><strong className="text-white">Haptic Feedback:</strong> Instant tactile response with 60fps frame rate.</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="pt-2 border-t border-slate-800 flex justify-end">
          <button
            onClick={onClose}
            className="px-6 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-cyber text-xs font-bold transition-all cursor-pointer"
          >
            GOT IT, LET'S FLY!
          </button>
        </div>
      </div>
    </div>
  );
};
