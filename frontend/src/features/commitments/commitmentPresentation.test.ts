import {
  canOpenConversation,
  referrerActionsForStatus,
} from './commitmentPresentation';

describe('commitment presentation', () => {
  test('canOpenConversation_when_request_is_pending_expected_false', () => {
    expect(canOpenConversation('requested')).toBe(false);
  });

  test('canOpenConversation_when_request_is_accepted_expected_true', () => {
    expect(canOpenConversation('accepted')).toBe(true);
  });

  test('referrerActionsForStatus_when_pending_expected_review_actions', () => {
    expect(referrerActionsForStatus('requested')).toEqual(['accept', 'decline']);
  });
});
