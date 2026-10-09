import React from 'react';
import { GameRules } from '../types/game';
import { SHARK_THEMES, SHARK_THEMES_LIST, SharkThemeId, SharkLayoutPresetId } from '../utils/sharkThemes';
import { SHARK_LAYOUT_PRESETS_LIST } from '../utils/boardPresets';
import { Settings, X, Volume2, VolumeX, Palette, Compass } from 'lucide-react';
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
  const currentThemeId: SharkThemeId = rules.sharkTheme || 'great-white';
  const currentLayoutId: SharkLayoutPresetId = rules.sharkLayout || 'reef-patrol';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-sm">
      <div className="bg-slate-900 border border-slate-700/80 rounded-2xl w-full max-w-lg max-h-[90vh] overflow-hidden shadow-2xl flex flex-col text-slate-100 animate-fade-in">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 p-4 sm:p-5 bg-slate-950/50">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-cyan-500/20 border border-cyan-500/40 flex items-center justify-center text-cyan-400">
              <Settings className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-black tracking-tight uppercase">Game Settings</h2>
              <p className="text-xs text-slate-400">Customize rules, shark themes, and layouts</p>
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

        {/* Scrollable Form Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 flex flex-col gap-4">
          {/* Shark Theme Setting */}
          <div className="flex flex-col gap-2 p-3.5 rounded-xl bg-slate-800/70 border border-slate-700/80">
            <div className="flex items-center justify-between">
              <span className="text-sm font-bold text-slate-200 flex items-center gap-1.5">
                <Palette className="w-4 h-4 text-cyan-400" /> Shark Board Theme
              </span>
              <span className="text-[11px] text-cyan-300 font-mono font-bold">
                {SHARK_THEMES[currentThemeId]?.name}
              </span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5">
              {SHARK_THEMES_LIST.map((theme) => {
                const isSelected = theme.id === currentThemeId;
                return (
                  <button
                    key={theme.id}
                    onClick={() => {
                      sound.playClick();
                      onUpdateRules({ ...rules, sharkTheme: theme.id });
                    }}
                    className={`p-2 rounded-lg border text-left transition-all cursor-pointer flex flex-col gap-0.5 ${
                      isSelected
                        ? 'bg-cyan-500/20 border-cyan-400 ring-1 ring-cyan-400/50 text-white shadow-sm'
                        : 'bg-slate-900/80 border-slate-750 text-slate-400 hover:text-slate-200 hover:border-slate-650'
                    }`}
                  >
                    <div className="flex items-center gap-1.5">
                      <span className="text-base">{theme.icon}</span>
                      <span className="text-[11px] font-black truncate">{theme.name.split(' ')[0]}</span>
                    </div>
                    <span className="text-[9px] text-slate-400 truncate opacity-90 font-mono">
                      {theme.hazardName}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Shark Board Layout Preset */}
          <div className="flex flex-col gap-2 p-3.5 rounded-xl bg-slate-800/70 border border-slate-700/80">
            <div className="flex items-center justify-between">
              <span className="text-sm font-bold text-slate-200 flex items-center gap-1.5">
                <Compass className="w-4 h-4 text-amber-400" /> Shark Board Layout Preset
              </span>
              <span className="text-[11px] text-amber-300 font-mono font-bold">
                {SHARK_LAYOUT_PRESETS_LIST.find((l) => l.id === currentLayoutId)?.name}
              </span>
            </div>
            <div className="grid grid-cols-2 gap-2">
              {SHARK_LAYOUT_PRESETS_LIST.map((layout) => {
                const isSelected = layout.id === currentLayoutId;
                return (
                  <button
                    key={layout.id}
                    onClick={() => {
                      sound.playClick();
                      onUpdateRules({ ...rules, sharkLayout: layout.id });
                    }}
                    className={`p-2 rounded-lg border text-left transition-all cursor-pointer flex flex-col gap-0.5 ${
                      isSelected
                        ? 'bg-amber-500/20 border-amber-400 ring-1 ring-amber-400/50 text-white shadow-sm'
                        : 'bg-slate-900/80 border-slate-750 text-slate-400 hover:text-slate-200 hover:border-slate-650'
                    }`}
                  >
                    <div className="flex items-center gap-1.5">
                      <span className="text-sm">{layout.icon}</span>
                      <span className="text-[11px] font-black text-white">{layout.name}</span>
                    </div>
                    <span className="text-[9px] text-slate-400 truncate">
                      {layout.difficulty} • {Object.keys(layout.snakes).length} Sharks
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Sound Effects */}
          <div className="flex items-center justify-between p-3.5 rounded-xl bg-slate-800/70 border border-slate-700/80">
            <div className="flex flex-col">
              <span className="text-sm font-bold text-slate-200">Sound Effects</span>
              <span className="text-xs text-slate-400">Audio for rolls, steps, shark chomps, climbs</span>
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

        {/* Footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-950/70">
          <button
            onClick={() => {
              sound.playClick();
              onClose();
            }}
            className="w-full py-3 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-black rounded-xl cursor-pointer transition-transform active:scale-95 shadow-lg shadow-cyan-500/20"
          >
            Save & Close
          </button>
        </div>
      </div>
    </div>
  );
};
