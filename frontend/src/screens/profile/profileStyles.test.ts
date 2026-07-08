jest.mock('react-native', () => ({
  StyleSheet: {
    absoluteFillObject: {},
    create: <T>(styles: T): T => styles,
    hairlineWidth: 0.5,
  },
}));

import { profileStyles } from './profileStyles';
import { colors } from '../../theme/colors';

type StyleRecord = Record<string, unknown>;

const styles = profileStyles as StyleRecord;

test('test_profileCards_whenPolished_exposeSharedSurfaceLayers', (): void => {
  expect(styles.profileCardSurface).toBeDefined();
  expect(styles.profileCardGlow).toBeDefined();
});

test('test_profileCards_whenRendered_useProfileSurface', (): void => {
  expect((styles.hero as { backgroundColor?: string }).backgroundColor).toBe(
    colors.profileCardSurface,
  );
  expect((styles.section as { backgroundColor?: string }).backgroundColor).toBe(
    colors.profileCardSurface,
  );
});

test('test_profileHeroAndSections_whenPolished_avoidHardOuterBorders', (): void => {
  expect((styles.hero as { borderWidth?: number }).borderWidth ?? 0).toBe(0);
  expect((styles.section as { borderWidth?: number }).borderWidth ?? 0).toBe(0);
});

test('test_profileSnapshot_whenPolished_removesRoughTopDivider', (): void => {
  expect((styles.snapshot as { borderTopWidth?: number }).borderTopWidth ?? 0).toBe(0);
});

test('test_profileHero_whenReadable_usesCompactIdentityType', (): void => {
  expect((styles.displayName as { fontSize?: number }).fontSize).toBeLessThanOrEqual(26);
  expect((styles.displayName as { lineHeight?: number }).lineHeight).toBeLessThanOrEqual(32);
});

test('test_endorserScore_whenCompact_placesScoreOnRight', (): void => {
  expect((styles.heroScore as { alignItems?: string }).alignItems).toBe('flex-end');
  expect((styles.scoreBlock as { alignItems?: string }).alignItems).toBe('flex-end');
  expect((styles.scoreValue as { textAlign?: string }).textAlign).toBe('right');
});

test('test_profileNestedCards_whenPolished_avoidHardBorders', (): void => {
  const nestedKeys = ['metric', 'settingsRow', 'actionRow', 'chip'] as const;

  for (const key of nestedKeys) {
    expect((styles[key] as { borderWidth?: number }).borderWidth ?? 0).toBe(0);
  }
});

test('test_profileContent_whenMobileWeb_centersConstrainedColumn', (): void => {
  expect((styles.content as { alignItems?: string }).alignItems).toBe('center');
  expect(styles.contentPanel).toBeDefined();
  expect((styles.contentPanel as { maxWidth?: number }).maxWidth).toBe(440);
});
