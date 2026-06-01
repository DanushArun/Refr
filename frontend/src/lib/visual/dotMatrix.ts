export interface DotMatrixPoint {
  x: number;
  y: number;
}

interface DotMatrixLayoutConfig {
  width: number;
  height: number;
  cellSize: number;
}

interface DotMatrixSplitConfig {
  points: readonly DotMatrixPoint[];
  progress: number;
  width: number;
}

export function clampDotMatrixProgress(value: number): number {
  if (!Number.isFinite(value)) return 0;
  return Math.max(0, Math.min(1, value));
}

export function buildDotMatrixPoints(config: DotMatrixLayoutConfig): DotMatrixPoint[] {
  const { width, height, cellSize } = config;
  if (width <= 0 || height <= 0 || cellSize <= 0) return [];

  const cols = Math.floor(width / cellSize);
  const rows = Math.floor(height / cellSize);
  const offsetX = (width - cols * cellSize) / 2;
  const offsetY = (height - rows * cellSize) / 2;
  const points: DotMatrixPoint[] = [];

  for (let row = 0; row < rows; row += 1) {
    for (let col = 0; col < cols; col += 1) {
      points.push({
        x: offsetX + col * cellSize + cellSize / 2,
        y: offsetY + row * cellSize + cellSize / 2,
      });
    }
  }

  return points;
}

export function splitDotMatrixPoints(config: DotMatrixSplitConfig): {
  lit: DotMatrixPoint[];
  dim: DotMatrixPoint[];
} {
  const cutoff = config.width * clampDotMatrixProgress(config.progress);
  const lit: DotMatrixPoint[] = [];
  const dim: DotMatrixPoint[] = [];

  config.points.forEach((point) => {
    if (point.x <= cutoff) {
      lit.push(point);
      return;
    }
    dim.push(point);
  });

  return { lit, dim };
}
