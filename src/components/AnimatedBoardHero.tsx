import React, { useState, useEffect } from 'react';
import { SharkThemeId, SharkLayoutPresetId } from '../types/game';
import { SHARK_THEMES, SHARK_THEMES_LIST } from '../utils/sharkThemes';
import { getSharkLayoutPreset } from '../utils/boardPresets';
import { SharkSvgLayer } from './SharkSvgLayer';
import { getTileCoordinates } from '../utils/geometry';
import { Play, Pause, Palette } from 'lucide-react';

interface SimPawn {
  id: number;
  name: string;
  avatar: string;
  color: string;
  bg: string;
  ring: string;
  position: number;
}

const INITIAL_PAWNS: SimPawn[] = [
  { id: 0, name: 'Hero', avatar: '🦁', color: 'red', bg: 'bg-rose-500', ring: 'ring-rose-400', position: 24 },
  { id: 1, name: 'Nova', avatar: '🤖', color: 'blue', bg: 'bg-cyan-500', ring: 'ring-cyan-400', position: 42 },
  { id: 2, name: 'Blaze', avatar: '🔥', color: 'green', bg: 'bg-emerald-500', ring: 'ring-emerald-400', position: 70 },
  { id: 3, name: 'Echo', avatar: '⚡', color: 'yellow', bg: 'bg-amber-400', ring: 'ring-amber-300', position: 12 },
];

interface AnimatedBoardHeroProps {
  initialThemeId?: SharkThemeId;
  initialLayoutId?: SharkLayoutPresetId;
  onThemeSelect?: (id: SharkThemeId) => void;
}

export const AnimatedBoardHero: React.FC<AnimatedBoardHeroProps> = ({
  initialThemeId = 'great-white',
  initialLayoutId = 'reef-patrol',
  onThemeSelect,
}) => {
  const [selectedThemeId, setSelectedThemeId] = useState<SharkThemeId>(initialThemeId);
  const [selectedLayoutId, setSelectedLayoutId] = useState<SharkLayoutPresetId>(initialLayoutId);

  const currentTheme = SHARK_THEMES[selectedThemeId] || SHARK_THEMES['great-white'];
  const currentLayout = getSharkLayoutPreset(selectedLayoutId);

  const [pawns, setPawns] = useState<SimPawn[]>(INITIAL_PAWNS);
  const [activeTurnIdx, setActiveTurnIdx] = useState<number>(0);
  const [diceVal, setDiceVal] = useState<number>(4);
  const [isRolling, setIsRolling] = useState<boolean>(false);
  const [isPaused, setIsPaused] = useState<boolean>(false);
  const [activeBanner, setActiveBanner] = useState<{ text: string; type: 'ladder' | 'snake' | 'roll' | 'win' }>({
    text: '🦈 Ocean match in progress: Watch live shark dives and diver climbs!',
    type: 'roll',
  });
  const [steppingPawnId, setSteppingPawnId] = useState<number | null>(null);
  const [steppingPos, setSteppingPos] = useState<number | null>(null);

  const size = 10;

  // Turn simulation loop
  useEffect(() => {
    if (isPaused) return;

    const timer = setInterval(async () => {
      const curr = pawns[activeTurnIdx];
      if (!curr) return;

      setIsRolling(true);
      const roll = Math.floor(Math.random() * 6) + 1;
      setDiceVal(roll);

      await new Promise((r) => setTimeout(r, 600));
      setIsRolling(false);

      const oldPos = curr.position;
      let targetPos = oldPos + roll;
      if (targetPos > 100) targetPos = 100 - (targetPos - 100);

      setSteppingPawnId(curr.id);

      // Animate steps
      let step = oldPos;
      while (step < targetPos) {
        step++;
        setSteppingPos(step);
        await new Promise((r) => setTimeout(r, 90));
      }

      let finalPos = targetPos;
      let bannerText = `${curr.avatar} ${curr.name} rolled ${roll} ➔ Square ${targetPos}`;
      let bannerType: 'ladder' | 'snake' | 'roll' | 'win' = 'roll';

      // Check ladder
      const ladder = currentLayout.laddersList.find((l) => l.bottom === targetPos);
      if (ladder) {
        await new Promise((r) => setTimeout(r, 250));
        finalPos = ladder.top;
        setSteppingPos(finalPos);
        bannerText = `${currentTheme.ladderEmoji} ${curr.name} climbed ${currentTheme.ladderName} ${ladder.bottom} ➔ ${ladder.top}!`;
        bannerType = 'ladder';
        await new Promise((r) => setTimeout(r, 450));
      }

      // Check shark hazard
      const shark = currentLayout.snakesList.find((s) => s.head === targetPos);
      if (shark) {
        await new Promise((r) => setTimeout(r, 250));
        finalPos = shark.tail;
        setSteppingPos(finalPos);
        bannerText = `${currentTheme.hazardEmoji} ${curr.name} chomped by ${currentTheme.hazardName} ${shark.head} ➔ dragged to ${shark.tail}!`;
        bannerType = 'snake';
        await new Promise((r) => setTimeout(r, 450));
      }

      // Check win
      if (finalPos === 100) {
        bannerText = `🏆 ${curr.avatar} ${curr.name} conquered ${currentTheme.finishText}!`;
        bannerType = 'win';
      }

      setActiveBanner({ text: bannerText, type: bannerType });
      setSteppingPawnId(null);
      setSteppingPos(null);

      setPawns((prev) =>
        prev.map((p) => (p.id === curr.id ? { ...p, position: finalPos === 100 ? 1 : finalPos } : p))
      );

      setActiveTurnIdx((prev) => (prev + 1) % pawns.length);
    }, 2800);

    return () => clearInterval(timer);
  }, [pawns, activeTurnIdx, isPaused, currentLayout, currentTheme]);

  // Group pawns by tile for clustered rendering
  const pawnsByTile = React.useMemo(() => {
    const map = new Map<number, SimPawn[]>();
    pawns.forEach((p) => {
      const pos = p.id === steppingPawnId && steppingPos !== null ? steppingPos : p.position;
      if (pos >= 1 && pos <= 100) {
        if (!map.has(pos)) map.set(pos, []);
        map.get(pos)!.push(p);
      }
    });
    return map;
  }, [pawns, steppingPawnId, steppingPos]);

  // Grid cells 1..100
  const gridCells = React.useMemo(() => {
    const cells = [];
    for (let r = 0; r < size; r++) {
      for (let c = 0; c < size; c++) {
        const rowFromBottom = size - 1 - r;
        const colInRow = rowFromBottom % 2 === 0 ? c : size - 1 - c;
        const tileNum = rowFromBottom * size + colInRow + 1;
        cells.push({ tileNum, row: r, col: c });
      }
    }
    return cells;
  }, [size]);

  const activePawn = pawns[activeTurnIdx] || pawns[0];

  return (
    <div className="relative w-full rounded-3xl bg-slate-900/90 border border-slate-800 p-4 sm:p-6 shadow-2xl overflow-hidden flex flex-col gap-4">
      {/* Background Glow */}
      <div className="absolute -top-24 -left-24 w-60 h-60 bg-amber-500/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-24 -right-24 w-60 h-60 bg-cyan-500/15 rounded-full blur-3xl pointer-events-none" />

      {/* Hero Header & Theme Switcher */}
      <div className="flex flex-wrap items-center justify-between gap-3 relative z-10 border-b border-slate-800 pb-3">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-cyan-400 to-blue-600 flex items-center justify-center text-xl shadow-lg border border-cyan-300">
            {currentTheme.icon}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base sm:text-lg font-black tracking-tight text-white flex items-center gap-1.5">
                Shark Board Arena Showcase
              </h2>
              <span className="text-[9px] uppercase font-black px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 animate-pulse flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" /> LIVE ARENA
              </span>
            </div>
            <p className="text-[11px] text-slate-400">
              {currentTheme.name} • {currentTheme.tagline}
            </p>
          </div>
        </div>

        {/* Theme pills switcher */}
        <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none py-1 max-w-full">
          {SHARK_THEMES_LIST.map((th) => {
            const isSel = th.id === selectedThemeId;
            return (
              <button
                key={th.id}
                onClick={() => {
                  setSelectedThemeId(th.id);
                  if (onThemeSelect) onThemeSelect(th.id);
                }}
                className={`flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] font-bold transition-all cursor-pointer border shrink-0 ${
                  isSel
                    ? 'bg-cyan-500/25 border-cyan-400 text-cyan-200 ring-1 ring-cyan-400/50 scale-105'
                    : 'bg-slate-800/80 border-slate-700 text-slate-400 hover:text-white'
                }`}
                title={th.speciesTitle}
              >
                <span>{th.icon}</span>
                <span className="hidden sm:inline">{th.name.split(' ')[0]}</span>
              </button>
            );
          })}

          <button
            onClick={() => setIsPaused(!isPaused)}
            className="px-2 py-1 rounded-lg bg-slate-800 hover:bg-slate-750 text-slate-300 text-xs font-bold transition-colors cursor-pointer flex items-center gap-1 border border-slate-700 shrink-0 ml-1"
            title={isPaused ? 'Resume Demo' : 'Pause Demo'}
          >
            {isPaused ? <Play className="w-3 h-3 text-emerald-400" /> : <Pause className="w-3 h-3 text-amber-400" />}
            <span className="text-[10px]">{isPaused ? 'Play' : 'Pause'}</span>
          </button>
        </div>
      </div>

      {/* Main Interactive Showcase Body: Mini Board on Left + Live 3D Dice Ticker on Right */}
      <div className="flex flex-col md:flex-row items-center justify-center gap-6 lg:gap-10 relative z-10 w-full">
        {/* The Animated 10x10 Board */}
        <div
          className={`relative w-full max-w-[340px] sm:max-w-[390px] lg:max-w-[460px] xl:max-w-[520px] 2xl:max-w-[560px] aspect-square rounded-2xl sm:rounded-3xl overflow-hidden border-2 p-1.5 shadow-2xl shrink-0 transition-all duration-300 ${currentTheme.boardOuterBorder} ${currentTheme.boardOuterBg}`}
        >
          {/* 10x10 Grid Cells */}
          <div
            className={`grid w-full h-full gap-0.5 rounded-lg overflow-hidden relative ${currentTheme.boardInnerGridBg}`}
            style={{
              gridTemplateColumns: 'repeat(10, minmax(0, 1fr))',
              gridTemplateRows: 'repeat(10, minmax(0, 1fr))',
            }}
          >
            {gridCells.map(({ tileNum }) => {
              const isFinish = tileNum === 100;
              const isStart = tileNum === 1;
              const isEven = (Math.floor((tileNum - 1) / 10) + (tileNum % 10)) % 2 === 0;

              let cellBg = isEven ? currentTheme.tileEvenBg : currentTheme.tileOddBg;
              if (isFinish) cellBg = currentTheme.finishBg;
              if (isStart) cellBg = currentTheme.startBg;

              return (
                <div
                  key={tileNum}
                  className={`relative flex items-center justify-center p-0.5 rounded-[2px] border text-[7px] sm:text-[8px] font-bold ${currentTheme.tileBorder} ${cellBg}`}
                >
                  {isFinish ? '🏆' : isStart ? 'S' : tileNum}
                </div>
              );
            })}
          </div>

          {/* SVG Layer for Shark Hazards & Ladders */}
          <SharkSvgLayer
            theme={currentTheme}
            snakes={currentLayout.snakesList}
            ladders={currentLayout.laddersList}
            boardSize={10}
            dimension={1000}
          />

          {/* Clustered Animated Pawns */}
          <div className="absolute inset-0 pointer-events-none p-1.5">
            {Array.from(pawnsByTile.entries()).map(([tileNum, tilePawns]) => {
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
                  <div className="flex items-center justify-center -space-x-1">
                    {tilePawns.map((p, idx) => {
                      const isTurn = p.id === activeTurnIdx;
                      const isStepping = steppingPawnId === p.id;

                      return (
                        <div
                          key={p.id}
                          className={`w-5 h-5 sm:w-6 sm:h-6 rounded-full flex items-center justify-center text-[10px] sm:text-xs shadow-md border border-white font-black ${p.bg} ${
                            isTurn ? 'ring-2 ring-amber-400 scale-110 z-30' : 'z-20'
                          } ${isStepping ? 'scale-125 -translate-y-1' : ''}`}
                          style={{
                            transform: `translate(${idx * 2}px, ${idx * -2}px)`,
                          }}
                        >
                          {p.avatar}
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Live Simulation Sidebar Dashboard & 3D Rolling Dice */}
        <div className="flex flex-col gap-3.5 w-full max-w-xs sm:max-w-sm lg:max-w-md">
          {/* Active Player Ticker Card */}
          <div className="p-3.5 rounded-2xl bg-slate-900/90 border border-slate-800 flex items-center justify-between shadow-lg">
            <div className="flex items-center gap-2.5">
              <div className={`w-10 h-10 rounded-xl ${activePawn.bg} flex items-center justify-center text-xl shadow-md ring-2 ring-white/30`}>
                {activePawn.avatar}
              </div>
              <div>
                <span className="text-[10px] font-black uppercase text-amber-400 block">
                  Current Turn
                </span>
                <h4 className="text-sm font-black text-white">{activePawn.name}</h4>
                <span className="text-[11px] text-slate-400 font-mono font-bold">
                  Square: <strong className="text-amber-300">{activePawn.position}</strong> / 100
                </span>
              </div>
            </div>

            {/* Rolling 3D Mini Cube */}
            <div className="flex flex-col items-center justify-center bg-slate-950 px-3 py-2 rounded-xl border border-slate-800">
              <div className="dice-container">
                <div className={`dice-cube ${isRolling ? 'dice-rolling-anim' : `dice-show-${diceVal}`}`} style={{ width: '40px', height: '40px' }}>
                  <div className="dice-face dice-face-1 bg-white border border-slate-300" style={{ width: '40px', height: '40px' }}>
                    <div className="w-2.5 h-2.5 bg-rose-600 rounded-full" />
                  </div>
                  <div className="dice-face dice-face-2 bg-white border border-slate-300" style={{ width: '40px', height: '40px' }}>
                    <div className="flex justify-between w-6 h-6 p-0.5">
                      <div className="w-1.5 h-1.5 bg-slate-800 rounded-full self-start" />
                      <div className="w-1.5 h-1.5 bg-slate-800 rounded-full self-end" />
                    </div>
                  </div>
                  <div className="dice-face dice-face-3 bg-white border border-slate-300" style={{ width: '40px', height: '40px' }}>
                    <div className="flex justify-between w-6 h-6 p-0.5">
                      <div className="w-1.5 h-1.5 bg-slate-800 rounded-full self-start" />
                      <div className="w-1.5 h-1.5 bg-slate-800 rounded-full self-center" />
                      <div className="w-1.5 h-1.5 bg-slate-800 rounded-full self-end" />
                    </div>
                  </div>
                  <div className="dice-face dice-face-4 bg-white border border-slate-300" style={{ width: '40px', height: '40px' }}>
                    <div className="flex flex-col justify-between w-6 h-6 p-0.5">
                      <div className="flex justify-between"><div className="w-1.5 h-1.5 bg-slate-800 rounded-full" /><div className="w-1.5 h-1.5 bg-slate-800 rounded-full" /></div>
                      <div className="flex justify-between"><div className="w-1.5 h-1.5 bg-slate-800 rounded-full" /><div className="w-1.5 h-1.5 bg-slate-800 rounded-full" /></div>
                    </div>
                  </div>
                  <div className="dice-face dice-face-5 bg-white border border-slate-300" style={{ width: '40px', height: '40px' }}>
                    <div className="flex flex-col justify-between w-6 h-6 p-0.5 relative">
                      <div className="flex justify-between"><div className="w-1.5 h-1.5 bg-slate-800 rounded-full" /><div className="w-1.5 h-1.5 bg-slate-800 rounded-full" /></div>
                      <div className="w-1.5 h-1.5 bg-slate-800 rounded-full self-center" />
                      <div className="flex justify-between"><div className="w-1.5 h-1.5 bg-slate-800 rounded-full" /><div className="w-1.5 h-1.5 bg-slate-800 rounded-full" /></div>
                    </div>
                  </div>
                  <div className="dice-face dice-face-6 bg-white border border-slate-300" style={{ width: '40px', height: '40px' }}>
                    <div className="flex justify-between w-6 h-6 p-0.5">
                      <div className="flex flex-col justify-between"><div className="w-1.5 h-1.5 bg-slate-800 rounded-full" /><div className="w-1.5 h-1.5 bg-slate-800 rounded-full" /><div className="w-1.5 h-1.5 bg-slate-800 rounded-full" /></div>
                      <div className="flex justify-between"><div className="w-1.5 h-1.5 bg-slate-800 rounded-full" /><div className="w-1.5 h-1.5 bg-slate-800 rounded-full" /><div className="w-1.5 h-1.5 bg-slate-800 rounded-full" /></div>
                    </div>
                  </div>
                </div>
              </div>
              <span className="text-[10px] font-black text-amber-400 mt-1">
                {isRolling ? '...' : `Roll: ${diceVal}`}
              </span>
            </div>
          </div>

          {/* Standings list */}
          <div className="flex flex-col gap-1.5 bg-slate-950/60 p-3 rounded-2xl border border-slate-800">
            <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-0.5">
              <span>Live Contenders</span>
              <span className="text-cyan-300 font-mono">{currentLayout.name}</span>
            </div>
            <div className="grid grid-cols-2 gap-1.5">
              {pawns.map((p, idx) => (
                <div
                  key={p.id}
                  className={`flex items-center justify-between px-2 py-1 rounded-lg text-xs border ${
                    idx === activeTurnIdx
                      ? 'bg-slate-800 border-amber-400 text-white font-bold shadow'
                      : 'bg-slate-900/80 border-slate-800 text-slate-400'
                  }`}
                >
                  <span className="flex items-center gap-1">
                    <span>{p.avatar}</span>
                    <span className="text-[11px] truncate">{p.name}</span>
                  </span>
                  <span className="font-mono text-[10px] font-bold text-amber-300">
                    {p.position}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Live Match Action Event Ticker */}
      <div className="relative z-10 w-full bg-slate-950/90 border border-slate-800 rounded-xl px-4 py-2.5 flex items-center justify-between text-xs shadow-md">
        <div className="flex items-center gap-2 font-bold text-slate-200">
          <span className="text-base">
            {activeBanner.type === 'ladder' ? currentTheme.ladderEmoji : activeBanner.type === 'snake' ? currentTheme.hazardEmoji : activeBanner.type === 'win' ? '🏆' : '🎲'}
          </span>
          <span
            className={
              activeBanner.type === 'ladder'
                ? 'text-emerald-300'
                : activeBanner.type === 'snake'
                ? 'text-rose-300'
                : activeBanner.type === 'win'
                ? 'text-amber-300 font-black'
                : 'text-slate-200'
            }
          >
            {activeBanner.text}
          </span>
        </div>

        <span className="text-[10px] uppercase font-black text-cyan-400/90 tracking-wider">
          LIVE DEMO
        </span>
      </div>
    </div>
  );
};
