import type { Referral } from '@refr/shared';

import { request } from './http';
import { referralsApi } from './referrals';

jest.mock('../../demo/config', () => ({
  DEMO: { enabled: false },
  DEMO_SEEKERS: [],
  MOCK_INBOX: [],
  MOCK_LEADERBOARD: [],
  MOCK_PIPELINE: [],
  MOCK_REPUTATION: {},
  isDemoScreen: jest.fn(() => false),
  referrerByCompany: jest.fn(),
  referrerById: jest.fn(),
}));

jest.mock('../../demo/world', () => ({
  getCurrentDemoCompanyName: jest.fn(() => 'Demo Company'),
}));

jest.mock('./http', () => ({
  request: jest.fn(),
}));

const requestMock = request as jest.MockedFunction<typeof request>;

beforeEach(() => {
  requestMock.mockReset();
});

test('test_recordEndorserSwipe_when_backend_reports_mutual_expected_preserved', async () => {
  const referral = {
    id: 'referral-1',
    seekerId: 'seeker-1',
    targetRole: 'Backend Engineer',
    status: 'accepted',
  } as Referral;
  requestMock.mockResolvedValue({ data: referral, meta: { mutual: true } });

  const result = await referralsApi.recordEndorserSwipe({
    id: 'seeker-1',
    name: 'Aarav Mehta',
    headline: 'Backend engineer',
    yearsOfExperience: 6,
    skills: ['Go'],
    targetRole: 'Backend Engineer',
  });

  expect(result).toEqual({ referral, mutual: true });
});

test(
  'test_record_endorser_swipe_when_backend_returns_null_expected_non_mutual_result',
  async () => {
    requestMock.mockResolvedValue({ data: null, meta: { mutual: false } });

    const result = await referralsApi.recordEndorserSwipe({
      id: 'seeker-1',
      name: 'Aarav Mehta',
      headline: 'Backend engineer',
      yearsOfExperience: 6,
      skills: ['Go'],
      targetRole: 'Backend Engineer',
    });

    expect(result).toEqual({ referral: null, mutual: false });
  },
);

test('test_create_request_when_scope_is_selected_expected_forwarded_to_api', async () => {
  requestMock.mockResolvedValue({ data: { id: 'referral-1' } as Referral });

  await referralsApi.createRequest({
    companyId: 'company-1',
    jobId: 'opportunity-1',
    targetRole: 'Backend Engineer',
    requestKind: 'introduction',
    sharedFields: ['headline', 'skills'],
  });

  expect(requestMock).toHaveBeenCalledWith('/api/v1/referrals/', {
    method: 'POST',
    body: JSON.stringify({
      companyId: 'company-1',
      jobId: 'opportunity-1',
      targetRole: 'Backend Engineer',
      source: 'specific',
      seekerNote: undefined,
      requestKind: 'introduction',
      sharedFields: ['headline', 'skills'],
    }),
  });
});
