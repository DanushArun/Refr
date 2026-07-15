const modulePath = './mappers';

describe('discovery recommendation mappers', () => {
  it('test_maps_referrer_recommendation_when_received_from_backend', async (): Promise<void> => {
    const mappers = await import(modulePath);

    const card = mappers.referrerRecommendationToEndorserCard({
      id: 'referrer-42',
      userId: 'user-42',
      displayName: 'Priya Rao',
      avatarUrl: 'https://example.test/priya.png',
      companyId: 'company-7',
      companyName: 'Stripe',
      department: 'Engineering',
      jobTitle: 'Staff Backend Engineer',
      endorsementScore: 91,
      endorsementTier: 'gold',
      opportunityId: 'job-77',
      opportunityTitle: 'Backend Platform Engineer',
      roleFamily: 'Engineering',
      roleLevel: 'Senior',
      matchScore: 88.4,
      reasonCodes: ['role_fit'],
      poolKey: 'strict',
      wideningLevel: 0,
    });

    expect(card).toMatchObject({
      id: 'referrer-42',
      name: 'Priya Rao',
      companyId: 'company-7',
      companyName: 'Stripe',
      jobTitle: 'Staff Backend Engineer',
      matchPercent: 88,
      opportunityId: 'job-77',
      opportunityTitle: 'Backend Platform Engineer',
    });
  });

  it(
    'test_maps_referrer_recommendation_when_facts_missing_expected_no_invented_stats',
    async () => {
    const mappers = await import(modulePath);

    const card = mappers.referrerRecommendationToEndorserCard({
      id: 'referrer-42',
      userId: 'user-42',
      displayName: 'Priya Rao',
      companyId: 'company-7',
      companyName: 'Stripe',
      endorsementScore: 91,
      endorsementTier: 'gold',
      opportunityId: 'job-77',
      opportunityTitle: 'Backend Platform Engineer',
      roleFamily: 'Engineering',
      roleLevel: 'Senior',
      matchScore: 88.4,
      reasonCodes: ['role_fit'],
      poolKey: 'strict',
      wideningLevel: 0,
    });

    expect({
      acceptanceRate: card.acceptanceRate,
      hires: card.hires,
      responseTime: card.responseTime,
    }).toEqual({ acceptanceRate: undefined, hires: undefined, responseTime: undefined });
    },
  );

  it('test_maps_seeker_recommendation_when_received_from_backend', async (): Promise<void> => {
    const mappers = await import(modulePath);

    const card = mappers.seekerRecommendationToSeekerCard({
      id: 'seeker-9',
      userId: 'user-9',
      displayName: 'Aarav Mehta',
      avatarUrl: 'https://example.test/aarav.png',
      headline: 'Backend engineer scaling payment systems',
      skills: ['Go', 'PostgreSQL', 'Kafka', 'AWS'],
      yearsOfExperience: 6,
      targetRoles: ['Backend Engineer', 'Platform Engineer'],
      targetCompanies: ['Stripe', 'Razorpay', 'Rippling'],
      endorsementScore: 72,
      endorsementTier: 'silver',
      opportunityId: 'job-11',
      opportunityTitle: 'Backend Infrastructure Engineer',
      matchScore: 93.7,
      reasonCodes: ['company_target'],
      poolKey: 'strict',
      wideningLevel: 0,
    });

    expect(card).toMatchObject({
      id: 'seeker-9',
      name: 'Aarav Mehta',
      targetRole: 'Backend Engineer',
      skills: ['Go', 'PostgreSQL', 'Kafka'],
      matchPercent: 94,
      opportunityId: 'job-11',
    });
  });

  it('test_maps_seeker_recommendation_when_avatar_missing_expected_no_stock_portrait', async () => {
    const mappers = await import(modulePath);

    const card = mappers.seekerRecommendationToSeekerCard({
      id: 'seeker-9',
      userId: 'user-9',
      displayName: 'Aarav Mehta',
      avatarUrl: null,
      skills: ['Go'],
      yearsOfExperience: 6,
      targetRoles: ['Backend Engineer'],
      targetCompanies: ['Stripe'],
      endorsementScore: 72,
      endorsementTier: 'silver',
      opportunityId: 'job-11',
      opportunityTitle: 'Backend Infrastructure Engineer',
      matchScore: 93.7,
      reasonCodes: ['company_target'],
      poolKey: 'strict',
      wideningLevel: 0,
    });

    expect(card.photoUrl).toBeUndefined();
  });
});
