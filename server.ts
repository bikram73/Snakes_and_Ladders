import express from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

// Server-authoritative Game Engine in Backend
const SNAKES: Record<number, number> = {
  98: 78,
  95: 75,
  92: 88,
  89: 68,
  74: 53,
  64: 44,
  62: 22,
  49: 11,
  47: 26,
  16: 6,
};

const LADDERS: Record<number, number> = {
  3: 22,
  8: 30,
  15: 44,
  21: 42,
  28: 76,
  36: 57,
  51: 67,
  71: 92,
  80: 99,
};

const COLOR_MAP = [
  { color: 'red', avatar: '🔴' },
  { color: 'blue', avatar: '🔵' },
  { color: 'green', avatar: '🟢' },
  { color: 'yellow', avatar: '🟡' },
];

export interface PlayerState {
  id: number;
  name: string;
  position: number;
  is_computer: boolean;
  color: string;
  avatar: string;
}

export interface GameSession {
  game_id: string;
  mode: 'pvc' | 'multiplayer' | 'remote';
  sub_mode?: string;
  players: PlayerState[];
  current_player: number;
  game_over: boolean;
  winner: PlayerState | null;
  last_dice: number | null;
  rules: {
    board_size: number;
    exact_finish: boolean;
    extra_turn_on_six: boolean;
  };
  move_history: Array<{
    player_id: number;
    player_name: string;
    dice: number;
    old_position: number;
    landing_position: number;
    final_position: number;
    event: 'normal' | 'ladder' | 'snake' | 'overshoot' | 'winner';
    message: string;
    extra_turn: boolean;
  }>;
}

export interface OnlineRoom {
  code: string;
  host_id: number;
  status: 'lobby' | 'playing' | 'ended';
  max_players: number; // 2, 3, or 4
  players: PlayerState[];
  current_player: number;
  game_over: boolean;
  winner: PlayerState | null;
  last_dice: number | null;
  rules: {
    board_size: number;
    exact_finish: boolean;
    extra_turn_on_six: boolean;
  };
  move_history: Array<any>;
  last_updated: number;
}

const activeGames = new Map<string, GameSession>();
const activeRooms = new Map<string, OnlineRoom>();

function generateRoomCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = '';
  for (let i = 0; i < 5; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

// Initialize players supporting PvC, Local Multiplayer, and Remote Rooms
function createPlayers(
  mode: string,
  customPlayers?: Array<{ name: string; is_computer?: boolean; avatar?: string; color?: string }>
): PlayerState[] {
  if (customPlayers && customPlayers.length >= 2) {
    return customPlayers.map((p, i) => ({
      id: i,
      name: p.name || (p.is_computer ? `Computer ${i}` : `Player ${i + 1}`),
      position: 0,
      is_computer: Boolean(p.is_computer),
      color: p.color || COLOR_MAP[i % COLOR_MAP.length].color,
      avatar: p.avatar || COLOR_MAP[i % COLOR_MAP.length].avatar,
    }));
  }

  return [
    { id: 0, name: 'Player 1', position: 0, is_computer: false, color: 'red', avatar: '🔴' },
    { id: 1, name: 'Computer', position: 0, is_computer: true, color: 'blue', avatar: '🔵' },
  ];
}

// ---------------- LOCAL API ROUTES ---------------- //

app.post('/api/game/new', (req, res) => {
  const {
    mode = 'pvc',
    sub_mode,
    players: customPlayers,
    exact_finish = true,
    extra_turn_on_six = true,
  } = req.body || {};
  const game_id = `game_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;

  const players = createPlayers(mode, customPlayers);
  const session: GameSession = {
    game_id,
    mode: mode === 'multiplayer' ? 'multiplayer' : 'pvc',
    sub_mode: sub_mode || `${players.length}p`,
    players,
    current_player: 0,
    game_over: false,
    winner: null,
    last_dice: null,
    rules: {
      board_size: 100,
      exact_finish: Boolean(exact_finish),
      extra_turn_on_six: Boolean(extra_turn_on_six),
    },
    move_history: [],
  };

  activeGames.set(game_id, session);

  res.json({
    success: true,
    game_id,
    current_player: session.current_player,
    state: session,
  });
});

app.post('/api/game/roll', (req, res) => {
  const { game_id, player_id, fixed_dice } = req.body || {};
  const session = activeGames.get(game_id);

  if (!session) {
    return res.status(404).json({
      success: false,
      error: 'Game session not found.',
    });
  }

  if (session.game_over) {
    return res.json({
      success: false,
      error: 'This game has already ended.',
      game_over: true,
      winner: session.winner,
    });
  }

  const currPlayer = session.players[session.current_player];
  if (player_id !== undefined && Number(player_id) !== currPlayer.id) {
    return res.status(400).json({
      success: false,
      error: 'It is not your turn.',
      current_player: currPlayer.id,
    });
  }

  const dice = fixed_dice ? Number(fixed_dice) : Math.floor(Math.random() * 6) + 1;
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
    if (LADDERS[landingPosition]) {
      finalPosition = LADDERS[landingPosition];
      event = 'ladder';
      message = `🪜 Ladder! ${currPlayer.name} climbed from ${landingPosition} to ${finalPosition}.`;
    } else if (SNAKES[landingPosition]) {
      finalPosition = SNAKES[landingPosition];
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

  session.move_history.push({
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

  res.json({
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
    players: session.players,
  });
});

app.get('/api/game/state', (req, res) => {
  const game_id = req.query.game_id as string;
  const session = activeGames.get(game_id);

  if (!session) {
    return res.status(404).json({
      success: false,
      error: 'Game session not found.',
    });
  }

  const curr = session.players[session.current_player];
  res.json({
    success: true,
    state: {
      ...session,
      current_player_name: curr.name,
      is_computer_turn: curr.is_computer && !session.game_over,
    },
  });
});

app.post('/api/game/restart', (req, res) => {
  const { game_id } = req.body || {};
  const session = activeGames.get(game_id);

  if (!session) {
    return res.status(404).json({
      success: false,
      error: 'Game session not found.',
    });
  }

  session.players.forEach((p) => {
    p.position = 0;
  });
  session.current_player = 0;
  session.game_over = false;
  session.winner = null;
  session.last_dice = null;
  session.move_history = [];

  res.json({
    success: true,
    game_id,
    state: session,
  });
});

// ---------------- REMOTE ONLINE ROOM API ROUTES ---------------- //

// Host creates a room
app.post('/api/room/create', (req, res) => {
  const {
    host_name = 'Host',
    max_players = 2,
    exact_finish = true,
    extra_turn_on_six = true,
  } = req.body || {};

  const roomCode = generateRoomCode();
  const clampedMax = Math.max(2, Math.min(4, Number(max_players) || 2));

  const hostPlayer: PlayerState = {
    id: 0,
    name: host_name.trim() || 'Host',
    position: 0,
    is_computer: false,
    color: COLOR_MAP[0].color,
    avatar: COLOR_MAP[0].avatar,
  };

  const room: OnlineRoom = {
    code: roomCode,
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
      exact_finish: Boolean(exact_finish),
      extra_turn_on_six: Boolean(extra_turn_on_six),
    },
    move_history: [],
    last_updated: Date.now(),
  };

  activeRooms.set(roomCode, room);

  res.json({
    success: true,
    room_code: roomCode,
    player_id: 0,
    room,
  });
});

// Guest joins an existing room
app.post('/api/room/join', (req, res) => {
  const { room_code, player_name = 'Guest' } = req.body || {};
  const code = (room_code || '').trim().toUpperCase();
  const room = activeRooms.get(code);

  if (!room) {
    return res.status(404).json({
      success: false,
      error: `Room code "${code}" not found. Check the code or create a new room!`,
    });
  }

  if (room.status !== 'lobby') {
    return res.status(400).json({
      success: false,
      error: 'This match has already started!',
    });
  }

  if (room.players.length >= room.max_players) {
    return res.status(400).json({
      success: false,
      error: `Room is full (${room.players.length}/${room.max_players} players).`,
    });
  }

  const newId = room.players.length;
  const newPlayer: PlayerState = {
    id: newId,
    name: player_name.trim() || `Player ${newId + 1}`,
    position: 0,
    is_computer: false,
    color: COLOR_MAP[newId % COLOR_MAP.length].color,
    avatar: COLOR_MAP[newId % COLOR_MAP.length].avatar,
  };

  room.players.push(newPlayer);
  room.last_updated = Date.now();

  res.json({
    success: true,
    room_code: code,
    player_id: newId,
    room,
  });
});

// Get real-time room state
app.get('/api/room/state', (req, res) => {
  const code = ((req.query.room_code as string) || '').trim().toUpperCase();
  const playerId = req.query.player_id !== undefined ? Number(req.query.player_id) : undefined;
  const room = activeRooms.get(code);

  if (!room) {
    return res.status(404).json({
      success: false,
      error: 'Room not found.',
    });
  }

  const curr = room.players[room.current_player] || room.players[0];
  const isMyTurn = playerId !== undefined && playerId === curr.id && room.status === 'playing';

  res.json({
    success: true,
    room,
    current_player_name: curr.name,
    is_my_turn: isMyTurn,
  });
});

// Host starts the room match
app.post('/api/room/start', (req, res) => {
  const { room_code, player_id } = req.body || {};
  const code = (room_code || '').trim().toUpperCase();
  const room = activeRooms.get(code);

  if (!room) {
    return res.status(404).json({ success: false, error: 'Room not found.' });
  }

  if (Number(player_id) !== room.host_id) {
    return res.status(403).json({ success: false, error: 'Only the room host can start the game.' });
  }

  if (room.players.length < 2) {
    return res.status(400).json({ success: false, error: 'At least 2 players are needed to start the game.' });
  }

  room.status = 'playing';
  room.current_player = 0;
  room.game_over = false;
  room.winner = null;
  room.last_updated = Date.now();

  res.json({
    success: true,
    room,
  });
});

// Roll dice in online room
app.post('/api/room/roll', (req, res) => {
  const { room_code, player_id, fixed_dice } = req.body || {};
  const code = (room_code || '').trim().toUpperCase();
  const room = activeRooms.get(code);

  if (!room) {
    return res.status(404).json({ success: false, error: 'Room not found.' });
  }

  if (room.status !== 'playing') {
    return res.status(400).json({ success: false, error: 'Match is not in progress.' });
  }

  if (room.game_over) {
    return res.json({
      success: false,
      error: 'This game has already ended.',
      game_over: true,
      winner: room.winner,
    });
  }

  const currPlayer = room.players[room.current_player];
  if (player_id !== undefined && Number(player_id) !== currPlayer.id) {
    return res.status(400).json({
      success: false,
      error: 'It is not your turn to roll.',
      current_player: currPlayer.id,
    });
  }

  const dice = fixed_dice ? Number(fixed_dice) : Math.floor(Math.random() * 6) + 1;
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
    if (LADDERS[landingPosition]) {
      finalPosition = LADDERS[landingPosition];
      event = 'ladder';
      message = `🪜 Ladder! ${currPlayer.name} climbed from ${landingPosition} to ${finalPosition}.`;
    } else if (SNAKES[landingPosition]) {
      finalPosition = SNAKES[landingPosition];
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

  res.json({
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
    extra_turn: grantExtraTurn,
    game_over: room.game_over,
    winner: room.winner,
    players: room.players,
    room,
  });
});

// Restart room match
app.post('/api/room/restart', (req, res) => {
  const { room_code, player_id } = req.body || {};
  const code = (room_code || '').trim().toUpperCase();
  const room = activeRooms.get(code);

  if (!room) {
    return res.status(404).json({ success: false, error: 'Room not found.' });
  }

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

  res.json({
    success: true,
    room_code: code,
    room,
  });
});

// Vite middleware mounting in dev mode
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, () => {
    console.log(`Snake & Ladder Game Server running on port ${PORT}`);
  });
}

startServer();
