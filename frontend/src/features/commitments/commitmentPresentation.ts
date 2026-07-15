import type { Referral } from '@refr/shared';

export type ReferrerAction = 'accept' | 'decline';

export function canOpenConversation(status: Referral['status']): boolean {
  return ['accepted', 'submitted', 'interviewing'].includes(status);
}

export function referrerActionsForStatus(status: Referral['status']): ReferrerAction[] {
  if (status !== 'requested') return [];
  return ['accept', 'decline'];
}
