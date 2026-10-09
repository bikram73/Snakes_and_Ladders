import React from 'react';
import {
  SharkThemeId,
  SharkLayoutPresetId,
  SHARK_THEMES,
  SHARK_THEMES_LIST,
} from '../utils/sharkThemes';
import {
  SHARK_LAYOUT_PRESETS,
  SHARK_LAYOUT_PRESETS_LIST,
} from '../utils/boardPresets';
import { sound } from '../utils/audio';
import { Palette, X, Check, ShieldAlert, Sparkles, Compass } from 'lucide-react';

interface SharkThemeModalProps {
  currentThemeId: SharkThemeId;
  currentLayoutId: SharkLayoutPresetId;
  onSelectTheme: (themeId: SharkThemeId) => void;
  onSelectLayout: (layoutId: SharkLayoutPresetId) => void;
  onClose: () => void;
}

export const SharkThemeModal: React.FC<SharkThemeModalProps> = ({
  currentThemeId,
  currentLayoutId,
  onSelectTheme,
  onSelectLayout,
  onClose,
}) => {
  const activeTheme = SHARK_THEMES[currentThemeId] || SHARK_THEMES['great-white'];
  const activeLayout = SHARK_LAYOUT_PRESETS[currentLayoutId] || SHARK_LAYOUT_PRESETS['reef-patrol'];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/85 backdrop-blur-md">
      <div className="bg-slate-900 border border-slate-700/80 rounded-2xl w-full max-w-2xl max-h-[92vh] flex flex-col overflow-hidden shadow-2xl animate-fade-in text-slate-100">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-800 bg-slate-950/60">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-cyan-500/20 border border-cyan-400/40 flex items-center justify-center text-cyan-400 shadow-sm">
              <Palette className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-black tracking-tight uppercase text-white">
                  Shark Board Themes & Layouts
                </h2>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                  {activeTheme.icon} {activeTheme.name}
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Choose your oceanic visual aesthetic and shark obstacle layout
              </p>
            </div>
          </div>

          <button
            onClick={() => {
              sound.playClick();
              onClose();
            }}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg bg-slate-800 hover:bg-slate-700 cursor-pointer transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 flex flex-col gap-6">
          {/* Section 1: Shark Visual Themes */}
          <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-400" />
                <h3 className="text-xs sm:text-sm font-black uppercase tracking-wider text-slate-200">
                  1. Choose Shark Board Theme
                </h3>
              </div>
              <span className="text-[11px] text-slate-400">
                6 Unique Ocean Aesthetics
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {SHARK_THEMES_LIST.map((theme) => {
                const isSelected = theme.id === currentThemeId;

                return (
                  <button
                    key={theme.id}
                    onClick={() => {
                      sound.playClick();
                      onSelectTheme(theme.id);
                    }}
                    className={`relative p-3.5 rounded-xl border text-left transition-all cursor-pointer flex flex-col gap-2 ${
                      isSelected
                        ? 'bg-slate-800/90 border-cyan-400 ring-2 ring-cyan-400/50 shadow-lg scale-[1.01]'
                        : 'bg-slate-950/60 border-slate-800 hover:border-slate-700 hover:bg-slate-850'
                    }`}
                  >
                    {/* Top Row: Icon, Title, and Checkmark */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <span className="text-2xl drop-shadow">{theme.icon}</span>
                        <div>
                          <h4 className="text-xs sm:text-sm font-black text-white flex items-center gap-1.5">
                            {theme.name}
                          </h4>
                          <span className="text-[10px] text-cyan-300 font-mono opacity-90 block">
                            {theme.speciesTitle}
                          </span>
                        </div>
                      </div>

                      {isSelected && (
                        <div className="w-5 h-5 rounded-full bg-cyan-400 text-slate-950 flex items-center justify-center font-black">
                          <Check className="w-3.5 h-3.5 stroke-[3]" />
                        </div>
                      )}
                    </div>

                    {/* Tagline & Description */}
                    <p className="text-[11px] text-slate-300 leading-snug">
                      {theme.description}
                    </p>

                    {/* Badges footer */}
                    <div className="flex flex-wrap items-center gap-1.5 pt-1.5 border-t border-slate-800 text-[9px] font-bold">
                      <span className="px-1.5 py-0.5 rounded bg-slate-800 text-slate-300">
                        Trap: {theme.hazardEmoji} {theme.hazardName}
                      </span>
                      <span className="px-1.5 py-0.5 rounded bg-slate-800 text-slate-300">
                        Ascent: {theme.ladderEmoji} {theme.ladderName}
                      </span>
                      <span className="px-1.5 py-0.5 rounded bg-slate-800 text-cyan-300">
                        {theme.ambientBadge}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Section 2: Shark Board Layout Presets */}
          <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Compass className="w-4 h-4 text-cyan-400" />
                <h3 className="text-xs sm:text-sm font-black uppercase tracking-wider text-slate-200">
                  2. Choose Shark Board Layout
                </h3>
              </div>
              <span className="text-[11px] text-slate-400">
                Shark & Ladder Obstacle Distribution
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {SHARK_LAYOUT_PRESETS_LIST.map((layout) => {
                const isSelected = layout.id === currentLayoutId;

                return (
                  <button
                    key={layout.id}
                    onClick={() => {
                      sound.playClick();
                      onSelectLayout(layout.id);
                    }}
                    className={`relative p-3.5 rounded-xl border text-left transition-all cursor-pointer flex flex-col gap-2 ${
                      isSelected
                        ? 'bg-slate-800/90 border-amber-400 ring-2 ring-amber-400/50 shadow-lg scale-[1.01]'
                        : 'bg-slate-950/60 border-slate-800 hover:border-slate-700 hover:bg-slate-850'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-xl">{layout.icon}</span>
                        <div>
                          <h4 className="text-xs sm:text-sm font-black text-white">
                            {layout.name}
                          </h4>
                          <span className="text-[10px] text-amber-300 font-mono">
                            {layout.difficulty}
                          </span>
                        </div>
                      </div>

                      {isSelected && (
                        <div className="w-5 h-5 rounded-full bg-amber-400 text-slate-950 flex items-center justify-center font-black">
                          <Check className="w-3.5 h-3.5 stroke-[3]" />
                        </div>
                      )}
                    </div>

                    <p className="text-[11px] text-slate-300 leading-snug">
                      {layout.description}
                    </p>

                    <div className="flex items-center gap-2 text-[10px] font-bold text-slate-400 pt-1 border-t border-slate-800">
                      <span className="text-rose-400">
                        🦈 {Object.keys(layout.snakes).length} Sharks
                      </span>
                      <span>•</span>
                      <span className="text-emerald-400">
                        🪜 {Object.keys(layout.ladders).length} Ladders
                      </span>
                      <span>•</span>
                      <span className="text-slate-300 italic">
                        {layout.tagline}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-950/80 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <span>Active:</span>
            <strong className="text-cyan-300">
              {activeTheme.icon} {activeTheme.name}
            </strong>
            <span>•</span>
            <strong className="text-amber-300">
              {activeLayout.icon} {activeLayout.name}
            </strong>
          </div>

          <button
            onClick={() => {
              sound.playClick();
              onClose();
            }}
            className="px-5 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-black text-xs uppercase tracking-wider cursor-pointer transition-transform active:scale-95 shadow-md shadow-cyan-500/20"
          >
            Apply & Play
          </button>
        </div>
      </div>
    </div>
  );
};
