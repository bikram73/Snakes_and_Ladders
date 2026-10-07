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

  // Group players by current rendered tile (1..100)
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

  // Players at start bench (Position 0)
  const playersAtStart = useMemo(() => {
    return players.filter((p) => {
      const effectivePos = (p.id === steppingPlayerId && steppingTile !== null) ? steppingTile : p.position;
      return effectivePos === 0;
    });
  }, [players, steppingPlayerId, steppingTile]);

  // Build grid of cells from 1 to 100 (bottom-to-top serpentine order)
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
    <div className="flex flex-col items-center w-full max-w-[560px] mx-auto select-none">
      {/* Position 0 Bench (Starting Zone outside board) */}
      <div className="w-full mb-2.5 bg-slate-900/90 border border-slate-800 rounded-xl px-3 sm:px-4 py-2 flex flex-wrap items-center justify-between gap-2 shadow-md">
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
      <div className="relative w-full aspect-square rounded-2xl sm:rounded-3xl overflow-hidden border-2 sm:border-4 border-slate-700/80 bg-slate-900 p-1.5 sm:p-2.5 shadow-2xl">
        {/* 10x10 Grid */}
        <div
          className="grid w-full h-full gap-0.5 sm:gap-1 rounded-lg sm:rounded-xl overflow-hidden relative"
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
            const isLadderBottom = PRD_LADDERS_LIST.find((l) => l.bottom === tileNum);

            let cellBg = isEven ? 'bg-slate-800/85 text-amber-50 border-slate-700/60' : 'bg-slate-850 text-amber-100 border-slate-800/70';
            if (isFinish) cellBg = 'bg-gradient-to-br from-amber-500 via-amber-400 to-yellow-500 text-slate-950 font-black border-amber-300 shadow-inner';
            if (isStart) cellBg = 'bg-gradient-to-br from-emerald-700 to-teal-800 text-white font-bold border-emerald-400';

            return (
              <div
                key={tileNum}
                className={`relative flex flex-col justify-between p-0.5 sm:p-1 rounded-[3px] sm:rounded-sm border transition-colors ${cellBg}`}
              >
                {/* Tile Number Header */}
                <div className="flex items-center justify-between w-full leading-none">
                  <span
                    className={`text-[8px] xs:text-[9px] sm:text-xs font-black tracking-tight ${
                      isFinish ? 'text-slate-950 font-black' : isStart ? 'text-emerald-100 font-bold' : 'text-slate-300'
                    }`}
                  >
                    {tileNum}
                  </span>

                  {isFinish && (
                    <Trophy className="w-2.5 h-2.5 sm:w-3.5 sm:h-3.5 text-slate-950 drop-shadow animate-bounce" />
                  )}
                  {isStart && (
                    <span className="text-[6px] sm:text-[8px] font-black uppercase text-emerald-200">
                      START
                    </span>
                  )}
                </div>

                {/* Snake / Ladder Badge Indicators */}
                <div className="flex items-center justify-end gap-0.5 text-[6px] sm:text-[8px] opacity-90 leading-none">
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
          className="absolute inset-0 w-full h-full pointer-events-none p-1.5 sm:p-2.5"
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

            <linearGradient id="ladderRailGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#fef08a" />
              <stop offset="50%" stopColor="#eab308" />
              <stop offset="100%" stopColor="#a16207" />
            </linearGradient>
          </defs>

          {/* 🪜 Ladders Group */}
          <g filter="url(#shadow3D)">
            {ladderGeometries.map((l) => (
              <g key={l.id} className="opacity-95 hover:opacity-100 transition-opacity">
                {/* Rail 1 (Left side) */}
                <line
                  x1={l.geom.rail1Start.x}
                  y1={l.geom.rail1Start.y}
                  x2={l.geom.rail1End.x}
                  y2={l.geom.rail1End.y}
                  stroke="url(#ladderRailGrad)"
                  strokeWidth="8"
                  strokeLinecap="round"
                />
                {/* Rail 2 (Right side) */}
                <line
                  x1={l.geom.rail2Start.x}
                  y1={l.geom.rail2Start.y}
                  x2={l.geom.rail2End.x}
                  y2={l.geom.rail2End.y}
                  stroke="url(#ladderRailGrad)"
                  strokeWidth="8"
                  strokeLinecap="round"
                />
                {/* Ladder Rungs */}
                {l.geom.rungs.map((rung, idx) => (
                  <line
                    key={idx}
                    x1={rung.start.x}
                    y1={rung.start.y}
                    x2={rung.end.x}
                    y2={rung.end.y}
                    stroke="#fef9c3"
                    strokeWidth="5"
                    strokeLinecap="round"
                  />
                ))}
              </g>
            ))}
          </g>

          {/* 🐍 Snakes Group */}
          <g filter="url(#shadow3D)">
            {snakeGeometries.map((s, idx) => {
              const grad = idx % 2 === 0 ? 'url(#snakeGrad1)' : 'url(#snakeGrad2)';
              return (
                <g key={s.id} className="opacity-95 hover:opacity-100 transition-opacity">
                  {/* Snake Body */}
                  <path
                    d={s.geom.pathD}
                    fill="none"
                    stroke={grad}
                    strokeWidth="18"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  {/* Snake Head */}
                  <circle
                    cx={s.geom.head.x}
                    cy={s.geom.head.y}
                    r="13"
                    fill={idx % 2 === 0 ? '#b91c1c' : '#c2410c'}
                    stroke="#fef08a"
                    strokeWidth="2"
                  />
                  {/* Snake Eyes */}
                  <circle cx={s.geom.head.x - 3} cy={s.geom.head.y - 3} r="2.5" fill="#fef08a" />
                  <circle cx={s.geom.head.x + 3} cy={s.geom.head.y - 3} r="2.5" fill="#fef08a" />
                  <circle cx={s.geom.head.x - 3} cy={s.geom.head.y - 3} r="1" fill="#000" />
                  <circle cx={s.geom.head.x + 3} cy={s.geom.head.y - 3} r="1" fill="#000" />
                  {/* Snake Tail Accent */}
                  <circle cx={s.geom.tail.x} cy={s.geom.tail.y} r="4" fill="#fbbf24" />
                </g>
              );
            })}
          </g>
        </svg>

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
                          isTurn ? 'ring-2 sm:ring-4 ring-amber-400 scale-110 sm:scale-125 z-40 token-active-pulse' : 'z-30'
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
    </div>
  );
};
