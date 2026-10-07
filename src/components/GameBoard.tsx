import React, { useMemo } from 'react';
import { BoardConfig, BoardTheme, Player, SpecialTileType } from '../types/game';
import { computeLadderGeometry, computeSnakeGeometry, getTileCoordinates } from '../utils/geometry';
import { SPECIAL_TILE_DEFS } from '../utils/boardPresets';
import { Trophy, Zap, Snowflake, Sparkles } from 'lucide-react';

interface GameBoardProps {
  boardConfig: BoardConfig;
  players: Player[];
  activePlayerIndex: number;
  steppingPlayerId: string | null;
  steppingTile: number | null;
  theme: BoardTheme;
  highlightedTiles?: number[];
  onTileClick?: (tileNumber: number) => void;
  isEditor?: boolean;
  selectedEditorTile?: number | null;
}

export const GameBoard: React.FC<GameBoardProps> = ({
  boardConfig,
  players,
  activePlayerIndex,
  steppingPlayerId,
  steppingTile,
  theme,
  highlightedTiles = [],
  onTileClick,
  isEditor = false,
  selectedEditorTile = null,
}) => {
  const { size, snakes, ladders, specialTiles } = boardConfig;
  const totalTiles = size * size;

  // Board theme color definitions
  const themeStyles = useMemo(() => {
    switch (theme) {
      case 'neon':
        return {
          boardBg: 'bg-slate-950 border-cyan-500/40 shadow-cyan-900/40',
          tileEven: 'bg-slate-900/90 text-cyan-200 border-cyan-900/50 hover:bg-slate-850',
          tileOdd: 'bg-indigo-950/80 text-cyan-300 border-indigo-900/50 hover:bg-indigo-900/60',
          tileFinish: 'bg-gradient-to-br from-fuchsia-900/80 to-purple-950 text-fuchsia-200 border-fuchsia-500/70',
          tileStart: 'bg-gradient-to-br from-emerald-950 to-teal-950 text-emerald-300 border-emerald-500/60',
          ladderRail: '#06b6d4',
          ladderRung: '#22d3ee',
          ladderGlow: 'drop-shadow(0 0 6px rgba(6,182,212,0.8))',
          snakeBody1: '#ec4899',
          snakeBody2: '#a855f7',
          snakeGlow: 'drop-shadow(0 0 6px rgba(236,72,153,0.8))',
          numberColor: 'text-cyan-400/80',
        };
      case 'jungle':
        return {
          boardBg: 'bg-stone-950 border-emerald-800/40 shadow-emerald-950/50',
          tileEven: 'bg-emerald-950/60 text-emerald-100 border-emerald-900/40 hover:bg-emerald-900/40',
          tileOdd: 'bg-stone-900/80 text-stone-200 border-stone-800 hover:bg-stone-850',
          tileFinish: 'bg-gradient-to-br from-amber-800/80 to-yellow-950 text-amber-200 border-amber-500/70',
          tileStart: 'bg-gradient-to-br from-teal-900 to-stone-900 text-teal-300 border-teal-600/60',
          ladderRail: '#ca8a04',
          ladderRung: '#eab308',
          ladderGlow: 'drop-shadow(0 2px 4px rgba(0,0,0,0.5))',
          snakeBody1: '#15803d',
          snakeBody2: '#166534',
          snakeGlow: 'drop-shadow(0 2px 5px rgba(0,0,0,0.6))',
          numberColor: 'text-emerald-400/70',
        };
      case 'candy':
        return {
          boardBg: 'bg-pink-950/40 border-pink-500/40 shadow-pink-950/40',
          tileEven: 'bg-rose-950/50 text-pink-100 border-pink-900/30 hover:bg-rose-900/40',
          tileOdd: 'bg-indigo-950/50 text-sky-100 border-sky-900/30 hover:bg-indigo-900/40',
          tileFinish: 'bg-gradient-to-br from-pink-600/70 to-rose-700/80 text-white border-pink-400',
          tileStart: 'bg-gradient-to-br from-teal-800/80 to-emerald-900/80 text-teal-200 border-teal-400',
          ladderRail: '#38bdf8',
          ladderRung: '#7dd3fc',
          ladderGlow: 'drop-shadow(0 0 5px rgba(56,189,248,0.7))',
          snakeBody1: '#f43f5e',
          snakeBody2: '#fb7185',
          snakeGlow: 'drop-shadow(0 0 5px rgba(244,63,94,0.7))',
          numberColor: 'text-pink-300/80',
        };
      case 'vintage':
      default:
        return {
          boardBg: 'bg-slate-900 border-amber-700/40 shadow-2xl shadow-slate-950/80',
          tileEven: 'bg-slate-800/80 text-amber-50 border-slate-700/60 hover:bg-slate-750',
          tileOdd: 'bg-slate-900/80 text-amber-100 border-slate-800/60 hover:bg-slate-850',
          tileFinish: 'bg-gradient-to-br from-amber-600 to-yellow-600 text-slate-950 font-black border-amber-400',
          tileStart: 'bg-gradient-to-br from-emerald-700 to-teal-800 text-emerald-100 border-emerald-400',
          ladderRail: '#f59e0b',
          ladderRung: '#fbbf24',
          ladderGlow: 'drop-shadow(0 3px 6px rgba(0,0,0,0.6))',
          snakeBody1: '#ef4444',
          snakeBody2: '#dc2626',
          snakeGlow: 'drop-shadow(0 3px 6px rgba(0,0,0,0.6))',
          numberColor: 'text-amber-200/70',
        };
    }
  }, [theme]);

  // Group players by current rendered tile
  const playersOnTile = useMemo(() => {
    const map = new Map<number, Player[]>();
    players.forEach((p) => {
      // If player is currently animating a step, use steppingTile for that player
      const effectivePos = (p.id === steppingPlayerId && steppingTile !== null) ? steppingTile : p.position;
      if (effectivePos > 0) {
        if (!map.has(effectivePos)) map.set(effectivePos, []);
        map.get(effectivePos)!.push(p);
      }
    });
    return map;
  }, [players, steppingPlayerId, steppingTile]);

  // Compute SVG Ladders
  const ladderGeometries = useMemo(() => {
    return ladders.map((l) => ({
      ...l,
      geom: computeLadderGeometry(l.bottom, l.top, size, 1000),
    }));
  }, [ladders, size]);

  // Compute SVG Snakes
  const snakeGeometries = useMemo(() => {
    return snakes.map((s) => ({
      ...s,
      geom: computeSnakeGeometry(s.head, s.tail, size, 1000),
    }));
  }, [snakes, size]);

  // Build grid of cells from 1 to totalTiles
  const gridCells = useMemo(() => {
    const cells = [];
    for (let r = 0; r < size; r++) {
      for (let c = 0; c < size; c++) {
        // Row 0 is top row
        const rowFromBottom = (size - 1) - r;
        const colInRow = (rowFromBottom % 2 === 0) ? c : (size - 1 - c);
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
    <div className="relative w-full max-w-[620px] aspect-square select-none mx-auto">
      {/* Outer Game Board Frame */}
      <div
        className={`relative w-full h-full rounded-2xl overflow-hidden border-4 ${themeStyles.boardBg} p-2 shadow-2xl transition-all duration-300`}
      >
        {/* HTML Grid Layer for Cells & Background */}
        <div
          className="grid w-full h-full gap-0.5 rounded-xl overflow-hidden relative"
          style={{
            gridTemplateColumns: `repeat(${size}, minmax(0, 1fr))`,
            gridTemplateRows: `repeat(${size}, minmax(0, 1fr))`,
          }}
        >
          {gridCells.map(({ tileNum }) => {
            const isFinish = tileNum === totalTiles;
            const isStart = tileNum === 1;
            const isEven = (Math.floor((tileNum - 1) / size) + (tileNum % size)) % 2 === 0;
            const isHighlighted = highlightedTiles.includes(tileNum);
            const isSelected = selectedEditorTile === tileNum;
            const specialType = specialTiles[tileNum] as SpecialTileType | undefined;
            const specialDef = specialType ? SPECIAL_TILE_DEFS[specialType] : null;

            let cellBg = isEven ? themeStyles.tileEven : themeStyles.tileOdd;
            if (isFinish) cellBg = themeStyles.tileFinish;
            if (isStart) cellBg = themeStyles.tileStart;
            if (isSelected) cellBg = 'bg-amber-500/50 ring-2 ring-amber-400 text-white';

            const tileSnakesHead = snakes.find((s) => s.head === tileNum);
            const tileSnakesTail = snakes.find((s) => s.tail === tileNum);
            const tileLaddersBottom = ladders.find((l) => l.bottom === tileNum);
            const tileLaddersTop = ladders.find((l) => l.top === tileNum);

            return (
              <div
                key={tileNum}
                onClick={() => onTileClick && onTileClick(tileNum)}
                className={`relative flex flex-col justify-between p-1 rounded-sm border transition-colors cursor-pointer group ${cellBg} ${
                  isHighlighted ? 'ring-2 ring-yellow-400 bg-yellow-400/20' : ''
                }`}
              >
                {/* Tile Number Header */}
                <div className="flex items-center justify-between w-full leading-none">
                  <span
                    className={`text-[10px] sm:text-xs font-black tracking-tight ${
                      isFinish || isStart ? 'text-white' : themeStyles.numberColor
                    }`}
                  >
                    {tileNum}
                  </span>

                  {/* Tile Icons / Indicators */}
                  {isFinish && (
                    <Trophy className="w-3.5 h-3.5 text-amber-300 drop-shadow animate-bounce" />
                  )}
                  {isStart && (
                    <span className="text-[9px] font-bold uppercase tracking-wider text-emerald-200">
                      START
                    </span>
                  )}
                  {specialDef && (
                    <span
                      className="text-xs transform group-hover:scale-125 transition-transform"
                      title={`${specialDef.title}: ${specialDef.description}`}
                    >
                      {specialDef.icon}
                    </span>
                  )}
                </div>

                {/* Sub-label badges for snake / ladder endpoints */}
                <div className="flex items-center justify-end gap-0.5 text-[8px] opacity-80">
                  {tileSnakesHead && (
                    <span className="text-rose-400 font-bold" title={`Snake slides down to ${tileSnakesHead.tail}`}>
                      🐍➔{tileSnakesHead.tail}
                    </span>
                  )}
                  {tileLaddersBottom && (
                    <span className="text-emerald-400 font-bold" title={`Ladder climbs up to ${tileLaddersBottom.top}`}>
                      🪜➔{tileLaddersBottom.top}
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Dynamic SVG Layer for Snakes and Ladders Overlays */}
        <svg
          viewBox="0 0 1000 1000"
          className="absolute inset-0 w-full h-full pointer-events-none p-2"
          style={{ overflow: 'visible' }}
        >
          <defs>
            {/* Ladder Gradients */}
            <linearGradient id="ladderRailGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#fde047" />
              <stop offset="50%" stopColor="#ca8a04" />
              <stop offset="100%" stopColor="#854d0e" />
            </linearGradient>

            <linearGradient id="ladderRungGrad" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#fef08a" />
              <stop offset="100%" stopColor="#b45309" />
            </linearGradient>

            {/* Snake Gradients */}
            <linearGradient id="snakeGrad1" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#f43f5e" />
              <stop offset="50%" stopColor="#e11d48" />
              <stop offset="100%" stopColor="#881337" />
            </linearGradient>

            <linearGradient id="snakeGrad2" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#10b981" />
              <stop offset="50%" stopColor="#059669" />
              <stop offset="100%" stopColor="#064e3b" />
            </linearGradient>

            <linearGradient id="snakeGrad3" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#a855f7" />
              <stop offset="50%" stopColor="#7e22ce" />
              <stop offset="100%" stopColor="#3b0764" />
            </linearGradient>

            {/* Snake Pattern / Scales */}
            <pattern id="snakeScales" width="12" height="12" patternUnits="userSpaceOnUse">
              <path d="M 0 6 Q 6 0 12 6 Q 6 12 0 6" fill="none" stroke="rgba(255,255,255,0.22)" strokeWidth="1.2" />
            </pattern>

            {/* Filter for glowing drop shadow */}
            <filter id="shadow3D" x="-20%" y="-20%" width="140%" height="140%">
              <feDropShadow dx="3" dy="6" stdDeviation="4" floodColor="#000000" floodOpacity="0.6" />
            </filter>
          </defs>

          {/* Render Ladders */}
          <g className="ladders-group">
            {ladderGeometries.map((l) => (
              <g key={l.id} filter="url(#shadow3D)">
                {/* Left Rail */}
                <line
                  x1={l.geom.rail1Start.x}
                  y1={l.geom.rail1Start.y}
                  x2={l.geom.rail1End.x}
                  y2={l.geom.rail1End.y}
                  stroke={themeStyles.ladderRail}
                  strokeWidth="7"
                  strokeLinecap="round"
                />
                <line
                  x1={l.geom.rail1Start.x}
                  y1={l.geom.rail1Start.y}
                  x2={l.geom.rail1End.x}
                  y2={l.geom.rail1End.y}
                  stroke="rgba(255,255,255,0.4)"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                />

                {/* Right Rail */}
                <line
                  x1={l.geom.rail2Start.x}
                  y1={l.geom.rail2Start.y}
                  x2={l.geom.rail2End.x}
                  y2={l.geom.rail2End.y}
                  stroke={themeStyles.ladderRail}
                  strokeWidth="7"
                  strokeLinecap="round"
                />
                <line
                  x1={l.geom.rail2Start.x}
                  y1={l.geom.rail2Start.y}
                  x2={l.geom.rail2End.x}
                  y2={l.geom.rail2End.y}
                  stroke="rgba(255,255,255,0.4)"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                />

                {/* Rungs */}
                {l.geom.rungs.map((rung, idx) => (
                  <g key={idx}>
                    <line
                      x1={rung.start.x}
                      y1={rung.start.y}
                      x2={rung.end.x}
                      y2={rung.end.y}
                      stroke={themeStyles.ladderRung}
                      strokeWidth="5"
                      strokeLinecap="round"
                    />
                    <line
                      x1={rung.start.x}
                      y1={rung.start.y}
                      x2={rung.end.x}
                      y2={rung.end.y}
                      stroke="rgba(255,255,255,0.5)"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                    />
                  </g>
                ))}
              </g>
            ))}
          </g>

          {/* Render Snakes */}
          <g className="snakes-group">
            {snakeGeometries.map((s, index) => {
              const gradId = index % 3 === 0 ? 'url(#snakeGrad1)' : index % 3 === 1 ? 'url(#snakeGrad2)' : 'url(#snakeGrad3)';

              return (
                <g key={s.id} filter="url(#shadow3D)">
                  {/* Snake Body Outer Glow / Shadow */}
                  <path
                    d={s.geom.pathD}
                    fill="none"
                    stroke={theme === 'neon' ? themeStyles.snakeBody1 : 'rgba(0,0,0,0.4)'}
                    strokeWidth="24"
                    strokeLinecap="round"
                    opacity={theme === 'neon' ? '0.3' : '0.5'}
                  />

                  {/* Snake Main Body */}
                  <path
                    d={s.geom.pathD}
                    fill="none"
                    stroke={gradId}
                    strokeWidth="18"
                    strokeLinecap="round"
                  />

                  {/* Snake Scale Pattern Overlay */}
                  <path
                    d={s.geom.pathD}
                    fill="none"
                    stroke="url(#snakeScales)"
                    strokeWidth="14"
                    strokeLinecap="round"
                  />

                  {/* Snake Head */}
                  <g
                    transform={`translate(${s.geom.head.x}, ${s.geom.head.y}) rotate(${s.geom.headAngleDeg - 90})`}
                  >
                    {/* Forked Tongue */}
                    <path
                      d="M 0 -12 L 0 -22 M 0 -22 L -4 -28 M 0 -22 L 4 -28"
                      stroke="#ef4444"
                      strokeWidth="2"
                      strokeLinecap="round"
                      fill="none"
                    />
                    {/* Head Oval */}
                    <ellipse
                      cx="0"
                      cy="0"
                      rx="14"
                      ry="18"
                      fill={gradId}
                      stroke="#0f172a"
                      strokeWidth="1.5"
                    />
                    {/* Eyes */}
                    <circle cx="-6" cy="-4" r="3.5" fill="#facc15" />
                    <circle cx="6" cy="-4" r="3.5" fill="#facc15" />
                    <ellipse cx="-6" cy="-4" rx="1.2" ry="3" fill="#000" />
                    <ellipse cx="6" cy="-4" rx="1.2" ry="3" fill="#000" />
                    {/* Nostrils */}
                    <circle cx="-2.5" cy="-11" r="0.8" fill="#450a0a" />
                    <circle cx="2.5" cy="-11" r="0.8" fill="#450a0a" />
                  </g>

                  {/* Snake Tail (tapering rattle) */}
                  <g
                    transform={`translate(${s.geom.tail.x}, ${s.geom.tail.y}) rotate(${s.geom.tailAngleDeg})`}
                  >
                    <circle cx="0" cy="0" r="4.5" fill="#f59e0b" stroke="#78350f" strokeWidth="1" />
                    <circle cx="5" cy="0" r="3.5" fill="#fbbf24" stroke="#78350f" strokeWidth="1" />
                    <circle cx="9" cy="0" r="2.5" fill="#fef08a" stroke="#78350f" strokeWidth="1" />
                  </g>
                </g>
              );
            })}
          </g>
        </svg>

        {/* Render Animated Player Pawns / Tokens */}
        <div className="absolute inset-0 pointer-events-none p-2">
          {Array.from(playersOnTile.entries()).map(([tileNum, tilePlayers]) => {
            const coords = getTileCoordinates(tileNum, size, 100); // in percent 0..100

            return (
              <div
                key={tileNum}
                className="absolute flex items-center justify-center transition-all duration-300 transform -translate-x-1/2 -translate-y-1/2"
                style={{
                  left: `${coords.x}%`,
                  top: `${coords.y}%`,
                  zIndex: 25,
                }}
              >
                <div className="flex items-center justify-center -space-x-2">
                  {tilePlayers.map((p, idx) => {
                    const isActive = players[activePlayerIndex]?.id === p.id;
                    const isStepping = steppingPlayerId === p.id;

                    return (
                      <div
                        key={p.id}
                        className={`relative group flex items-center justify-center w-8 h-8 sm:w-9 sm:h-9 rounded-full shadow-lg border-2 border-white/90 text-sm font-black transition-transform duration-200 ${
                          p.bgGradient
                        } ${isActive ? 'token-active-pulse ring-4 ring-amber-400 z-30' : 'z-20'} ${
                          isStepping ? 'scale-125 -translate-y-2 ring-4 ring-white' : ''
                        }`}
                        style={{
                          transform: `translate(${idx * 4}px, ${idx * -4}px) ${
                            isStepping ? 'scale(1.25)' : ''
                          }`,
                        }}
                        title={`${p.name} (Tile ${tileNum})`}
                      >
                        <span className="text-base select-none filter drop-shadow">
                          {p.avatar}
                        </span>

                        {p.isFrozen && (
                          <div className="absolute -top-1 -right-1 bg-cyan-500 rounded-full p-0.5 border border-white text-[8px] animate-pulse">
                            ❄️
                          </div>
                        )}

                        {/* Name Tooltip on hover */}
                        <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-1 hidden group-hover:flex items-center gap-1 bg-slate-900/95 text-white text-[10px] font-semibold px-2 py-0.5 rounded shadow-xl whitespace-nowrap z-50 pointer-events-none border border-slate-700">
                          <span>{p.avatar}</span>
                          <span>{p.name}</span>
                          <span className="text-slate-400 font-mono">[{tileNum}]</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
