/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { GameRules, MoveLog, Player, RollApiResponse, NewGameApiResponse, RoomState } from './types/game';
import { gameApi } from './utils/apiClient';
import { GameBoard } from './components/GameBoard';
import { Dice3D } from './components/Dice3D';
import { LandingPage } from './components/LandingPage';
import { RemoteRoomLobby } from './components/RemoteRoomLobby';
import { RulesModal } from './components/RulesModal';
import { SettingsModal } from './components/SettingsModal';
import { NewGameConfirmModal } from './components/NewGameConfirmModal';
import { ExitMatchModal } from './components/ExitMatchModal';
import { VictoryModal } from './components/VictoryModal';
import { MoveLogDrawer } from './components/MoveLogDrawer';
import { SharkThemeModal } from './components/SharkThemeModal';
import { SHARK_THEMES, SharkThemeId, SharkLayoutPresetId } from './utils/sharkThemes';
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
  Globe,
  Copy,
  Check,
  Share2,
  Palette,
  LogOut,
  UserMinus,
} from 'lucide-react';

const DEFAULT_RULES: GameRules = {
  exact100: true,
  extraTurnOnSix: true,
  soundEnabled: true,
  animationSpeed: 'normal',
  sharkTheme: 'great-white',
  sharkLayout: 'reef-patrol',
};

export default function App() {
  // Current View: 'landing' | 'lobby' | 'game'
  const [currentView, setCurrentView] = useState<'landing' | 'lobby' | 'game'>('landing');

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
  const [winReason, setWinReason] = useState<string | null>(null);
  const [lastDice, setLastDice] = useState<number>(1);
  const [rules, setRules] = useState<GameRules>(DEFAULT_RULES);

  // Remote online match state
  const [isRemoteMatch, setIsRemoteMatch] = useState<boolean>(false);
  const [roomCode, setRoomCode] = useState<string | null>(null);
  const [myPlayerId, setMyPlayerId] = useState<number | null>(null);
  const [isRoomHost, setIsRoomHost] = useState<boolean>(false);
  const [copiedLink, setCopiedLink] = useState<boolean>(false);
  const [showExitConfirmModal, setShowExitConfirmModal] = useState<boolean>(false);
  const lastProcessedExitTimestampRef = useRef<number>(0);

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
  const [showSharkThemeModal, setShowSharkThemeModal] = useState<boolean>(false);
  const [showNewGameConfirm, setShowNewGameConfirm] = useState<boolean>(false);
  const [showLogDrawer, setShowLogDrawer] = useState<boolean>(false);
  const [moveLogs, setMoveLogs] = useState<MoveLog[]>([]);

  // Ref tracking last move history length in remote room to animate turns
  const lastRemoteMoveCountRef = useRef<number>(0);

  const activePlayer = players.find((p) => p.id === currentPlayerId) || players[0];
  const isMyTurnInRemote = isRemoteMatch ? myPlayerId === currentPlayerId : true;
  const currentSharkTheme = SHARK_THEMES[rules.sharkTheme || 'great-white'] || SHARK_THEMES['great-white'];

  // Helper delay
  const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

  const getStepSpeedMs = useCallback(() => {
    if (rules.animationSpeed === 'fast') return 80;
    if (rules.animationSpeed === 'slow') return 250;
    return 140; // normal
  }, [rules.animationSpeed]);

  // Start local game from Landing Page (PvC or Pass & Play)
  const handleStartLocalGame = useCallback(async (
    mode: 'pvc' | 'multiplayer',
    configuredPlayers: Array<{ name: string; is_computer: boolean; avatar: string; color: string }>,
    customRules: GameRules
  ) => {
    try {
      setRules(customRules);
      setIsRemoteMatch(false);
      setRoomCode(null);
      setMyPlayerId(null);
      setIsRoomHost(false);

      const modeLabel =
        mode === 'pvc'
          ? `Player 1 vs ${configuredPlayers.length - 1} Bot${configuredPlayers.length > 2 ? 's' : ''}`
          : `${configuredPlayers.length} Players Pass & Play`;
      setActiveModeTitle(modeLabel);

      const data: NewGameApiResponse = await gameApi.newGame(
        mode,
        configuredPlayers,
        customRules.exact100,
        customRules.extraTurnOnSix,
        customRules.sharkTheme || 'great-white',
        customRules.sharkLayout || 'reef-patrol'
      );

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

  // Open remote lobby from Landing Page
  const handleOpenRemoteLobby = useCallback((code: string, playerId: number, isHost: boolean) => {
    setRoomCode(code);
    setMyPlayerId(playerId);
    setIsRoomHost(isHost);
    setIsRemoteMatch(true);
    setCurrentView('lobby');
  }, []);

  // Launch active remote match from lobby
  const handleStartRemoteMatch = useCallback(async () => {
    if (!roomCode) return;
    try {
      const data = await gameApi.getRoomState(roomCode, myPlayerId ?? undefined);
      if (data.success && data.room) {
        const room: RoomState = data.room;
        setPlayers(room.players);
        setCurrentPlayerId(room.current_player);
        setGameOver(room.game_over);
        setWinner(room.winner);
        setWinReason(room.win_reason || null);
        setRules((prev) => ({
          ...prev,
          exact100: room.rules.exact_finish,
          extraTurnOnSix: room.rules.extra_turn_on_six,
        }));
        setActiveModeTitle(`🌐 Online Room: ${room.code} (${room.players.length} Players)`);
        setMoveLogs([]);
        lastRemoteMoveCountRef.current = room.move_history.length;
        if (room.last_exit_event?.timestamp) {
          lastProcessedExitTimestampRef.current = room.last_exit_event.timestamp;
        }
        setCurrentView('game');

        const currP = room.players[room.current_player];
        if (myPlayerId === room.current_player) {
          setStatusMessage(`🎯 It's YOUR turn! Click the 3D Dice to roll.`);
        } else {
          setStatusMessage(`Waiting for ${currP?.name} to roll...`);
        }
      }
    } catch (err) {
      console.error('Error starting remote match:', err);
    }
  }, [roomCode, myPlayerId]);

  // Handle explicit player exit from an active online game
  const handleConfirmExitRemoteMatch = useCallback(async () => {
    setShowExitConfirmModal(false);
    if (!roomCode || myPlayerId === null) {
      setIsRemoteMatch(false);
      setRoomCode(null);
      setMyPlayerId(null);
      setCurrentView('landing');
      return;
    }

    try {
      await gameApi.leaveRoom(roomCode, myPlayerId);
    } catch (e) {
      console.error('Error leaving room:', e);
    }

    if (typeof window !== 'undefined' && window.history && window.history.replaceState) {
      try {
        const url = new URL(window.location.href);
        url.searchParams.delete('room');
        url.searchParams.delete('join');
        url.searchParams.delete('code');
        window.history.replaceState({}, '', url.pathname + (url.search ? url.search : ''));
      } catch (e) {}
    }

    setIsRemoteMatch(false);
    setRoomCode(null);
    setMyPlayerId(null);
    setCurrentView('landing');
  }, [roomCode, myPlayerId]);

  // Restart active game match
  const handleRestartMatch = useCallback(async () => {
    if (isRemoteMatch && roomCode && myPlayerId !== null) {
      try {
        const data = await gameApi.restartRoom(roomCode, myPlayerId);
        if (data.success && data.room) {
          setPlayers(data.room.players);
          setCurrentPlayerId(0);
          setGameOver(false);
          setWinner(null);
          setLastDice(1);
          setMoveLogs([]);
          setSteppingPlayerId(null);
          setSteppingTile(null);
          setIsRolling(false);
          setIsAnimatingMove(false);
          setActiveEventBanner(null);
          setStatusMessage(`Match restarted! ${data.room.players[0].name}'s turn.`);
        }
      } catch (err) {
        console.error('Error restarting room:', err);
      }
      return;
    }

    if (!gameId) return;
    try {
      const data = await gameApi.restartGame(gameId);
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
      setStatusMessage(`${firstPlayer?.name || 'Player 1'}'s Turn. Roll the dice to start!`);
    } catch (err) {
      console.error('Error restarting game:', err);
    }
  }, [isRemoteMatch, roomCode, myPlayerId, gameId]);

  // Execute turn animation sequence
  const executeStepAnimation = useCallback(async (
    actingPlayerId: number,
    actingPlayerName: string,
    actingPlayerAvatar: string,
    dice: number,
    oldPos: number,
    landingPos: number,
    finalPos: number,
    event: 'normal' | 'ladder' | 'snake' | 'overshoot' | 'winner',
    message: string,
    extraTurn: boolean,
    updatedPlayers: Player[],
    nextPlayerId: number,
    isGameOver: boolean,
    gameWinner: Player | null
  ) => {
    setIsAnimatingMove(true);
    setSteppingPlayerId(actingPlayerId);

    // 1. Progressive step-by-step movement animation
    if (event !== 'overshoot') {
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
      setStatusMessage(`${actingPlayerName} rolled a ${dice}. You need an exact roll to reach 100.`);
      await delay(900);
    }

    // 2. Ladder Climb Animation
    if (event === 'ladder') {
      await delay(300);
      sound.playLadderClimb();
      const ladderEmoji = currentSharkTheme.ladderEmoji;
      const ladderName = currentSharkTheme.ladderName;
      setActiveEventBanner({
        text: `${ladderEmoji} ${ladderName}! Climbed from ${landingPos} to ${finalPos}!`,
        type: 'ladder',
      });
      setStatusMessage(`${ladderEmoji} ${ladderName}! ${actingPlayerName} climbed from ${landingPos} to ${finalPos}.`);
      setSteppingTile(finalPos);
      await delay(800);
    }

    // 3. Snake / Shark Slide Animation
    if (event === 'snake') {
      await delay(300);
      if (rules.sharkTheme === 'classic-snake') {
        sound.playSnakeSlide();
      } else {
        sound.playSharkChomp(rules.sharkTheme);
      }
      const hazardEmoji = currentSharkTheme.hazardEmoji;
      const hazardName = currentSharkTheme.hazardName;
      setActiveEventBanner({
        text: `${hazardEmoji} ${hazardName} Attack! Slid down from ${landingPos} to ${finalPos}!`,
        type: 'snake',
      });
      setStatusMessage(`${hazardEmoji} ${hazardName}! ${actingPlayerName} was chomped and dragged from ${landingPos} to ${finalPos}.`);
      setSteppingTile(finalPos);
      await delay(800);
    }

    // 4. Update player list with server state
    setPlayers(updatedPlayers);
    setSteppingPlayerId(null);
    setSteppingTile(null);
    setIsAnimatingMove(false);

    // Add to move logs
    const newLog: MoveLog = {
      id: `log_${Date.now()}_${Math.random()}`,
      playerId: actingPlayerId,
      playerName: actingPlayerName,
      playerAvatar: actingPlayerAvatar,
      dice,
      oldPosition: oldPos,
      landingPosition: landingPos,
      finalPosition: finalPos,
      event,
      message,
      extraTurn,
    };
    setMoveLogs((prev) => [...prev, newLog]);

    // 5. Check Game Over / Winner
    if (isGameOver && gameWinner) {
      sound.playWinFanfare();
      setGameOver(true);
      setWinner(gameWinner);
      setActiveEventBanner({ text: `🏆 ${gameWinner.name} Wins!`, type: 'winner' });
      setStatusMessage(`🏆 ${gameWinner.name} Wins! Congratulations!`);
      return;
    }

    // 6. Extra turn or next turn
    if (extraTurn) {
      sound.playPowerup();
      setActiveEventBanner({ text: `🌟 Rolled a 6! ${actingPlayerName} gets another turn!`, type: 'six' });
      setStatusMessage(`🌟 ${actingPlayerName} rolled a 6 and gets an extra turn!`);
      await delay(1000);
      setActiveEventBanner(null);
    } else {
      setCurrentPlayerId(nextPlayerId);
      const nextP = updatedPlayers.find((p) => p.id === nextPlayerId);
      if (isRemoteMatch) {
        if (myPlayerId === nextPlayerId) {
          setStatusMessage(`🎯 It's YOUR turn! Click the 3D Dice to roll.`);
        } else {
          setStatusMessage(`Waiting for ${nextP?.name} to roll...`);
        }
      } else {
        setStatusMessage(`${nextP?.name}'s Turn.`);
      }
      setActiveEventBanner(null);
    }
  }, [getStepSpeedMs, isRemoteMatch, myPlayerId]);

  // Handle rolling dice turn
  const handleRollDice = useCallback(async (forcedPlayerId?: number) => {
    if (isRolling || isAnimatingMove || gameOver) return;

    if (isRemoteMatch) {
      if (!roomCode || myPlayerId === null || myPlayerId !== currentPlayerId) return;
    } else {
      if (!gameId) return;
    }

    const actingPlayerId = forcedPlayerId !== undefined ? forcedPlayerId : currentPlayerId;
    const actingPlayer = players.find((p) => p.id === actingPlayerId) || activePlayer;

    setIsRolling(true);
    sound.playDiceRoll();
    setStatusMessage(`${actingPlayer.name} is rolling the dice...`);

    await delay(700);

    try {
      if (isRemoteMatch && roomCode && myPlayerId !== null) {
        const data: RollApiResponse = await gameApi.rollRoomDice(roomCode, myPlayerId);
        if (!data.success) {
          setIsRolling(false);
          if (data.error) setStatusMessage(data.error);
          return;
        }

        setLastDice(data.dice);
        setIsRolling(false);

        if (data.room && data.room.move_history) {
          lastRemoteMoveCountRef.current = data.room.move_history.length;
        }

        await executeStepAnimation(
          data.player_id,
          data.player_name,
          actingPlayer.avatar,
          data.dice,
          data.old_position,
          data.landing_position,
          data.final_position,
          data.event,
          data.message,
          data.extra_turn,
          data.players,
          data.next_player,
          data.game_over,
          data.winner
        );
      } else if (gameId) {
        const data: RollApiResponse = await gameApi.rollDice(gameId, actingPlayerId);
        if (!data.success) {
          setIsRolling(false);
          if (data.error) setStatusMessage(data.error);
          return;
        }

        setLastDice(data.dice);
        setIsRolling(false);

        await executeStepAnimation(
          data.player_id,
          data.player_name,
          actingPlayer.avatar,
          data.dice,
          data.old_position,
          data.landing_position,
          data.final_position,
          data.event,
          data.message,
          data.extra_turn,
          data.players,
          data.next_player,
          data.game_over,
          data.winner
        );
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
    isRemoteMatch,
    roomCode,
    myPlayerId,
    currentPlayerId,
    gameId,
    players,
    activePlayer,
    executeStepAnimation,
  ]);

  // Polling for Online Remote Room updates during active game
  useEffect(() => {
    if (currentView !== 'game' || !isRemoteMatch || !roomCode || isAnimatingMove || isRolling) return;

    let isMounted = true;
    const interval = setInterval(async () => {
      try {
        const data = await gameApi.getRoomState(roomCode, myPlayerId ?? undefined);
        if (!isMounted || !data.success || !data.room) return;

        const room: RoomState = data.room;

        // 1. Check for player exit events (2-player surrender win, 3/4-player remove pawn and continue)
        if (room.last_exit_event && room.last_exit_event.timestamp > lastProcessedExitTimestampRef.current) {
          lastProcessedExitTimestampRef.current = room.last_exit_event.timestamp;
          const exitEvt = room.last_exit_event;

          // Sound effect
          sound.playSnakeSlide();

          // If the exit resulted in an end of game (e.g. 2-player mode where other player left)
          if (room.game_over && room.winner) {
            setPlayers(room.players);
            setGameOver(true);
            setWinner(room.winner);
            const winMsg = room.win_reason || exitEvt.message;
            setWinReason(winMsg);
            setStatusMessage(`🏆 ${winMsg}`);
            setActiveEventBanner({
              text: `👑 ${winMsg}`,
              type: 'winner',
            });
            return;
          } else {
            // 3-player or 4-player game where 1 player exited and match continues
            setPlayers(room.players);
            setCurrentPlayerId(room.current_player);
            setActiveModeTitle(`🌐 Online Room: ${room.code} (${room.players.length} Players)`);
            setStatusMessage(exitEvt.message);
            setActiveEventBanner({
              text: `👋 ${exitEvt.message}`,
              type: 'snake',
            });
            setTimeout(() => {
              setActiveEventBanner(null);
            }, 5000);
          }
        }

        // Check if a remote opponent rolled and there are new moves to animate
        const historyLen = room.move_history?.length || 0;
        if (historyLen > lastRemoteMoveCountRef.current) {
          const latestMove = room.move_history[historyLen - 1];
          lastRemoteMoveCountRef.current = historyLen;

          // If the move was performed by another player, trigger the roll animation & stepping!
          if (latestMove.player_id !== myPlayerId) {
            setLastDice(latestMove.dice);
            setIsRolling(true);
            sound.playDiceRoll();
            setStatusMessage(`${latestMove.player_name} is rolling the dice...`);
            await delay(700);
            setIsRolling(false);

            const pAvatar = room.players.find((p) => p.id === latestMove.player_id)?.avatar || '🔴';
            await executeStepAnimation(
              latestMove.player_id,
              latestMove.player_name,
              pAvatar,
              latestMove.dice,
              latestMove.old_position,
              latestMove.landing_position,
              latestMove.final_position,
              latestMove.event,
              latestMove.message,
              latestMove.extra_turn,
              room.players,
              room.current_player,
              room.game_over,
              room.winner
            );
          }
        } else if (!isAnimatingMove && !isRolling) {
          // Sync basic state if no animation active
          setPlayers(room.players);
          setCurrentPlayerId(room.current_player);
          setGameOver(room.game_over);
          setWinner(room.winner);
          if (room.win_reason) {
            setWinReason(room.win_reason);
          }

          const currP = room.players[room.current_player];
          if (myPlayerId === room.current_player && !room.game_over) {
            setStatusMessage(`🎯 It's YOUR turn! Click the 3D Dice to roll.`);
          } else if (!room.game_over) {
            setStatusMessage(`Waiting for ${currP?.name} to roll...`);
          }
        }
      } catch (err) {
        console.error('Remote sync error:', err);
      }
    }, 1000);

    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, [currentView, isRemoteMatch, roomCode, myPlayerId, isAnimatingMove, isRolling, executeStepAnimation]);

  // AI Computer Turn Effect (for local PvC)
  useEffect(() => {
    if (currentView !== 'game' || isRemoteMatch || gameOver || isRolling || isAnimatingMove || showNewGameConfirm) return;

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
    isRemoteMatch,
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

  const handleCopyInviteLink = () => {
    sound.playClick();
    const link = typeof window !== 'undefined' ? `${window.location.origin}/?room=${roomCode}` : `?room=${roomCode}`;
    if (navigator.clipboard) {
      navigator.clipboard.writeText(link);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
    }
  };

  // If on Landing Page, render LandingPage component
  if (currentView === 'landing') {
    return (
      <LandingPage
        onStartGame={handleStartLocalGame}
        onOpenRemoteLobby={handleOpenRemoteLobby}
        initialRules={rules}
        onUpdateRules={setRules}
      />
    );
  }

  // If in Remote Room Lobby, render RemoteRoomLobby
  if (currentView === 'lobby' && roomCode && myPlayerId !== null) {
    return (
      <RemoteRoomLobby
        roomCode={roomCode}
        playerId={myPlayerId}
        isHost={isRoomHost}
        onStartMatch={handleStartRemoteMatch}
        onRegenerateCode={(newCode) => setRoomCode(newCode)}
        onLeaveRoom={() => {
          setIsRemoteMatch(false);
          setRoomCode(null);
          setMyPlayerId(null);
          setCurrentView('landing');
        }}
      />
    );
  }

  // Active Game Board Arena Screen
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between selection:bg-amber-500 selection:text-slate-950">
      {/* Top Game Navigation Header */}
      <header className="w-full max-w-6xl mx-auto px-3 sm:px-4 py-2.5 sm:py-3 flex flex-wrap items-center justify-between gap-2.5 sm:gap-3 border-b border-slate-800/80 bg-slate-950/90 backdrop-blur-md sticky top-0 z-30">
        {/* Brand & Mode Tag */}
        <div className="flex items-center gap-2.5 sm:gap-3">
          <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-br from-amber-400 to-yellow-600 flex items-center justify-center text-lg sm:text-xl shadow-lg shadow-amber-500/20 border border-amber-300 shrink-0">
            🐍
          </div>
          <div>
            <h1 className="text-sm sm:text-base md:text-lg font-black tracking-tight text-white flex items-center gap-1.5 leading-tight">
              SNAKE & LADDER
            </h1>
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="text-[9px] sm:text-[10px] text-amber-400 font-bold uppercase tracking-wider block truncate max-w-[140px] xs:max-w-[180px] sm:max-w-none">
                {activeModeTitle}
              </span>
              {isRemoteMatch && (
                <button
                  onClick={handleCopyInviteLink}
                  className="text-[9px] font-black uppercase px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 hover:bg-emerald-500 hover:text-slate-950 transition-colors flex items-center gap-1 cursor-pointer"
                  title="Click to copy invite link"
                >
                  {copiedLink ? <Check className="w-2.5 h-2.5" /> : <Copy className="w-2.5 h-2.5" />}
                  <span>{copiedLink ? 'COPIED!' : `ROOM: ${roomCode}`}</span>
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          {/* Online Match Exit Button */}
          {isRemoteMatch && (
            <button
              onClick={() => {
                sound.playClick();
                setShowExitConfirmModal(true);
              }}
              className="px-2.5 sm:px-3 py-1.5 sm:py-2 rounded-xl bg-rose-950/80 border border-rose-700/80 hover:bg-rose-900 text-rose-200 hover:text-white text-xs font-black transition-colors cursor-pointer flex items-center gap-1.5 shadow-sm"
              title="Exit Online Match"
            >
              <LogOut className="w-3.5 h-3.5 text-rose-400 shrink-0" />
              <span className="hidden sm:inline">Exit Match</span>
            </button>
          )}

          {/* Return to Main Menu / Landing Page */}
          <button
            onClick={() => {
              sound.playClick();
              if (isRemoteMatch) {
                setShowExitConfirmModal(true);
                return;
              }
              setCurrentView('landing');
            }}
            className="px-2.5 sm:px-3 py-1.5 sm:py-2 rounded-xl bg-slate-900 border border-slate-700 hover:border-amber-400 text-slate-200 hover:text-white text-xs font-bold transition-colors cursor-pointer flex items-center gap-1.5"
            title="Main Menu"
          >
            <Home className="w-3.5 h-3.5 text-amber-400 shrink-0" />
            <span className="hidden sm:inline">Main Menu</span>
          </button>

          {/* Restart Current Game */}
          <button
            onClick={() => {
              sound.playClick();
              setShowNewGameConfirm(true);
            }}
            className="p-1.5 sm:p-2 rounded-xl bg-slate-900 border border-slate-700 hover:border-amber-400 text-slate-300 hover:text-white transition-colors cursor-pointer"
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
            className="p-1.5 sm:p-2 rounded-xl bg-slate-900 border border-slate-700 hover:border-amber-400 text-slate-300 hover:text-white transition-colors cursor-pointer"
            title="Game Rules"
          >
            <BookOpen className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-amber-400" />
          </button>

          {/* Shark Themes Modal */}
          <button
            onClick={() => {
              sound.playClick();
              setShowSharkThemeModal(true);
            }}
            className="p-1.5 sm:p-2 rounded-xl bg-slate-900 border border-slate-700 hover:border-cyan-400 text-slate-300 hover:text-white transition-colors cursor-pointer flex items-center gap-1.5 shadow-sm"
            title="Shark Board Themes & Layouts"
          >
            <Palette className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-cyan-400" />
            <span className="hidden md:inline text-[11px] font-black text-cyan-300">
              {currentSharkTheme.icon} {currentSharkTheme.name.split(' ')[0]}
            </span>
          </button>

          {/* Settings Modal */}
          <button
            onClick={() => {
              sound.playClick();
              setShowSettingsModal(true);
            }}
            className="p-1.5 sm:p-2 rounded-xl bg-slate-900 border border-slate-700 hover:border-amber-400 text-slate-300 hover:text-white transition-colors cursor-pointer"
            title="Game Settings"
          >
            <SettingsIcon className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-sky-400" />
          </button>

          {/* Sound Toggle */}
          <button
            onClick={toggleSound}
            className="p-1.5 sm:p-2 rounded-xl bg-slate-900 border border-slate-700 hover:border-amber-400 text-slate-300 hover:text-white transition-colors cursor-pointer"
            title={rules.soundEnabled ? 'Mute Audio' : 'Unmute Audio'}
          >
            {rules.soundEnabled ? (
              <Volume2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-emerald-400" />
            ) : (
              <VolumeX className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-rose-400" />
            )}
          </button>

          {/* Game Log Drawer */}
          <button
            onClick={() => {
              sound.playClick();
              setShowLogDrawer(!showLogDrawer);
            }}
            className="relative p-1.5 sm:p-2 rounded-xl bg-slate-900 border border-slate-700 hover:border-amber-400 text-slate-300 hover:text-white transition-colors cursor-pointer"
            title="Move History Log"
          >
            <History className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-purple-400" />
            {moveLogs.length > 0 && (
              <span className="absolute -top-1 -right-1 bg-amber-500 text-slate-950 text-[9px] font-black rounded-full w-4 h-4 flex items-center justify-center">
                {moveLogs.length}
              </span>
            )}
          </button>
        </div>
      </header>

      {/* Main Game Layout (Responsive across Mobile, Tablet, and Desktop) */}
      <main className="w-full max-w-6xl mx-auto px-2 xs:px-3 sm:px-4 py-2 sm:py-4 flex-1 flex flex-col lg:flex-row items-center justify-center gap-4 lg:gap-8">
        {/* Left Column: Game Board Arena */}
        <div className="w-full lg:w-7/12 flex flex-col items-center justify-center max-w-[min(100%,560px)]">
          {/* Active Action / Notification Banner */}
          <div className="h-7 sm:h-8 mb-1.5 sm:mb-2 flex items-center justify-center w-full">
            {activeEventBanner ? (
              <div
                className={`px-3 sm:px-4 py-0.5 sm:py-1 rounded-full text-[11px] sm:text-xs font-black tracking-wide shadow-lg border animate-bounce ${
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
              <span className="text-[11px] sm:text-xs text-slate-400 font-medium text-center">
                Reach square <strong className="text-amber-400">100</strong> to conquer the arena!
              </span>
            )}
          </div>

          <GameBoard
            players={players}
            currentPlayerId={currentPlayerId}
            steppingPlayerId={steppingPlayerId}
            steppingTile={steppingTile}
            sharkThemeId={rules.sharkTheme || 'great-white'}
            sharkLayoutId={rules.sharkLayout || 'reef-patrol'}
            onChangeTheme={(themeId) => {
              setRules((prev) => ({ ...prev, sharkTheme: themeId }));
            }}
            onChangeLayout={(layoutId) => {
              setRules((prev) => ({ ...prev, sharkLayout: layoutId }));
            }}
            onOpenThemeModal={() => setShowSharkThemeModal(true)}
          />
        </div>

        {/* Right Column: Player Dashboard & Dice Roller */}
        <div className="w-full lg:w-5/12 flex flex-col gap-3 sm:gap-4 max-w-md">
          {/* Player Standings & Active Turn Glow */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-3.5 sm:p-4 shadow-xl flex flex-col gap-2.5 sm:gap-3">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                <Trophy className="w-3.5 h-3.5 text-amber-400" /> Contenders
              </span>
              <div className="flex items-center gap-2">
                {isRemoteMatch && myPlayerId !== null && (
                  <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded bg-sky-500/20 text-sky-300 border border-sky-500/30">
                    YOU: {players.find((p) => p.id === myPlayerId)?.name}
                  </span>
                )}
                <span className="text-[11px] font-mono text-slate-400 font-bold">
                  {players.length} Players
                </span>
              </div>
            </div>

            {/* List of Players */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-2">
              {players.map((p) => {
                const isTurn = p.id === currentPlayerId;
                const isMe = isRemoteMatch && p.id === myPlayerId;

                return (
                  <div
                    key={p.id}
                    className={`p-2.5 sm:p-3 rounded-xl border transition-all ${
                      isTurn
                        ? 'bg-slate-800/90 border-amber-500 ring-2 ring-amber-400/40 shadow-md'
                        : isMe
                        ? 'bg-slate-900/90 border-sky-500/40 text-slate-200'
                        : 'bg-slate-950/50 border-slate-800 text-slate-300'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 sm:gap-2.5">
                        <span className="text-lg sm:text-xl">{p.avatar}</span>
                        <div>
                          <h4 className={`text-xs sm:text-sm font-black flex items-center gap-1.5 ${isTurn ? 'text-amber-300' : 'text-white'}`}>
                            <span className="truncate max-w-[100px] sm:max-w-[130px]">{p.name}</span>
                            {isMe && (
                              <span className="text-[8px] uppercase px-1.5 py-0.2 rounded bg-sky-500 text-slate-950 font-black">
                                YOU
                              </span>
                            )}
                          </h4>
                          <span className="text-[11px] font-bold text-slate-400">
                            Square: <strong className="text-amber-400 font-mono text-xs sm:text-sm">{p.position}</strong> / 100
                          </span>
                        </div>
                      </div>

                      <div className="text-right">
                        {isTurn ? (
                          <div className="flex flex-col items-end">
                            <span className="text-[9px] uppercase font-black px-1.5 py-0.5 rounded bg-amber-500 text-slate-950 shadow animate-pulse">
                              {p.is_computer ? '🤖 THINKING' : isMe ? 'YOUR TURN' : 'ROLLING'}
                            </span>
                            <span className="text-[9px] text-slate-400 mt-0.5">
                              Roll: {p.id === activePlayer.id ? lastDice : '-'}
                            </span>
                          </div>
                        ) : (
                          <span className="text-[9px] uppercase font-bold text-slate-500 bg-slate-800/80 px-1.5 py-0.5 rounded">
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
          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-3.5 sm:p-4 shadow-xl flex flex-col items-center justify-center">
            <Dice3D
              value={lastDice}
              isRolling={isRolling}
              onRoll={() => handleRollDice()}
              disabled={
                isAnimatingMove ||
                (activePlayer.is_computer && !isRemoteMatch) ||
                (isRemoteMatch && !isMyTurnInRemote) ||
                gameOver
              }
            />
          </div>

          {/* Game Status Log Box */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-3 sm:p-3.5 shadow-lg flex flex-col gap-1">
            <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">
              GAME STATUS
            </span>
            <p className="text-xs sm:text-sm font-bold text-amber-300 leading-snug">
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

      {/* Shark Themes & Layouts Modal */}
      {showSharkThemeModal && (
        <SharkThemeModal
          currentThemeId={rules.sharkTheme || 'great-white'}
          currentLayoutId={rules.sharkLayout || 'reef-patrol'}
          onSelectTheme={(themeId) => {
            setRules((prev) => ({ ...prev, sharkTheme: themeId }));
          }}
          onSelectLayout={(layoutId) => {
            setRules((prev) => ({ ...prev, sharkLayout: layoutId }));
          }}
          onClose={() => setShowSharkThemeModal(false)}
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

      {/* Exit Online Match Confirm Modal */}
      {showExitConfirmModal && (
        <ExitMatchModal
          totalPlayers={players.length}
          onConfirm={handleConfirmExitRemoteMatch}
          onCancel={() => setShowExitConfirmModal(false)}
        />
      )}

      {/* Victory Celebration Modal */}
      {gameOver && winner && (
        <VictoryModal
          winner={winner}
          winReason={winReason}
          onPlayAgain={() => {
            handleRestartMatch();
          }}
          onMainMenu={() => {
            if (isRemoteMatch) {
              setIsRemoteMatch(false);
              setRoomCode(null);
              setMyPlayerId(null);
            }
            setCurrentView('landing');
          }}
        />
      )}
    </div>
  );
}
