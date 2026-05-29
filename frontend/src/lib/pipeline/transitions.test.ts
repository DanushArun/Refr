import {
  ACTIVE_STATUSES,
  TERMINAL_STATUSES,
  canTransition,
  isActive,
  isTerminal,
  nextStates,
  progressIndex,
  type ReferralStatus,
} from './transitions';

describe('pipeline.transitions — canTransition', () => {
  test('requested_can_advance_to_accepted_or_rejected_or_expired', () => {
    expect(canTransition('requested', 'accepted')).toBe(true);
    expect(canTransition('requested', 'rejected')).toBe(true);
    expect(canTransition('requested', 'expired')).toBe(true);
  });

  test('requested_cannot_skip_to_submitted', () => {
    expect(canTransition('requested', 'submitted')).toBe(false);
  });

  test('accepted_can_advance_to_submitted_or_withdrawn_or_expired', () => {
    expect(canTransition('accepted', 'submitted')).toBe(true);
    expect(canTransition('accepted', 'withdrawn')).toBe(true);
    expect(canTransition('accepted', 'expired')).toBe(true);
  });

  test('accepted_cannot_skip_to_interviewing_or_hired', () => {
    expect(canTransition('accepted', 'interviewing')).toBe(false);
    expect(canTransition('accepted', 'hired')).toBe(false);
  });

  test('submitted_can_advance_to_interviewing_withdrawn_or_expired', () => {
    expect(canTransition('submitted', 'interviewing')).toBe(true);
    expect(canTransition('submitted', 'withdrawn')).toBe(true);
    expect(canTransition('submitted', 'expired')).toBe(true);
  });

  test('interviewing_can_advance_to_hired_withdrawn_or_expired', () => {
    expect(canTransition('interviewing', 'hired')).toBe(true);
    expect(canTransition('interviewing', 'withdrawn')).toBe(true);
    expect(canTransition('interviewing', 'expired')).toBe(true);
  });

  test('hired_is_terminal', () => {
    for (const s of ['requested', 'accepted', 'submitted', 'interviewing', 'rejected', 'withdrawn', 'expired'] as ReferralStatus[]) {
      expect(canTransition('hired', s)).toBe(false);
    }
  });

  test('rejected_withdrawn_expired_are_terminal', () => {
    for (const from of ['rejected', 'withdrawn', 'expired'] as ReferralStatus[]) {
      for (const to of ['requested', 'accepted', 'submitted', 'interviewing', 'hired'] as ReferralStatus[]) {
        expect(canTransition(from, to)).toBe(false);
      }
    }
  });

  test('cannot_transition_to_self', () => {
    for (const s of ['requested', 'accepted', 'submitted', 'interviewing', 'hired'] as ReferralStatus[]) {
      expect(canTransition(s, s)).toBe(false);
    }
  });

  test('cannot_go_backwards', () => {
    expect(canTransition('submitted', 'requested')).toBe(false);
    expect(canTransition('interviewing', 'submitted')).toBe(false);
    expect(canTransition('hired', 'interviewing')).toBe(false);
  });
});

describe('pipeline.transitions — nextStates', () => {
  test('lists_only_valid_next_statuses', () => {
    expect(nextStates('requested').sort()).toEqual(['accepted', 'expired', 'rejected'].sort());
    expect(nextStates('accepted').sort()).toEqual(['expired', 'submitted', 'withdrawn'].sort());
    expect(nextStates('submitted').sort()).toEqual(['expired', 'interviewing', 'withdrawn'].sort());
    expect(nextStates('interviewing').sort()).toEqual(['expired', 'hired', 'withdrawn'].sort());
  });

  test('terminal_statuses_have_no_next_states', () => {
    expect(nextStates('hired')).toEqual([]);
    expect(nextStates('rejected')).toEqual([]);
    expect(nextStates('withdrawn')).toEqual([]);
    expect(nextStates('expired')).toEqual([]);
  });
});

describe('pipeline.transitions — isTerminal / isActive', () => {
  test('terminal_set_is_complete', () => {
    expect(TERMINAL_STATUSES.sort()).toEqual(['expired', 'hired', 'rejected', 'withdrawn'].sort());
  });

  test('active_set_is_complete', () => {
    expect(ACTIVE_STATUSES.sort()).toEqual(['accepted', 'interviewing', 'requested', 'submitted'].sort());
  });

  test('isTerminal_matches_terminal_set', () => {
    for (const s of TERMINAL_STATUSES) expect(isTerminal(s)).toBe(true);
    for (const s of ACTIVE_STATUSES) expect(isTerminal(s)).toBe(false);
  });

  test('isActive_matches_active_set', () => {
    for (const s of ACTIVE_STATUSES) expect(isActive(s)).toBe(true);
    for (const s of TERMINAL_STATUSES) expect(isActive(s)).toBe(false);
  });
});

describe('pipeline.transitions — progressIndex', () => {
  test('happy_path_returns_zero_through_four', () => {
    expect(progressIndex('requested')).toBe(0);
    expect(progressIndex('accepted')).toBe(1);
    expect(progressIndex('submitted')).toBe(2);
    expect(progressIndex('interviewing')).toBe(3);
    expect(progressIndex('hired')).toBe(4);
  });

  test('unhappy_terminal_states_return_negative_one', () => {
    expect(progressIndex('rejected')).toBe(-1);
    expect(progressIndex('withdrawn')).toBe(-1);
    expect(progressIndex('expired')).toBe(-1);
  });
});
