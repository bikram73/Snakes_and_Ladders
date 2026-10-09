import { SharkLayoutPresetId } from './sharkThemes';

export interface SnakeData {
  id: string;
  head: number;
  tail: number;
  label?: string;
  hazardType?: 'shark' | 'snake';
}

export interface LadderData {
  id: string;
  bottom: number;
  top: number;
  label?: string;
  ladderType?: string;
}

export interface SharkLayoutConfig {
  id: SharkLayoutPresetId;
  name: string;
  badge: string;
  difficulty: 'Balanced' | 'High Peril' | 'Fast Ascent' | 'Apex Gauntlet';
  icon: string;
  tagline: string;
  description: string;
  snakes: Record<number, number>;
  ladders: Record<number, number>;
  snakesList: SnakeData[];
  laddersList: LadderData[];
}

// 1. REEF PATROL (Balanced classic arrangement)
export const SNAKES_REEF_PATROL: Record<number, number> = {
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

export const LADDERS_REEF_PATROL: Record<number, number> = {
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

// 2. SHARK FRENZY (Infestation / aggressive predators across mid and high tiers)
export const SNAKES_SHARK_FRENZY: Record<number, number> = {
  99: 69,
  94: 71,
  91: 61,
  87: 54,
  78: 48,
  65: 35,
  59: 19,
  53: 33,
  46: 15,
  38: 17,
  24: 7,
  18: 3,
};

export const LADDERS_SHARK_FRENZY: Record<number, number> = {
  2: 38,
  7: 29,
  14: 45,
  22: 58,
  32: 75,
  41: 79,
  63: 81,
  72: 93,
};

// 3. TREASURE DIVE (Fast Ascent / Diver's Paradise with high mobility)
export const SNAKES_TREASURE_DIVE: Record<number, number> = {
  97: 77,
  93: 63,
  86: 56,
  76: 46,
  68: 38,
  52: 23,
  37: 16,
  19: 5,
};

export const LADDERS_TREASURE_DIVE: Record<number, number> = {
  4: 25,
  9: 31,
  12: 41,
  20: 59,
  27: 66,
  35: 64,
  43: 74,
  55: 83,
  61: 82,
  73: 94,
  84: 98,
};

// 4. MEGALODON GAUNTLET (Terrifying apex predators lurking right near victory!)
export const SNAKES_MEGALODON_GAUNTLET: Record<number, number> = {
  99: 21, // Colossal Megalodon plunge back to the deep abyss!
  96: 55,
  93: 43,
  88: 24,
  82: 62,
  75: 34,
  58: 38,
  44: 14,
  31: 12,
  17: 4,
};

export const LADDERS_MEGALODON_GAUNTLET: Record<number, number> = {
  5: 35,
  10: 32,
  16: 47,
  25: 56,
  39: 68,
  48: 79,
  60: 85,
  70: 91,
  81: 97,
};

function buildList(
  snakes: Record<number, number>,
  ladders: Record<number, number>
): { snakesList: SnakeData[]; laddersList: LadderData[] } {
  const snakesList: SnakeData[] = Object.entries(snakes).map(([head, tail], i) => ({
    id: `shark_${head}_${tail}`,
    head: Number(head),
    tail: Number(tail),
    label: `Shark ${i + 1}`,
    hazardType: 'shark',
  }));

  const laddersList: LadderData[] = Object.entries(ladders).map(([bottom, top], i) => ({
    id: `ladder_${bottom}_${top}`,
    bottom: Number(bottom),
    top: Number(top),
    label: `Ladder ${i + 1}`,
  }));

  return { snakesList, laddersList };
}

const reefBuilt = buildList(SNAKES_REEF_PATROL, LADDERS_REEF_PATROL);
const frenzyBuilt = buildList(SNAKES_SHARK_FRENZY, LADDERS_SHARK_FRENZY);
const treasureBuilt = buildList(SNAKES_TREASURE_DIVE, LADDERS_TREASURE_DIVE);
const gauntletBuilt = buildList(SNAKES_MEGALODON_GAUNTLET, LADDERS_MEGALODON_GAUNTLET);

export const SHARK_LAYOUT_PRESETS: Record<SharkLayoutPresetId, SharkLayoutConfig> = {
  'reef-patrol': {
    id: 'reef-patrol',
    name: 'Reef Patrol',
    badge: 'Standard 10 Sharks & 9 Ladders',
    difficulty: 'Balanced',
    icon: '🌊',
    tagline: 'Standard Tournament Balance',
    description: 'Evenly distributed shark ambush points and diving ascents. Perfect balance for competitive matches.',
    snakes: SNAKES_REEF_PATROL,
    ladders: LADDERS_REEF_PATROL,
    snakesList: reefBuilt.snakesList,
    laddersList: reefBuilt.laddersList,
  },
  'shark-frenzy': {
    id: 'shark-frenzy',
    name: 'Shark Frenzy',
    badge: '12 Aggressive Sharks & 8 Ladders',
    difficulty: 'High Peril',
    icon: '🦈',
    tagline: 'Apex Infestation Hazard',
    description: 'Heavily shark-infested waters with 12 ravenous predators waiting across mid and high sea-depths.',
    snakes: SNAKES_SHARK_FRENZY,
    ladders: LADDERS_SHARK_FRENZY,
    snakesList: frenzyBuilt.snakesList,
    laddersList: frenzyBuilt.laddersList,
  },
  'treasure-dive': {
    id: 'treasure-dive',
    name: 'Treasure Diver',
    badge: '8 Lurking Sharks & 11 Ladders',
    difficulty: 'Fast Ascent',
    icon: '💎',
    tagline: 'Diver Paradise & Fast Ascents',
    description: 'Ample climbing ropes and buoy cables with fewer sharks for rapid-fire, high-speed games.',
    snakes: SNAKES_TREASURE_DIVE,
    ladders: LADDERS_TREASURE_DIVE,
    snakesList: treasureBuilt.snakesList,
    laddersList: treasureBuilt.laddersList,
  },
  'megalodon-gauntlet': {
    id: 'megalodon-gauntlet',
    name: 'Megalodon Gauntlet',
    badge: 'Colossal Drop-offs near Finish',
    difficulty: 'Apex Gauntlet',
    icon: '🌋',
    tagline: 'Endgame Climax Peril',
    description: 'Heart-pounding tension at the top! Prehistoric Megalodons lurk between tiles 80–99 with deep drops back to the trench.',
    snakes: SNAKES_MEGALODON_GAUNTLET,
    ladders: LADDERS_MEGALODON_GAUNTLET,
    snakesList: gauntletBuilt.snakesList,
    laddersList: gauntletBuilt.laddersList,
  },
};

export const SHARK_LAYOUT_PRESETS_LIST: SharkLayoutConfig[] = Object.values(SHARK_LAYOUT_PRESETS);

export function getSharkLayoutPreset(id?: SharkLayoutPresetId): SharkLayoutConfig {
  if (id && SHARK_LAYOUT_PRESETS[id]) {
    return SHARK_LAYOUT_PRESETS[id];
  }
  return SHARK_LAYOUT_PRESETS['reef-patrol'];
}

// Backward compatibility with legacy constants
export const SNAKES_PRD = SNAKES_REEF_PATROL;
export const LADDERS_PRD = LADDERS_REEF_PATROL;
export const PRD_SNAKES_LIST = reefBuilt.snakesList;
export const PRD_LADDERS_LIST = reefBuilt.laddersList;
