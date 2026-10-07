import React, { useEffect } from 'react';
import { sound } from '../utils/audio';
import { Dices } from 'lucide-react';

interface Dice3DProps {
  value: number;
  isRolling: boolean;
  onRoll: () => void;
  disabled?: boolean;
}

export const Dice3D: React.FC<Dice3DProps> = ({
  value,
  isRolling,
  onRoll,
  disabled = false,
}) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space' && !disabled && !isRolling) {
        e.preventDefault();
        sound.playClick();
        onRoll();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [disabled, isRolling, onRoll]);

  const faceClass = `dice-show-${Math.max(1, Math.min(6, value || 1))}`;

  return (
    <div className="flex flex-col items-center gap-3 select-none w-full">
      {/* 3D Rolling Cube */}
      <div className="dice-container p-1 sm:p-2 cursor-pointer" onClick={() => !disabled && !isRolling && onRoll()}>
        <div
          className={`dice-cube ${isRolling ? 'dice-rolling-anim' : faceClass}`}
          style={{ transformOrigin: 'center center' }}
        >
          {/* Face 1: ⚀ */}
          <div className="dice-face dice-face-1 bg-gradient-to-br from-white via-slate-50 to-slate-200 border border-slate-300 shadow-md">
            <div className="w-4 h-4 bg-rose-600 rounded-full shadow-inner ring-1 ring-rose-700/50" />
          </div>

          {/* Face 2: ⚁ */}
          <div className="dice-face dice-face-2 bg-gradient-to-br from-white via-slate-50 to-slate-200 border border-slate-300 shadow-md">
            <div className="flex flex-col justify-between w-10 h-10 p-1">
              <div className="w-2.5 h-2.5 bg-slate-800 rounded-full shadow-inner self-start" />
              <div className="w-2.5 h-2.5 bg-slate-800 rounded-full shadow-inner self-end" />
            </div>
          </div>

          {/* Face 3: ⚂ */}
          <div className="dice-face dice-face-3 bg-gradient-to-br from-white via-slate-50 to-slate-200 border border-slate-300 shadow-md">
            <div className="flex justify-between w-10 h-10 p-1">
              <div className="w-2.5 h-2.5 bg-slate-800 rounded-full shadow-inner self-start" />
              <div className="w-2.5 h-2.5 bg-slate-800 rounded-full shadow-inner self-center" />
              <div className="w-2.5 h-2.5 bg-slate-800 rounded-full shadow-inner self-end" />
            </div>
          </div>

          {/* Face 4: ⚃ */}
          <div className="dice-face dice-face-4 bg-gradient-to-br from-white via-slate-50 to-slate-200 border border-slate-300 shadow-md">
            <div className="flex flex-col justify-between w-10 h-10 p-1">
              <div className="flex justify-between">
                <div className="w-2.5 h-2.5 bg-slate-800 rounded-full shadow-inner" />
                <div className="w-2.5 h-2.5 bg-slate-800 rounded-full shadow-inner" />
              </div>
              <div className="flex justify-between">
                <div className="w-2.5 h-2.5 bg-slate-800 rounded-full shadow-inner" />
                <div className="w-2.5 h-2.5 bg-slate-800 rounded-full shadow-inner" />
              </div>
            </div>
          </div>

          {/* Face 5: ⚄ */}
          <div className="dice-face dice-face-5 bg-gradient-to-br from-white via-slate-50 to-slate-200 border border-slate-300 shadow-md">
            <div className="flex flex-col justify-between w-10 h-10 p-1 relative">
              <div className="flex justify-between">
                <div className="w-2.5 h-2.5 bg-slate-800 rounded-full shadow-inner" />
                <div className="w-2.5 h-2.5 bg-slate-800 rounded-full shadow-inner" />
              </div>
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-2.5 h-2.5 bg-slate-800 rounded-full shadow-inner" />
              </div>
              <div className="flex justify-between">
                <div className="w-2.5 h-2.5 bg-slate-800 rounded-full shadow-inner" />
                <div className="w-2.5 h-2.5 bg-slate-800 rounded-full shadow-inner" />
              </div>
            </div>
          </div>

          {/* Face 6: ⚅ */}
          <div className="dice-face dice-face-6 bg-gradient-to-br from-white via-slate-50 to-slate-200 border border-slate-300 shadow-md">
            <div className="flex justify-between w-10 h-10 p-1">
              <div className="flex flex-col justify-between">
                <div className="w-2.5 h-2.5 bg-slate-800 rounded-full shadow-inner" />
                <div className="w-2.5 h-2.5 bg-slate-800 rounded-full shadow-inner" />
                <div className="w-2.5 h-2.5 bg-slate-800 rounded-full shadow-inner" />
              </div>
              <div className="flex flex-col justify-between">
                <div className="w-2.5 h-2.5 bg-slate-800 rounded-full shadow-inner" />
                <div className="w-2.5 h-2.5 bg-slate-800 rounded-full shadow-inner" />
                <div className="w-2.5 h-2.5 bg-slate-800 rounded-full shadow-inner" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Action Button */}
      <button
        onClick={() => {
          if (!disabled && !isRolling) {
            sound.playClick();
            onRoll();
          }
        }}
        disabled={disabled || isRolling}
        className={`w-full py-3 sm:py-3.5 px-4 rounded-xl font-black text-sm uppercase tracking-wider transition-all flex items-center justify-center gap-2 shadow-lg cursor-pointer ${
          disabled || isRolling
            ? 'bg-slate-800 text-slate-500 border border-slate-700 cursor-not-allowed opacity-60'
            : 'bg-gradient-to-r from-amber-500 via-amber-400 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-slate-950 shadow-amber-500/25 active:scale-98 border-b-4 border-amber-600 hover:shadow-xl'
        }`}
      >
        <Dices className="w-4 h-4" />
        <span>{isRolling ? 'ROLLING...' : 'ROLL DICE'}</span>
      </button>

      {/* Keyboard Shortcut hint (Desktop only) */}
      <span className="hidden sm:block text-[10px] text-slate-400 font-bold uppercase tracking-wider">
        Press <kbd className="px-1.5 py-0.5 rounded bg-slate-800 border border-slate-700 text-amber-300 font-mono text-[9px]">Spacebar</kbd> to roll
      </span>
    </div>
  );
};
