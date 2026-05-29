import type { ReferrerInboxItem } from '@refr/shared';

import {
  buildInboxStageCounts,
  bucketForInboxStatus,
  filterInboxActive,
  filterInboxByStage,
  summarizeInbox,
} from './inboxLogic';

function item(
  id: string,
  status: ReferrerInboxItem['referral']['status'],
): ReferrerInboxItem {
  return {
    referral: {
      id,
      seekerId: `s-${id}`,
      referrerId: 'r-1',
      companyId: 'c-1',
      targetRole: 'Backend Engineer',
      status,
      matchScore: 90,
      seekerNote: '',
      requestedAt: '2026-05-20T10:00:00.000Z',
    },
    seekerName: `Seeker ${id}`,
    seekerHeadline: 'Backend engineer',
    matchScore: 90,
  };
}

describe('inboxLogic', () => {
  test('bucketForInboxStatus_whenAccepted_returnsRequestedBucket', () => {
    expect(bucketForInboxStatus('accepted')).toBe('requested');
  });

  test('filterInboxActive_whenUnknownTerminalExcluded_keepsKnownTerminalHistory', () => {
    expect(filterInboxActive([item('1', 'hired'), item('2', 'requested')]).length).toBe(2);
  });

  test('filterInboxByStage_whenSubmitted_returnsOnlySubmitted', () => {
    const filtered = filterInboxByStage(
      [item('1', 'submitted'), item('2', 'requested')],
      'submitted',
    );
    expect(filtered).toEqual([item('1', 'submitted')]);
  });

  test('buildInboxStageCounts_whenMixedStatuses_returnsLiveCounts', () => {
    expect(buildInboxStageCounts([item('1', 'accepted'), item('2', 'interviewing')])).toEqual({
      requested: 1,
      submitted: 0,
      interviewing: 1,
    });
  });

  test('summarizeInbox_whenItemsMixed_returnsTriageSummary', () => {
    expect(summarizeInbox([item('1', 'accepted'), item('2', 'submitted')])).toEqual({
      newCount: 1,
      submittedCount: 1,
      interviewingCount: 0,
    });
  });
});
