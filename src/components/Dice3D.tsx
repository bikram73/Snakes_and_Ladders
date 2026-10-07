import React, { useEffect } from 'react';
import { sound } from '../utils/audio';

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
      <div className="dice-container p-2">
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

      {/* Large Interactive Action Button */}
      <button
        onClick={() => {
          if (!disabled && !isRolling) {
            sound.playClick();
            onRoll();
          }
        }}
        disabled={disabled || isRolling}
        aria-label="Roll dice"
        className={`w-full max-w-xs py-3.5 px-6 rounded-2xl font-black text-base uppercase tracking-wider transition-all duration-200 cursor-pointer flex items-center justify-center gap-3 shadow-lg ${
          disabled
            ? 'opacity-60 cursor-not-allowed bg-slate-800 text-slate-400 border border-slate-700'
            : 'bg-gradient-to-r from-amber-500 via-amber-400 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-slate-950 shadow-amber-500/25 active:scale-95 border-b-4 border-amber-600'
        }`}
      >
        <span>🎲</span>
        <span>{isRolling ? 'Rolling...' : 'ROLL DICE'}</span>
      </button>

      {!disabled && !isRolling && (
        <span className="text-[11px] text-slate-400 font-medium animate-pulse">
          Click button or press [Space] to roll
        </span>
      )}
    </div>
  );
};
