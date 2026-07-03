import { TIERS } from './tiers';
import {
  TIER_BADGE_METRICS,
  tierBadgeLabel,
  tierStarRows,
} from './tierBadgeModel';

test('test_tierBadgeMetrics_whenSizeIncreases_growsShieldPredictably', (): void => {
  expect(TIER_BADGE_METRICS.sm.width).toBeLessThan(TIER_BADGE_METRICS.md.width);
  expect(TIER_BADGE_METRICS.md.width).toBeLessThan(TIER_BADGE_METRICS.lg.width);
});

test('test_tierStarRows_whenTierProgresses_matchesReferenceShieldRows', (): void => {
  expect(TIERS.map((tier) => tierStarRows((tier as { starCount?: number }).starCount ?? 0)))
    .toEqual([[1], [2], [2, 1], [2, 2], [3, 2]]);
});

test('test_tierBadgeLabel_whenCompact_usesInitial', (): void => {
  expect(tierBadgeLabel('Platinum', 'sm')).toBe('P');
});

test('test_tierBadgeLabel_whenFullSize_usesUppercaseName', (): void => {
  expect(tierBadgeLabel('Platinum', 'md')).toBe('PLATINUM');
});
