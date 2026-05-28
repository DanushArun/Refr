import type {
  ReferralStatus,
  ReferrerInboxItem,
  SeekerPipelineItem,
} from '@refr/shared';

export type StageFilter = 'all' | 'requested' | 'submitted' | 'interviewing';

export const INBOX_STAGE_FILTERS: { key: StageFilter; label: string }[] = [
  { key: 'all', label: 'All' },
  { key: 'requested', label: 'New' },
  { key: 'submitted', label: 'Submitted' },
  { key: 'interviewing', label: 'Interviewing' },
];

export const INBOX_STAGE_LABEL: Record<StageFilter, string> = {
  all: 'All',
  requested: 'New',
  submitted: 'Submitted',
  interviewing: 'Interviewing',
};

const ACTIVE_FOR_INBOX: ReadonlySet<ReferralStatus> = new Set<ReferralStatus>([
  'requested',
  'accepted',
  'submitted',
  'interviewing',
  'hired',
  'rejected',
  'withdrawn',
  'expired',
]);

export function filterInboxActive(items: ReferrerInboxItem[]): ReferrerInboxItem[] {
  return items.filter((item) => ACTIVE_FOR_INBOX.has(item.referral.status));
}

export function bucketForInboxStatus(
  status: ReferralStatus,
): Exclude<StageFilter, 'all'> | null {
  if (status === 'requested' || status === 'accepted') return 'requested';
  if (status === 'submitted') return 'submitted';
  if (status === 'interviewing') return 'interviewing';
  return null;
}

export function filterInboxByStage(
  items: ReferrerInboxItem[],
  filter: StageFilter,
): ReferrerInboxItem[] {
  if (filter === 'all') return items;
  return items.filter((item) => bucketForInboxStatus(item.referral.status) === filter);
}

export function buildInboxStageCounts(
  items: ReferrerInboxItem[],
): Record<Exclude<StageFilter, 'all'>, number> {
  const out = { requested: 0, submitted: 0, interviewing: 0 };
  for (const item of items) {
    const bucket = bucketForInboxStatus(item.referral.status);
    if (bucket) out[bucket] += 1;
  }
  return out;
}

export function summarizeInbox(items: ReferrerInboxItem[]): {
  newCount: number;
  submittedCount: number;
  interviewingCount: number;
} {
  const counts = buildInboxStageCounts(items);
  return {
    newCount: counts.requested,
    submittedCount: counts.submitted,
    interviewingCount: counts.interviewing,
  };
}

export function adaptInboxItem(
  item: ReferrerInboxItem,
  companyName: string,
): SeekerPipelineItem {
  return {
    referral: item.referral,
    referrerName: item.seekerName,
    companyName,
  };
}
