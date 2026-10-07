import React, { useEffect } from 'react';
import { sound } from '../utils/audio';

interface Dice3DProps {
  value: number;
  isRolling: boolean;
  onRoll: () => void;
  disabled?: boolean;
  secondaryValue?: number;
  showDouble?: boolean;
  theme?: string;
}

export const Dice3D: React.FC<Dice3DProps> = ({
  value,
  isRolling,
  onRoll,
  disabled = false,
  secondaryValue,
  showDouble = false,
}) => {
  // Spacebar trigger
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space' && !disabled && !isRolling) {
        // Prevent page scroll
        e.preventDefault();
        sound.playClick();
        onRoll();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [disabled, isRolling, onRoll]);

  const renderSingleDie = (val: number, isSecondary = false) => {
    const faceClass = `dice-show-${Math.max(1, Math.min(6, val || 1))}`;

    return (
      <div className="dice-container p-2 select-none">
        <div
          className={`dice-cube ${isRolling ? 'dice-rolling-anim' : faceClass}`}
          style={{ transformOrigin: 'center center' }}
        >
          {/* Face 1 */}
          <div className="dice-face dice-face-1 bg-gradient-to-br from-white via-slate-50 to-slate-200 border border-slate-300 shadow-md">
            <div className="w-3.5 h-3.5 bg-rose-600 rounded-full shadow-inner ring-1 ring-rose-700/50" />
          </div>

          {/* Face 2 */}
          <div className="dice-face dice-face-2 bg-gradient-to-br from-white via-slate-50 to-slate-200 border border-slate-300 shadow-md">
            <div className="flex flex-col justify-between w-10 h-10 p-1">
              <div className="w-2.5 h-2.5 bg-slate-800 rounded-full shadow-inner self-start" />
              <div className="w-2.5 h-2.5 bg-slate-800 rounded-full shadow-inner self-end" />
            </div>
          </div>

          {/* Face 3 */}
          <div className="dice-face dice-face-3 bg-gradient-to-br from-white via-slate-50 to-slate-200 border border-slate-300 shadow-md">
            <div className="flex justify-between w-10 h-10 p-1">
              <div className="w-2.5 h-2.5 bg-slate-800 rounded-full shadow-inner self-start" />
              <div className="w-2.5 h-2.5 bg-slate-800 rounded-full shadow-inner self-center" />
              <div className="w-2.5 h-2.5 bg-slate-800 rounded-full shadow-inner self-end" />
            </div>
          </div>

          {/* Face 4 */}
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

          {/* Face 5 */}
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

          {/* Face 6 */}
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
    );
  };

  const total = showDouble && secondaryValue ? value + secondaryValue : value;

  return (
    <div className="flex flex-col items-center gap-3">
      <button
        onClick={() => {
          if (!disabled && !isRolling) {
            sound.playClick();
            onRoll();
          }
        }}
        disabled={disabled || isRolling}
        className={`group relative flex items-center justify-center gap-4 px-6 py-4 rounded-2xl transition-all duration-200 cursor-pointer ${
          disabled
            ? 'opacity-60 cursor-not-allowed bg-slate-900/60 border border-slate-800'
            : 'bg-gradient-to-b from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 shadow-lg shadow-amber-500/20 active:scale-95 border-b-4 border-amber-700 hover:border-amber-600'
        }`}
        title={disabled ? 'Waiting for turn...' : 'Click or press Spacebar to roll!'}
      >
        <div className="flex items-center gap-3">
          {renderSingleDie(value)}
          {showDouble && secondaryValue && renderSingleDie(secondaryValue, true)}
        </div>

        <div className="flex flex-col text-left pl-2">
          <span className="text-xs uppercase tracking-wider font-extrabold opacity-75">
            {isRolling ? 'Rolling...' : disabled ? 'Turn in progress' : 'Tap or Spacebar'}
          </span>
          <span className="text-xl font-black tracking-tight">
            {isRolling ? '...' : `Roll: ${total || '?'}`}
          </span>
        </div>
      </button>

      {!disabled && !isRolling && (
        <span className="text-xs text-slate-400 font-medium animate-pulse">
          Press [Space] to Roll
        </span>
      )}
    </div>
  );
};
