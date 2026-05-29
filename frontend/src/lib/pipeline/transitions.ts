/**
 * Referral lifecycle state machine.
 *
 * Happy path: requested → accepted → submitted → interviewing → hired
 * Escapes:    rejected (from requested only), withdrawn / expired (from any active state)
 *
 * All transitions are validated here — UI dispatches and backend mutations
 * both ask `canTransition` before changing state.
 */

export type ReferralStatus =
  | 'requested'
  | 'accepted'
  | 'submitted'
  | 'interviewing'
  | 'hired'
  | 'rejected'
  | 'withdrawn'
  | 'expired';

export const ACTIVE_STATUSES: ReferralStatus[] = [
  'requested',
  'accepted',
  'submitted',
  'interviewing',
];

export const TERMINAL_STATUSES: ReferralStatus[] = [
  'hired',
  'rejected',
  'withdrawn',
  'expired',
];

const TRANSITIONS: Record<ReferralStatus, ReferralStatus[]> = {
  requested: ['accepted', 'rejected', 'expired'],
  accepted: ['submitted', 'withdrawn', 'expired'],
  submitted: ['interviewing', 'withdrawn', 'expired'],
  interviewing: ['hired', 'withdrawn', 'expired'],
  hired: [],
  rejected: [],
  withdrawn: [],
  expired: [],
};

const HAPPY_PATH_INDEX: Record<ReferralStatus, number> = {
  requested: 0,
  accepted: 1,
  submitted: 2,
  interviewing: 3,
  hired: 4,
  rejected: -1,
  withdrawn: -1,
  expired: -1,
};

export function canTransition(from: ReferralStatus, to: ReferralStatus): boolean {
  return TRANSITIONS[from].includes(to);
}

export function nextStates(from: ReferralStatus): ReferralStatus[] {
  return [...TRANSITIONS[from]];
}

export function isTerminal(status: ReferralStatus): boolean {
  return TERMINAL_STATUSES.includes(status);
}

export function isActive(status: ReferralStatus): boolean {
  return ACTIVE_STATUSES.includes(status);
}

export function progressIndex(status: ReferralStatus): number {
  return HAPPY_PATH_INDEX[status];
}
