export type GameMode = 'classic' | 'blitz' | 'obstacle' | 'custom';

export type BoardTheme = 'vintage' | 'neon' | 'jungle' | 'candy';

export type SpecialTileType = 'speed_boost' | 'spring' | 'banana' | 'freeze' | 'mystery_portal';

export interface SpecialTileInfo {
  type: SpecialTileType;
  title: string;
  description: string;
  icon: string;
  color: string;
  effectDelta?: number; // e.g. +3, -3
}

export interface Snake {
  id: string;
  head: number;
  tail: number;
  name?: string;
}

export interface Ladder {
  id: string;
  bottom: number;
  top: number;
  name?: string;
}

export interface BoardConfig {
  id: string;
  name: string;
  size: number; // 10 for 10x10=100, 7 for 7x7=49
  snakes: Snake[];
  ladders: Ladder[];
  specialTiles: Record<number, SpecialTileType>;
}

export type BotPersonality = 'balanced' | 'speedy' | 'cautious' | 'dramatic';

export interface PlayerStats {
  rolls: number;
  snakesBitten: number;
  laddersClimbed: number;
  sixesCount: number;
  tilesTraveled: number;
  specialTilesHit: number;
}

export interface Player {
  id: string;
  name: string;
  isAi: boolean;
  botPersonality?: BotPersonality;
  avatar: string; // Emoji or token symbol
  color: string; // Tailwind color or Hex
  bgGradient: string;
  ringColor: string;
  position: number; // 0 means not yet on board or at start 1
  consecutiveSixes: number;
  isFrozen: boolean;
  turnsPlayed: number;
  stats: PlayerStats;
}

export interface GameRules {
  exact100: boolean; // Must land exactly on the finish tile
  rollSixAgain: boolean; // Rolling a 6 yields another roll
  threeSixesPenalty: boolean; // Rolling 3 consecutive sixes cancels turn/penalty
  allowKnockout: boolean; // Landing on someone bumps them back
  doubleDice: boolean; // Roll 2 dice instead of 1
  requireSixToStart: boolean; // Must roll a 6 to enter tile 1 (optional classic rule)
  botSpeed: 'fast' | 'normal' | 'slow';
}

export interface MoveLog {
  id: string;
  timestamp: Date;
  playerId: string;
  playerName: string;
  playerAvatar: string;
  diceRoll: number[];
  fromPos: number;
  toPos: number;
  actionType: 'normal' | 'ladder' | 'snake' | 'special' | 'knockout' | 'win' | 'frozen' | 'bounce';
  message: string;
}

export interface GameSettings {
  soundEnabled: boolean;
  volume: number;
  musicEnabled: boolean;
  theme: BoardTheme;
  autoBotTurn: boolean;
}
