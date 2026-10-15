/**
 * Local browser storage management for player profile and game states.
 * Guarantees persistence across page refreshes, browser re-opens, and Netlify static deployments.
 */

import { Player, GameRules, MoveLog } from '../types/game';

export interface PlayerProfile {
  name: string;
  avatar: string;
  color: string;
  updatedAt: number;
}

export interface SavedGameState {
  version: number;
  currentView: 'game' | 'landing' | 'lobby';
  gameId: string | null;
  activeModeTitle: string;
  players: Player[];
  currentPlayerId: number;
  gameOver: boolean;
  winner: Player | null;
  winReason: string | null;
  lastDice: number;
  rules: GameRules;
  moveLogs: MoveLog[];
  statusMessage: string;
  isRemoteMatch: boolean;
  roomCode: string | null;
  myPlayerId: number | null;
  isRoomHost: boolean;
  timestamp: number;
}

const STORAGE_KEY_PLAYER_PROFILE = 'snakes_player_profile';
const STORAGE_KEY_LEGACY_NAME = 'snakes_player_name';
const STORAGE_KEY_GAME_STATE = 'snakes_saved_game_state';

export const AVATAR_OPTIONS = [
  { emoji: '🔴', label: 'Red Beacon', color: 'red' },
  { emoji: '🔵', label: 'Blue Tide', color: 'blue' },
  { emoji: '🟢', label: 'Green Reef', color: 'green' },
  { emoji: '🟡', label: 'Gold Sun', color: 'yellow' },
  { emoji: '🦈', label: 'Great White', color: 'cyan' },
  { emoji: '👑', label: 'Ocean Monarch', color: 'amber' },
  { emoji: '⚡', label: 'Storm Striker', color: 'purple' },
  { emoji: '🌊', label: 'Tidal Wave', color: 'sky' },
  { emoji: '⚓', label: 'Iron Anchor', color: 'emerald' },
  { emoji: '🐙', label: 'Kraken', color: 'rose' },
];

const FUN_NAMES = [
  'Shark Raider',
  'Captain Fin',
  'Wave Rider',
  'Coral Diver',
  'Apex Hunter',
  'Swift Sailor',
  'Abyss Walker',
  'Ocean King',
  'Sea Falcon',
  'Tide Master',
  'Reef Runner',
  'Storm Chaser',
];

/**
 * Returns a random fun player name
 */
export function generateRandomPlayerName(): string {
  const base = FUN_NAMES[Math.floor(Math.random() * FUN_NAMES.length)];
  const num = Math.floor(10 + Math.random() * 89);
  return `${base} ${num}`;
}

/**
 * Checks if a player name has already been stored in the browser
 */
export function hasStoredPlayer(): boolean {
  if (typeof window === 'undefined' || typeof localStorage === 'undefined') return false;
  try {
    const raw = localStorage.getItem(STORAGE_KEY_PLAYER_PROFILE);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed && typeof parsed.name === 'string' && parsed.name.trim().length > 0) {
        return true;
      }
    }
    const legacy = localStorage.getItem(STORAGE_KEY_LEGACY_NAME);
    if (legacy && legacy.trim().length > 0) {
      return true;
    }
  } catch (e) {
    // ignore
  }
  return false;
}

/**
 * Retrieves the stored player profile or creates a sensible default if none exists
 */
export function getStoredPlayerProfile(): PlayerProfile {
  if (typeof window !== 'undefined' && typeof localStorage !== 'undefined') {
    try {
      const raw = localStorage.getItem(STORAGE_KEY_PLAYER_PROFILE);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed && typeof parsed.name === 'string' && parsed.name.trim().length > 0) {
          return {
            name: parsed.name.trim(),
            avatar: parsed.avatar || '🔴',
            color: parsed.color || 'red',
            updatedAt: parsed.updatedAt || Date.now(),
          };
        }
      }

      // Check legacy key
      const legacy = localStorage.getItem(STORAGE_KEY_LEGACY_NAME);
      if (legacy && legacy.trim().length > 0) {
        const prof: PlayerProfile = {
          name: legacy.trim(),
          avatar: '🔴',
          color: 'red',
          updatedAt: Date.now(),
        };
        savePlayerProfile(prof);
        return prof;
      }
    } catch (e) {
      // ignore
    }
  }

  return {
    name: '',
    avatar: '🔴',
    color: 'red',
    updatedAt: Date.now(),
  };
}

/**
 * Retrieves just the player name (trimmed)
 */
export function getStoredPlayerName(): string {
  return getStoredPlayerProfile().name;
}

/**
 * Saves or updates player profile in localStorage
 */
export function savePlayerProfile(profile: Partial<PlayerProfile>): PlayerProfile {
  const current = getStoredPlayerProfile();
  const updated: PlayerProfile = {
    name: (profile.name !== undefined ? profile.name : current.name).trim() || 'Player 1',
    avatar: profile.avatar || current.avatar || '🔴',
    color: profile.color || current.color || 'red',
    updatedAt: Date.now(),
  };

  if (typeof window !== 'undefined' && typeof localStorage !== 'undefined') {
    try {
      localStorage.setItem(STORAGE_KEY_PLAYER_PROFILE, JSON.stringify(updated));
      localStorage.setItem(STORAGE_KEY_LEGACY_NAME, updated.name);
    } catch (e) {
      console.warn('Unable to write player profile to localStorage:', e);
    }
  }

  return updated;
}

/**
 * Saves current active game state to local browser storage
 */
export function saveActiveGameState(state: Omit<SavedGameState, 'version' | 'timestamp'>): void {
  if (typeof window === 'undefined' || typeof localStorage === 'undefined') return;

  try {
    const payload: SavedGameState = {
      ...state,
      version: 1,
      timestamp: Date.now(),
    };
    localStorage.setItem(STORAGE_KEY_GAME_STATE, JSON.stringify(payload));
  } catch (e) {
    console.warn('Unable to save game state to localStorage:', e);
  }
}

/**
 * Retrieves the saved game state from localStorage
 */
export function loadSavedGameState(): SavedGameState | null {
  if (typeof window === 'undefined' || typeof localStorage === 'undefined') return null;

  try {
    const raw = localStorage.getItem(STORAGE_KEY_GAME_STATE);
    if (!raw) return null;

    const data: SavedGameState = JSON.parse(raw);
    if (!data || !Array.isArray(data.players) || data.players.length === 0) {
      return null;
    }

    // Discard saved states that are over 7 days old
    const MAX_AGE_MS = 7 * 24 * 60 * 60 * 1000;
    if (Date.now() - (data.timestamp || 0) > MAX_AGE_MS) {
      clearSavedGameState();
      return null;
    }

    return data;
  } catch (e) {
    console.warn('Failed to parse saved game state from localStorage:', e);
    return null;
  }
}

/**
 * Clears the saved game state from local browser storage
 */
export function clearSavedGameState(): void {
  if (typeof window === 'undefined' || typeof localStorage === 'undefined') return;
  try {
    localStorage.removeItem(STORAGE_KEY_GAME_STATE);
  } catch (e) {
    // ignore
  }
}

/**
 * Checks if there is an unfinished / active game that can be resumed
 */
export function hasOngoingSavedGame(): boolean {
  const saved = loadSavedGameState();
  if (!saved) return false;
  // Ongoing if not game over and at least one player has moved or a game was actively in progress
  return !saved.gameOver && saved.players.length > 0;
}
