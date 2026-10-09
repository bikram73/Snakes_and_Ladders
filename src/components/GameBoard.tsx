import React, { useMemo } from 'react';
import { Player, SharkThemeId, SharkLayoutPresetId } from '../types/game';
import { getSharkLayoutPreset } from '../utils/boardPresets';
import { SHARK_THEMES, SHARK_THEMES_LIST } from '../utils/sharkThemes';
import { SharkSvgLayer } from './SharkSvgLayer';
import { getTileCoordinates } from '../utils/geometry';
import { Trophy, Flag, Palette, Sparkles, Compass } from 'lucide-react';
import { sound } from '../utils/audio';

interface GameBoardProps {
  players: Player[];
  currentPlayerId: number;
  steppingPlayerId: number | null;
  steppingTile: number | null;
  sharkThemeId?: SharkThemeId;
  sharkLayoutId?: SharkLayoutPresetId;
  onChangeTheme?: (themeId: SharkThemeId) => void;
  onChangeLayout?: (layoutId: SharkLayoutPresetId) => void;
  onOpenThemeModal?: () => void;
}

export const GameBoard: React.FC<GameBoardProps> = ({
  players,
  currentPlayerId,
  steppingPlayerId,
  steppingTile,
  sharkThemeId = 'great-white',
  sharkLayoutId = 'reef-patrol',
  onChangeTheme,
  onChangeLayout,
  onOpenThemeModal,
}) => {
  const size = 10;
  const currentTheme = SHARK_THEMES[sharkThemeId] || SHARK_THEMES['great-white'];
  const currentLayout = getSharkLayoutPreset(sharkLayoutId);

  // Group players by current rendered tile (1..100)
  const playersOnBoard = useMemo(() => {
    const map = new Map<number, Player[]>();
    players.forEach((p) => {
      const effectivePos = p.id === steppingPlayerId && steppingTile !== null ? steppingTile : p.position;
      if (effectivePos >= 1 && effectivePos <= 100) {
        if (!map.has(effectivePos)) map.set(effectivePos, []);
        map.get(effectivePos)!.push(p);
      }
    });
    return map;
  }, [players, steppingPlayerId, steppingTile]);

  // Players at start bench (Position 0)
  const playersAtStart = useMemo(() => {
    return players.filter((p) => {
      const effectivePos = p.id === steppingPlayerId && steppingTile !== null ? steppingTile : p.position;
      return effectivePos === 0;
    });
  }, [players, steppingPlayerId, steppingTile]);

  // Build grid of cells from 1 to 100 (bottom-to-top serpentine order)
  const gridCells = useMemo(() => {
    const cells = [];
    for (let r = 0; r < size; r++) {
      for (let c = 0; c < size; c++) {
        // Row 0 is top row (contains 100 down to 91)
        const rowFromBottom = size - 1 - r;
        const colInRow = rowFromBottom % 2 === 0 ? c : size - 1 - c;
        const tileNum = rowFromBottom * size + colInRow + 1;
        cells.push({
          tileNum,
          rowFromTop: r,
          col: c,
        });
      }
    }
    return cells;
  }, [size]);

  return (
    <div className="flex flex-col items-center w-full max-w-[560px] mx-auto select-none">
      {/* 🦈 Quick Shark Board Theme & Layout Selector Bar */}
      <div className="w-full mb-2 bg-slate-900/90 border border-slate-800 rounded-xl px-2.5 sm:px-3 py-1.5 flex items-center justify-between gap-2 shadow-md">
        <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none py-0.5 max-w-[75%] sm:max-w-[80%]">
          <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 shrink-0 flex items-center gap-1">
            <Palette className="w-3 h-3 text-cyan-400" /> Themes:
          </span>

          {SHARK_THEMES_LIST.map((theme) => {
            const isActive = theme.id === sharkThemeId;
            return (
              <button
                key={theme.id}
                onClick={() => {
                  sound.playClick();
                  if (onChangeTheme) onChangeTheme(theme.id);
                }}
                className={`flex items-center gap-1 px-2 py-0.5 rounded-lg text-[10px] font-bold shrink-0 transition-all cursor-pointer border ${
                  isActive
                    ? 'bg-cyan-500/25 border-cyan-400 text-cyan-200 ring-1 ring-cyan-400/50 shadow-sm scale-105'
                    : 'bg-slate-800/80 border-slate-700/80 text-slate-400 hover:text-white hover:bg-slate-750'
                }`}
                title={`${theme.name} — ${theme.speciesTitle}`}
              >
                <span>{theme.icon}</span>
                <span className="hidden xs:inline">{theme.name.split(' ')[0]}</span>
              </button>
            );
          })}
        </div>

        {onOpenThemeModal && (
          <button
            onClick={() => {
              sound.playClick();
              onOpenThemeModal();
            }}
            className="flex items-center gap-1 px-2 py-0.5 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 hover:border-cyan-400 text-cyan-300 text-[10px] font-black uppercase tracking-wider shrink-0 cursor-pointer transition-colors shadow-sm"
            title="Open Shark Themes & Board Layouts"
          >
            <Compass className="w-3 h-3" />
            <span className="hidden sm:inline">Layouts</span>
          </button>
        )}
      </div>

      {/* Position 0 Bench (Starting Zone outside board) */}
      <div className="w-full mb-2 bg-slate-900/90 border border-slate-800 rounded-xl px-3 sm:px-4 py-2 flex flex-wrap items-center justify-between gap-2 shadow-md">
        <div className="flex items-center gap-1.5 sm:gap-2">
          <Flag className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-emerald-400 shrink-0" />
          <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-slate-300">
            Start Bench (Sq 0):
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
          {playersAtStart.length === 0 ? (
            <span className="text-[10px] sm:text-xs text-slate-500 italic">All contenders on board</span>
          ) : (
            playersAtStart.map((p) => {
              const isTurn = p.id === currentPlayerId;
              return (
                <div
                  key={p.id}
                  className={`flex items-center gap-1 sm:gap-1.5 px-2 sm:px-2.5 py-0.5 sm:py-1 rounded-lg border text-[10px] sm:text-xs font-bold transition-transform ${
                    isTurn
                      ? 'bg-amber-500/20 border-amber-400 text-amber-200 ring-2 ring-amber-400/50 scale-105 shadow-sm'
                      : 'bg-slate-800/90 border-slate-700 text-slate-300'
                  }`}
                  title={`${p.name} at Start (Position 0)`}
                >
                  <span className="text-xs sm:text-sm">{p.avatar}</span>
                  <span className="truncate max-w-[70px] sm:max-w-[100px]">{p.name}</span>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Main 10x10 Board Arena */}
      <div
        className={`relative w-full aspect-square rounded-2xl sm:rounded-3xl overflow-hidden border-2 sm:border-4 transition-all duration-300 p-1.5 sm:p-2.5 ${currentTheme.boardOuterBorder} ${currentTheme.boardOuterBg}`}
      >
        {/* Subtle Water Caustic Overlay */}
        <div className="absolute inset-0 pointer-events-none opacity-25 mix-blend-overlay bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-white/20 via-transparent to-transparent" />

        {/* 10x10 Grid */}
        <div
          className={`grid w-full h-full gap-0.5 sm:gap-1 rounded-lg sm:rounded-xl overflow-hidden relative ${currentTheme.boardInnerGridBg}`}
          style={{
            gridTemplateColumns: 'repeat(10, minmax(0, 1fr))',
            gridTemplateRows: 'repeat(10, minmax(0, 1fr))',
          }}
        >
          {gridCells.map(({ tileNum }) => {
            const isFinish = tileNum === 100;
            const isStart = tileNum === 1;
            const isEven = (Math.floor((tileNum - 1) / 10) + (tileNum % 10)) % 2 === 0;

            const isSharkHead = currentLayout.snakesList.find((s) => s.head === tileNum);
            const isLadderBottom = currentLayout.laddersList.find((l) => l.bottom === tileNum);

            let cellBg = isEven ? currentTheme.tileEvenBg : currentTheme.tileOddBg;
            if (isFinish) cellBg = currentTheme.finishBg;
            if (isStart) cellBg = currentTheme.startBg;

            return (
              <div
                key={tileNum}
                className={`relative flex flex-col justify-between p-0.5 sm:p-1 rounded-[3px] sm:rounded-sm border transition-colors ${currentTheme.tileBorder} ${cellBg}`}
              >
                {/* Tile Number Header */}
                <div className="flex items-center justify-between w-full leading-none">
                  <span
                    className={`text-[8px] xs:text-[9px] sm:text-xs font-black tracking-tight ${
                      isFinish
                        ? 'text-slate-950 font-black'
                        : isStart
                        ? 'text-white font-black'
                        : currentTheme.tileNumberColor
                    }`}
                  >
                    {tileNum}
                  </span>

                  {isFinish && (
                    <Trophy className="w-2.5 h-2.5 sm:w-3.5 sm:h-3.5 text-slate-950 drop-shadow animate-bounce" />
                  )}
                  {isStart && (
                    <span className="text-[6px] sm:text-[8px] font-black uppercase text-white drop-shadow">
                      START
                    </span>
                  )}
                </div>

                {/* Shark / Ladder Badge Indicators */}
                <div className="flex items-center justify-end gap-0.5 text-[6px] sm:text-[8px] opacity-90 leading-none">
                  {isSharkHead && (
                    <span
                      className="font-black drop-shadow-sm flex items-center gap-0.5 text-rose-400"
                      title={`${currentTheme.hazardName} chomps down to ${isSharkHead.tail}`}
                    >
                      <span>{currentTheme.hazardEmoji}</span>
                      <span>➔{isSharkHead.tail}</span>
                    </span>
                  )}
                  {isLadderBottom && (
                    <span
                      className="font-black drop-shadow-sm flex items-center gap-0.5 text-emerald-400"
                      title={`${currentTheme.ladderName} ascends up to ${isLadderBottom.top}`}
                    >
                      <span>{currentTheme.ladderEmoji}</span>
                      <span>➔{isLadderBottom.top}</span>
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* 🦈 SVG Layer for Shark Hazards & Ascent Ladders */}
        <SharkSvgLayer
          theme={currentTheme}
          snakes={currentLayout.snakesList}
          ladders={currentLayout.laddersList}
          boardSize={size}
          dimension={1000}
        />

        {/* 🔴 Clustered Animated Player Tokens */}
        <div className="absolute inset-0 pointer-events-none p-1.5 sm:p-2.5">
          {Array.from(playersOnBoard.entries()).map(([tileNum, tilePlayers]) => {
            const coords = getTileCoordinates(tileNum, size, 100);

            return (
              <div
                key={tileNum}
                className="absolute flex items-center justify-center transition-all duration-200 transform -translate-x-1/2 -translate-y-1/2"
                style={{
                  left: `${coords.x}%`,
                  top: `${coords.y}%`,
                  zIndex: 30,
                }}
              >
                <div className="flex items-center justify-center -space-x-1 sm:-space-x-1.5">
                  {tilePlayers.map((p, idx) => {
                    const isTurn = p.id === currentPlayerId;
                    const isStepping = steppingPlayerId === p.id;

                    return (
                      <div
                        key={p.id}
                        className={`w-5 h-5 xs:w-6 xs:h-6 sm:w-7 sm:h-7 rounded-full flex items-center justify-center text-[10px] sm:text-xs shadow-lg border-2 border-white font-black transition-all ${
                          p.color === 'red'
                            ? 'bg-rose-600 text-white'
                            : p.color === 'blue'
                            ? 'bg-sky-500 text-white'
                            : p.color === 'green'
                            ? 'bg-emerald-500 text-white'
                            : 'bg-amber-400 text-slate-950'
                        } ${
                          isTurn
                            ? 'ring-2 sm:ring-4 ring-amber-400 scale-110 sm:scale-125 z-40 token-active-pulse'
                            : 'z-30'
                        } ${isStepping ? 'scale-125 sm:scale-140 -translate-y-1 z-50' : ''}`}
                        style={{
                          transform: `translate(${idx * 3}px, ${idx * -3}px)`,
                        }}
                        title={`${p.name} at Square ${tileNum}`}
                      >
                        <span>{p.avatar}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Board Ambient Footer Badge */}
      <div className="w-full mt-2 flex items-center justify-between text-[10px] text-slate-400 px-1 font-medium">
        <span className="flex items-center gap-1">
          <span className="font-bold text-slate-300">{currentTheme.icon} {currentTheme.name}</span>
          <span>•</span>
          <span className={currentTheme.ambientTextColor}>{currentTheme.speciesTitle}</span>
        </span>
        <span className="flex items-center gap-1 font-mono text-slate-400">
          <span>{currentLayout.icon} {currentLayout.name}</span>
          <span>({Object.keys(currentLayout.snakes).length} Sharks / {Object.keys(currentLayout.ladders).length} Ladders)</span>
        </span>
      </div>
    </div>
  );
};
