export const SNAKES_PRD: Record<number, number> = {
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

export const LADDERS_PRD: Record<number, number> = {
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

export interface SnakeData {
  id: string;
  head: number;
  tail: number;
  label?: string;
}

export interface LadderData {
  id: string;
  bottom: number;
  top: number;
  label?: string;
}

export const PRD_SNAKES_LIST: SnakeData[] = Object.entries(SNAKES_PRD).map(([head, tail], i) => ({
  id: `snake_${head}_${tail}`,
  head: Number(head),
  tail: Number(tail),
  label: `Snake ${i + 1}`,
}));

export const PRD_LADDERS_LIST: LadderData[] = Object.entries(LADDERS_PRD).map(([bottom, top], i) => ({
  id: `ladder_${bottom}_${top}`,
  bottom: Number(bottom),
  top: Number(top),
  label: `Ladder ${i + 1}`,
}));
