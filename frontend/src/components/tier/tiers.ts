/**
 * Endorser tier system — gamifies Endorsement Score.
 * Tiers now stay inside the After Hours palette: Brass for rank/status,
 * Sage for positive maturity, Parchment for premium calm, and Vermilion only
 * at the top detonation tier.
 *
 * Thresholds are tuned so every tier is populated at launch and Diamond
 * is aspirational (only top Endorsers reach it).
 */

import { colors } from '../../theme/colors';

export interface Tier {
  name: 'Bronze' | 'Silver' | 'Gold' | 'Platinum' | 'Diamond';
  min: number;
  max: number;
  starCount: number;
  color: string;
  light: string;
  glow: string;
}

export const TIERS: Tier[] = [
  {
    name: 'Bronze',
    min: 0,
    max: 19,
    starCount: 1,
    color: colors.brass,
    light: colors.warningLight,
    glow: colors.brass,
  },
  {
    name: 'Silver',
    min: 20,
    max: 39,
    starCount: 2,
    color: colors.sage,
    light: colors.successLight,
    glow: colors.sage,
  },
  {
    name: 'Gold',
    min: 40,
    max: 59,
    starCount: 3,
    color: colors.brass,
    light: colors.goldGlow,
    glow: colors.brass,
  },
  {
    name: 'Platinum',
    min: 60,
    max: 79,
    starCount: 4,
    color: colors.cream,
    light: colors.surfaceLevel2,
    glow: colors.sage,
  },
  {
    name: 'Diamond',
    min: 80,
    max: Infinity,
    starCount: 5,
    color: colors.vermilion,
    light: colors.vermilionLight,
    glow: colors.vermilion,
  },
];

export function tierForScore(score: number): Tier {
  const t = TIERS.find((t) => score >= t.min && score <= t.max);
  return t ?? TIERS[0];
}

export function nextTier(score: number): Tier | null {
  const idx = TIERS.findIndex((t) => score >= t.min && score <= t.max);
  if (idx < 0 || idx === TIERS.length - 1) return null;
  return TIERS[idx + 1];
}

/** Progress toward the next tier, in [0, 1]. Returns 1 for top tier. */
export function progressToNextTier(score: number): number {
  const current = tierForScore(score);
  const next = nextTier(score);
  if (!next) return 1;
  const span = next.min - current.min;
  const done = score - current.min;
  return Math.max(0, Math.min(1, done / span));
}

/** Points remaining until next tier, or 0 at top tier. */
export function pointsToNextTier(score: number): number {
  const next = nextTier(score);
  if (!next) return 0;
  return Math.max(0, next.min - score);
}
