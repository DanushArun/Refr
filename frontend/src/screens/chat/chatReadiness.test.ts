import { buildReadiness, hasResumeSignal, submitDisabledReason } from './chatReadiness';
import type { Message } from './chatLogic';

function message(body: string): Message {
  return {
    body,
    createdAt: '2026-05-30T00:00:00.000Z',
    id: body,
    sender: { displayName: 'Harshita', id: 'seeker-1' },
  };
}

describe('chatReadiness', () => {
  test('test_has_resume_signal_when_link_present_expected_true', () => {
    expect(hasResumeSignal([message('Resume: https://example.com/cv')])).toBe(true);
  });

  test('test_submit_disabled_reason_when_resume_missing_expected_resume_copy', () => {
    const summary = buildReadiness({
      messages: [message('I want the DevOps role')],
      stage: 'matched',
      targetRole: 'DevOps Engineer',
    });

    expect(submitDisabledReason(summary)).toBe('Ask for resume before submitting');
  });

  test('test_readiness_when_resume_and_role_present_expected_ready', () => {
    const summary = buildReadiness({
      messages: [message('Resume https://example.com/resume')],
      stage: 'matched',
      targetRole: 'DevOps Engineer',
    });

    expect(summary.readyForSubmission).toBe(true);
  });

  test('test_readiness_when_submitted_expected_hr_note_complete', () => {
    const summary = buildReadiness({
      messages: [message('Resume https://example.com/resume')],
      stage: 'submitted',
      targetRole: 'DevOps Engineer',
    });

    expect(summary.hrNoteReady).toBe(true);
  });
});
