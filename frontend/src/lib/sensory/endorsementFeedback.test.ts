import { feedbackForEndorsementDecision } from './endorsementFeedback';

describe('endorsementFeedback', () => {
  test('feedbackForEndorsementDecision_whenPass_returnsNoToast', () => {
    const feedback = feedbackForEndorsementDecision('pass');

    expect(feedback.toast).toBeNull();
  });

  test('feedbackForEndorsementDecision_whenRequest_setsProfessionalSavingCopy', () => {
    const feedback = feedbackForEndorsementDecision('request', 'Aarav');

    expect(feedback.toast).toBe('Saving endorsement for Aarav...');
  });
});
