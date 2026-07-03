export type TierBadgeSize = 'sm' | 'md' | 'lg';

export const TIER_BADGE_METRICS = {
  sm: {
    width: 26,
    bodyHeight: 28,
    pointHeight: 6,
    bandHeight: 8,
    radius: 6,
    borderWidth: 1,
    labelFont: 6,
    starFont: 7,
    starGap: 1,
    starTopGap: 9,
  },
  md: {
    width: 50,
    bodyHeight: 56,
    pointHeight: 12,
    bandHeight: 17,
    radius: 10,
    borderWidth: 1,
    labelFont: 9,
    starFont: 12,
    starGap: 2,
    starTopGap: 18,
  },
  lg: {
    width: 66,
    bodyHeight: 74,
    pointHeight: 15,
    bandHeight: 22,
    radius: 12,
    borderWidth: 1,
    labelFont: 12,
    starFont: 16,
    starGap: 3,
    starTopGap: 25,
  },
} as const;

export function tierStarRows(starCount: number): number[] {
  if (starCount <= 0) return [];
  if (starCount <= 2) return [starCount];
  if (starCount === 3) return [2, 1];
  if (starCount === 4) return [2, 2];
  return [3, 2];
}

export function tierBadgeLabel(name: string, size: TierBadgeSize): string {
  if (size === 'sm') return name.charAt(0).toUpperCase();
  return name.toUpperCase();
}
