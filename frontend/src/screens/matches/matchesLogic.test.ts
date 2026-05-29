import type { ReferralStatus, SeekerPipelineItem } from '@refr/shared';

import {
  bucketFor,
  buildStageCounts,
  filterByStage,
  resolveMatchesError,
} from './matchesLogic';

function item(id: string, status: ReferralStatus): SeekerPipelineItem {
  return {
    referral: {
      id,
      seekerId: 's-1',
      referrerId: `e-${id}`,
      companyId: 'c-1',
      targetRole: 'Product Engineer',
      status,
      matchScore: 88,
      requestedAt: '2026-05-20T10:00:00.000Z',
    },
    referrerName: `Endorser ${id}`,
    companyName: 'CRED',
  };
}

describe('matchesLogic', () => {
  test('bucketFor_whenAccepted_returnsMatched', () => {
    expect(bucketFor('accepted')).toBe('matched');
  });

  test('filterByStage_whenSubmitted_returnsOnlySubmittedItems', () => {
    const filtered = filterByStage(
      [item('1', 'accepted'), item('2', 'submitted'), item('3', 'hired')],
      'submitted',
    );
    expect(filtered).toEqual([item('2', 'submitted')]);
  });

  test('buildStageCounts_whenTerminalPresent_ignoresTerminalStatuses', () => {
    const counts = buildStageCounts([
      item('1', 'requested'),
      item('2', 'interviewing'),
      item('3', 'rejected'),
    ]);
    expect(counts).toEqual({ matched: 1, submitted: 0, interviewing: 1 });
  });

  test('resolveMatchesError_whenErrorHasMessage_returnsMessage', () => {
    expect(resolveMatchesError(new Error('Network request failed'))).toBe(
      'Network request failed',
    );
  });

  test('resolveMatchesError_whenErrorUnknown_returnsFallback', () => {
    expect(resolveMatchesError(null)).toBe(
      'Matches could not be loaded. Check your connection and retry.',
    );
  });
});
