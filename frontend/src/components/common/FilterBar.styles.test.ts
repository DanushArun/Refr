jest.mock('react-native', () => ({
  StyleSheet: {
    hairlineWidth: 1,
    create: <T>(styles: T): T => styles,
  },
}));

jest.mock('./PressableScale', () => ({
  PressableScale: 'PressableScale',
}));

jest.mock('../../utils/haptics', () => ({
  Phrase: { tick: jest.fn() },
}));

import {
  DISCOVER_FILTER_CHIP_WIDTH,
  filterBarStyles,
} from './FilterBar';

const styles = filterBarStyles as Record<string, Record<string, unknown>>;

test('test_filterBar_whenFixedWidthChip_keepsCompactMobileScale', (): void => {
  expect(DISCOVER_FILTER_CHIP_WIDTH).toBe(78);
  expect(styles.chipFixed.minHeight).toBe(32);
  expect(styles.chipFixed.borderRadius).toBe(16);
  expect(styles.chipFixed.paddingHorizontal).toBe(8);
});
