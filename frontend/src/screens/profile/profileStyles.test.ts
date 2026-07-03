jest.mock('react-native', () => ({
  StyleSheet: {
    absoluteFillObject: {},
    create: <T>(styles: T): T => styles,
    hairlineWidth: 0.5,
  },
}));

import { profileStyles } from './profileStyles';

type StyleRecord = Record<string, unknown>;

const styles = profileStyles as StyleRecord;

test('test_profileCards_whenPolished_exposeSharedSurfaceLayers', (): void => {
  expect(styles.profileCardSurface).toBeDefined();
  expect(styles.profileCardGlow).toBeDefined();
});

test('test_profileHeroAndSections_whenPolished_avoidHardOuterBorders', (): void => {
  expect((styles.hero as { borderWidth?: number }).borderWidth ?? 0).toBe(0);
  expect((styles.section as { borderWidth?: number }).borderWidth ?? 0).toBe(0);
});

test('test_profileSnapshot_whenPolished_removesRoughTopDivider', (): void => {
  expect((styles.snapshot as { borderTopWidth?: number }).borderTopWidth ?? 0).toBe(0);
});

test('test_profileNestedCards_whenPolished_avoidHardBorders', (): void => {
  const nestedKeys = ['metric', 'settingsRow', 'actionRow', 'chip'] as const;

  for (const key of nestedKeys) {
    expect((styles[key] as { borderWidth?: number }).borderWidth ?? 0).toBe(0);
  }
});
