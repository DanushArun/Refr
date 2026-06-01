import {
  buildReputationRailMetrics,
  clampRailMarkerProgress,
  formatTierTitle,
} from './reputationRailLogic';

describe('reputationRailLogic', () => {
  test('test_clampRailMarkerProgress_when_negative_returns_minimum_marker_position', (): void => {
    expect(clampRailMarkerProgress(-0.4)).toBe(0.08);
  });

  test('test_clampRailMarkerProgress_when_too_high_returns_maximum_marker_position', (): void => {
    expect(clampRailMarkerProgress(1.4)).toBe(0.92);
  });

  test('test_buildReputationRailMetrics_when_score_is_47_returns_gold_tier', (): void => {
    expect(buildReputationRailMetrics(47).currentTierName).toBe('Gold');
  });

  test('test_formatTierTitle_when_score_is_gold_returns_tier_only', (): void => {
    expect(formatTierTitle(buildReputationRailMetrics(47))).toBe('Gold');
  });

  test('test_buildReputationRailMetrics_when_score_is_47_returns_13_remaining', (): void => {
    expect(buildReputationRailMetrics(47).remaining).toBe(13);
  });

  test('test_buildReputationRailMetrics_when_top_tier_has_no_upper_bound', (): void => {
    expect(buildReputationRailMetrics(92).upperBound).toBeNull();
  });
});
