jest.mock('react-native', () => ({
  StyleSheet: {
    absoluteFillObject: {},
    create: <T>(styles: T): T => styles,
    hairlineWidth: 0.5,
  },
}));

import { colors } from '../../theme/colors';
import { earningsStyles } from './earningsStyles';

const styles = earningsStyles as Record<string, unknown>;

test('test_earningsGameStyles_whenPositiveScoreMove_usesSage', (): void => {
  expect((styles.scoreRulePositive as { color?: string } | undefined)?.color).toBe(colors.sage);
});

test('test_earningsGameStyles_whenNegativeScoreMove_usesVermilion', (): void => {
  expect((styles.scoreRuleNegative as { color?: string } | undefined)?.color).toBe(
    colors.vermilion,
  );
});

test('test_earningsGameStyles_whenLeaderboardRanked_usesBrass', (): void => {
  expect((earningsStyles.lbRank as { color?: string }).color).toBe(colors.brass);
});
