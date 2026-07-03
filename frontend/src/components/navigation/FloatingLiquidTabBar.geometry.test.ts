import { spacing } from '../../theme/spacing';
import { activePillMetrics } from './FloatingLiquidTabBar.geometry';

test('test_activePillMetrics_whenFirstTab_keepsOvalInsideEdgeReserve', (): void => {
  expect(activePillMetrics(0, 5, 385)?.left).toBe(spacing[3] - spacing[2]);
});

test('test_activePillMetrics_whenLastTab_keepsOvalInsideEdgeReserve', (): void => {
  const metrics = activePillMetrics(4, 5, 385);

  expect(metrics && metrics.left + metrics.width).toBe(385 - spacing[3] + spacing[2]);
});

test('test_activePillMetrics_whenFiveTabs_keepsOvalWiderThanCell', (): void => {
  const rowPadding = spacing[3];
  const cellWidth = (385 - rowPadding * 2) / 5;

  expect(activePillMetrics(2, 5, 385)?.width).toBeGreaterThan(cellWidth);
});
