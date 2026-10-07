/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useCallback } from 'react';
import { GameRules, MoveLog, Player, RollApiResponse, NewGameApiResponse } from './types/game';
import { GameBoard } from './components/GameBoard';
import { Dice3D } from './components/Dice3D';
import { LandingPage } from './components/LandingPage';
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
  Home,
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
  // Current View: 'landing' or 'game'
  const [currentView, setCurrentView] = useState<'landing' | 'game'>('landing');

  // Game session & state
  const [gameId, setGameId] = useState<string | null>(null);
  const [activeModeTitle, setActiveModeTitle] = useState<string>('Player vs Computer');
  const [players, setPlayers] = useState<Player[]>([
    { id: 0, name: 'Player 1', position: 0, is_computer: false, color: 'red', avatar: '🔴' },
    { id: 1, name: 'Bot Nova', position: 0, is_computer: true, color: 'blue', avatar: '🔵' },
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

  // Start game from Landing Page
  const handleStartFromLanding = useCallback(async (
    mode: 'pvc' | 'multiplayer',
    configuredPlayers: Array<{ name: string; is_computer: boolean; avatar: string; color: string }>,
    customRules: GameRules
  ) => {
    try {
      setRules(customRules);
      const modeLabel =
        mode === 'pvc'
          ? `Player 1 vs ${configuredPlayers.length - 1} Bot${configuredPlayers.length > 2 ? 's' : ''}`
          : `${configuredPlayers.length} Players Pass & Play`;
      setActiveModeTitle(modeLabel);

      const res = await fetch('/api/game/new', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mode,
          players: configuredPlayers,
          exact_finish: customRules.exact100,
          extra_turn_on_six: customRules.extraTurnOnSix,
        }),
      });

      if (!res.ok) throw new Error('Failed to create new game');

      const data: NewGameApiResponse = await res.json();
      setGameId(data.game_id);
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
      setCurrentView('game');
    } catch (err) {
      console.error('Error starting game:', err);
    }
  }, []);

  // Restart active game match
  const handleRestartMatch = useCallback(async () => {
    if (!gameId) return;
    try {
      const res = await fetch('/api/game/restart', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ game_id: gameId }),
      });

      if (!res.ok) throw new Error('Failed to restart game');
      const data = await res.json();

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
    } catch (err) {
      console.error('Error restarting game:', err);
    }
  }, [gameId]);

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

  // AI Computer Turn Effect
  useEffect(() => {
    if (currentView !== 'game' || gameOver || isRolling || isAnimatingMove || showNewGameConfirm) return;

    if (activePlayer && activePlayer.is_computer) {
      setComputerThinking(true);
      setStatusMessage(`🤖 ${activePlayer.name} is thinking...`);

      const timer = setTimeout(() => {
        setComputerThinking(false);
        handleRollDice(activePlayer.id);
      }, 1000);

      return () => clearTimeout(timer);
    } else {
      setComputerThinking(false);
    }
  }, [
    currentView,
    currentPlayerId,
    activePlayer,
    gameOver,
    isRolling,
    isAnimatingMove,
    showNewGameConfirm,
    handleRollDice,
  ]);

  const toggleSound = () => {
    const next = !rules.soundEnabled;
    sound.enabled = next;
    if (next) sound.playClick();
    setRules((prev) => ({ ...prev, soundEnabled: next }));
  };

  // If on Landing Page, render LandingPage component
  if (currentView === 'landing') {
    return (
      <LandingPage
        onStartGame={handleStartFromLanding}
        initialRules={rules}
        onUpdateRules={setRules}
      />
    );
  }

  // Active Game Board Arena Screen
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between selection:bg-amber-500 selection:text-slate-950">
      {/* Top Game Navigation Header */}
      <header className="w-full max-w-6xl mx-auto px-4 py-3 flex flex-wrap items-center justify-between gap-3 border-b border-slate-800/80 bg-slate-950/90 backdrop-blur-md sticky top-0 z-30">
        {/* Brand & Mode Tag */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-400 to-yellow-600 flex items-center justify-center text-xl shadow-lg shadow-amber-500/20 border border-amber-300">
            🐍
          </div>
          <div>
            <h1 className="text-base sm:text-lg font-black tracking-tight text-white flex items-center gap-1.5">
              SNAKE & LADDER
            </h1>
            <span className="text-[10px] text-amber-400 font-bold uppercase tracking-wider block">
              {activeModeTitle}
            </span>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2">
          {/* Return to Main Menu / Landing Page */}
          <button
            onClick={() => {
              sound.playClick();
              setCurrentView('landing');
            }}
            className="px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 hover:border-amber-400 text-slate-200 hover:text-white text-xs font-bold transition-colors cursor-pointer flex items-center gap-1.5"
            title="Main Menu"
          >
            <Home className="w-3.5 h-3.5 text-amber-400" />
            <span className="hidden sm:inline">Main Menu</span>
          </button>

          {/* Restart Current Game */}
          <button
            onClick={() => {
              sound.playClick();
              setShowNewGameConfirm(true);
            }}
            className="p-2 rounded-xl bg-slate-900 border border-slate-700 hover:border-amber-400 text-slate-300 hover:text-white transition-colors cursor-pointer"
            title="Restart Match"
          >
            <RotateCcw className="w-3.5 h-3.5 text-rose-400" />
          </button>

          {/* Rules Modal */}
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

          {/* Settings Modal */}
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
            title={rules.soundEnabled ? 'Mute Audio' : 'Unmute Audio'}
          >
            {rules.soundEnabled ? (
              <Volume2 className="w-4 h-4 text-emerald-400" />
            ) : (
              <VolumeX className="w-4 h-4 text-rose-400" />
            )}
          </button>

          {/* Game Log Drawer */}
          <button
            onClick={() => {
              sound.playClick();
              setShowLogDrawer(!showLogDrawer);
            }}
            className="relative p-2 rounded-xl bg-slate-900 border border-slate-700 hover:border-amber-400 text-slate-300 hover:text-white transition-colors cursor-pointer"
            title="Move History Log"
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

      {/* Main Game Layout */}
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
                Reach square <strong className="text-amber-400">100</strong> to conquer the arena!
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

        {/* Right Column: Player Dashboard & Dice Roller */}
        <div className="w-full lg:w-2/5 flex flex-col gap-4 max-w-md">
          {/* Player Standings & Active Turn Glow */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-xl flex flex-col gap-3">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                <Trophy className="w-3.5 h-3.5 text-amber-400" /> Player Contenders
              </span>
              <span className="text-[11px] font-mono text-slate-400 font-bold">
                {players.length} Players
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

          {/* Interactive 3D Dice Component */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-xl flex flex-col items-center justify-center">
            <Dice3D
              value={lastDice}
              isRolling={isRolling}
              onRoll={() => handleRollDice()}
              disabled={isAnimatingMove || activePlayer.is_computer || gameOver}
            />
          </div>

          {/* Game Status Log Box */}
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

      {/* Restart / New Game Confirm Modal */}
      {showNewGameConfirm && (
        <NewGameConfirmModal
          onConfirm={() => {
            setShowNewGameConfirm(false);
            handleRestartMatch();
          }}
          onCancel={() => setShowNewGameConfirm(false)}
        />
      )}

      {/* Victory Celebration Modal */}
      {gameOver && winner && (
        <VictoryModal
          winner={winner}
          onPlayAgain={() => {
            handleRestartMatch();
          }}
          onMainMenu={() => {
            setCurrentView('landing');
          }}
        />
      )}
    </div>
  );
}
