jest.mock('react-native', () => ({
  StyleSheet: {
    absoluteFillObject: {},
    create: <T>(styles: T): T => styles,
    hairlineWidth: 0.5,
  },
}));

import { earningsScreenStyles } from './earningsScreenStyles';

const styles = earningsScreenStyles as Record<string, unknown>;

test('test_earningsHeroStyles_whenPolished_exposesIntegratedOrbFrame', (): void => {
  expect(styles.heroOrbFrame).toBeDefined();
});

test('test_earningsHeroStyles_whenCreditCard_usesCardAspectRatio', (): void => {
  expect((styles.earningsHero as { aspectRatio?: number }).aspectRatio).toBeCloseTo(1.58);
});

test('test_earningsHeroStyles_whenCreditCard_exposesCardSurfaceLayer', (): void => {
  expect(styles.heroCardSurface).toBeDefined();
});

test('test_earningsHeroStyles_whenSmoothCard_avoidsHardOuterBorder', (): void => {
  expect((styles.earningsHero as { borderWidth?: number }).borderWidth ?? 0).toBe(0);
});

test('test_earningsHeroStyles_whenPolished_removesNegativeMarginOrbSlot', (): void => {
  expect(styles.heroOrbWrap).toBeUndefined();
});

test('test_earningsHeroStyles_whenPolished_removesExtraBevelEdges', (): void => {
  const roughEdgeStyles = ['bevelTop', 'bevelBottom', 'materialSheen', 'heroInnerStroke'];

  expect(roughEdgeStyles.filter((key) => key in styles)).toEqual([]);
});
