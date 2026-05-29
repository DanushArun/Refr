import { DEMO_PAYOUT_PER_HIRE, buildDemoPayouts, getCurrentDemoCompanyName } from './demoWorld';
import { MOCK_INBOX } from './demo';

describe('demoWorld', () => {
  test('getCurrentDemoCompanyName_whenReferrerProfileSelected_returnsRazorpay', () => {
    expect(getCurrentDemoCompanyName()).toBe('Razorpay');
  });

  test('buildDemoPayouts_whenHiresRequested_usesInboxCandidates', () => {
    const payouts = buildDemoPayouts(2, 'Razorpay', MOCK_INBOX);
    expect(payouts.map((p) => p.candidateName)).toEqual(['Aditi Sharma', 'Kavya Ramesh']);
  });

  test('buildDemoPayouts_whenHiresRequested_setsStandardAmount', () => {
    const [payout] = buildDemoPayouts(1, 'Razorpay', MOCK_INBOX);
    expect(payout.amount).toBe(DEMO_PAYOUT_PER_HIRE);
  });
});
