/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { GameMode, GameRules, MoveLog, Player, RollApiResponse, NewGameApiResponse } from './types/game';
import { GameBoard } from './components/GameBoard';
import { Dice3D } from './components/Dice3D';
import { ModeSelectModal } from './components/ModeSelectModal';
import { RulesModal } from './components/RulesModal';
import { SettingsModal } from './components/SettingsModal';
import { NewGameConfirmModal } from './components/NewGameConfirmModal';
import { VictoryModal } from './components/VictoryModal';
import { MoveLogDrawer } from './components/MoveLogDrawer';
import { sound } from './utils/audio';
import {
  Volume2,
  VolumeX,
  BookOpen,
  Settings as SettingsIcon,
  RotateCcw,
  History,
  Trophy,
  Bot,
  User,
  Sparkles,
} from 'lucide-react';

const DEFAULT_RULES: GameRules = {
  exact100: true,
  extraTurnOnSix: true,
  soundEnabled: true,
  animationSpeed: 'normal',
};

export default function App() {
  // Game session & state
  const [gameId, setGameId] = useState<string | null>(null);
  const [mode, setMode] = useState<GameMode>('pvc');
  const [players, setPlayers] = useState<Player[]>([
    { id: 0, name: 'Player 1', position: 0, is_computer: false, color: 'red', avatar: '🔴' },
    { id: 1, name: 'Computer', position: 0, is_computer: true, color: 'blue', avatar: '🔵' },
  ]);
  const [currentPlayerId, setCurrentPlayerId] = useState<number>(0);
  const [gameOver, setGameOver] = useState<boolean>(false);
  const [winner, setWinner] = useState<Player | null>(null);
  const [lastDice, setLastDice] = useState<number>(1);
  const [rules, setRules] = useState<GameRules>(DEFAULT_RULES);

  // Animation & UI state
  const [isRolling, setIsRolling] = useState<boolean>(false);
  const [isAnimatingMove, setIsAnimatingMove] = useState<boolean>(false);
  const [steppingPlayerId, setSteppingPlayerId] = useState<number | null>(null);
  const [steppingTile, setSteppingTile] = useState<number | null>(null);
  const [statusMessage, setStatusMessage] = useState<string>("Welcome! Roll the dice to start the game.");
  const [activeEventBanner, setActiveEventBanner] = useState<{ text: string; type: 'snake' | 'ladder' | 'overshoot' | 'winner' | 'six' } | null>(null);
  const [computerThinking, setComputerThinking] = useState<boolean>(false);

  // Modals & Panels
  const [showModeModal, setShowModeModal] = useState<boolean>(false);
  const [showRulesModal, setShowRulesModal] = useState<boolean>(false);
  const [showSettingsModal, setShowSettingsModal] = useState<boolean>(false);
  const [showNewGameConfirm, setShowNewGameConfirm] = useState<boolean>(false);
  const [showLogDrawer, setShowLogDrawer] = useState<boolean>(false);
  const [moveLogs, setMoveLogs] = useState<MoveLog[]>([]);

  const activePlayer = players.find((p) => p.id === currentPlayerId) || players[0];

  // Helper delay
  const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

  const getStepSpeedMs = useCallback(() => {
    if (rules.animationSpeed === 'fast') return 80;
    if (rules.animationSpeed === 'slow') return 250;
    return 140; // normal
  }, [rules.animationSpeed]);

  // Initialize a new game session via backend API
  const initNewGame = useCallback(async (selectedMode: GameMode, playerNames?: string[]) => {
    try {
      const customPlayers = playerNames?.map((name, i) => ({
        name,
        is_computer: selectedMode === 'pvc' && i === 1,
      }));

      const res = await fetch('/api/game/new', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mode: selectedMode,
          players: customPlayers,
          exact_finish: rules.exact100,
          extra_turn_on_six: rules.extraTurnOnSix,
        }),
      });

      if (!res.ok) throw new Error('Failed to create new game');

      const data: NewGameApiResponse = await res.json();
      setGameId(data.game_id);
      setMode(selectedMode);
      setPlayers(data.state.players);
      setCurrentPlayerId(data.state.current_player);
      setGameOver(false);
      setWinner(null);
      setLastDice(1);
      setMoveLogs([]);
      setSteppingPlayerId(null);
      setSteppingTile(null);
      setIsRolling(false);
      setIsAnimatingMove(false);
      setComputerThinking(false);
      setActiveEventBanner(null);

      const firstPlayer = data.state.players[0];
      setStatusMessage(`${firstPlayer.name}'s Turn. Roll the dice to start!`);
      setShowModeModal(false);
    } catch (err) {
      console.error('Error creating new game:', err);
    }
  }, [rules.exact100, rules.extraTurnOnSix]);

  // Initial load auto-start game
  useEffect(() => {
    if (!gameId) {
      initNewGame('pvc');
    }
  }, [gameId, initNewGame]);

  // Handle rolling dice turn
  const handleRollDice = useCallback(async (forcedPlayerId?: number) => {
    if (isRolling || isAnimatingMove || gameOver || !gameId) return;

    const actingPlayerId = forcedPlayerId !== undefined ? forcedPlayerId : currentPlayerId;
    const actingPlayer = players.find((p) => p.id === actingPlayerId) || activePlayer;

    setIsRolling(true);
    sound.playDiceRoll();
    setStatusMessage(`${actingPlayer.name} is rolling the dice...`);

    await delay(700);

    try {
      const res = await fetch('/api/game/roll', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          game_id: gameId,
          player_id: actingPlayerId,
        }),
      });

      const data: RollApiResponse = await res.json();
      if (!data.success) {
        setIsRolling(false);
        if (data.error) setStatusMessage(data.error);
        return;
      }

      setLastDice(data.dice);
      setIsRolling(false);
      setIsAnimatingMove(true);

      const oldPos = data.old_position;
      const landingPos = data.landing_position;
      const finalPos = data.final_position;

      setSteppingPlayerId(actingPlayerId);

      // 1. Progressive step-by-step movement animation
      if (data.event !== 'overshoot') {
        let curr = oldPos;
        while (curr < landingPos) {
          curr++;
          setSteppingTile(curr);
          sound.playStepBounce(curr % 8);
          await delay(getStepSpeedMs());
        }
      } else {
        // Overshoot bounce
        sound.playKnockout();
        setActiveEventBanner({ text: `⚠️ You need an exact roll to reach 100!`, type: 'overshoot' });
        setStatusMessage(`${actingPlayer.name} rolled a ${data.dice}. You need an exact roll to reach 100.`);
        await delay(900);
      }

      // 2. Ladder Climb Animation
      if (data.event === 'ladder') {
        await delay(300);
        sound.playLadderClimb();
        setActiveEventBanner({
          text: `🪜 Ladder! Climbed from ${landingPos} to ${finalPos}!`,
          type: 'ladder',
        });
        setStatusMessage(`🪜 Ladder! ${actingPlayer.name} climbed from ${landingPos} to ${finalPos}.`);
        setSteppingTile(finalPos);
        await delay(800);
      }

      // 3. Snake Slide Animation
      if (data.event === 'snake') {
        await delay(300);
        sound.playSnakeSlide();
        setActiveEventBanner({
          text: `🐍 Snake! Slid down from ${landingPos} to ${finalPos}!`,
          type: 'snake',
        });
        setStatusMessage(`🐍 Snake! ${actingPlayer.name} slid down from ${landingPos} to ${finalPos}.`);
        setSteppingTile(finalPos);
        await delay(800);
      }

      // 4. Update player list with server state
      setPlayers(data.players);
      setSteppingPlayerId(null);
      setSteppingTile(null);
      setIsAnimatingMove(false);

      // Add to move logs
      const newLog: MoveLog = {
        id: `log_${Date.now()}`,
        playerId: actingPlayer.id,
        playerName: actingPlayer.name,
        playerAvatar: actingPlayer.avatar,
        dice: data.dice,
        oldPosition: oldPos,
        landingPosition: landingPos,
        finalPosition: finalPos,
        event: data.event,
        message: data.message,
        extraTurn: data.extra_turn,
      };
      setMoveLogs((prev) => [...prev, newLog]);

      // 5. Check Game Over / Winner
      if (data.game_over && data.winner) {
        sound.playWinFanfare();
        setGameOver(true);
        setWinner(data.winner);
        setActiveEventBanner({ text: `🏆 ${data.winner.name} Wins!`, type: 'winner' });
        setStatusMessage(`🏆 ${data.winner.name} Wins! Congratulations!`);
        return;
      }

      // 6. Extra turn or next turn
      if (data.extra_turn) {
        sound.playPowerup();
        setActiveEventBanner({ text: `🌟 Rolled a 6! ${actingPlayer.name} gets another turn!`, type: 'six' });
        setStatusMessage(`🌟 ${actingPlayer.name} rolled a 6 and gets an extra turn!`);
        await delay(1000);
        setActiveEventBanner(null);
      } else {
        setCurrentPlayerId(data.next_player);
        const nextP = data.players.find((p) => p.id === data.next_player);
        setStatusMessage(`${nextP?.name}'s Turn.`);
        setActiveEventBanner(null);
      }
    } catch (err) {
      console.error('Error during dice roll:', err);
      setIsRolling(false);
      setIsAnimatingMove(false);
    }
  }, [
    isRolling,
    isAnimatingMove,
    gameOver,
    gameId,
    currentPlayerId,
    players,
    activePlayer,
    getStepSpeedMs,
  ]);

  // AI Computer Turn Effect (Section 23 & 24)
  useEffect(() => {
    if (gameOver || isRolling || isAnimatingMove || showModeModal || showNewGameConfirm) return;

    if (activePlayer && activePlayer.is_computer) {
      setComputerThinking(true);
      setStatusMessage(`🤖 Computer is thinking...`);

      const timer = setTimeout(() => {
        setComputerThinking(false);
        handleRollDice(activePlayer.id);
      }, 1000);

      return () => clearTimeout(timer);
    } else {
      setComputerThinking(false);
    }
  }, [
    currentPlayerId,
    activePlayer,
    gameOver,
    isRolling,
    isAnimatingMove,
    showModeModal,
    showNewGameConfirm,
    handleRollDice,
  ]);

  const toggleSound = () => {
    const next = !rules.soundEnabled;
    sound.enabled = next;
    if (next) sound.playClick();
    setRules((prev) => ({ ...prev, soundEnabled: next }));
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between selection:bg-amber-500 selection:text-slate-950">
      {/* 11. Header */}
      <header className="w-full max-w-6xl mx-auto px-4 py-3 flex flex-wrap items-center justify-between gap-3 border-b border-slate-800/80 bg-slate-950/90 backdrop-blur-md sticky top-0 z-30">
        {/* Brand */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-400 to-yellow-600 flex items-center justify-center text-xl shadow-lg shadow-amber-500/20 border border-amber-300">
            🐍
          </div>
          <div>
            <h1 className="text-base sm:text-lg font-black tracking-tight text-white flex items-center gap-1.5">
              SNAKE & LADDER
            </h1>
            <span className="text-[11px] text-amber-400 font-bold uppercase tracking-wider block">
              Classic Board Game
            </span>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2">
          {/* New Game */}
          <button
            onClick={() => {
              sound.playClick();
              setShowNewGameConfirm(true);
            }}
            className="px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 hover:border-amber-400 text-slate-200 hover:text-white text-xs font-bold transition-colors cursor-pointer flex items-center gap-1.5"
            title="Start New Game"
          >
            <RotateCcw className="w-3.5 h-3.5 text-amber-400" />
            <span>New Game</span>
          </button>

          {/* Rules */}
          <button
            onClick={() => {
              sound.playClick();
              setShowRulesModal(true);
            }}
            className="p-2 rounded-xl bg-slate-900 border border-slate-700 hover:border-amber-400 text-slate-300 hover:text-white transition-colors cursor-pointer"
            title="Game Rules"
          >
            <BookOpen className="w-4 h-4 text-amber-400" />
          </button>

          {/* Settings */}
          <button
            onClick={() => {
              sound.playClick();
              setShowSettingsModal(true);
            }}
            className="p-2 rounded-xl bg-slate-900 border border-slate-700 hover:border-amber-400 text-slate-300 hover:text-white transition-colors cursor-pointer"
            title="Game Settings"
          >
            <SettingsIcon className="w-4 h-4 text-sky-400" />
          </button>

          {/* Sound Toggle */}
          <button
            onClick={toggleSound}
            className="p-2 rounded-xl bg-slate-900 border border-slate-700 hover:border-amber-400 text-slate-300 hover:text-white transition-colors cursor-pointer"
            title={rules.soundEnabled ? 'Mute Sound' : 'Unmute Sound'}
          >
            {rules.soundEnabled ? (
              <Volume2 className="w-4 h-4 text-emerald-400" />
            ) : (
              <VolumeX className="w-4 h-4 text-rose-400" />
            )}
          </button>

          {/* Game Log Drawer Toggle */}
          <button
            onClick={() => {
              sound.playClick();
              setShowLogDrawer(!showLogDrawer);
            }}
            className="relative p-2 rounded-xl bg-slate-900 border border-slate-700 hover:border-amber-400 text-slate-300 hover:text-white transition-colors cursor-pointer"
            title="Game Move Log"
          >
            <History className="w-4 h-4 text-purple-400" />
            {moveLogs.length > 0 && (
              <span className="absolute -top-1 -right-1 bg-amber-500 text-slate-950 text-[9px] font-black rounded-full w-4 h-4 flex items-center justify-center">
                {moveLogs.length}
              </span>
            )}
          </button>
        </div>
      </header>

      {/* 12. Main Game Layout */}
      <main className="w-full max-w-6xl mx-auto px-4 py-4 flex-1 flex flex-col lg:flex-row items-center justify-center gap-6">
        {/* Left Column: Game Board */}
        <div className="w-full lg:w-3/5 flex flex-col items-center justify-center">
          {/* Active Action / Notification Banner */}
          <div className="h-8 mb-2 flex items-center justify-center w-full">
            {activeEventBanner ? (
              <div
                className={`px-4 py-1 rounded-full text-xs font-black tracking-wide shadow-lg border animate-bounce ${
                  activeEventBanner.type === 'ladder'
                    ? 'bg-emerald-500 text-slate-950 border-emerald-300 shadow-emerald-500/20'
                    : activeEventBanner.type === 'snake'
                    ? 'bg-rose-500 text-white border-rose-300 shadow-rose-500/20'
                    : activeEventBanner.type === 'six'
                    ? 'bg-yellow-400 text-slate-950 border-yellow-200 shadow-yellow-400/20'
                    : activeEventBanner.type === 'winner'
                    ? 'bg-amber-400 text-slate-950 border-amber-200'
                    : 'bg-slate-800 text-amber-300 border-amber-500/50'
                }`}
              >
                {activeEventBanner.text}
              </div>
            ) : (
              <span className="text-xs text-slate-400 font-medium">
                Reach square <strong className="text-amber-400">100</strong> to win the game!
              </span>
            )}
          </div>

          <GameBoard
            players={players}
            currentPlayerId={currentPlayerId}
            steppingPlayerId={steppingPlayerId}
            steppingTile={steppingTile}
          />
        </div>

        {/* Right Column: Player Info, Dice, Game Status */}
        <div className="w-full lg:w-2/5 flex flex-col gap-4 max-w-md">
          {/* 51. Player Dashboard & Turn Status */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-xl flex flex-col gap-3">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                <Trophy className="w-3.5 h-3.5 text-amber-400" /> Player Dashboard
              </span>
              <span className="text-[11px] font-bold text-slate-400 uppercase">
                Mode: {mode === 'pvc' ? 'Player vs Bot' : mode === 'two' ? '2 Players' : '4 Players'}
              </span>
            </div>

            {/* List of Players */}
            <div className="flex flex-col gap-2">
              {players.map((p) => {
                const isTurn = p.id === currentPlayerId;

                return (
                  <div
                    key={p.id}
                    className={`p-3 rounded-xl border transition-all ${
                      isTurn
                        ? 'bg-slate-800/90 border-amber-500 ring-2 ring-amber-400/40 shadow-md'
                        : 'bg-slate-950/50 border-slate-800 text-slate-300'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <span className="text-xl">{p.avatar}</span>
                        <div>
                          <h4 className={`text-sm font-black ${isTurn ? 'text-amber-300' : 'text-white'}`}>
                            {p.name}
                          </h4>
                          <span className="text-xs font-bold text-slate-400">
                            Position: <strong className="text-amber-400 font-mono text-sm">{p.position}</strong> / 100
                          </span>
                        </div>
                      </div>

                      <div className="text-right">
                        {isTurn ? (
                          <div className="flex flex-col items-end">
                            <span className="text-[10px] uppercase font-black px-2 py-0.5 rounded bg-amber-500 text-slate-950 shadow animate-pulse">
                              {p.is_computer ? '🤖 THINKING...' : 'YOUR TURN'}
                            </span>
                            <span className="text-[10px] text-slate-400 mt-0.5">
                              Last Roll: {p.id === activePlayer.id ? lastDice : '-'}
                            </span>
                          </div>
                        ) : (
                          <span className="text-[10px] uppercase font-bold text-slate-500 bg-slate-800/80 px-2 py-0.5 rounded">
                            WAITING
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* 14. Dice UI */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-xl flex flex-col items-center justify-center">
            <Dice3D
              value={lastDice}
              isRolling={isRolling}
              onRoll={() => handleRollDice()}
              disabled={isAnimatingMove || activePlayer.is_computer || gameOver}
            />
          </div>

          {/* 15. Game Status Panel */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 shadow-lg flex flex-col gap-1.5">
            <span className="text-[11px] font-black uppercase tracking-wider text-slate-400">
              GAME STATUS
            </span>
            <p className="text-sm font-bold text-amber-300 leading-snug">
              {statusMessage}
            </p>
          </div>
        </div>
      </main>

      {/* Move Log Drawer */}
      <MoveLogDrawer
        logs={moveLogs}
        isOpen={showLogDrawer}
        onToggle={() => setShowLogDrawer(!showLogDrawer)}
      />

      {/* Mode Selection / Start Modal */}
      {showModeModal && (
        <ModeSelectModal
          onStart={(selectedMode, playerNames) => {
            initNewGame(selectedMode, playerNames);
          }}
          onCancel={() => setShowModeModal(false)}
        />
      )}

      {/* Rules Modal */}
      {showRulesModal && (
        <RulesModal onClose={() => setShowRulesModal(false)} />
      )}

      {/* Settings Modal */}
      {showSettingsModal && (
        <SettingsModal
          rules={rules}
          onUpdateRules={setRules}
          onClose={() => setShowSettingsModal(false)}
        />
      )}

      {/* New Game Confirmation Modal */}
      {showNewGameConfirm && (
        <NewGameConfirmModal
          onConfirm={() => {
            setShowNewGameConfirm(false);
            setShowModeModal(true);
          }}
          onCancel={() => setShowNewGameConfirm(false)}
        />
      )}

      {/* Winner Celebration Modal */}
      {gameOver && winner && (
        <VictoryModal
          winner={winner}
          onPlayAgain={() => {
            initNewGame(mode);
          }}
          onMainMenu={() => {
            setShowModeModal(true);
          }}
        />
      )}
    </div>
  );
}
