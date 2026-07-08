jest.mock('../auth', () => ({
  getSession: jest.fn(async () => ({
    access_token: 'access-token',
    refresh_token: 'refresh-token',
    user: { id: 'user-1', email: 'seeker@example.test' },
  })),
  saveSession: jest.fn(),
}));

jest.mock('../baseUrl', () => ({
  BASE_URL: 'https://api.example.test',
}));

jest.mock('../../demo/config', () => ({
  DEMO: {
    enabled: false,
    demoRole: 'seeker',
    screens: {
      auth: false,
      feed: false,
      pipeline: false,
      inbox: false,
      chat: false,
      earnings: false,
      profile: false,
      matches: false,
    },
  },
  isDemoScreen: jest.fn(() => false),
  MOCK_FEED_RESPONSE: { cards: [], cursor: null, hasMore: false },
  MOCK_PIPELINE: [],
  MOCK_INBOX: [],
  MOCK_CHAT_CONVERSATION_ID: 'conv-test',
  MOCK_REPUTATION: {
    endorsementScore: 0,
    totalReferrals: 0,
    successfulHires: 0,
  },
  MOCK_LEADERBOARD: [],
  MOCK_SEEKER_PROFILE: {},
  MOCK_REFERRER_PROFILE: {},
  DEMO_SEEKERS: [],
  chatForReferral: jest.fn(() => []),
  appendChatMessage: jest.fn(),
  referrerByCompany: jest.fn(),
  referrerById: jest.fn(),
}));

jest.mock('../../demo/world', () => ({
  getCurrentDemoCompanyName: jest.fn(() => 'Demo Company'),
}));

describe('referralsApi swipe mutations', () => {
  beforeEach((): void => {
    global.fetch = jest.fn(async () => ({
      ok: true,
      status: 201,
      json: async () => ({
        data: {
          id: 'referral-1',
          seekerId: 'seeker-1',
          referrerId: 'referrer-42',
          companyId: 'company-7',
          opportunityId: 'job-77',
          jobId: 'job-77',
          targetRole: 'Backend Platform Engineer',
          status: 'requested',
          matchScore: 88,
          requestedAt: '2026-07-08T00:00:00.000Z',
        },
      }),
    })) as jest.Mock;
  });

  it('test_posts_specific_referrer_when_seeker_swipes_right', async (): Promise<void> => {
    const { referralsApi } = await import('./client');

    const endorser = {
      id: 'referrer-42',
      name: 'Priya Rao',
      companyId: 'company-7',
      companyName: 'Stripe',
      jobTitle: 'Backend Platform Engineer',
      opportunityId: 'job-77',
    } as unknown as Parameters<typeof referralsApi.recordSeekerSwipe>[0];

    await referralsApi.recordSeekerSwipe(endorser, 'Strong fit for my search.');
    const options = (global.fetch as jest.Mock).mock.calls[0][1];
    const body = JSON.parse(options.body);

    expect(body).toEqual({
      referrerId: 'referrer-42',
      jobId: 'job-77',
      targetRole: 'Backend Platform Engineer',
      source: 'browse',
      seekerNote: 'Strong fit for my search.',
    });
  });
});
