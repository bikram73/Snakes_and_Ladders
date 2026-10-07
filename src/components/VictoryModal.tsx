import React, { useEffect } from 'react';
import { Player } from '../types/game';
import confetti from 'canvas-confetti';
import { Trophy, Award, RotateCcw, Users, Flame, Star } from 'lucide-react';
import { sound } from '../utils/audio';

interface VictoryModalProps {
  winner: Player;
  players: Player[];
  totalTurns: number;
  onPlayAgain: () => void;
  onChangeSetup: () => void;
}

export const VictoryModal: React.FC<VictoryModalProps> = ({
  winner,
  players,
  totalTurns,
  onPlayAgain,
  onChangeSetup,
}) => {
  useEffect(() => {
    sound.playWinFanfare();

    // Confetti cannons
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

    const interval = setInterval(() => {
      confetti({
        particleCount: 40,
        angle: 60,
        spread: 55,
        origin: { x: 0 },
      });
      confetti({
        particleCount: 40,
        angle: 120,
        spread: 55,
        origin: { x: 1 },
      });
    }, 1500);

    return () => clearInterval(interval);
  }, [winner]);

  // Sort players by position descending
  const sortedLeaderboard = [...players].sort((a, b) => b.position - a.position);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-fade-in">
      <div className="bg-slate-900 border-2 border-amber-500/60 rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl shadow-amber-500/10 flex flex-col text-slate-100">
        {/* Banner Header */}
        <div className="relative bg-gradient-to-b from-amber-500 via-amber-600 to-amber-700 p-6 flex flex-col items-center justify-center text-center text-slate-950">
          <div className="w-16 h-16 rounded-2xl bg-white/20 backdrop-blur-md border border-white/40 flex items-center justify-center text-3xl shadow-inner mb-2 animate-bounce">
            🏆
          </div>

          <span className="text-xs uppercase tracking-widest font-black text-amber-950/80">
            Grand Champion
          </span>
          <h1 className="text-3xl font-black tracking-tight drop-shadow-sm flex items-center gap-2">
            <span>{winner.avatar}</span>
            <span>{winner.name}</span>
          </h1>
          <p className="text-xs font-bold text-amber-950/75 mt-1">
            Conquered the summit in {winner.turnsPlayed} turns!
          </p>
        </div>

        {/* Podium Standings & Highlights */}
        <div className="p-6 flex flex-col gap-5">
          <div className="flex flex-col gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Final Standings
            </span>
            <div className="flex flex-col gap-1.5">
              {sortedLeaderboard.map((p, idx) => (
                <div
                  key={p.id}
                  className={`flex items-center justify-between p-3 rounded-xl border ${
                    p.id === winner.id
                      ? 'bg-amber-500/15 border-amber-500/50 text-amber-200'
                      : 'bg-slate-800/60 border-slate-700/60 text-slate-300'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className="w-6 text-center font-black text-sm">
                      {idx === 0 ? '🥇' : idx === 1 ? '🥈' : idx === 2 ? '🥉' : `#${idx + 1}`}
                    </span>
                    <span className="text-lg">{p.avatar}</span>
                    <span className="font-bold text-sm">{p.name}</span>
                    {p.isAi && (
                      <span className="text-[10px] bg-slate-700 px-1.5 py-0.5 rounded text-amber-300 font-mono">
                        BOT
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-3 text-xs">
                    <span className="font-mono font-bold text-amber-400">Tile {p.position}</span>
                    <span className="text-slate-500">·</span>
                    <span className="text-slate-400">{p.stats.laddersClimbed} 🪜</span>
                    <span className="text-slate-400">{p.stats.snakesBitten} 🐍</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Winner Match Achievements */}
          <div className="grid grid-cols-3 gap-2 bg-slate-950/60 p-3 rounded-xl border border-slate-800 text-center">
            <div className="flex flex-col">
              <span className="text-[10px] text-slate-400 uppercase font-semibold">Total Rolls</span>
              <span className="text-lg font-black text-slate-200">{winner.stats.rolls}</span>
            </div>
            <div className="flex flex-col">
              <span className="text-[10px] text-slate-400 uppercase font-semibold">Ladders Climbed</span>
              <span className="text-lg font-black text-emerald-400">{winner.stats.laddersClimbed}</span>
            </div>
            <div className="flex flex-col">
              <span className="text-[10px] text-slate-400 uppercase font-semibold">Snakes Bitten</span>
              <span className="text-lg font-black text-rose-400">{winner.stats.snakesBitten}</span>
            </div>
          </div>

          {/* Action CTAs */}
          <div className="flex items-center gap-3 pt-2">
            <button
              onClick={() => {
                sound.playClick();
                onPlayAgain();
              }}
              className="flex-1 flex items-center justify-center gap-2 py-3.5 px-4 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black shadow-lg shadow-amber-500/20 transition-transform active:scale-95 cursor-pointer"
            >
              <RotateCcw className="w-4 h-4" /> Rematch
            </button>

            <button
              onClick={() => {
                sound.playClick();
                onChangeSetup();
              }}
              className="flex items-center justify-center gap-2 py-3.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold border border-slate-700 transition-colors cursor-pointer"
            >
              <Users className="w-4 h-4" /> New Setup
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
