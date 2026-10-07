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
  16: 6
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
  80: 99
};

interface PlayerState {
  id: number;
  name: string;
  position: number;
  is_computer: boolean;
  color: string;
  avatar: string;
}

interface GameSession {
  game_id: string;
  mode: 'pvc' | 'two' | 'four';
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

const activeGames = new Map<string, GameSession>();

// Initialize default players
function createPlayers(mode: 'pvc' | 'two' | 'four', customPlayers?: Array<{ name: string; is_computer?: boolean }>): PlayerState[] {
  const colorMap = [
    { color: 'red', avatar: '🔴' },
    { color: 'blue', avatar: '🔵' },
    { color: 'green', avatar: '🟢' },
    { color: 'yellow', avatar: '🟡' },
  ];

  if (customPlayers && customPlayers.length >= 2) {
    return customPlayers.map((p, i) => ({
      id: i,
      name: p.name || `Player ${i + 1}`,
      position: 0,
      is_computer: Boolean(p.is_computer),
      color: colorMap[i % colorMap.length].color,
      avatar: colorMap[i % colorMap.length].avatar,
    }));
  }

  if (mode === 'pvc') {
    return [
      { id: 0, name: 'Player 1', position: 0, is_computer: false, color: 'red', avatar: '🔴' },
      { id: 1, name: 'Computer', position: 0, is_computer: true, color: 'blue', avatar: '🔵' },
    ];
  } else if (mode === 'four') {
    return [
      { id: 0, name: 'Player 1', position: 0, is_computer: false, color: 'red', avatar: '🔴' },
      { id: 1, name: 'Player 2', position: 0, is_computer: false, color: 'blue', avatar: '🔵' },
      { id: 2, name: 'Player 3', position: 0, is_computer: false, color: 'green', avatar: '🟢' },
      { id: 3, name: 'Player 4', position: 0, is_computer: false, color: 'yellow', avatar: '🟡' },
    ];
  } else {
    return [
      { id: 0, name: 'Player 1', position: 0, is_computer: false, color: 'red', avatar: '🔴' },
      { id: 1, name: 'Player 2', position: 0, is_computer: false, color: 'blue', avatar: '🔵' },
    ];
  }
}

// API Routes
app.post('/api/game/new', (req, res) => {
  const { mode = 'pvc', players: customPlayers, exact_finish = true, extra_turn_on_six = true } = req.body || {};
  const game_id = `game_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;

  const players = createPlayers(mode, customPlayers);
  const session: GameSession = {
    game_id,
    mode,
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
