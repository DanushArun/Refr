import { shouldShowMatchReveal } from './matchReveal';

describe('shouldShowMatchReveal', () => {
  it('test_should_show_match_reveal_when_mutual_with_referral_expected_true', (): void => {
    expect(shouldShowMatchReveal({ mutual: true, referral: { id: 'referral-1' } })).toBe(true);
  });

  it('test_should_show_match_reveal_when_not_mutual_expected_false', (): void => {
    expect(shouldShowMatchReveal({ mutual: false, referral: null })).toBe(false);
  });

  it('test_should_show_match_reveal_when_mutual_without_referral_expected_false', (): void => {
    expect(shouldShowMatchReveal({ mutual: true, referral: null })).toBe(false);
  });
});
