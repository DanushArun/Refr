import {
  calculatePayoutAmount,
  calculateRankPosition,
  estimateInFlight,
  formatINR,
  formatINRFull,
} from './earningsLogic';

describe('earningsLogic', () => {
  test('formatINR_whenAmountIsLakhs_returnsCompactIndianAmount', () => {
    expect(formatINR(220000)).toBe('₹2.2L');
  });

  test('formatINRFull_whenAmountHasIndianGrouping_returnsFullAmount', () => {
    expect(formatINRFull(220000)).toBe('₹2,20,000');
  });

  test('estimateInFlight_whenHiresExceedTotal_clampsToZero', () => {
    expect(estimateInFlight(2, 5)).toBe(0);
  });

  test('calculatePayoutAmount_whenHiresExist_returnsSuccessFeeTotal', () => {
    expect(calculatePayoutAmount(3, 22000)).toBe(120000);
  });

  test('calculateRankPosition_whenViewerMissing_returnsZero', () => {
    expect(calculateRankPosition('Asha', [{ user: { displayName: 'Nivrant' } }])).toBe(0);
  });
});
