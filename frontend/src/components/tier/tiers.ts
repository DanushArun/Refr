/**
 * Endorser tier system — gamifies Endorsement Score.
 * Tiers progress from warm-cheap (Bronze) to cool-rare (Diamond),
 * mirroring the visual grammar of Apex / Valorant / Duolingo Legend.
 *
 * Thresholds are tuned so every tier is populated at launch and Diamond
 * is aspirational (only top Endorsers reach it).
 */

export type TierIcon =
  | 'medal-outline'
  | 'medal'
  | 'trophy'
  | 'sparkles'
  | 'diamond';

export interface Tier {
  name: 'Bronze' | 'Silver' | 'Gold' | 'Platinum' | 'Diamond';
  min: number;
  max: number;           // inclusive upper bound; Infinity for top tier
  icon: TierIcon;        // Ionicons name — escalates in visual prestige
  color: string;         // solid accent for borders, text, icon fill
  light: string;         // soft backdrop for pills
  glow: string;          // brighter accent for progress bars, badges
}

export const TIERS: Tier[] = [
  { name: 'Bronze',   min: 0,   max: 19,       icon: 'medal-outline', color: '#b87333', light: 'rgba(184,115,51,0.15)', glow: '#d2935a' },
  { name: 'Silver',   min: 20,  max: 39,       icon: 'medal',          color: '#c0c4cc', light: 'rgba(192,196,204,0.15)', glow: '#d8dce4' },
  { name: 'Gold',     min: 40,  max: 59,       icon: 'trophy',         color: '#e6b800', light: 'rgba(230,184,0,0.15)',  glow: '#ffd24a' },
  { name: 'Platinum', min: 60,  max: 79,       icon: 'sparkles',       color: '#22d3ee', light: 'rgba(34,211,238,0.15)', glow: '#67e8f9' },
  { name: 'Diamond',  min: 80,  max: Infinity, icon: 'diamond',        color: '#c084fc', light: 'rgba(192,132,252,0.15)', glow: '#d8b4fe' },
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
