jest.mock('react-native', () => ({
  StyleSheet: {
    absoluteFillObject: {},
    hairlineWidth: 1,
    create: <T>(styles: T): T => styles,
  },
}));

import { spacing } from '../../theme/spacing';
import {
  LIQUID_TAB_BAR_ICON_SIZE,
  LIQUID_TAB_BAR_HEIGHT,
  LIQUID_TAB_BAR_RADIUS,
} from './tabBarOptions';
import { floatingLiquidTabBarStyles } from './FloatingLiquidTabBar.styles';

const styles = floatingLiquidTabBarStyles as Record<string, Record<string, unknown>>;

test('test_liquidTabBar_whenRendered_clipsOneContinuousGlassCapsule', (): void => {
  expect(styles.bar.height).toBe(LIQUID_TAB_BAR_HEIGHT);
  expect(styles.bar.borderRadius).toBe(LIQUID_TAB_BAR_RADIUS);
  expect(styles.bar.overflow).toBe('hidden');
  expect(styles.bar.borderWidth ?? 0).toBe(0);
});

test('test_liquidTabBar_whenRendered_usesMaterialLayersInsteadOfRoughEdges', (): void => {
  expect(styles.surfaceStack).toBeDefined();
  expect(styles.glassBlur).toBeDefined();
  expect(
    ['topHairline', 'innerShade', 'glassUnderlay', 'glassTint', 'glassHighlight']
      .filter((key) => key in styles),
  ).toEqual([]);
});

test('test_liquidTabBar_whenFocused_doesNotResizeIconCells', (): void => {
  expect(styles.item.height).toBeGreaterThanOrEqual(spacing[11]);
  expect(styles.itemFocused.flex).toBeUndefined();
  expect(styles.itemFocused.backgroundColor).toBeUndefined();
  expect(styles.itemFocused.borderWidth ?? 0).toBe(0);
  expect(styles.activePill.position).toBe('absolute');
});

test('test_liquidTabBar_whenFocused_keepsIconFrameFixed', (): void => {
  expect(styles.iconSlot.width).toBe(LIQUID_TAB_BAR_ICON_SIZE);
  expect(styles.iconSlot.height).toBe(LIQUID_TAB_BAR_ICON_SIZE);
});

test('test_liquidTabBar_whenRendered_hasTransparentBackgroundMaterial', (): void => {
  expect(styles.bar.backgroundColor).toBe('transparent');
  expect(styles.activePill.backgroundColor).toBe('rgba(255, 255, 255, 0.105)');
  expect(styles.itemPressed.backgroundColor).toBe('rgba(255, 255, 255, 0.145)');
});
