import React from 'react';
import { LogOut, AlertTriangle } from 'lucide-react';
import { sound } from '../utils/audio';

interface ExitMatchModalProps {
  totalPlayers: number;
  onConfirm: () => void;
  onCancel: () => void;
}

export const ExitMatchModal: React.FC<ExitMatchModalProps> = ({
  totalPlayers,
  onConfirm,
  onCancel,
}) => {
  const isTwoPlayer = totalPlayers <= 2;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-sm">
      <div className="bg-slate-900 border-2 border-rose-500/60 rounded-3xl w-full max-w-sm overflow-hidden shadow-2xl p-6 flex flex-col gap-4 text-slate-100 text-center animate-fade-in">
        <div className="w-14 h-14 rounded-2xl bg-rose-500/20 border border-rose-500/40 text-rose-400 mx-auto flex items-center justify-center">
          <LogOut className="w-7 h-7" />
        </div>

        <div>
          <h3 className="text-xl font-black text-white">Exit Online Match?</h3>
          <div className="mt-2 text-xs text-slate-300 leading-relaxed bg-slate-950/60 p-3 rounded-xl border border-slate-800 text-left flex items-start gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
            <div>
              {isTwoPlayer ? (
                <p>
                  In <strong>2-player mode</strong>, leaving the game awards an immediate win to the other player: <span className="text-amber-400 font-bold">"You left the game so they win!"</span>
                </p>
              ) : (
                <p>
                  You will exit the game and your pawn will be removed from the board. The match will seamlessly continue for the remaining <strong className="text-cyan-400">{totalPlayers - 1} players</strong>.
                </p>
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3 pt-2">
          <button
            onClick={() => {
              sound.playClick();
              onCancel();
            }}
            className="flex-1 py-3.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs uppercase tracking-wider transition-colors cursor-pointer"
          >
            STAY IN MATCH
          </button>
          <button
            onClick={() => {
              sound.playClick();
              onConfirm();
            }}
            className="flex-1 py-3.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-black text-xs uppercase tracking-wider transition-colors shadow-lg shadow-rose-600/25 cursor-pointer"
          >
            EXIT GAME
          </button>
        </div>
      </div>
    </div>
  );
};
