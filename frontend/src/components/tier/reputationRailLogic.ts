import { nextTier, pointsToNextTier, progressToNextTier, tierForScore } from './tiers';

const MIN_MARKER_PROGRESS = 0.08;
const MAX_MARKER_PROGRESS = 0.92;

export interface ReputationRailMetrics {
  currentTierName: string;
  nextTierName: string | null;
  lowerBound: number;
  upperBound: number | null;
  progress: number;
  markerProgress: number;
  remaining: number;
  isTopTier: boolean;
}

export function clampRailMarkerProgress(progress: number): number {
  if (!Number.isFinite(progress)) return MIN_MARKER_PROGRESS;
  return Math.min(MAX_MARKER_PROGRESS, Math.max(MIN_MARKER_PROGRESS, progress));
}

export function buildReputationRailMetrics(score: number): ReputationRailMetrics {
  const safeScore = normalizeScore(score);
  const current = tierForScore(safeScore);
  const next = nextTier(safeScore);
  const progress = progressToNextTier(safeScore);

  return {
    currentTierName: current.name,
    nextTierName: next?.name ?? null,
    lowerBound: current.min,
    upperBound: next?.min ?? null,
    progress,
    markerProgress: clampRailMarkerProgress(progress),
    remaining: pointsToNextTier(safeScore),
    isTopTier: !next,
  };
}

export function formatTierTitle(metrics: ReputationRailMetrics): string {
  return metrics.currentTierName;
}

function normalizeScore(score: number): number {
  if (!Number.isFinite(score)) return 0;
  return Math.max(0, Math.round(score));
}
