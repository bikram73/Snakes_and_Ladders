export type GameMode = 'pvc' | 'multiplayer' | 'remote';

export interface Player {
  id: number;
  name: string;
  position: number; // 0 = start outside board, 1..100
  is_computer: boolean;
  color: string; // 'red' | 'blue' | 'green' | 'yellow'
  avatar: string; // '🔴' | '🔵' | '🟢' | '🟡'
}

export interface GameRules {
  exact100: boolean; // Exact 100 rule
  extraTurnOnSix: boolean; // Six gives another turn
  soundEnabled: boolean;
  animationSpeed: 'slow' | 'normal' | 'fast'; // Slow: 250ms, Normal: 150ms, Fast: 80ms
}

export interface MoveLog {
  id: string;
  playerId: number;
  playerName: string;
  playerAvatar: string;
  dice: number;
  oldPosition: number;
  landingPosition: number;
  finalPosition: number;
  event: 'normal' | 'ladder' | 'snake' | 'overshoot' | 'winner';
  message: string;
  extraTurn: boolean;
}

export interface RollApiResponse {
  success: boolean;
  dice: number;
  player_id: number;
  player_name: string;
  old_position: number;
  landing_position: number;
  final_position: number;
  event: 'normal' | 'ladder' | 'snake' | 'overshoot' | 'winner';
  message: string;
  next_player: number;
  next_player_name: string;
  is_computer_turn: boolean;
  extra_turn: boolean;
  game_over: boolean;
  winner: Player | null;
  players: Player[];
  error?: string;
  room?: any;
}

export interface NewGameApiResponse {
  success: boolean;
  game_id: string;
  current_player: number;
  state: {
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
  };
}

export interface RoomState {
  code: string;
  host_id: number;
  status: 'lobby' | 'playing' | 'ended';
  max_players: number;
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
  last_updated: number;
}
