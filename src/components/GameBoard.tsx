import React, { useMemo } from 'react';
import { Player } from '../types/game';
import { PRD_SNAKES_LIST, PRD_LADDERS_LIST } from '../utils/boardPresets';
import { computeLadderGeometry, computeSnakeGeometry, getTileCoordinates } from '../utils/geometry';
import { Trophy, Flag } from 'lucide-react';

interface GameBoardProps {
  players: Player[];
  currentPlayerId: number;
  steppingPlayerId: number | null;
  steppingTile: number | null;
}

export const GameBoard: React.FC<GameBoardProps> = ({
  players,
  currentPlayerId,
  steppingPlayerId,
  steppingTile,
}) => {
  const size = 10;
  const totalTiles = 100;

  // Compute SVG Ladders
  const ladderGeometries = useMemo(() => {
    return PRD_LADDERS_LIST.map((l) => ({
      ...l,
      geom: computeLadderGeometry(l.bottom, l.top, size, 1000),
    }));
  }, [size]);

  // Compute SVG Snakes
  const snakeGeometries = useMemo(() => {
    return PRD_SNAKES_LIST.map((s) => ({
      ...s,
      geom: computeSnakeGeometry(s.head, s.tail, size, 1000),
    }));
  }, [size]);

  // Group players by current rendered tile (1..100) or 0 (start bench)
  const playersOnBoard = useMemo(() => {
    const map = new Map<number, Player[]>();
    players.forEach((p) => {
      const effectivePos = (p.id === steppingPlayerId && steppingTile !== null) ? steppingTile : p.position;
      if (effectivePos >= 1 && effectivePos <= 100) {
        if (!map.has(effectivePos)) map.set(effectivePos, []);
        map.get(effectivePos)!.push(p);
      }
    });
    return map;
  }, [players, steppingPlayerId, steppingTile]);

  // Players at start (Position 0)
  const playersAtStart = useMemo(() => {
    return players.filter((p) => {
      const effectivePos = (p.id === steppingPlayerId && steppingTile !== null) ? steppingTile : p.position;
      return effectivePos === 0;
    });
  }, [players, steppingPlayerId, steppingTile]);

  // Build grid of cells from 1 to 100
  const gridCells = useMemo(() => {
    const cells = [];
    for (let r = 0; r < size; r++) {
      for (let c = 0; c < size; c++) {
        // Row 0 is top row (contains 100 down to 91)
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
    <div className="flex flex-col items-center w-full max-w-[620px] mx-auto select-none">
      {/* Position 0 Bench (Starting Zone outside board) */}
      <div className="w-full mb-2 bg-slate-900/90 border border-slate-800 rounded-xl px-4 py-2 flex items-center justify-between shadow-md">
        <div className="flex items-center gap-2">
          <Flag className="w-4 h-4 text-emerald-400" />
          <span className="text-xs font-bold uppercase tracking-wider text-slate-300">
            Start Bench (Square 0):
          </span>
        </div>
        <div className="flex items-center gap-2">
          {playersAtStart.length === 0 ? (
            <span className="text-xs text-slate-500 italic">All players have entered the board</span>
          ) : (
            playersAtStart.map((p) => {
              const isTurn = p.id === currentPlayerId;
              return (
                <div
                  key={p.id}
                  className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-xs font-bold transition-transform ${
                    isTurn
                      ? 'bg-amber-500/20 border-amber-400 text-amber-200 ring-2 ring-amber-400/50 scale-105'
                      : 'bg-slate-800 border-slate-700 text-slate-300'
                  }`}
                  title={`${p.name} at Position 0`}
                >
                  <span className="text-sm">{p.avatar}</span>
                  <span>{p.name}</span>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Main 10x10 Board */}
      <div className="relative w-full aspect-square rounded-2xl overflow-hidden border-4 border-slate-700/80 bg-slate-900 p-2 shadow-2xl">
        {/* 10x10 Grid */}
        <div
          className="grid w-full h-full gap-0.5 rounded-xl overflow-hidden relative"
          style={{
            gridTemplateColumns: 'repeat(10, minmax(0, 1fr))',
            gridTemplateRows: 'repeat(10, minmax(0, 1fr))',
          }}
        >
          {gridCells.map(({ tileNum }) => {
            const isFinish = tileNum === 100;
            const isStart = tileNum === 1;
            const isEven = (Math.floor((tileNum - 1) / 10) + (tileNum % 10)) % 2 === 0;

            const isSnakeHead = PRD_SNAKES_LIST.find((s) => s.head === tileNum);
            const isSnakeTail = PRD_SNAKES_LIST.find((s) => s.tail === tileNum);
            const isLadderBottom = PRD_LADDERS_LIST.find((l) => l.bottom === tileNum);
            const isLadderTop = PRD_LADDERS_LIST.find((l) => l.top === tileNum);

            let cellBg = isEven ? 'bg-slate-800/80 text-amber-50 border-slate-700/60' : 'bg-slate-850 text-amber-100 border-slate-800/70';
            if (isFinish) cellBg = 'bg-gradient-to-br from-amber-500 to-yellow-600 text-slate-950 font-black border-amber-300 shadow-inner';
            if (isStart) cellBg = 'bg-gradient-to-br from-emerald-700 to-teal-800 text-white font-bold border-emerald-400';

            return (
              <div
                key={tileNum}
                className={`relative flex flex-col justify-between p-1 rounded-sm border transition-colors ${cellBg}`}
              >
                {/* Tile Number Header */}
                <div className="flex items-center justify-between w-full leading-none">
                  <span
                    className={`text-[9px] sm:text-xs font-black tracking-tight ${
                      isFinish ? 'text-slate-950 text-xs sm:text-sm font-black' : isStart ? 'text-emerald-100 font-bold' : 'text-slate-300'
                    }`}
                  >
                    {tileNum}
                  </span>

                  {isFinish && (
                    <Trophy className="w-3.5 h-3.5 text-slate-950 drop-shadow animate-bounce" />
                  )}
                  {isStart && (
                    <span className="text-[8px] font-black uppercase text-emerald-200">
                      START
                    </span>
                  )}
                </div>

                {/* Snake / Ladder Badge Indicators */}
                <div className="flex items-center justify-end gap-0.5 text-[8px] opacity-90 leading-none">
                  {isSnakeHead && (
                    <span className="text-rose-400 font-black" title={`Snake slides down to ${isSnakeHead.tail}`}>
                      🐍➔{isSnakeHead.tail}
                    </span>
                  )}
                  {isLadderBottom && (
                    <span className="text-emerald-400 font-black" title={`Ladder climbs up to ${isLadderBottom.top}`}>
                      🪜➔{isLadderBottom.top}
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* SVG Layer for Snakes and Ladders */}
        <svg
          viewBox="0 0 1000 1000"
          className="absolute inset-0 w-full h-full pointer-events-none p-2"
          style={{ overflow: 'visible' }}
        >
          <defs>
            <filter id="shadow3D" x="-20%" y="-20%" width="140%" height="140%">
              <feDropShadow dx="2" dy="5" stdDeviation="4" floodColor="#000000" floodOpacity="0.6" />
            </filter>

            {/* Snake Gradients */}
            <linearGradient id="snakeGrad1" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#ef4444" />
              <stop offset="50%" stopColor="#dc2626" />
              <stop offset="100%" stopColor="#7f1d1d" />
            </linearGradient>

            <linearGradient id="snakeGrad2" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#f97316" />
              <stop offset="50%" stopColor="#ea580c" />
              <stop offset="100%" stopColor="#9a3412" />
            </linearGradient>

            <pattern id="snakeScales" width="12" height="12" patternUnits="userSpaceOnUse">
              <path d="M 0 6 Q 6 0 12 6 Q 6 12 0 6" fill="none" stroke="rgba(255,255,255,0.25)" strokeWidth="1.2" />
            </pattern>
          </defs>

          {/* Render Ladders */}
          <g className="ladders-group" filter="url(#shadow3D)">
            {ladderGeometries.map((l) => (
              <g key={l.id}>
                {/* Left Rail */}
                <line
                  x1={l.geom.rail1Start.x}
                  y1={l.geom.rail1Start.y}
                  x2={l.geom.rail1End.x}
                  y2={l.geom.rail1End.y}
                  stroke="#eab308"
                  strokeWidth="7"
                  strokeLinecap="round"
                />
                <line
                  x1={l.geom.rail1Start.x}
                  y1={l.geom.rail1Start.y}
                  x2={l.geom.rail1End.x}
                  y2={l.geom.rail1End.y}
                  stroke="#fef08a"
                  strokeWidth="2"
                  strokeLinecap="round"
                />

                {/* Right Rail */}
                <line
                  x1={l.geom.rail2Start.x}
                  y1={l.geom.rail2Start.y}
                  x2={l.geom.rail2End.x}
                  y2={l.geom.rail2End.y}
                  stroke="#eab308"
                  strokeWidth="7"
                  strokeLinecap="round"
                />
                <line
                  x1={l.geom.rail2Start.x}
                  y1={l.geom.rail2Start.y}
                  x2={l.geom.rail2End.x}
                  y2={l.geom.rail2End.y}
                  stroke="#fef08a"
                  strokeWidth="2"
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
                      stroke="#ca8a04"
                      strokeWidth="5"
                      strokeLinecap="round"
                    />
                    <line
                      x1={rung.start.x}
                      y1={rung.start.y}
                      x2={rung.end.x}
                      y2={rung.end.y}
                      stroke="#fef9c3"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                    />
                  </g>
                ))}
              </g>
            ))}
          </g>

          {/* Render Snakes */}
          <g className="snakes-group" filter="url(#shadow3D)">
            {snakeGeometries.map((s, index) => {
              const gradId = index % 2 === 0 ? 'url(#snakeGrad1)' : 'url(#snakeGrad2)';
              return (
                <g key={s.id}>
                  {/* Shadow Outline */}
                  <path
                    d={s.geom.pathD}
                    fill="none"
                    stroke="rgba(0,0,0,0.5)"
                    strokeWidth="24"
                    strokeLinecap="round"
                  />

                  {/* Body */}
                  <path
                    d={s.geom.pathD}
                    fill="none"
                    stroke={gradId}
                    strokeWidth="18"
                    strokeLinecap="round"
                  />

                  {/* Scale Pattern */}
                  <path
                    d={s.geom.pathD}
                    fill="none"
                    stroke="url(#snakeScales)"
                    strokeWidth="14"
                    strokeLinecap="round"
                  />

                  {/* Head */}
                  <g
                    transform={`translate(${s.geom.head.x}, ${s.geom.head.y}) rotate(${s.geom.headAngleDeg - 90})`}
                  >
                    {/* Forked Tongue */}
                    <path
                      d="M 0 -10 L 0 -20 M 0 -20 L -3 -25 M 0 -20 L 3 -25"
                      stroke="#ef4444"
                      strokeWidth="2"
                      strokeLinecap="round"
                      fill="none"
                    />
                    <ellipse
                      cx="0"
                      cy="0"
                      rx="14"
                      ry="17"
                      fill={gradId}
                      stroke="#450a0a"
                      strokeWidth="1.5"
                    />
                    {/* Yellow Eyes with Slit Pupil */}
                    <circle cx="-5" cy="-3" r="3" fill="#facc15" />
                    <circle cx="5" cy="-3" r="3" fill="#facc15" />
                    <ellipse cx="-5" cy="-3" rx="1" ry="2.5" fill="#000" />
                    <ellipse cx="5" cy="-3" rx="1" ry="2.5" fill="#000" />
                  </g>

                  {/* Tail */}
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

        {/* Clustered Non-Overlapping Player Tokens Layer */}
        <div className="absolute inset-0 pointer-events-none p-2">
          {Array.from(playersOnBoard.entries()).map(([tileNum, tilePlayers]) => {
            const coords = getTileCoordinates(tileNum, 10, 100);

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
                <div className="flex items-center justify-center flex-wrap max-w-[40px] -space-x-1.5 -space-y-1.5">
                  {tilePlayers.map((p, idx) => {
                    const isTurn = p.id === currentPlayerId;
                    const isStepping = steppingPlayerId === p.id;

                    const tokenBg =
                      p.color === 'red'
                        ? 'bg-gradient-to-br from-rose-500 to-red-700 ring-rose-400'
                        : p.color === 'blue'
                        ? 'bg-gradient-to-br from-cyan-500 to-blue-700 ring-blue-400'
                        : p.color === 'green'
                        ? 'bg-gradient-to-br from-emerald-500 to-teal-700 ring-emerald-400'
                        : 'bg-gradient-to-br from-amber-400 to-yellow-600 ring-yellow-400';

                    return (
                      <div
                        key={p.id}
                        className={`relative group flex items-center justify-center w-7 h-7 sm:w-8 sm:h-8 rounded-full shadow-lg border-2 border-white text-xs font-black transition-transform duration-200 ${tokenBg} ${
                          isTurn ? 'token-active-pulse ring-4 z-30' : 'z-20'
                        } ${isStepping ? 'scale-125 -translate-y-2 ring-4 ring-white' : ''}`}
                        style={{
                          transform: `translate(${idx * 3}px, ${idx * -3}px) ${
                            isStepping ? 'scale(1.25)' : ''
                          }`,
                        }}
                        title={`${p.name} (Tile ${tileNum})`}
                      >
                        <span className="text-sm select-none filter drop-shadow">
                          {p.avatar}
                        </span>

                        {/* Name Tooltip */}
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
