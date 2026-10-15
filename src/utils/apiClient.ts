/**
 * Unified API Client with Automatic Client-side Fallback
 * Ensures 100% functionality on Netlify static hosting, serverless, or full-stack Node.
 */

import { GameMode, GameRules, Player, RollApiResponse, NewGameApiResponse, RoomState } from '../types/game';
import { SNAKES_PRD, LADDERS_PRD } from './boardPresets';

const COLOR_MAP = [
  { color: 'red', avatar: '🔴' },
  { color: 'blue', avatar: '🔵' },
  { color: 'green', avatar: '🟢' },
  { color: 'yellow', avatar: '🟡' },
];

interface LocalGameSession {
  game_id: string;
  mode: GameMode;
  players: Player[];
  current_player: number;
  game_over: boolean;
  winner: Player | null;
  last_dice: number | null;
  rules: {
    board_size: number;
    exact_finish: boolean;
    extra_turn_on_six: boolean;
  };
  move_history: any[];
}

// In-memory / storage stores for static Netlify hosting
const localGames = new Map<string, LocalGameSession>();
const localRooms = new Map<string, RoomState>();

function saveLocalGame(session: LocalGameSession): void {
  localGames.set(session.game_id, session);
  if (typeof window !== 'undefined' && typeof localStorage !== 'undefined') {
    try {
      localStorage.setItem(`snakes_game_${session.game_id}`, JSON.stringify(session));
    } catch (e) {}
  }
}

function getLocalGame(gameId: string): LocalGameSession | null {
  let session = localGames.get(gameId);
  if (!session && typeof window !== 'undefined' && typeof localStorage !== 'undefined') {
    try {
      const raw = localStorage.getItem(`snakes_game_${gameId}`);
      if (raw) {
        session = JSON.parse(raw);
        if (session) {
          localGames.set(gameId, session);
        }
      }
    } catch (e) {}
  }
  return session || null;
}

// BroadcastChannel for cross-tab multiplayer simulation on same device/browser on static hosts
let broadcastChannel: BroadcastChannel | null = null;
if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
  try {
    broadcastChannel = new BroadcastChannel('snakes_and_ladders_sync');
    broadcastChannel.onmessage = (event) => {
      if (event.data?.type === 'ROOM_SYNC' && event.data.room?.code) {
        localRooms.set(event.data.room.code.toUpperCase(), event.data.room);
      }
    };
  } catch (e) {
    // Ignore fallback
  }
}

// Cloud Relay for cross-device multiplayer on static Netlify deployments
const CLOUD_RELAY_TOPIC_PREFIX = 'sl_arenasync_';

function syncLocalRoom(room: RoomState) {
  const code = room.code.toUpperCase();
  localRooms.set(code, room);
  if (typeof localStorage !== 'undefined') {
    try {
      localStorage.setItem(`snakes_room_${code}`, JSON.stringify(room));
    } catch (e) {}
  }
  if (broadcastChannel) {
    try {
      broadcastChannel.postMessage({ type: 'ROOM_SYNC', room });
    } catch (e) {}
  }
}

async function relayPublishRoom(room: RoomState): Promise<void> {
  syncLocalRoom(room);
  try {
    const topic = `${CLOUD_RELAY_TOPIC_PREFIX}${room.code.toUpperCase()}`;
    await fetch(`https://ntfy.sh/${topic}`, {
      method: 'POST',
      headers: {
        Title: 'room_sync',
        Priority: 'urgent',
      },
      body: JSON.stringify(room),
    });
  } catch (e) {
    // Relay publish non-blocking fallback
  }
}

async function relayFetchRoom(code: string): Promise<RoomState | null> {
  const cleanCode = code.trim().toUpperCase();
  let localFound = localRooms.get(cleanCode);
  if (!localFound && typeof localStorage !== 'undefined') {
    try {
      const stored = localStorage.getItem(`snakes_room_${cleanCode}`);
      if (stored) localFound = JSON.parse(stored);
    } catch (e) {}
  }

  try {
    const topic = `${CLOUD_RELAY_TOPIC_PREFIX}${cleanCode}`;
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 2600);
    const res = await fetch(`https://ntfy.sh/${topic}/json?poll=1`, {
      signal: controller.signal,
    });
    clearTimeout(timeoutId);

    if (res.ok) {
      const text = await res.text();
      const lines = text.trim().split('\n').filter(Boolean);
      for (let i = lines.length - 1; i >= 0; i--) {
        try {
          const lineObj = JSON.parse(lines[i]);
          if (lineObj && lineObj.message) {
            const parsedRoom = JSON.parse(lineObj.message);
            if (parsedRoom && parsedRoom.code && Array.isArray(parsedRoom.players)) {
              if (
                !localFound ||
                (parsedRoom.last_updated && parsedRoom.last_updated >= (localFound.last_updated || 0))
              ) {
                syncLocalRoom(parsedRoom);
                return parsedRoom as RoomState;
              }
            }
          }
        } catch (e) {}
      }
    }
  } catch (e) {
    // Network or abort timeout
  }

  return localFound || null;
}

function generateRoomCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = '';
  for (let i = 0; i < 5; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

// Helper to check if server responded with valid JSON
async function tryFetchJson(url: string, options?: RequestInit): Promise<{ ok: boolean; hasServer: boolean; data?: any }> {
  try {
    const res = await fetch(url, options);
    const contentType = res.headers.get('content-type') || '';
    if (contentType.includes('application/json')) {
      const data = await res.json();
      return { ok: res.ok, hasServer: true, data };
    }
  } catch (err) {
    // Network or server unreachable -> use fallback
  }
  return { ok: false, hasServer: false };
}

export const gameApi = {
  // 1. Create New Local Game
  async newGame(
    mode: 'pvc' | 'multiplayer',
    playersList: Array<{ name: string; is_computer: boolean; avatar: string; color: string }>,
    exactFinish: boolean = true,
    extraTurnOnSix: boolean = true,
    sharkTheme: string = 'great-white',
    sharkLayout: string = 'reef-patrol'
  ): Promise<NewGameApiResponse> {
    const serverAttempt = await tryFetchJson('/api/game/new', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        mode,
        players: playersList,
        exact_finish: exactFinish,
        extra_turn_on_six: extraTurnOnSix,
        shark_theme: sharkTheme,
        shark_layout: sharkLayout,
      }),
    });

    if (serverAttempt.ok && serverAttempt.data) {
      return serverAttempt.data;
    }

    // Static Netlify Fallback
    const gameId = `game_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
    const players: Player[] = playersList.map((p, i) => ({
      id: i,
      name: p.name || (p.is_computer ? `Computer ${i}` : `Player ${i + 1}`),
      position: 0,
      is_computer: Boolean(p.is_computer),
      color: p.color || COLOR_MAP[i % COLOR_MAP.length].color,
      avatar: p.avatar || COLOR_MAP[i % COLOR_MAP.length].avatar,
    }));

    const session: LocalGameSession = {
      game_id: gameId,
      mode,
      players,
      current_player: 0,
      game_over: false,
      winner: null,
      last_dice: null,
      rules: {
        board_size: 100,
        exact_finish: exactFinish,
        extra_turn_on_six: extraTurnOnSix,
      },
      move_history: [],
    };

    saveLocalGame(session);

    return {
      success: true,
      game_id: gameId,
      current_player: 0,
      state: session,
    };
  },

  // 2. Roll Dice for Game
  async rollDice(gameId: string, playerId: number, fixedDice?: number): Promise<RollApiResponse> {
    const serverAttempt = await tryFetchJson('/api/game/roll', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        game_id: gameId,
        player_id: playerId,
        fixed_dice: fixedDice,
      }),
    });

    if (serverAttempt.ok && serverAttempt.data) {
      return serverAttempt.data;
    }

    // Static Netlify Fallback
    const session = getLocalGame(gameId);
    if (!session) {
      return {
        success: false,
        dice: 1,
        player_id: playerId,
        player_name: '',
        old_position: 0,
        landing_position: 0,
        final_position: 0,
        event: 'normal',
        message: 'Game session not found',
        next_player: 0,
        next_player_name: '',
        is_computer_turn: false,
        extra_turn: false,
        game_over: true,
        winner: null,
        players: [],
        error: 'Game session not found',
      };
    }

    const currPlayer = session.players[session.current_player];
    const dice = fixedDice || Math.floor(Math.random() * 6) + 1;
    session.last_dice = dice;

    const oldPosition = currPlayer.position;
    const landingPosition = oldPosition + dice;

    let event: 'normal' | 'ladder' | 'snake' | 'overshoot' | 'winner' = 'normal';
    let message = `${currPlayer.name} rolled a ${dice} and moved from ${oldPosition} to ${landingPosition}.`;
    let finalPosition = landingPosition;

    if (session.rules.exact_finish && landingPosition > 100) {
      finalPosition = oldPosition;
      event = 'overshoot';
      message = `${currPlayer.name} rolled a ${dice}. You need an exact roll to reach 100.`;
    } else if (landingPosition === 100) {
      finalPosition = 100;
      currPlayer.position = 100;
      session.game_over = true;
      session.winner = currPlayer;
      event = 'winner';
      message = `🏆 ${currPlayer.name} wins! Congratulations!`;
    } else if (landingPosition < 100) {
      if (LADDERS_PRD[landingPosition]) {
        finalPosition = LADDERS_PRD[landingPosition];
        event = 'ladder';
        message = `🪜 Ladder! ${currPlayer.name} climbed from ${landingPosition} to ${finalPosition}.`;
      } else if (SNAKES_PRD[landingPosition]) {
        finalPosition = SNAKES_PRD[landingPosition];
        event = 'snake';
        message = `🐍 Snake! ${currPlayer.name} slid down from ${landingPosition} to ${finalPosition}.`;
      }
      currPlayer.position = finalPosition;
    }

    const grantExtraTurn = session.rules.extra_turn_on_six && dice === 6 && !session.game_over;
    if (!grantExtraTurn) {
      session.current_player = (session.current_player + 1) % session.players.length;
    }

    const nextPlayer = session.players[session.current_player];
    saveLocalGame(session);

    return {
      success: true,
      dice,
      player_id: currPlayer.id,
      player_name: currPlayer.name,
      old_position: oldPosition,
      landing_position: event === 'overshoot' ? oldPosition : landingPosition,
      final_position: finalPosition,
      event,
      message,
      next_player: nextPlayer.id,
      next_player_name: nextPlayer.name,
      is_computer_turn: nextPlayer.is_computer && !session.game_over,
      extra_turn: grantExtraTurn,
      game_over: session.game_over,
      winner: session.winner,
      players: [...session.players],
    };
  },

  // 3. Restart Game
  async restartGame(gameId: string): Promise<{ success: boolean; state: any }> {
    const serverAttempt = await tryFetchJson('/api/game/restart', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ game_id: gameId }),
    });

    if (serverAttempt.ok && serverAttempt.data) {
      return serverAttempt.data;
    }

    const session = getLocalGame(gameId);
    if (session) {
      session.players.forEach((p) => {
        p.position = 0;
      });
      session.current_player = 0;
      session.game_over = false;
      session.winner = null;
      session.last_dice = null;
      session.move_history = [];
      saveLocalGame(session);
    }

    return {
      success: true,
      state: session || { players: [], current_player: 0 },
    };
  },

  // 4. Remote Room Create
  async createRoom(
    hostName: string,
    maxPlayers: number,
    exactFinish: boolean,
    extraTurnOnSix: boolean,
    sharkTheme: string = 'great-white',
    sharkLayout: string = 'reef-patrol'
  ): Promise<{ success: boolean; room_code: string; player_id: number; room?: RoomState; error?: string }> {
    const serverAttempt = await tryFetchJson('/api/room/create', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        host_name: hostName,
        max_players: maxPlayers,
        exact_finish: exactFinish,
        extra_turn_on_six: extraTurnOnSix,
        shark_theme: sharkTheme,
        shark_layout: sharkLayout,
      }),
    });

    if (serverAttempt.hasServer && serverAttempt.data) {
      if (serverAttempt.data.room) {
        localRooms.set(serverAttempt.data.room.code, serverAttempt.data.room);
        if (typeof localStorage !== 'undefined') {
          try {
            localStorage.setItem(`snakes_room_${serverAttempt.data.room.code}`, JSON.stringify(serverAttempt.data.room));
          } catch (e) {}
        }
      }
      return serverAttempt.data;
    }

    // Static Netlify Fallback
    const code = generateRoomCode();
    const clampedMax = Math.max(2, Math.min(4, Number(maxPlayers) || 2));
    const hostPlayer: Player = {
      id: 0,
      name: hostName.trim() || 'Host',
      position: 0,
      is_computer: false,
      color: COLOR_MAP[0].color,
      avatar: COLOR_MAP[0].avatar,
    };

    const room: RoomState = {
      code,
      host_id: 0,
      status: 'lobby',
      max_players: clampedMax,
      players: [hostPlayer],
      current_player: 0,
      game_over: false,
      winner: null,
      last_dice: null,
      rules: {
        board_size: 100,
        exact_finish: exactFinish,
        extra_turn_on_six: extraTurnOnSix,
      },
      move_history: [],
      last_updated: Date.now(),
    };

    await relayPublishRoom(room);

    return {
      success: true,
      room_code: code,
      player_id: 0,
      room,
    };
  },

  // 5. Remote Room Join
  async joinRoom(
    roomCode: string,
    playerName: string
  ): Promise<{ success: boolean; room_code: string; player_id: number; room?: RoomState; error?: string }> {
    const code = roomCode.trim().toUpperCase();
    const serverAttempt = await tryFetchJson('/api/room/join', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        room_code: code,
        player_name: playerName,
      }),
    });

    if (serverAttempt.hasServer && serverAttempt.data) {
      if (serverAttempt.data.success) {
        if (serverAttempt.data.room) {
          await relayPublishRoom(serverAttempt.data.room);
        }
        return serverAttempt.data;
      }

      // If server does not have the room, check local cache (e.g. server was restarted or tab was opened)
      const localFound = await relayFetchRoom(code);
      if (localFound) {
        try {
          await tryFetchJson('/api/room/sync', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ room: localFound }),
          });
          const retry = await tryFetchJson('/api/room/join', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              room_code: code,
              player_name: playerName,
            }),
          });
          if (retry.hasServer && retry.data && retry.data.success) {
            if (retry.data.room) await relayPublishRoom(retry.data.room);
            return retry.data;
          }
        } catch (e) {}
      } else {
        return serverAttempt.data;
      }
    }

    // Static Netlify Fallback: fetch room from cloud relay / local cache
    const room = await relayFetchRoom(code);

    if (!room) {
      return {
        success: false,
        room_code: code,
        player_id: -1,
        error: `Room code "${code}" not found. Please confirm the code with the host.`,
      };
    }

    if (room.players.length >= room.max_players) {
      return {
        success: false,
        room_code: code,
        player_id: -1,
        error: `Room is full (${room.players.length}/${room.max_players} players).`,
      };
    }

    const newId = room.players.length;
    const newPlayer: Player = {
      id: newId,
      name: playerName.trim() || `Player ${newId + 1}`,
      position: 0,
      is_computer: false,
      color: COLOR_MAP[newId % COLOR_MAP.length].color,
      avatar: COLOR_MAP[newId % COLOR_MAP.length].avatar,
    };

    room.players.push(newPlayer);
    room.last_updated = Date.now();
    await relayPublishRoom(room);

    return {
      success: true,
      room_code: code,
      player_id: newId,
      room,
    };
  },

  // 6. Get Room State
  async getRoomState(
    roomCode: string,
    playerId?: number
  ): Promise<{ success: boolean; room?: RoomState; current_player_name?: string; is_my_turn?: boolean; error?: string }> {
    const code = roomCode.trim().toUpperCase();
    const serverAttempt = await tryFetchJson(`/api/room/state?room_code=${code}&player_id=${playerId ?? ''}`);

    if (serverAttempt.hasServer && serverAttempt.data) {
      if (serverAttempt.data.success) {
        if (serverAttempt.data.room) {
          syncLocalRoom(serverAttempt.data.room);
        }
        return serverAttempt.data;
      }

      // Check if room is in local cache/relay and restore to server
      const localFound = await relayFetchRoom(code);
      if (localFound) {
        try {
          await tryFetchJson('/api/room/sync', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ room: localFound }),
          });
        } catch (e) {}
      } else {
        return serverAttempt.data;
      }
    }

    // Static Netlify Fallback: fetch from cloud relay and local storage
    const room = await relayFetchRoom(code);

    if (!room) {
      return { success: false, error: 'Room not found' };
    }

    const curr = room.players[room.current_player] || room.players[0];
    const isMyTurn = playerId !== undefined && playerId === curr?.id && room.status === 'playing';

    return {
      success: true,
      room,
      current_player_name: curr ? curr.name : '',
      is_my_turn: isMyTurn,
    };
  },

  // 7. Start Room Game
  async startRoom(roomCode: string, playerId: number): Promise<{ success: boolean; room?: RoomState; error?: string }> {
    const code = roomCode.trim().toUpperCase();
    const serverAttempt = await tryFetchJson('/api/room/start', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ room_code: code, player_id: playerId }),
    });

    if (serverAttempt.hasServer && serverAttempt.data) {
      if (serverAttempt.data.room) {
        await relayPublishRoom(serverAttempt.data.room);
      }
      return serverAttempt.data;
    }

    const room = await relayFetchRoom(code);
    if (!room) return { success: false, error: 'Room not found' };

    room.status = 'playing';
    room.current_player = 0;
    room.game_over = false;
    room.winner = null;
    room.last_updated = Date.now();
    await relayPublishRoom(room);

    return { success: true, room };
  },

  // 8. Roll Dice in Room
  async rollRoomDice(roomCode: string, playerId: number, fixedDice?: number): Promise<RollApiResponse> {
    const code = roomCode.trim().toUpperCase();
    const serverAttempt = await tryFetchJson('/api/room/roll', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ room_code: code, player_id: playerId, fixed_dice: fixedDice }),
    });

    if (serverAttempt.hasServer && serverAttempt.data) {
      if (serverAttempt.data.room) {
        await relayPublishRoom(serverAttempt.data.room);
      }
      return serverAttempt.data;
    }

    const room = await relayFetchRoom(code);
    if (!room) {
      return {
        success: false,
        dice: 1,
        player_id: playerId,
        player_name: '',
        old_position: 0,
        landing_position: 0,
        final_position: 0,
        event: 'normal',
        message: 'Room not found',
        next_player: 0,
        next_player_name: '',
        is_computer_turn: false,
        extra_turn: false,
        game_over: true,
        winner: null,
        players: [],
        error: 'Room not found',
      };
    }

    const currPlayer = room.players[room.current_player];
    const dice = fixedDice || Math.floor(Math.random() * 6) + 1;
    room.last_dice = dice;

    const oldPosition = currPlayer.position;
    const landingPosition = oldPosition + dice;

    let event: 'normal' | 'ladder' | 'snake' | 'overshoot' | 'winner' = 'normal';
    let message = `${currPlayer.name} rolled a ${dice} and moved from ${oldPosition} to ${landingPosition}.`;
    let finalPosition = landingPosition;

    if (room.rules.exact_finish && landingPosition > 100) {
      finalPosition = oldPosition;
      event = 'overshoot';
      message = `${currPlayer.name} rolled a ${dice}. You need an exact roll to reach 100.`;
    } else if (landingPosition === 100) {
      finalPosition = 100;
      currPlayer.position = 100;
      room.game_over = true;
      room.status = 'ended';
      room.winner = currPlayer;
      event = 'winner';
      message = `🏆 ${currPlayer.name} wins! Congratulations!`;
    } else if (landingPosition < 100) {
      if (LADDERS_PRD[landingPosition]) {
        finalPosition = LADDERS_PRD[landingPosition];
        event = 'ladder';
        message = `🪜 Ladder! ${currPlayer.name} climbed from ${landingPosition} to ${finalPosition}.`;
      } else if (SNAKES_PRD[landingPosition]) {
        finalPosition = SNAKES_PRD[landingPosition];
        event = 'snake';
        message = `🐍 Snake! ${currPlayer.name} slid down from ${landingPosition} to ${finalPosition}.`;
      }
      currPlayer.position = finalPosition;
    }

    const grantExtraTurn = room.rules.extra_turn_on_six && dice === 6 && !room.game_over;
    if (!grantExtraTurn) {
      room.current_player = (room.current_player + 1) % room.players.length;
    }

    const nextPlayer = room.players[room.current_player];

    room.move_history.push({
      player_id: currPlayer.id,
      player_name: currPlayer.name,
      dice,
      old_position: oldPosition,
      landing_position: event === 'overshoot' ? oldPosition : landingPosition,
      final_position: finalPosition,
      event,
      message,
      extra_turn: grantExtraTurn,
    });

    room.last_updated = Date.now();
    await relayPublishRoom(room);

    return {
      success: true,
      dice,
      player_id: currPlayer.id,
      player_name: currPlayer.name,
      old_position: oldPosition,
      landing_position: event === 'overshoot' ? oldPosition : landingPosition,
      final_position: finalPosition,
      event,
      message,
      next_player: nextPlayer.id,
      next_player_name: nextPlayer.name,
      is_computer_turn: nextPlayer.is_computer && !room.game_over,
      extra_turn: grantExtraTurn,
      game_over: room.game_over,
      winner: room.winner,
      players: [...room.players],
      room,
    };
  },

  // 9. Restart Room
  async restartRoom(roomCode: string, playerId: number): Promise<{ success: boolean; room?: RoomState; error?: string }> {
    const code = roomCode.trim().toUpperCase();
    const serverAttempt = await tryFetchJson('/api/room/restart', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ room_code: code, player_id: playerId }),
    });

    if (serverAttempt.hasServer && serverAttempt.data) {
      if (serverAttempt.data.room) {
        await relayPublishRoom(serverAttempt.data.room);
      }
      return serverAttempt.data;
    }

    const room = await relayFetchRoom(code);
    if (!room) return { success: false, error: 'Room not found' };

    room.players.forEach((p) => {
      p.position = 0;
    });
    room.current_player = 0;
    room.status = 'playing';
    room.game_over = false;
    room.winner = null;
    room.last_dice = null;
    room.move_history = [];
    room.last_updated = Date.now();
    await relayPublishRoom(room);

    return { success: true, room };
  },

  // 10. Leave / Exit Room (with 2/3/4 player auto-win / continue logic)
  async leaveRoom(roomCode: string, playerId: number): Promise<{ success: boolean; room?: RoomState; error?: string }> {
    const code = roomCode.trim().toUpperCase();
    const serverAttempt = await tryFetchJson('/api/room/leave', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ room_code: code, player_id: playerId }),
    });

    if (serverAttempt.hasServer && serverAttempt.data) {
      if (serverAttempt.data.room) {
        await relayPublishRoom(serverAttempt.data.room);
      }
      return serverAttempt.data;
    }

    // Static Netlify Fallback
    const room = await relayFetchRoom(code);
    if (!room) return { success: false, error: 'Room not found' };

    const pid = Number(playerId);
    const leavingIndex = room.players.findIndex((p) => p.id === pid);
    if (leavingIndex === -1) {
      return { success: true, room };
    }

    const leavingPlayer = room.players[leavingIndex];
    room.players.splice(leavingIndex, 1);
    const remainingCount = room.players.length;

    if (room.host_id === pid && remainingCount > 0) {
      room.host_id = room.players[0].id;
    }

    if (room.status === 'playing') {
      if (remainingCount <= 1) {
        room.game_over = true;
        room.status = 'ended';
        const soleSurvivor = room.players[0] || null;
        room.winner = soleSurvivor;
        const msg = soleSurvivor
          ? `${leavingPlayer.name} left the game, so ${soleSurvivor.name} won the game!`
          : `${leavingPlayer.name} left the game. Game over.`;
        room.win_reason = msg;
        room.last_exit_event = {
          exited_player_id: pid,
          exited_player_name: leavingPlayer.name,
          remaining_players_count: remainingCount,
          message: msg,
          timestamp: Date.now(),
        };
      } else {
        if (room.current_player >= room.players.length) {
          room.current_player = 0;
        }
        const msg = `${leavingPlayer.name} has exited the game. Removed from board. Match continues with ${remainingCount} players!`;
        room.last_exit_event = {
          exited_player_id: pid,
          exited_player_name: leavingPlayer.name,
          remaining_players_count: remainingCount,
          message: msg,
          timestamp: Date.now(),
        };
      }
    } else {
      if (remainingCount === 0) {
        localRooms.delete(code);
        if (typeof localStorage !== 'undefined') {
          try {
            localStorage.removeItem(`snakes_room_${code}`);
          } catch (e) {}
        }
        return { success: true };
      }
      room.last_exit_event = {
        exited_player_id: pid,
        exited_player_name: leavingPlayer.name,
        remaining_players_count: remainingCount,
        message: `${leavingPlayer.name} left the lobby.`,
        timestamp: Date.now(),
      };
    }

    room.last_updated = Date.now();
    await relayPublishRoom(room);

    return { success: true, room };
  },
};
