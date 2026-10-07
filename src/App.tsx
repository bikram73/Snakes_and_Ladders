/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  BoardConfig,
  BoardTheme,
  GameMode,
  GameRules,
  MoveLog,
  Player,
  SpecialTileType,
} from './types/game';
import { ALL_PRESETS, BLITZ_PRESET, CLASSIC_PRESET, OBSTACLE_PRESET, SPECIAL_TILE_DEFS } from './utils/boardPresets';
import { sound } from './utils/audio';
import { GameBoard } from './components/GameBoard';
import { Dice3D } from './components/Dice3D';
import { PlayerSetupModal } from './components/PlayerSetupModal';
import { RulesModal } from './components/RulesModal';
import { VictoryModal } from './components/VictoryModal';
import { BoardEditor } from './components/BoardEditor';
import { MoveLogDrawer } from './components/MoveLogDrawer';
import {
  Sparkles,
  Volume2,
  VolumeX,
  BookOpen,
  RotateCcw,
  Users,
  Palette,
  History,
  Edit3,
  Trophy,
  Dices,
  Play,
  Flame,
  Shield,
  Zap,
} from 'lucide-react';

const DEFAULT_PLAYERS: Player[] = [
  {
    id: 'p1',
    name: 'Adventurer',
    isAi: false,
    avatar: '🦁',
    color: '#f59e0b',
    bgGradient: 'bg-gradient-to-br from-amber-400 to-yellow-600',
    ringColor: 'ring-amber-400',
    position: 1,
    consecutiveSixes: 0,
    isFrozen: false,
    turnsPlayed: 0,
    stats: { rolls: 0, snakesBitten: 0, laddersClimbed: 0, sixesCount: 0, tilesTraveled: 0, specialTilesHit: 0 },
  },
  {
    id: 'p2',
    name: 'Bot Nova',
    isAi: true,
    botPersonality: 'balanced',
    avatar: '🤖',
    color: '#06b6d4',
    bgGradient: 'bg-gradient-to-br from-cyan-400 to-blue-600',
    ringColor: 'ring-cyan-400',
    position: 1,
    consecutiveSixes: 0,
    isFrozen: false,
    turnsPlayed: 0,
    stats: { rolls: 0, snakesBitten: 0, laddersClimbed: 0, sixesCount: 0, tilesTraveled: 0, specialTilesHit: 0 },
  },
];

const DEFAULT_RULES: GameRules = {
  exact100: true,
  rollSixAgain: true,
  threeSixesPenalty: true,
  allowKnockout: false,
  doubleDice: false,
  requireSixToStart: false,
  botSpeed: 'normal',
};

export default function App() {
  // Board & Rules State
  const [boardConfig, setBoardConfig] = useState<BoardConfig>(CLASSIC_PRESET);
  const [theme, setTheme] = useState<BoardTheme>('vintage');
  const [rules, setRules] = useState<GameRules>(DEFAULT_RULES);

  // Player & Game State
  const [players, setPlayers] = useState<Player[]>(DEFAULT_PLAYERS);
  const [activePlayerIndex, setActivePlayerIndex] = useState<number>(0);
  const [winner, setWinner] = useState<Player | null>(null);
  const [totalTurns, setTotalTurns] = useState<number>(0);

  // Dice & Animation State
  const [diceValue, setDiceValue] = useState<number>(1);
  const [secondaryDiceValue, setSecondaryDiceValue] = useState<number>(1);
  const [isRolling, setIsRolling] = useState<boolean>(false);
  const [isAnimatingMove, setIsAnimatingMove] = useState<boolean>(false);
  const [steppingPlayerId, setSteppingPlayerId] = useState<string | null>(null);
  const [steppingTile, setSteppingTile] = useState<number | null>(null);
  const [activeActionBanner, setActiveActionBanner] = useState<{ text: string; type: 'ladder' | 'snake' | 'boost' | 'freeze' | 'bounce' | 'knockout' | 'six' } | null>(null);

  // Modals & UI Toggles
  const [showSetupModal, setShowSetupModal] = useState<boolean>(false);
  const [showRulesModal, setShowRulesModal] = useState<boolean>(false);
  const [showLogDrawer, setShowLogDrawer] = useState<boolean>(false);
  const [isEditorOpen, setIsEditorOpen] = useState<boolean>(false);
  const [editorSelectedTile, setEditorSelectedTile] = useState<number | null>(null);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [moveLogs, setMoveLogs] = useState<MoveLog[]>([]);

  const maxTile = boardConfig.size * boardConfig.size;
  const activePlayer = players[activePlayerIndex] || players[0];

  // Sync sound mute
  const toggleSound = () => {
    const next = !isMuted;
    setIsMuted(next);
    sound.enabled = !next;
    if (!next) sound.playClick();
  };

  // Switch board preset
  const handleSelectPreset = (preset: BoardConfig) => {
    sound.playClick();
    setBoardConfig(preset);
    resetMatch(preset);
  };

  // Reset Match with current or new board
  const resetMatch = (cfg = boardConfig, playerList = players) => {
    setWinner(null);
    setActivePlayerIndex(0);
    setTotalTurns(0);
    setIsRolling(false);
    setIsAnimatingMove(false);
    setSteppingPlayerId(null);
    setSteppingTile(null);
    setActiveActionBanner(null);
    setMoveLogs([]);

    const resetPlayers = playerList.map((p) => ({
      ...p,
      position: 1,
      consecutiveSixes: 0,
      isFrozen: false,
      turnsPlayed: 0,
      stats: {
        rolls: 0,
        snakesBitten: 0,
        laddersClimbed: 0,
        sixesCount: 0,
        tilesTraveled: 0,
        specialTilesHit: 0,
      },
    }));
    setPlayers(resetPlayers);
  };

  // Add Move Log Helper
  const addMoveLog = useCallback((
    player: Player,
    roll: number[],
    from: number,
    to: number,
    type: MoveLog['actionType'],
    message: string
  ) => {
    const newLog: MoveLog = {
      id: `log_${Date.now()}_${Math.random()}`,
      timestamp: new Date(),
      playerId: player.id,
      playerName: player.name,
      playerAvatar: player.avatar,
      diceRoll: roll,
      fromPos: from,
      toPos: to,
      actionType: type,
      message,
    };
    setMoveLogs((prev) => [...prev, newLog]);
  }, []);

  // Sleep utility
  const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

  // Perform full turn move animation and game logic
  const handleRollDice = useCallback(async () => {
    if (isRolling || isAnimatingMove || winner) return;

    // Check if player is frozen by frost trap
    if (activePlayer.isFrozen) {
      sound.playFreeze();
      setActiveActionBanner({ text: `❄️ ${activePlayer.name} is Frozen! Skipping turn.`, type: 'freeze' });
      addMoveLog(activePlayer, [0], activePlayer.position, activePlayer.position, 'frozen', `${activePlayer.name} was frozen and broke free from the ice!`);
      
      // Unfreeze for next turn
      setPlayers((prev) =>
        prev.map((p, idx) => (idx === activePlayerIndex ? { ...p, isFrozen: false } : p))
      );

      await delay(1200);
      setActiveActionBanner(null);
      setActivePlayerIndex((prev) => (prev + 1) % players.length);
      return;
    }

    setIsRolling(true);
    sound.playDiceRoll();

    // Roll random dice values
    const roll1 = Math.floor(Math.random() * 6) + 1;
    const roll2 = Math.floor(Math.random() * 6) + 1;
    const totalRoll = rules.doubleDice ? roll1 + roll2 : roll1;
    const diceArray = rules.doubleDice ? [roll1, roll2] : [roll1];

    await delay(700);

    setDiceValue(roll1);
    if (rules.doubleDice) setSecondaryDiceValue(roll2);
    setIsRolling(false);
    setIsAnimatingMove(true);

    const isSix = roll1 === 6 || (rules.doubleDice && (roll1 === 6 || roll2 === 6));
    let newConsecutiveSixes = isSix ? activePlayer.consecutiveSixes + 1 : 0;

    // Triple 6 penalty check
    if (rules.threeSixesPenalty && newConsecutiveSixes >= 3) {
      sound.playKnockout();
      setActiveActionBanner({ text: `⚠️ 3 Sixes in a row! Turn forfeited for ${activePlayer.name}`, type: 'bounce' });
      addMoveLog(activePlayer, diceArray, activePlayer.position, activePlayer.position, 'normal', `Rolled three 6s in a row! Turn forfeited.`);
      
      setPlayers((prev) =>
        prev.map((p, idx) =>
          idx === activePlayerIndex
            ? {
                ...p,
                consecutiveSixes: 0,
                stats: {
                  ...p.stats,
                  rolls: p.stats.rolls + 1,
                  sixesCount: p.stats.sixesCount + 1,
                },
              }
            : p
        )
      );

      await delay(1500);
      setActiveActionBanner(null);
      setIsAnimatingMove(false);
      setActivePlayerIndex((prev) => (prev + 1) % players.length);
      return;
    }

    // Step 1: Hop tile by tile forward
    const startPos = activePlayer.position;
    let targetPos = startPos + totalRoll;
    let isBounced = false;

    // Exact finish check
    if (rules.exact100 && targetPos > maxTile) {
      const overshoot = targetPos - maxTile;
      targetPos = maxTile - overshoot;
      isBounced = true;
    } else if (!rules.exact100 && targetPos > maxTile) {
      targetPos = maxTile;
    }

    setSteppingPlayerId(activePlayer.id);

    // Progressive step animation
    let currentStep = startPos;
    if (startPos < targetPos) {
      while (currentStep < targetPos) {
        currentStep++;
        setSteppingTile(currentStep);
        sound.playStepBounce((currentStep % 8));
        await delay(160);
      }
    } else if (isBounced) {
      // First walk up to maxTile
      while (currentStep < maxTile) {
        currentStep++;
        setSteppingTile(currentStep);
        sound.playStepBounce((currentStep % 8));
        await delay(150);
      }
      setActiveActionBanner({ text: `🎯 Overshot! Bounced back to ${targetPos}`, type: 'bounce' });
      // Then bounce back
      while (currentStep > targetPos) {
        currentStep--;
        setSteppingTile(currentStep);
        sound.playStepBounce((currentStep % 8));
        await delay(160);
      }
    }

    let finalTile = targetPos;
    let actionType: MoveLog['actionType'] = isBounced ? 'bounce' : 'normal';
    let actionMessage = `${activePlayer.name} rolled ${totalRoll} and moved to tile ${finalTile}`;

    // Step 2: Check for Ladders
    const ladder = boardConfig.ladders.find((l) => l.bottom === finalTile);
    if (ladder) {
      await delay(300);
      sound.playLadderClimb();
      setActiveActionBanner({ text: `🪜 CLIMB! Up to tile ${ladder.top}!`, type: 'ladder' });
      finalTile = ladder.top;
      setSteppingTile(finalTile);
      actionType = 'ladder';
      actionMessage = `🪜 ${activePlayer.name} climbed ladder from ${ladder.bottom} to ${ladder.top}!`;
      await delay(700);
    }

    // Step 3: Check for Snakes
    const snake = boardConfig.snakes.find((s) => s.head === finalTile);
    if (snake) {
      await delay(300);
      sound.playSnakeSlide();
      setActiveActionBanner({ text: `🐍 BITTEN! Slithered down to tile ${snake.tail}!`, type: 'snake' });
      finalTile = snake.tail;
      setSteppingTile(finalTile);
      actionType = 'snake';
      actionMessage = `🐍 ${activePlayer.name} got bitten by snake at ${snake.head} and slid to ${snake.tail}!`;
      await delay(700);
    }

    // Step 4: Check for Special Tiles
    let willBeFrozen = false;
    const special = boardConfig.specialTiles[finalTile] as SpecialTileType | undefined;
    if (special) {
      await delay(300);
      const specDef = SPECIAL_TILE_DEFS[special];
      if (special === 'speed_boost' || special === 'spring' || special === 'banana') {
        const delta = specDef.effectDelta || 0;
        const newSpecialTile = Math.max(1, Math.min(maxTile, finalTile + delta));
        sound.playPowerup();
        setActiveActionBanner({
          text: `${specDef.icon} ${specDef.title}: ${delta > 0 ? '+' : ''}${delta} tiles! (Now on ${newSpecialTile})`,
          type: 'boost',
        });
        finalTile = newSpecialTile;
        setSteppingTile(finalTile);
        actionType = 'special';
        actionMessage = `${specDef.icon} ${activePlayer.name} triggered ${specDef.title} (${delta > 0 ? '+' : ''}${delta} to ${finalTile})!`;
        await delay(700);
      } else if (special === 'freeze') {
        sound.playFreeze();
        setActiveActionBanner({ text: `❄️ Frost Trap! ${activePlayer.name} is frozen for next turn!`, type: 'freeze' });
        willBeFrozen = true;
        actionType = 'special';
        actionMessage = `❄️ ${activePlayer.name} stepped on Frost Trap and is frozen for next turn!`;
        await delay(700);
      } else if (special === 'mystery_portal') {
        sound.playPowerup();
        // Teleport to a random safe tile ahead
        const safeAhead = Math.min(maxTile - 1, finalTile + Math.floor(Math.random() * 12) + 4);
        setActiveActionBanner({ text: `🔮 Mystery Warp! Teleported ahead to tile ${safeAhead}!`, type: 'boost' });
        finalTile = safeAhead;
        setSteppingTile(finalTile);
        actionType = 'special';
        actionMessage = `🔮 ${activePlayer.name} warped through Mystery Portal to tile ${finalTile}!`;
        await delay(700);
      }
    }

    // Step 5: Check Pawn Knockout Clash
    let knockedPlayerName: string | null = null;
    if (rules.allowKnockout) {
      const otherPlayersOnTile = players.filter(
        (p, idx) => idx !== activePlayerIndex && p.position === finalTile && finalTile > 1
      );
      if (otherPlayersOnTile.length > 0) {
        sound.playKnockout();
        const bumped = otherPlayersOnTile[0];
        knockedPlayerName = bumped.name;
        const bumpedTo = Math.max(1, bumped.position - 3);
        setActiveActionBanner({ text: `💥 CLASH! ${activePlayer.name} bumped ${bumped.name} back to ${bumpedTo}!`, type: 'knockout' });
        
        setPlayers((prev) =>
          prev.map((p) => (p.id === bumped.id ? { ...p, position: bumpedTo } : p))
        );
        actionType = 'knockout';
        actionMessage = `💥 ${activePlayer.name} clashed with ${bumped.name}, knocking them back 3 tiles!`;
        await delay(600);
      }
    }

    // Step 6: Update active player state
    const won = finalTile >= maxTile;
    const distance = Math.abs(finalTile - startPos);

    setPlayers((prev) =>
      prev.map((p, idx) => {
        if (idx !== activePlayerIndex) return p;
        return {
          ...p,
          position: finalTile,
          consecutiveSixes: newConsecutiveSixes,
          isFrozen: willBeFrozen,
          turnsPlayed: p.turnsPlayed + 1,
          stats: {
            rolls: p.stats.rolls + 1,
            snakesBitten: p.stats.snakesBitten + (snake ? 1 : 0),
            laddersClimbed: p.stats.laddersClimbed + (ladder ? 1 : 0),
            sixesCount: p.stats.sixesCount + (isSix ? 1 : 0),
            tilesTraveled: p.stats.tilesTraveled + distance,
            specialTilesHit: p.stats.specialTilesHit + (special ? 1 : 0),
          },
        };
      })
    );

    addMoveLog(activePlayer, diceArray, startPos, finalTile, won ? 'win' : actionType, actionMessage);
    setTotalTurns((prev) => prev + 1);

    setSteppingPlayerId(null);
    setSteppingTile(null);
    setIsAnimatingMove(false);

    // Win condition check
    if (won) {
      setWinner({ ...activePlayer, position: maxTile });
      return;
    }

    // Bonus roll on 6
    const getsBonusRoll = rules.rollSixAgain && isSix;
    if (getsBonusRoll) {
      setActiveActionBanner({ text: `🌟 Lucky 6! ${activePlayer.name} rolls again!`, type: 'six' });
      await delay(1000);
      setActiveActionBanner(null);
      // Stay on same activePlayerIndex for bonus roll
    } else {
      await delay(300);
      setActiveActionBanner(null);
      setActivePlayerIndex((prev) => (prev + 1) % players.length);
    }
  }, [
    isRolling,
    isAnimatingMove,
    winner,
    activePlayer,
    rules,
    maxTile,
    boardConfig,
    players,
    activePlayerIndex,
    addMoveLog,
  ]);

  // AI Bot Auto Turn Trigger
  useEffect(() => {
    if (winner || isRolling || isAnimatingMove || showSetupModal || isEditorOpen) return;

    if (activePlayer && activePlayer.isAi) {
      const botDelayMs =
        rules.botSpeed === 'fast' ? 600 : rules.botSpeed === 'slow' ? 1600 : 1000;

      const botTimer = setTimeout(() => {
        handleRollDice();
      }, botDelayMs);

      return () => clearTimeout(botTimer);
    }
  }, [
    activePlayerIndex,
    activePlayer,
    winner,
    isRolling,
    isAnimatingMove,
    showSetupModal,
    isEditorOpen,
    rules.botSpeed,
    handleRollDice,
  ]);

  // Handle tile click in board editor
  const handleBoardTileClick = (tileNum: number) => {
    if (isEditorOpen) {
      setEditorSelectedTile(tileNum);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col items-center justify-between pb-8">
      {/* Top Navigation Bar */}
      <header className="w-full max-w-6xl mx-auto px-4 py-3 flex flex-wrap items-center justify-between gap-3 border-b border-slate-800/80 bg-slate-950/90 backdrop-blur-md sticky top-0 z-30">
        {/* Brand Logo & Title */}
        <div className="flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-yellow-600 flex items-center justify-center text-xl shadow-lg shadow-amber-500/20 ring-2 ring-amber-400/40">
            🪜
          </div>
          <div className="flex flex-col">
            <h1 className="text-base sm:text-lg font-black tracking-tight flex items-center gap-1.5 bg-gradient-to-r from-amber-300 via-yellow-200 to-amber-400 bg-clip-text text-transparent">
              Snakes & Ladders
              <span className="text-[10px] uppercase font-bold text-amber-500 border border-amber-500/40 px-1.5 py-0.2 rounded-md bg-amber-500/10">
                Grand Arena
              </span>
            </h1>
            <span className="text-[11px] text-slate-400 font-medium">
              {boardConfig.name} ({maxTile} Tiles)
            </span>
          </div>
        </div>

        {/* Preset & Mode Switcher */}
        <div className="flex items-center gap-1.5 bg-slate-900/90 p-1 rounded-xl border border-slate-800">
          <button
            onClick={() => handleSelectPreset(CLASSIC_PRESET)}
            className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-colors cursor-pointer ${
              boardConfig.id === 'classic'
                ? 'bg-amber-500 text-slate-950 shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Classic 100
          </button>
          <button
            onClick={() => handleSelectPreset(BLITZ_PRESET)}
            className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-colors cursor-pointer ${
              boardConfig.id === 'blitz'
                ? 'bg-amber-500 text-slate-950 shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Blitz 49
          </button>
          <button
            onClick={() => handleSelectPreset(OBSTACLE_PRESET)}
            className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-colors cursor-pointer ${
              boardConfig.id === 'obstacle'
                ? 'bg-amber-500 text-slate-950 shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Obstacle Rush
          </button>
        </div>

        {/* Control Action Tools */}
        <div className="flex items-center gap-2">
          {/* Theme Selector */}
          <div className="relative group">
            <button
              className="p-2 text-slate-300 hover:text-white bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-xl transition-colors cursor-pointer flex items-center gap-1.5 text-xs font-semibold"
              title="Change Board Theme"
            >
              <Palette className="w-4 h-4 text-amber-400" />
              <span className="hidden md:inline capitalize">{theme}</span>
            </button>
            <div className="absolute right-0 top-full mt-1 hidden group-hover:flex flex-col bg-slate-900 border border-slate-700 p-1.5 rounded-xl shadow-2xl z-50 min-w-[130px] gap-1">
              {(['vintage', 'neon', 'jungle', 'candy'] as BoardTheme[]).map((t) => (
                <button
                  key={t}
                  onClick={() => {
                    setTheme(t);
                    sound.playClick();
                  }}
                  className={`text-left px-3 py-1.5 rounded-lg text-xs font-bold capitalize transition-colors cursor-pointer ${
                    theme === t
                      ? 'bg-amber-500 text-slate-950'
                      : 'text-slate-300 hover:bg-slate-800'
                  }`}
                >
                  {t === 'vintage' && '📜 '}
                  {t === 'neon' && '⚡ '}
                  {t === 'jungle' && '🌿 '}
                  {t === 'candy' && '🍬 '}
                  {t}
                </button>
              ))}
            </div>
          </div>

          {/* Sound Toggle */}
          <button
            onClick={toggleSound}
            className="p-2 text-slate-300 hover:text-white bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-xl transition-colors cursor-pointer"
            title={isMuted ? 'Unmute Sound' : 'Mute Sound'}
          >
            {isMuted ? <VolumeX className="w-4 h-4 text-rose-400" /> : <Volume2 className="w-4 h-4 text-emerald-400" />}
          </button>

          {/* Player Roster Setup */}
          <button
            onClick={() => {
              sound.playClick();
              setShowSetupModal(true);
            }}
            className="p-2 text-slate-300 hover:text-white bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-xl transition-colors cursor-pointer flex items-center gap-1.5 text-xs font-semibold"
            title="Player Roster Setup"
          >
            <Users className="w-4 h-4 text-sky-400" />
            <span className="hidden sm:inline">Players</span>
          </button>

          {/* Rules Modal */}
          <button
            onClick={() => {
              sound.playClick();
              setShowRulesModal(true);
            }}
            className="p-2 text-slate-300 hover:text-white bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-xl transition-colors cursor-pointer"
            title="Rules & Options"
          >
            <BookOpen className="w-4 h-4 text-amber-400" />
          </button>

          {/* Custom Board Editor */}
          <button
            onClick={() => {
              sound.playClick();
              setIsEditorOpen(!isEditorOpen);
            }}
            className={`p-2 rounded-xl border transition-colors cursor-pointer flex items-center gap-1.5 text-xs font-semibold ${
              isEditorOpen
                ? 'bg-amber-500 text-slate-950 border-amber-400'
                : 'bg-slate-900 text-slate-300 border-slate-800 hover:border-slate-700 hover:text-white'
            }`}
            title="Custom Board Maker"
          >
            <Edit3 className="w-4 h-4" />
            <span className="hidden sm:inline">Editor</span>
          </button>

          {/* Match Log */}
          <button
            onClick={() => {
              sound.playClick();
              setShowLogDrawer(!showLogDrawer);
            }}
            className="relative p-2 text-slate-300 hover:text-white bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-xl transition-colors cursor-pointer"
            title="Move History Log"
          >
            <History className="w-4 h-4 text-indigo-400" />
            {moveLogs.length > 0 && (
              <span className="absolute -top-1 -right-1 bg-amber-500 text-slate-950 text-[9px] font-black rounded-full w-4 h-4 flex items-center justify-center">
                {moveLogs.length}
              </span>
            )}
          </button>

          {/* Restart */}
          <button
            onClick={() => resetMatch()}
            className="p-2 text-slate-300 hover:text-white bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-xl transition-colors cursor-pointer"
            title="Restart Match"
          >
            <RotateCcw className="w-4 h-4 text-rose-400" />
          </button>
        </div>
      </header>

      {/* Main Game Arena Body */}
      <main className="w-full max-w-6xl mx-auto px-4 py-4 flex-1 flex flex-col lg:flex-row items-center justify-center gap-6">
        {/* Left Side: Game Board */}
        <div className="w-full lg:w-3/5 flex flex-col items-center justify-center">
          {/* Action Event Banner */}
          <div className="h-9 mb-2 flex items-center justify-center w-full">
            {activeActionBanner ? (
              <div
                className={`px-4 py-1.5 rounded-full text-xs font-black tracking-wide shadow-lg border animate-bounce ${
                  activeActionBanner.type === 'ladder'
                    ? 'bg-emerald-500 text-slate-950 border-emerald-300 shadow-emerald-500/20'
                    : activeActionBanner.type === 'snake'
                    ? 'bg-rose-500 text-white border-rose-300 shadow-rose-500/20'
                    : activeActionBanner.type === 'freeze'
                    ? 'bg-cyan-500 text-slate-950 border-cyan-300 shadow-cyan-500/20'
                    : activeActionBanner.type === 'boost'
                    ? 'bg-amber-500 text-slate-950 border-amber-300 shadow-amber-500/20'
                    : activeActionBanner.type === 'six'
                    ? 'bg-yellow-400 text-slate-950 border-yellow-200 shadow-yellow-400/20'
                    : 'bg-slate-800 text-slate-200 border-slate-700'
                }`}
              >
                {activeActionBanner.text}
              </div>
            ) : (
              <div className="text-xs text-slate-400 font-medium">
                Reach tile <strong className="text-amber-400">{maxTile}</strong> to conquer the arena!
              </div>
            )}
          </div>

          <GameBoard
            boardConfig={boardConfig}
            players={players}
            activePlayerIndex={activePlayerIndex}
            steppingPlayerId={steppingPlayerId}
            steppingTile={steppingTile}
            theme={theme}
            onTileClick={handleBoardTileClick}
            isEditor={isEditorOpen}
            selectedEditorTile={editorSelectedTile}
          />
        </div>

        {/* Right Side: Player Standings, 3D Dice, and Editor Panel */}
        <div className="w-full lg:w-2/5 flex flex-col gap-4 max-w-md">
          {/* If Editor Mode is Active, show Board Editor Controls here */}
          {isEditorOpen ? (
            <BoardEditor
              currentConfig={boardConfig}
              onSave={(newCfg) => {
                setBoardConfig(newCfg);
                setIsEditorOpen(false);
                resetMatch(newCfg);
              }}
              onClose={() => setIsEditorOpen(false)}
              onTileClickFromBoard={handleBoardTileClick}
              selectedTile={editorSelectedTile}
            />
          ) : (
            <>
              {/* Active Player Card & Turn Banner */}
              <div className="relative bg-slate-900/90 border-2 border-slate-800 rounded-2xl p-4 shadow-xl overflow-hidden">
                <div
                  className="absolute -top-12 -right-12 w-32 h-32 rounded-full opacity-20 filter blur-2xl pointer-events-none"
                  style={{ backgroundColor: activePlayer?.color || '#f59e0b' }}
                />

                <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-12 h-12 rounded-2xl ${activePlayer?.bgGradient} flex items-center justify-center text-2xl shadow-lg ring-2 ring-white/50`}
                    >
                      {activePlayer?.avatar}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-base font-black text-white">{activePlayer?.name}</h3>
                        {activePlayer?.isAi && (
                          <span className="text-[10px] bg-cyan-950 text-cyan-300 border border-cyan-800 px-1.5 py-0.5 rounded font-mono font-bold">
                            AI BOT
                          </span>
                        )}
                        {activePlayer?.isFrozen && (
                          <span className="text-[10px] bg-blue-950 text-blue-300 border border-blue-800 px-1.5 py-0.5 rounded font-mono font-bold">
                            ❄️ FROZEN
                          </span>
                        )}
                      </div>
                      <span className="text-xs text-slate-400 font-semibold">
                        Position: <strong className="text-amber-400 font-mono text-sm">Tile {activePlayer?.position}</strong> / {maxTile}
                      </span>
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">Current Turn</span>
                    <span className="text-xs font-black text-amber-400">
                      {activePlayer?.isAi ? 'Thinking...' : 'Your Roll!'}
                    </span>
                  </div>
                </div>

                {/* Dice Roller Section */}
                <div className="py-4 flex flex-col items-center justify-center">
                  <Dice3D
                    value={diceValue}
                    secondaryValue={secondaryDiceValue}
                    showDouble={rules.doubleDice}
                    isRolling={isRolling}
                    onRoll={handleRollDice}
                    disabled={isAnimatingMove || (activePlayer?.isAi ?? false)}
                  />
                </div>
              </div>

              {/* Player Standings Leaderboard */}
              <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 flex flex-col gap-2.5 shadow-lg">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                    <Trophy className="w-3.5 h-3.5 text-amber-400" /> Contenders Live Race
                  </h4>
                  <span className="text-[11px] text-slate-500 font-mono">Turn {totalTurns + 1}</span>
                </div>

                <div className="flex flex-col gap-1.5">
                  {players.map((p, idx) => {
                    const isTurn = activePlayerIndex === idx;
                    const progressPct = Math.min(100, Math.round((p.position / maxTile) * 100));

                    return (
                      <div
                        key={p.id}
                        className={`p-2.5 rounded-xl border transition-all ${
                          isTurn
                            ? 'bg-slate-800/90 border-amber-500/70 shadow-md'
                            : 'bg-slate-950/40 border-slate-800/80 text-slate-300'
                        }`}
                      >
                        <div className="flex items-center justify-between text-xs mb-1.5">
                          <div className="flex items-center gap-2">
                            <span className="text-base">{p.avatar}</span>
                            <span className={`font-bold ${isTurn ? 'text-amber-300' : 'text-slate-200'}`}>
                              {p.name}
                            </span>
                            {p.isAi && (
                              <span className="text-[9px] bg-slate-800 text-slate-400 px-1 py-0.2 rounded font-mono">
                                BOT
                              </span>
                            )}
                          </div>

                          <div className="flex items-center gap-2 font-mono">
                            <span className="font-bold text-amber-400">Tile {p.position}</span>
                            <span className="text-slate-500 text-[10px]">({progressPct}%)</span>
                          </div>
                        </div>

                        {/* Progress bar */}
                        <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                          <div
                            className={`h-full transition-all duration-300 ${p.bgGradient}`}
                            style={{ width: `${progressPct}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </>
          )}
        </div>
      </main>

      {/* Move Log Drawer */}
      <MoveLogDrawer
        logs={moveLogs}
        isOpen={showLogDrawer}
        onToggle={() => setShowLogDrawer(!showLogDrawer)}
      />

      {/* Setup Modal */}
      {showSetupModal && (
        <PlayerSetupModal
          initialPlayers={players}
          onStartGame={(newPlayers) => {
            setShowSetupModal(false);
            resetMatch(boardConfig, newPlayers);
          }}
          onClose={() => setShowSetupModal(false)}
        />
      )}

      {/* Rules Modal */}
      {showRulesModal && (
        <RulesModal
          rules={rules}
          onUpdateRules={setRules}
          onClose={() => setShowRulesModal(false)}
        />
      )}

      {/* Victory Fanfare Modal */}
      {winner && (
        <VictoryModal
          winner={winner}
          players={players}
          totalTurns={totalTurns}
          onPlayAgain={() => resetMatch()}
          onChangeSetup={() => {
            setWinner(null);
            setShowSetupModal(true);
          }}
        />
      )}
    </div>
  );
}
