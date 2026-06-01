jest.mock('react-native', () => ({
  StyleSheet: {
    absoluteFillObject: {},
    create: <T>(styles: T): T => styles,
  },
}));

import { reputationRailStyles } from './reputationRailStyles';

test('test_reputation_rail_when_rendered_uses_single_track_line', (): void => {
  const railBase = reputationRailStyles.railBase as Record<string, unknown>;

  expect(railBase.borderWidth ?? 0).toBe(0);
  expect((reputationRailStyles as Record<string, unknown>).railHighlight).toBeUndefined();
});
