jest.mock('react-native', () => ({
  StyleSheet: {
    absoluteFillObject: {},
    create: <T>(styles: T): T => styles,
    hairlineWidth: 0.5,
  },
}));

import { reputationRailStyles } from './reputationRailStyles';

test('test_reputation_rail_when_rendered_uses_single_track_line', (): void => {
  const railBase = reputationRailStyles.railBase as Record<string, unknown>;

  expect(railBase.borderWidth ?? 0).toBe(0);
  expect((reputationRailStyles as Record<string, unknown>).railHighlight).toBeUndefined();
});

test('test_reputation_rail_whenPolished_avoidsHardNestedPanelBorders', (): void => {
  const panelKeys = ['rankPill', 'railPanel', 'ruleChip'] as const;

  for (const key of panelKeys) {
    expect((reputationRailStyles[key] as { borderWidth?: number }).borderWidth ?? 0).toBe(0);
  }
});
