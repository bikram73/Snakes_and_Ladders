export interface Point {
  x: number;
  y: number;
}

/**
 * Returns exact cell center and coordinates for 1-100 tile numbers.
 * Row 1 (bottom): 1 (left) to 10 (right)
 * Row 2: 20 (left) to 11 (right)
 * ...
 * Row 10 (top): 100 (left) to 91 (right)
 */
export function getTileCoordinates(tileNumber: number, boardSize: number = 10, totalDimension: number = 1000): {
  x: number;
  y: number;
  col: number;
  rowFromTop: number;
  rowFromBottom: number;
  cellWidth: number;
  cellHeight: number;
} {
  const clampedTile = Math.max(1, Math.min(boardSize * boardSize, tileNumber));
  const rowFromBottom = Math.floor((clampedTile - 1) / boardSize);
  const colInRow = (clampedTile - 1) % boardSize;
  const col = (rowFromBottom % 2 === 0) ? colInRow : (boardSize - 1 - colInRow);
  const rowFromTop = (boardSize - 1) - rowFromBottom;

  const cellWidth = totalDimension / boardSize;
  const cellHeight = totalDimension / boardSize;
  const x = col * cellWidth + cellWidth / 2;
  const y = rowFromTop * cellHeight + cellHeight / 2;

  return {
    x,
    y,
    col,
    rowFromTop,
    rowFromBottom,
    cellWidth,
    cellHeight,
  };
}

export interface LadderRenderData {
  rail1Start: Point;
  rail1End: Point;
  rail2Start: Point;
  rail2End: Point;
  rungs: { start: Point; end: Point }[];
  angleDeg: number;
}

export function computeLadderGeometry(
  bottomTile: number,
  topTile: number,
  boardSize: number = 10,
  totalDimension: number = 1000
): LadderRenderData {
  const start = getTileCoordinates(bottomTile, boardSize, totalDimension);
  const end = getTileCoordinates(topTile, boardSize, totalDimension);

  const dx = end.x - start.x;
  const dy = end.y - start.y;
  const length = Math.hypot(dx, dy);
  const angle = Math.atan2(dy, dx);
  const angleDeg = (angle * 180) / Math.PI;

  const ladderHalfWidth = totalDimension * 0.018; // ~18px
  const perpX = -Math.sin(angle) * ladderHalfWidth;
  const perpY = Math.cos(angle) * ladderHalfWidth;

  const rail1Start = { x: start.x + perpX, y: start.y + perpY };
  const rail1End = { x: end.x + perpX, y: end.y + perpY };
  const rail2Start = { x: start.x - perpX, y: start.y - perpY };
  const rail2End = { x: end.x - perpX, y: end.y - perpY };

  const rungSpacing = totalDimension * 0.045; // ~45px per rung
  const rungCount = Math.max(3, Math.floor(length / rungSpacing));
  const rungs: { start: Point; end: Point }[] = [];

  for (let i = 1; i <= rungCount; i++) {
    const t = i / (rungCount + 1);
    const cx = start.x + dx * t;
    const cy = start.y + dy * t;
    rungs.push({
      start: { x: cx + perpX * 0.95, y: cy + perpY * 0.95 },
      end: { x: cx - perpX * 0.95, y: cy - perpY * 0.95 },
    });
  }

  return {
    rail1Start,
    rail1End,
    rail2Start,
    rail2End,
    rungs,
    angleDeg,
  };
}

export interface SnakeRenderData {
  head: Point;
  tail: Point;
  pathD: string;
  headAngleDeg: number;
  tailAngleDeg: number;
  seed: number;
}

export function computeSnakeGeometry(
  headTile: number,
  tailTile: number,
  boardSize: number = 10,
  totalDimension: number = 1000
): SnakeRenderData {
  const head = getTileCoordinates(headTile, boardSize, totalDimension);
  const tail = getTileCoordinates(tailTile, boardSize, totalDimension);

  const dx = tail.x - head.x;
  const dy = tail.y - head.y;
  const dist = Math.hypot(dx, dy);
  const baseAngle = Math.atan2(dy, dx);

  const seed = (headTile * 37 + tailTile * 19) % 100;
  const waveAmplitude = Math.min(totalDimension * 0.065, dist * 0.24) * (seed % 2 === 0 ? 1 : -1);

  const perpX = -Math.sin(baseAngle);
  const perpY = Math.cos(baseAngle);

  const cp1 = {
    x: head.x + dx * 0.33 + perpX * waveAmplitude,
    y: head.y + dy * 0.33 + perpY * waveAmplitude,
  };
  const cp2 = {
    x: head.x + dx * 0.66 - perpX * (waveAmplitude * 0.9),
    y: head.y + dy * 0.66 - perpY * (waveAmplitude * 0.9),
  };

  const pathD = `M ${head.x.toFixed(1)} ${head.y.toFixed(1)} C ${cp1.x.toFixed(1)} ${cp1.y.toFixed(1)}, ${cp2.x.toFixed(1)} ${cp2.y.toFixed(1)}, ${tail.x.toFixed(1)} ${tail.y.toFixed(1)}`;

  const headTangentAngle = Math.atan2(cp1.y - head.y, cp1.x - head.x);
  const headAngleDeg = (headTangentAngle * 180) / Math.PI;

  const tailTangentAngle = Math.atan2(tail.y - cp2.y, tail.x - cp2.x);
  const tailAngleDeg = (tailTangentAngle * 180) / Math.PI;

  return {
    head: { x: head.x, y: head.y },
    tail: { x: tail.x, y: tail.y },
    pathD,
    headAngleDeg,
    tailAngleDeg,
    seed,
  };
}
