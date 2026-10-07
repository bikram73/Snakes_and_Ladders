import { BoardConfig, Snake, Ladder, SpecialTileInfo, SpecialTileType } from '../types/game';

export const SPECIAL_TILE_DEFS: Record<SpecialTileType, SpecialTileInfo> = {
  speed_boost: {
    type: 'speed_boost',
    title: 'Speed Boots',
    description: 'Surge forward +3 tiles instantly!',
    icon: '⚡',
    color: 'from-amber-500 to-yellow-400',
    effectDelta: 3,
  },
  spring: {
    type: 'spring',
    title: 'Super Spring',
    description: 'Bounce ahead +5 tiles!',
    icon: '🌀',
    color: 'from-emerald-500 to-teal-400',
    effectDelta: 5,
  },
  banana: {
    type: 'banana',
    title: 'Banana Slip',
    description: 'Whoops! Slip back -2 tiles!',
    icon: '🍌',
    color: 'from-orange-500 to-amber-500',
    effectDelta: -2,
  },
  freeze: {
    type: 'freeze',
    title: 'Frost Trap',
    description: 'Frozen in ice! Skip your next turn.',
    icon: '❄️',
    color: 'from-cyan-500 to-blue-500',
  },
  mystery_portal: {
    type: 'mystery_portal',
    title: 'Warp Portal',
    description: 'Teleport to a random safe tile ahead!',
    icon: '🔮',
    color: 'from-purple-500 to-pink-500',
  },
};

export const CLASSIC_PRESET: BoardConfig = {
  id: 'classic',
  name: 'Classic 100 Arena',
  size: 10,
  ladders: [
    { id: 'l1', bottom: 4, top: 14, name: 'Short Step' },
    { id: 'l2', bottom: 9, top: 31, name: 'Meadow Climb' },
    { id: 'l3', bottom: 20, top: 38, name: 'Stone Ramp' },
    { id: 'l4', bottom: 28, top: 84, name: 'Grand Sky Ladder' },
    { id: 'l5', bottom: 40, top: 59, name: 'Castle Ladder' },
    { id: 'l6', bottom: 51, top: 67, name: 'Hillside Ascent' },
    { id: 'l7', bottom: 63, top: 81, name: 'Cloud Staircase' },
    { id: 'l8', bottom: 71, top: 91, name: 'Golden Ascent' },
  ],
  snakes: [
    { id: 's1', head: 17, tail: 7, name: 'Garden Viper' },
    { id: 's2', head: 54, tail: 34, name: 'Forest Boa' },
    { id: 's3', head: 62, tail: 19, name: 'Crimson Python' },
    { id: 's4', head: 64, tail: 60, name: 'Baby Adder' },
    { id: 's5', head: 87, tail: 24, name: 'Abyss Leviathan' },
    { id: 's6', head: 93, tail: 73, name: 'Sky Serpent' },
    { id: 's7', head: 95, tail: 75, name: 'Thunder Cobra' },
    { id: 's8', head: 99, tail: 78, name: 'Dragon King' },
  ],
  specialTiles: {},
};

export const BLITZ_PRESET: BoardConfig = {
  id: 'blitz',
  name: 'Blitz 49 Speedway',
  size: 7,
  ladders: [
    { id: 'bl1', bottom: 3, top: 11 },
    { id: 'bl2', bottom: 8, top: 22 },
    { id: 'bl3', bottom: 15, top: 37 },
    { id: 'bl4', bottom: 25, top: 44 },
  ],
  snakes: [
    { id: 'bs1', head: 18, tail: 6 },
    { id: 'bs2', head: 32, tail: 12 },
    { id: 'bs3', head: 41, tail: 20 },
    { id: 'bs4', head: 48, tail: 24 },
  ],
  specialTiles: {},
};

export const OBSTACLE_PRESET: BoardConfig = {
  id: 'obstacle',
  name: 'Chaos Obstacle Rush (100)',
  size: 10,
  ladders: [
    { id: 'ol1', bottom: 5, top: 25 },
    { id: 'ol2', bottom: 18, top: 45 },
    { id: 'ol3', bottom: 34, top: 72 },
    { id: 'ol4', bottom: 52, top: 88 },
    { id: 'ol5', bottom: 70, top: 92 },
  ],
  snakes: [
    { id: 'os1', head: 27, tail: 8 },
    { id: 'os2', head: 49, tail: 15 },
    { id: 'os3', head: 66, tail: 31 },
    { id: 'os4', head: 89, tail: 48 },
    { id: 'os5', head: 98, tail: 40 },
  ],
  specialTiles: {
    12: 'speed_boost',
    23: 'freeze',
    38: 'banana',
    42: 'spring',
    55: 'mystery_portal',
    60: 'banana',
    75: 'freeze',
    83: 'speed_boost',
    94: 'banana',
  },
};

export const ALL_PRESETS = [CLASSIC_PRESET, BLITZ_PRESET, OBSTACLE_PRESET];

export function validateBoardConfig(config: BoardConfig): { valid: boolean; error?: string } {
  const maxTile = config.size * config.size;
  
  // Check snake head > tail
  for (const s of config.snakes) {
    if (s.head <= s.tail) {
      return { valid: false, error: `Snake must go downwards (head ${s.head} must be > tail ${s.tail})` };
    }
    if (s.head > maxTile || s.tail < 1) {
      return { valid: false, error: `Snake ${s.head} -> ${s.tail} is outside tile range 1..${maxTile}` };
    }
    if (s.head === maxTile) {
      return { valid: false, error: `Snake head cannot be on the winning finish tile (${maxTile})` };
    }
  }

  // Check ladder top > bottom
  for (const l of config.ladders) {
    if (l.top <= l.bottom) {
      return { valid: false, error: `Ladder must go upwards (top ${l.top} must be > bottom ${l.bottom})` };
    }
    if (l.top > maxTile || l.bottom < 1) {
      return { valid: false, error: `Ladder ${l.bottom} -> ${l.top} is outside tile range 1..${maxTile}` };
    }
  }

  // Check no conflicting tile heads/bottoms
  const occupiedStart = new Set<number>();
  for (const s of config.snakes) {
    if (occupiedStart.has(s.head)) {
      return { valid: false, error: `Tile ${s.head} has multiple snakes or ladders attached!` };
    }
    occupiedStart.add(s.head);
  }
  for (const l of config.ladders) {
    if (occupiedStart.has(l.bottom)) {
      return { valid: false, error: `Tile ${l.bottom} has both a ladder and a snake/ladder!` };
    }
    occupiedStart.add(l.bottom);
  }

  return { valid: true };
}
