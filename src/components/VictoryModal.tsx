import React, { useEffect } from 'react';
import { Player } from '../types/game';
import confetti from 'canvas-confetti';
import { RotateCcw, Home } from 'lucide-react';
import { sound } from '../utils/audio';

interface VictoryModalProps {
  winner: Player;
  onPlayAgain: () => void;
  onMainMenu: () => void;
}

export const VictoryModal: React.FC<VictoryModalProps> = ({
  winner,
  onPlayAgain,
  onMainMenu,
}) => {
  useEffect(() => {
    sound.playWinFanfare();

    const count = 200;
    const defaults = { origin: { y: 0.7 } };

    function fire(particleRatio: number, opts: confetti.Options) {
      confetti({
        ...defaults,
        ...opts,
        particleCount: Math.floor(count * particleRatio),
      });
    }

    fire(0.25, { spread: 26, startVelocity: 55 });
    fire(0.2, { spread: 60 });
    fire(0.35, { spread: 100, decay: 0.91, scalar: 0.8 });
    fire(0.1, { spread: 120, startVelocity: 25, decay: 0.92, scalar: 1.2 });
    fire(0.1, { spread: 120, startVelocity: 45 });
  }, [winner]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md">
      <div className="bg-slate-900 border-2 border-amber-500/80 rounded-3xl w-full max-w-md overflow-hidden shadow-2xl shadow-amber-500/20 flex flex-col text-slate-100 text-center animate-fade-in">
        {/* Banner */}
        <div className="bg-gradient-to-b from-amber-500 via-amber-600 to-amber-700 p-8 flex flex-col items-center justify-center text-slate-950">
          <div className="w-20 h-20 rounded-2xl bg-white/20 backdrop-blur-md border border-white/40 flex items-center justify-center text-4xl shadow-inner mb-3 animate-bounce">
            🏆
          </div>

          <span className="text-3xl font-black tracking-tight drop-shadow uppercase">
            {winner.avatar} {winner.name} WINS!
          </span>
          <p className="text-base font-bold text-amber-950 mt-1">
            Congratulations! 🎉
          </p>
        </div>

        {/* Actions */}
        <div className="p-6 flex flex-col gap-3">
          <button
            onClick={() => {
              sound.playClick();
              onPlayAgain();
            }}
            className="w-full py-4 rounded-2xl bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-slate-950 font-black text-sm uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg shadow-amber-500/20 transition-transform active:scale-95 cursor-pointer"
          >
            <RotateCcw className="w-5 h-5" /> PLAY AGAIN
          </button>

          <button
            onClick={() => {
              sound.playClick();
              onMainMenu();
            }}
            className="w-full py-3.5 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-sm uppercase tracking-wider flex items-center justify-center gap-2 border border-slate-700 transition-colors cursor-pointer"
          >
            <Home className="w-5 h-5" /> MAIN MENU
          </button>
        </div>
      </div>
    </div>
  );
};
