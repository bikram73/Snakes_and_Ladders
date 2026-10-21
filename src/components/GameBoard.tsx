import React, { useMemo, useState } from 'react';
import { Player, SharkThemeId, SharkLayoutPresetId } from '../types/game';
import { getSharkLayoutPreset } from '../utils/boardPresets';
import { SHARK_THEMES, SHARK_THEMES_LIST } from '../utils/sharkThemes';
import { SharkSvgLayer } from './SharkSvgLayer';
import { getTileCoordinates } from '../utils/geometry';
import { Trophy, Flag, Palette, Sparkles, Compass, Info, ArrowUpRight, ArrowDownRight, AlertTriangle } from 'lucide-react';
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

  // Hover & Tile Inspector State
  const [hoveredTile, setHoveredTile] = useState<number | null>(null);

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

  // Precompute hovered tile info, connected hazards, and occupant details
  const hoveredTileInfo = useMemo(() => {
    if (hoveredTile === null) return null;
    const isSharkHead = currentLayout.snakesList.find((s) => s.head === hoveredTile);
    const isSharkTail = currentLayout.snakesList.find((s) => s.tail === hoveredTile);
    const isLadderBottom = currentLayout.laddersList.find((l) => l.bottom === hoveredTile);
    const isLadderTop = currentLayout.laddersList.find((l) => l.top === hoveredTile);
    const occupants = playersOnBoard.get(hoveredTile) || [];
    const coords = getTileCoordinates(hoveredTile, size, 100);

    let targetTile: number | null = null;
    let type: 'shark-head' | 'shark-tail' | 'ladder-bottom' | 'ladder-top' | 'finish' | 'start' | 'normal' = 'normal';

    if (isSharkHead) {
      type = 'shark-head';
      targetTile = isSharkHead.tail;
    } else if (isLadderBottom) {
      type = 'ladder-bottom';
      targetTile = isLadderBottom.top;
    } else if (isSharkTail) {
      type = 'shark-tail';
      targetTile = isSharkTail.head;
    } else if (isLadderTop) {
      type = 'ladder-top';
      targetTile = isLadderTop.bottom;
    } else if (hoveredTile === 100) {
      type = 'finish';
    } else if (hoveredTile === 1) {
      type = 'start';
    }

    return {
      tileNum: hoveredTile,
      type,
      targetTile,
      isSharkHead,
      isSharkTail,
      isLadderBottom,
      isLadderTop,
      occupants,
      coords,
    };
  }, [hoveredTile, currentLayout, playersOnBoard, size]);

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
    <div className="flex flex-col items-center w-full max-w-[min(100%,480px)] sm:max-w-[min(100%,520px)] mx-auto select-none">
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
        className={`relative w-full aspect-square max-h-[calc(100vh-230px)] sm:max-h-[calc(100vh-250px)] rounded-2xl sm:rounded-3xl overflow-hidden border-2 sm:border-4 transition-all duration-300 p-1.5 sm:p-2.5 lg:p-3 xl:p-3.5 ${currentTheme.boardOuterBorder} ${currentTheme.boardOuterBg}`}
        onMouseLeave={() => setHoveredTile(null)}
      >
        {/* Subtle Water Caustic Overlay */}
        <div className="absolute inset-0 pointer-events-none opacity-25 mix-blend-overlay bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-white/20 via-transparent to-transparent" />

        {/* 10x10 Grid */}
        <div
          className={`grid w-full h-full gap-0.5 sm:gap-1 lg:gap-1.5 rounded-lg sm:rounded-xl overflow-hidden relative ${currentTheme.boardInnerGridBg}`}
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
            const isSharkTail = currentLayout.snakesList.find((s) => s.tail === tileNum);
            const isLadderBottom = currentLayout.laddersList.find((l) => l.bottom === tileNum);
            const isLadderTop = currentLayout.laddersList.find((l) => l.top === tileNum);

            const isHovered = hoveredTile === tileNum;
            const isTargetOfHover = hoveredTileInfo?.targetTile === tileNum;

            let cellBg = isEven ? currentTheme.tileEvenBg : currentTheme.tileOddBg;
            if (isFinish) cellBg = currentTheme.finishBg;
            if (isStart) cellBg = currentTheme.startBg;

            // Highlight backgrounds on hover
            if (isHovered) {
              if (isSharkHead) cellBg = 'bg-rose-500/35';
              else if (isLadderBottom) cellBg = 'bg-emerald-500/35';
              else if (isFinish) cellBg = 'bg-amber-400/40';
              else if (isStart) cellBg = 'bg-sky-400/35';
              else cellBg = 'bg-amber-400/25';
            } else if (isTargetOfHover) {
              if (hoveredTileInfo?.type === 'shark-head') cellBg = 'bg-rose-500/25';
              else if (hoveredTileInfo?.type === 'ladder-bottom') cellBg = 'bg-emerald-500/25';
              else cellBg = 'bg-amber-400/20';
            }

            return (
              <div
                key={tileNum}
                onMouseEnter={() => setHoveredTile(tileNum)}
                onMouseLeave={() => setHoveredTile((prev) => (prev === tileNum ? null : prev))}
                onClick={() => {
                  sound.playClick();
                  setHoveredTile((prev) => (prev === tileNum ? null : tileNum));
                }}
                className={`relative flex flex-col justify-between p-0.5 sm:p-1 lg:p-1.5 rounded-[3px] sm:rounded-sm border transition-all duration-150 cursor-pointer ${
                  currentTheme.tileBorder
                } ${cellBg} ${
                  isHovered
                    ? isSharkHead
                      ? 'ring-2 sm:ring-4 ring-rose-400 z-30 scale-105 sm:scale-110 shadow-xl shadow-rose-500/40 brightness-110'
                      : isLadderBottom
                      ? 'ring-2 sm:ring-4 ring-emerald-400 z-30 scale-105 sm:scale-110 shadow-xl shadow-emerald-500/40 brightness-110'
                      : isFinish
                      ? 'ring-2 sm:ring-4 ring-amber-300 z-30 scale-105 sm:scale-110 shadow-xl shadow-amber-400/40 brightness-110'
                      : isStart
                      ? 'ring-2 sm:ring-4 ring-sky-300 z-30 scale-105 sm:scale-110 shadow-xl shadow-sky-400/40 brightness-110'
                      : 'ring-2 sm:ring-4 ring-amber-400 z-30 scale-105 sm:scale-110 shadow-xl shadow-amber-400/40 brightness-110'
                    : isTargetOfHover
                    ? isSharkTail || hoveredTileInfo?.type === 'shark-head'
                      ? 'ring-2 sm:ring-3 ring-dashed ring-rose-400 z-25 animate-pulse brightness-110'
                      : 'ring-2 sm:ring-3 ring-dashed ring-emerald-400 z-25 animate-pulse brightness-110'
                    : ''
                }`}
              >
                {/* Tile Number Header */}
                <div className="flex items-center justify-between w-full leading-none">
                  <span
                    className={`text-[8px] xs:text-[9px] sm:text-xs lg:text-sm xl:text-base font-black tracking-tight ${
                      isHovered
                        ? 'text-white drop-shadow font-black scale-105'
                        : isFinish
                        ? 'text-slate-950 font-black'
                        : isStart
                        ? 'text-white font-black'
                        : currentTheme.tileNumberColor
                    }`}
                  >
                    {tileNum}
                  </span>

                  {isFinish && (
                    <Trophy className="w-2.5 h-2.5 sm:w-3.5 sm:h-3.5 lg:w-4 lg:h-4 text-slate-950 drop-shadow animate-bounce" />
                  )}
                  {isStart && (
                    <span className="text-[6px] sm:text-[8px] lg:text-[10px] font-black uppercase text-white drop-shadow">
                      START
                    </span>
                  )}
                </div>

                {/* Shark / Ladder Badge Indicators */}
                <div className="flex items-center justify-end gap-0.5 text-[6px] sm:text-[8px] lg:text-[10px] xl:text-[11px] opacity-90 leading-none">
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
                  {!isSharkHead && isSharkTail && (
                    <span className="font-bold text-rose-300 opacity-60 text-[6px] sm:text-[7px] lg:text-[8px]" title="Shark drop zone">
                      ▼
                    </span>
                  )}
                  {!isLadderBottom && isLadderTop && (
                    <span className="font-bold text-emerald-300 opacity-60 text-[6px] sm:text-[7px] lg:text-[8px]" title="Ladder summit">
                      ▲
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
        <div className="absolute inset-0 pointer-events-none p-1.5 sm:p-2.5 lg:p-3 xl:p-3.5">
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
                <div className="flex items-center justify-center -space-x-1 sm:-space-x-1.5 lg:-space-x-2">
                  {tilePlayers.map((p, idx) => {
                    const isTurn = p.id === currentPlayerId;
                    const isStepping = steppingPlayerId === p.id;

                    return (
                      <div
                        key={p.id}
                        className={`w-5 h-5 xs:w-6 xs:h-6 sm:w-7 sm:h-7 lg:w-8 lg:h-8 xl:w-9 xl:h-9 rounded-full flex items-center justify-center text-[10px] sm:text-xs lg:text-sm shadow-lg border-2 border-white font-black transition-all ${
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

        {/* 💬 Floating Tile Inspector Tooltip on Hover */}
        {hoveredTileInfo && (
          <div
            className="absolute pointer-events-none z-50 transition-all duration-150 animate-fade-in"
            style={{
              left: `${hoveredTileInfo.coords.x}%`,
              top: `${hoveredTileInfo.coords.y}%`,
              transform: `translate(${
                hoveredTileInfo.coords.col <= 2
                  ? '-8%'
                  : hoveredTileInfo.coords.col >= 7
                  ? '-92%'
                  : '-50%'
              }, ${
                hoveredTileInfo.coords.rowFromTop <= 2
                  ? '32px'
                  : '-122%'
              })`,
            }}
          >
            <div
              className="bg-slate-950/95 border-2 rounded-2xl p-2.5 sm:p-3 shadow-2xl backdrop-blur-md text-slate-100 min-w-[190px] max-w-[240px] flex flex-col gap-1.5 ring-1 ring-white/10"
              style={{
                borderColor:
                  hoveredTileInfo.type === 'shark-head' || hoveredTileInfo.type === 'shark-tail'
                    ? '#f43f5e'
                    : hoveredTileInfo.type === 'ladder-bottom' || hoveredTileInfo.type === 'ladder-top'
                    ? '#10b981'
                    : hoveredTileInfo.type === 'finish'
                    ? '#f59e0b'
                    : '#38bdf8',
              }}
            >
              {/* Header */}
              <div className="flex items-center justify-between gap-1.5 border-b border-slate-800 pb-1.5">
                <div className="flex items-center gap-1.5">
                  <span
                    className={`px-1.5 py-0.5 rounded font-mono font-black text-[10px] text-slate-950 shadow-sm ${
                      hoveredTileInfo.type === 'shark-head' || hoveredTileInfo.type === 'shark-tail'
                        ? 'bg-rose-400'
                        : hoveredTileInfo.type === 'ladder-bottom' || hoveredTileInfo.type === 'ladder-top'
                        ? 'bg-emerald-400'
                        : hoveredTileInfo.type === 'finish'
                        ? 'bg-amber-400'
                        : 'bg-sky-400'
                    }`}
                  >
                    #{hoveredTileInfo.tileNum}
                  </span>
                  <span className="text-[10px] uppercase font-black tracking-wider text-slate-300">
                    {hoveredTileInfo.type === 'shark-head'
                      ? 'Shark Hazard'
                      : hoveredTileInfo.type === 'shark-tail'
                      ? 'Shark Drop'
                      : hoveredTileInfo.type === 'ladder-bottom'
                      ? 'Ascent Ladder'
                      : hoveredTileInfo.type === 'ladder-top'
                      ? 'Ladder Top'
                      : hoveredTileInfo.type === 'finish'
                      ? 'Finish Line'
                      : hoveredTileInfo.type === 'start'
                      ? 'Start Tile'
                      : 'Standard Square'}
                  </span>
                </div>
                <span className="text-[9px] font-mono text-slate-400">
                  {hoveredTileInfo.tileNum === 100 ? 'Goal' : `${100 - hoveredTileInfo.tileNum} to 100`}
                </span>
              </div>

              {/* Body */}
              <div className="flex flex-col gap-0.5 text-[11px] leading-snug">
                {hoveredTileInfo.type === 'shark-head' && (
                  <>
                    <div className="flex items-center gap-1 text-rose-400 font-black">
                      <span>{currentTheme.hazardEmoji}</span>
                      <span>{currentTheme.hazardName}</span>
                    </div>
                    <p className="text-slate-300">
                      Chomps down to <strong className="text-rose-300 font-mono">Square #{hoveredTileInfo.targetTile}</strong>
                      <span className="text-rose-400 font-bold ml-1">
                        (-{hoveredTileInfo.tileNum - (hoveredTileInfo.targetTile || 0)} tiles)
                      </span>
                    </p>
                  </>
                )}

                {hoveredTileInfo.type === 'ladder-bottom' && (
                  <>
                    <div className="flex items-center gap-1 text-emerald-400 font-black">
                      <span>{currentTheme.ladderEmoji}</span>
                      <span>{currentTheme.ladderName}</span>
                    </div>
                    <p className="text-slate-300">
                      Climbs up to <strong className="text-emerald-300 font-mono">Square #{hoveredTileInfo.targetTile}</strong>
                      <span className="text-emerald-400 font-bold ml-1">
                        (+{(hoveredTileInfo.targetTile || 0) - hoveredTileInfo.tileNum} tiles!)
                      </span>
                    </p>
                  </>
                )}

                {hoveredTileInfo.type === 'shark-tail' && (
                  <>
                    <div className="text-rose-300 font-bold flex items-center gap-1">
                      <span>🌊 Shark Drop Zone</span>
                    </div>
                    <p className="text-slate-400">
                      Dragged here if chomped by Shark at <strong className="text-rose-300 font-mono">Square #{hoveredTileInfo.targetTile}</strong>
                    </p>
                  </>
                )}

                {hoveredTileInfo.type === 'ladder-top' && (
                  <>
                    <div className="text-emerald-300 font-bold flex items-center gap-1">
                      <span>⭐ Ladder Summit</span>
                    </div>
                    <p className="text-slate-400">
                      Reached from Ladder climb starting at <strong className="text-emerald-300 font-mono">Square #{hoveredTileInfo.targetTile}</strong>
                    </p>
                  </>
                )}

                {hoveredTileInfo.type === 'finish' && (
                  <>
                    <div className="text-amber-300 font-black flex items-center gap-1">
                      <Trophy className="w-3.5 h-3.5 text-amber-400" />
                      <span>VICTORY TILE</span>
                    </div>
                    <p className="text-slate-300">
                      Reach square 100 with exact roll to conquer the match!
                    </p>
                  </>
                )}

                {hoveredTileInfo.type === 'start' && (
                  <>
                    <div className="text-sky-300 font-black flex items-center gap-1">
                      <Flag className="w-3.5 h-3.5 text-sky-400" />
                      <span>BOARD ENTRANCE</span>
                    </div>
                    <p className="text-slate-300">
                      First square on the board after rolling from Start Bench.
                    </p>
                  </>
                )}

                {hoveredTileInfo.type === 'normal' && (
                  <p className="text-slate-400">
                    Safe square • {100 - hoveredTileInfo.tileNum} squares left to conquer.
                  </p>
                )}
              </div>

              {/* Occupants if any */}
              {hoveredTileInfo.occupants.length > 0 && (
                <div className="pt-1 border-t border-slate-800 flex items-center gap-1 flex-wrap text-[10px]">
                  <span className="text-slate-400 font-bold">Here:</span>
                  {hoveredTileInfo.occupants.map((p) => (
                    <span
                      key={p.id}
                      className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-slate-900 border border-slate-700 text-slate-200 font-bold"
                    >
                      <span>{p.avatar}</span>
                      <span className="truncate max-w-[70px]">{p.name}</span>
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Board Ambient Footer / Live Tile Inspector */}
      <div className="w-full mt-2 min-h-7 flex items-center justify-between text-[10px] text-slate-400 px-1 font-medium transition-all">
        {hoveredTileInfo ? (
          <div className="flex items-center justify-between w-full bg-slate-900/90 border border-slate-800 rounded-lg px-2.5 py-1 text-slate-200 animate-fade-in shadow-sm">
            <div className="flex items-center gap-2 truncate">
              <span className="font-mono font-black text-amber-400 bg-slate-950 px-1.5 py-0.5 rounded border border-slate-800 text-[11px] shrink-0">
                Sq #{hoveredTileInfo.tileNum}
              </span>
              <span className="truncate">
                {hoveredTileInfo.type === 'shark-head' && (
                  <span className="text-rose-400 font-bold">
                    {currentTheme.hazardEmoji} {currentTheme.hazardName} chomps down to Square #{hoveredTileInfo.targetTile} (-{hoveredTileInfo.tileNum - (hoveredTileInfo.targetTile || 0)} tiles)
                  </span>
                )}
                {hoveredTileInfo.type === 'ladder-bottom' && (
                  <span className="text-emerald-400 font-bold">
                    {currentTheme.ladderEmoji} {currentTheme.ladderName} climbs up to Square #{hoveredTileInfo.targetTile} (+{(hoveredTileInfo.targetTile || 0) - hoveredTileInfo.tileNum} tiles!)
                  </span>
                )}
                {hoveredTileInfo.type === 'shark-tail' && (
                  <span className="text-rose-300">
                    Drop-zone from Shark at Square #{hoveredTileInfo.targetTile}
                  </span>
                )}
                {hoveredTileInfo.type === 'ladder-top' && (
                  <span className="text-emerald-300">
                    Summit from Ladder at Square #{hoveredTileInfo.targetTile}
                  </span>
                )}
                {hoveredTileInfo.type === 'finish' && (
                  <span className="text-amber-300 font-bold">
                    🏆 Finish Line! Land here with exact roll to win.
                  </span>
                )}
                {hoveredTileInfo.type === 'start' && (
                  <span className="text-sky-300 font-bold">
                    🚩 Start Square: Board entry point.
                  </span>
                )}
                {hoveredTileInfo.type === 'normal' && (
                  <span className="text-slate-300">
                    Standard square • {100 - hoveredTileInfo.tileNum} tiles to Victory
                  </span>
                )}
              </span>
            </div>
            <button
              onClick={() => setHoveredTile(null)}
              className="text-slate-400 hover:text-white text-[10px] font-bold px-1.5 py-0.5 rounded hover:bg-slate-800 cursor-pointer shrink-0 ml-2"
              title="Close inspector"
            >
              ✕
            </button>
          </div>
        ) : (
          <>
            <span className="flex items-center gap-1">
              <span className="font-bold text-slate-300">{currentTheme.icon} {currentTheme.name}</span>
              <span>•</span>
              <span className={currentTheme.ambientTextColor}>{currentTheme.speciesTitle}</span>
            </span>
            <span className="flex items-center gap-1 font-mono text-slate-400">
              <span className="hidden xs:inline">Hover or tap any square to inspect hazards</span>
              <span className="xs:hidden">{currentLayout.icon} {currentLayout.name}</span>
            </span>
          </>
        )}
      </div>
    </div>
  );
};
