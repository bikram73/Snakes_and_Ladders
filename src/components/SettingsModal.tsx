import React from 'react';
import { GameRules } from '../types/game';
import { Settings, X, Volume2, VolumeX } from 'lucide-react';
import { sound } from '../utils/audio';

interface SettingsModalProps {
  rules: GameRules;
  onUpdateRules: (rules: GameRules) => void;
  onClose: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  rules,
  onUpdateRules,
  onClose,
}) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
      <div className="bg-slate-900 border border-slate-700/80 rounded-2xl w-full max-w-md overflow-hidden shadow-2xl p-6 flex flex-col gap-5 text-slate-100 animate-fade-in">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400">
              <Settings className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-black tracking-tight uppercase">Game Settings</h2>
              <p className="text-xs text-slate-400">Customize rules and experience</p>
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

        <div className="flex flex-col gap-3">
          {/* Sound Effects */}
          <div className="flex items-center justify-between p-3.5 rounded-xl bg-slate-800/70 border border-slate-700/80">
            <div className="flex flex-col">
              <span className="text-sm font-bold text-slate-200">Sound Effects</span>
              <span className="text-xs text-slate-400">Audio for rolls, steps, snakes, ladders</span>
            </div>
            <button
              onClick={() => {
                const next = !rules.soundEnabled;
                sound.enabled = next;
                if (next) sound.playClick();
                onUpdateRules({ ...rules, soundEnabled: next });
              }}
              className={`px-3 py-1.5 rounded-lg text-xs font-black uppercase tracking-wider transition-colors cursor-pointer flex items-center gap-1.5 ${
                rules.soundEnabled
                  ? 'bg-emerald-500 text-slate-950'
                  : 'bg-slate-700 text-slate-300'
              }`}
            >
              {rules.soundEnabled ? <Volume2 className="w-3.5 h-3.5" /> : <VolumeX className="w-3.5 h-3.5" />}
              {rules.soundEnabled ? 'ON' : 'OFF'}
            </button>
          </div>

          {/* Extra Turn on 6 */}
          <div className="flex items-center justify-between p-3.5 rounded-xl bg-slate-800/70 border border-slate-700/80">
            <div className="flex flex-col">
              <span className="text-sm font-bold text-slate-200">Extra Turn on 6</span>
              <span className="text-xs text-slate-400">Rolling a 6 grants another turn</span>
            </div>
            <button
              onClick={() => {
                sound.playClick();
                onUpdateRules({ ...rules, extraTurnOnSix: !rules.extraTurnOnSix });
              }}
              className={`px-3 py-1.5 rounded-lg text-xs font-black uppercase tracking-wider transition-colors cursor-pointer ${
                rules.extraTurnOnSix
                  ? 'bg-amber-500 text-slate-950'
                  : 'bg-slate-700 text-slate-300'
              }`}
            >
              {rules.extraTurnOnSix ? 'ON' : 'OFF'}
            </button>
          </div>

          {/* Exact 100 Required */}
          <div className="flex items-center justify-between p-3.5 rounded-xl bg-slate-800/70 border border-slate-700/80">
            <div className="flex flex-col">
              <span className="text-sm font-bold text-slate-200">Exact 100 Required</span>
              <span className="text-xs text-slate-400">Must land precisely on square 100</span>
            </div>
            <button
              onClick={() => {
                sound.playClick();
                onUpdateRules({ ...rules, exact100: !rules.exact100 });
              }}
              className={`px-3 py-1.5 rounded-lg text-xs font-black uppercase tracking-wider transition-colors cursor-pointer ${
                rules.exact100
                  ? 'bg-amber-500 text-slate-950'
                  : 'bg-slate-700 text-slate-300'
              }`}
            >
              {rules.exact100 ? 'ON' : 'OFF'}
            </button>
          </div>

          {/* Animation Speed */}
          <div className="flex flex-col gap-2 p-3.5 rounded-xl bg-slate-800/70 border border-slate-700/80">
            <span className="text-sm font-bold text-slate-200">Animation Speed</span>
            <div className="grid grid-cols-3 gap-2">
              {(['slow', 'normal', 'fast'] as const).map((speed) => (
                <button
                  key={speed}
                  onClick={() => {
                    sound.playClick();
                    onUpdateRules({ ...rules, animationSpeed: speed });
                  }}
                  className={`py-2 rounded-lg text-xs font-black uppercase tracking-wider transition-colors cursor-pointer ${
                    rules.animationSpeed === speed
                      ? 'bg-amber-500 text-slate-950'
                      : 'bg-slate-750 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {speed}
                </button>
              ))}
            </div>
          </div>
        </div>

        <button
          onClick={() => {
            sound.playClick();
            onClose();
          }}
          className="w-full py-3 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black rounded-xl cursor-pointer transition-transform active:scale-95 shadow-lg shadow-amber-500/20"
        >
          Save & Close
        </button>
      </div>
    </div>
  );
};
