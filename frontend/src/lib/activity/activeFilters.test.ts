import type { ReferrerInboxItem } from '@refr/shared';
import {
  bucketForActiveStatus,
  countActiveStages,
  filterActiveItems,
  sortActiveItems,
} from './activeFilters';

function item(
  id: string,
  status: ReferrerInboxItem['referral']['status'],
  submittedAt?: string,
): ReferrerInboxItem {
  return {
    referral: {
      id,
      seekerId: `s-${id}`,
      referrerId: 'r-1',
      companyId: 'c-1',
      targetRole: 'Backend Engineer',
      status,
      matchScore: 80,
      requestedAt: '2026-05-01T00:00:00.000Z',
      submittedAt,
    },
    seekerName: `Candidate ${id}`,
    seekerHeadline: '4y backend',
    matchScore: 80,
  };
}

describe('activeFilters', () => {
  test('bucketForActiveStatus_whenAccepted_returnsMatched', () => {
    expect(bucketForActiveStatus('accepted')).toBe('matched');
  });

  test('filterActiveItems_whenTerminalRejected_excludesRejected', () => {
    const result = filterActiveItems([item('1', 'accepted'), item('2', 'rejected')], 'all');
    expect(result).toHaveLength(1);
  });

  test('countActiveStages_whenMixedStatuses_returnsStageCounts', () => {
    const result = countActiveStages([
      item('1', 'accepted'),
      item('2', 'submitted'),
      item('3', 'interviewing'),
      item('4', 'hired'),
    ]);
    expect(result).toEqual({ matched: 1, submitted: 1, interviewing: 1, hired: 1 });
  });

  test('sortActiveItems_whenDifferentStages_prioritizesInterviewing', () => {
    const result = sortActiveItems([item('1', 'accepted'), item('2', 'interviewing')]);
    expect(result[0].referral.id).toBe('2');
  });
});
