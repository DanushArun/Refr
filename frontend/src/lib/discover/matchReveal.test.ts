import { shouldShowMatchReveal } from './matchReveal';

describe('shouldShowMatchReveal', () => {
  it('returns_true_when_swipe_result_is_mutual', (): void => {
    expect(shouldShowMatchReveal({ mutual: true })).toBe(true);
  });

  it('returns_false_when_swipe_result_is_not_mutual', (): void => {
    expect(shouldShowMatchReveal({ mutual: false })).toBe(false);
  });
});
