import { colors } from '../../theme/colors';
import { TIERS } from './tiers';

test('test_tiers_whenDisplayedInLeaderboard_useAfterHoursAccentOrder', (): void => {
  expect(TIERS.map((tier) => tier.color)).toEqual([
    colors.brass,
    colors.sage,
    colors.brass,
    colors.cream,
    colors.vermilion,
  ]);
});

test('test_tiers_whenDisplayedAsShields_useEscalatingStarCounts', (): void => {
  expect(TIERS.map((tier) => (tier as { starCount?: number }).starCount)).toEqual([
    1,
    2,
    3,
    4,
    5,
  ]);
});

test('test_tiers_whenDisplayedAsShields_doNotUseGenericIonicons', (): void => {
  expect(TIERS.some((tier) => 'icon' in tier)).toBe(false);
});
