import React from 'react';
import { BookOpen, X } from 'lucide-react';
import { sound } from '../utils/audio';

interface RulesModalProps {
  onClose: () => void;
}

export const RulesModal: React.FC<RulesModalProps> = ({ onClose }) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
      <div className="bg-slate-900 border border-slate-700/80 rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl p-6 flex flex-col gap-5 text-slate-100 animate-fade-in">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-black tracking-tight uppercase">How To Play</h2>
              <p className="text-xs text-slate-400">Official Snake & Ladder Rules</p>
            </div>
          </div>
          <button
            onClick={() => {
              sound.playClick();
              onClose();
            }}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg bg-slate-800 hover:bg-slate-700 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="flex flex-col gap-3 text-sm text-slate-300">
          <div className="flex items-start gap-3 p-2.5 bg-slate-800/60 rounded-xl border border-slate-700/60">
            <span className="font-black text-amber-400 font-mono">1.</span>
            <span>Each player starts outside the board at position 0.</span>
          </div>
          <div className="flex items-start gap-3 p-2.5 bg-slate-800/60 rounded-xl border border-slate-700/60">
            <span className="font-black text-amber-400 font-mono">2.</span>
            <span>Roll the dice to determine how many squares your token moves.</span>
          </div>
          <div className="flex items-start gap-3 p-2.5 bg-slate-800/60 rounded-xl border border-slate-700/60">
            <span className="font-black text-amber-400 font-mono">3.</span>
            <span>Move your token step-by-step according to the dice result.</span>
          </div>
          <div className="flex items-start gap-3 p-2.5 bg-slate-800/60 rounded-xl border border-slate-700/60">
            <span className="font-black text-emerald-400 font-mono">4.</span>
            <span><strong>🪜 Ladder:</strong> Landing on the bottom of a ladder moves you upward.</span>
          </div>
          <div className="flex items-start gap-3 p-2.5 bg-slate-800/60 rounded-xl border border-slate-700/60">
            <span className="font-black text-rose-400 font-mono">5.</span>
            <span><strong>🐍 Snake:</strong> Landing on a snake head slides you downward to its tail.</span>
          </div>
          <div className="flex items-start gap-3 p-2.5 bg-slate-800/60 rounded-xl border border-slate-700/60">
            <span className="font-black text-amber-400 font-mono">6.</span>
            <span>You need an exact roll to reach 100. Overshooting keeps you at your current position.</span>
          </div>
          <div className="flex items-start gap-3 p-2.5 bg-slate-800/60 rounded-xl border border-slate-700/60">
            <span className="font-black text-yellow-400 font-mono">7.</span>
            <span>The first player to reach square 100 wins the game!</span>
          </div>
        </div>

        <button
          onClick={() => {
            sound.playClick();
            onClose();
          }}
          className="w-full py-3 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black rounded-xl cursor-pointer transition-transform active:scale-95 shadow-lg shadow-amber-500/20"
        >
          Got It, Let&apos;s Play!
        </button>
      </div>
    </div>
  );
};
