import type { ReferralStatus } from '@prisma/client';

// ─── Valid transitions ─────────────────────────────────────────────────────
// Each key is the current status; the value is the set of states it can move to.
// This is the single source of truth for the 8-state referral pipeline.

const TRANSITIONS: Record<ReferralStatus, ReferralStatus[]> = {
  requested:    ['accepted', 'rejected', 'withdrawn'],
  accepted:     ['submitted', 'withdrawn'],
  submitted:    ['interviewing', 'rejected', 'withdrawn'],
  interviewing: ['hired', 'rejected', 'withdrawn'],
  hired:        [],
  rejected:     [],
  withdrawn:    [],
  expired:      [],
};

export function canTransition(from: ReferralStatus, to: ReferralStatus): boolean {
  return TRANSITIONS[from].includes(to);
}

export function assertTransition(from: ReferralStatus, to: ReferralStatus): void {
  if (!canTransition(from, to)) {
    throw new Error(`Invalid referral transition: ${from} → ${to}`);
  }
}

// Timestamp fields to set when entering each state
export const TRANSITION_TIMESTAMP: Partial<Record<ReferralStatus, string>> = {
  accepted:     'acceptedAt',
  submitted:    'submittedAt',
  interviewing: 'interviewingAt',
  hired:        'outcomeAt',
  rejected:     'outcomeAt',
  withdrawn:    'outcomeAt',
};
