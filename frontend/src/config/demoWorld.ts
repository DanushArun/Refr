import type { ReferrerInboxItem } from '@refr/shared';
import {
  DEMO,
  DEMO_REFERRERS,
  MOCK_INBOX,
  MOCK_REFERRER_PROFILE,
  MOCK_REPUTATION,
  MOCK_SEEKER_PROFILE,
} from './demo';

export const DEMO_PAYOUT_PER_HIRE = 22000;

export interface DemoPayout {
  id: string;
  candidateName: string;
  companyName: string;
  role: string;
  dateISO: string;
  amount: number;
}

export function getCurrentDemoCompanyName(): string {
  const referrer = DEMO_REFERRERS.find((r) => r.id === MOCK_REPUTATION.user.id);
  return referrer?.company.name ?? MOCK_REPUTATION.company.name;
}

export function getCurrentDemoProfile() {
  return DEMO.demoRole === 'seeker' ? MOCK_SEEKER_PROFILE : MOCK_REFERRER_PROFILE;
}

export function buildDemoPayouts(
  hires: number,
  companyName = getCurrentDemoCompanyName(),
  inbox: ReferrerInboxItem[] = MOCK_INBOX,
): DemoPayout[] {
  if (hires <= 0) return [];
  const candidates = prioritizePayoutCandidates(inbox);
  return candidates.slice(0, hires).map((item, index) => ({
    id: `payout-${item.referral.id}`,
    candidateName: item.seekerName,
    companyName,
    role: item.referral.targetRole,
    dateISO: payoutDateFor(item, index),
    amount: DEMO_PAYOUT_PER_HIRE,
  }));
}

function prioritizePayoutCandidates(inbox: ReferrerInboxItem[]): ReferrerInboxItem[] {
  return [...inbox].sort((a, b) => {
    const rankDelta = payoutRank(b) - payoutRank(a);
    if (rankDelta !== 0) return rankDelta;
    return latestTime(b) - latestTime(a);
  });
}

function payoutRank(item: ReferrerInboxItem): number {
  if (item.referral.status === 'hired') return 4;
  if (item.referral.status === 'interviewing') return 3;
  if (item.referral.status === 'submitted') return 2;
  if (item.referral.status === 'accepted') return 1;
  return 0;
}

function latestTime(item: ReferrerInboxItem): number {
  const iso = item.referral.outcomeAt ?? item.referral.submittedAt ?? item.referral.acceptedAt;
  return iso ? new Date(iso).getTime() : 0;
}

function payoutDateFor(item: ReferrerInboxItem, index: number): string {
  const iso = item.referral.outcomeAt ?? item.referral.submittedAt;
  if (iso) return iso;
  return new Date(Date.now() - (index + 1) * 14 * 86_400_000).toISOString();
}
