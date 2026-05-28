import type { ReferralStatus, SeekerPipelineItem } from '@refr/shared';

export type StageFilter = 'all' | 'matched' | 'submitted' | 'interviewing';

export const STAGE_FILTERS: { key: StageFilter; label: string }[] = [
  { key: 'all', label: 'All' },
  { key: 'matched', label: 'Matched' },
  { key: 'submitted', label: 'Submitted' },
  { key: 'interviewing', label: 'Interviewing' },
];

export const STAGE_LABEL: Record<StageFilter, string> = {
  all: 'All',
  matched: 'Matched',
  submitted: 'Submitted',
  interviewing: 'Interviewing',
};

export function bucketFor(status: ReferralStatus): Exclude<StageFilter, 'all'> | null {
  switch (status) {
    case 'requested':
    case 'accepted':
      return 'matched';
    case 'submitted':
      return 'submitted';
    case 'interviewing':
      return 'interviewing';
    default:
      return null;
  }
}

export function buildStageCounts(
  items: readonly SeekerPipelineItem[],
): Record<Exclude<StageFilter, 'all'>, number> {
  const out = { matched: 0, submitted: 0, interviewing: 0 };
  for (const it of items) {
    const bucket = bucketFor(it.referral.status);
    if (bucket) out[bucket] += 1;
  }
  return out;
}

export function filterByStage(
  items: readonly SeekerPipelineItem[],
  filter: StageFilter,
): SeekerPipelineItem[] {
  if (filter === 'all') return [...items];
  return items.filter((it) => bucketFor(it.referral.status) === filter);
}

export function resolveMatchesError(error: unknown): string {
  if (error instanceof Error && error.message.trim().length > 0) {
    return error.message;
  }
  return 'Matches could not be loaded. Check your connection and retry.';
}
