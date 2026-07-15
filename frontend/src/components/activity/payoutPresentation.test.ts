import { payoutLabel } from './payoutPresentation';

test('test_payout_label_when_amount_missing_expected_hidden', () => {
  expect(payoutLabel()).toBeNull();
});

test('test_payout_label_when_amount_available_expected_compact_currency', () => {
  expect(payoutLabel(22000)).toBe('₹22K');
});
