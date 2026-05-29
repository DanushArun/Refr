import type { ReferralStatus, ReferrerInboxItem } from '@refr/shared';

export type ActiveStageFilter = 'all' | 'matched' | 'submitted' | 'interviewing' | 'hired';

export const ACTIVE_STAGE_FILTERS: { key: ActiveStageFilter; label: string }[] = [
  { key: 'all', label: 'All' },
  { key: 'matched', label: 'Matched' },
  { key: 'submitted', label: 'Submitted' },
  { key: 'interviewing', label: 'Interviewing' },
  { key: 'hired', label: 'Hired' },
];

export const ACTIVE_REFERRAL_STATUSES: ReadonlySet<ReferralStatus> = new Set([
  'accepted',
  'submitted',
  'interviewing',
  'hired',
]);

const STAGE_SORT_RANK: Record<string, number> = {
  interviewing: 0,
  submitted: 1,
  accepted: 2,
  requested: 2,
  hired: 3,
};

export function isActiveReferral(item: ReferrerInboxItem): boolean {
  return ACTIVE_REFERRAL_STATUSES.has(item.referral.status);
}

export function bucketForActiveStatus(
  status: ReferralStatus,
): Exclude<ActiveStageFilter, 'all'> | null {
  if (status === 'accepted') return 'matched';
  if (status === 'submitted') return 'submitted';
  if (status === 'interviewing') return 'interviewing';
  if (status === 'hired') return 'hired';
  return null;
}

export function filterActiveItems(
  items: ReferrerInboxItem[],
  filter: ActiveStageFilter,
): ReferrerInboxItem[] {
  const active = items.filter(isActiveReferral);
  if (filter === 'all') return active;
  return active.filter((item) => bucketForActiveStatus(item.referral.status) === filter);
}

export function countActiveStages(
  items: ReferrerInboxItem[],
): Record<Exclude<ActiveStageFilter, 'all'>, number> {
  const out = { matched: 0, submitted: 0, interviewing: 0, hired: 0 };
  for (const item of items.filter(isActiveReferral)) {
    const bucket = bucketForActiveStatus(item.referral.status);
    if (bucket) out[bucket] += 1;
  }
  return out;
}

export function sortActiveItems(items: ReferrerInboxItem[]): ReferrerInboxItem[] {
  return [...items].sort((a, b) => {
    const rankA = STAGE_SORT_RANK[a.referral.status] ?? 99;
    const rankB = STAGE_SORT_RANK[b.referral.status] ?? 99;
    if (rankA !== rankB) return rankA - rankB;
    return latestTimestampMs(b) - latestTimestampMs(a);
  });
}

function latestTimestampMs(item: ReferrerInboxItem): number {
  const referral = item.referral;
  const iso =
    referral.outcomeAt ??
    referral.submittedAt ??
    referral.acceptedAt ??
    referral.requestedAt;
  return iso ? new Date(iso).getTime() : 0;
}
