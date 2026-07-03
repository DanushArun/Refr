jest.mock('react-native', () => ({
  Platform: { OS: 'ios' },
  StyleSheet: {
    absoluteFillObject: {},
    create: <T>(styles: T): T => styles,
  },
  View: 'View',
}));

jest.mock('expo-blur', () => ({
  BlurView: 'BlurView',
}));

jest.mock('expo-linear-gradient', () => ({
  LinearGradient: 'LinearGradient',
}));

import { frostedGlassSurfaceStyles } from './FrostedGlassSurface';

const styles = frostedGlassSurfaceStyles as Record<string, unknown>;

test('test_frostedGlassSurface_whenPremiumCard_avoidsHardOuterBorder', (): void => {
  expect((styles.surface as { borderWidth?: number }).borderWidth ?? 0).toBe(0);
});

test('test_frostedGlassSurface_whenPremiumCard_removesRoughEdgeLayers', (): void => {
  expect(['topEdge', 'innerShade'].filter((key) => key in styles)).toEqual([]);
});
