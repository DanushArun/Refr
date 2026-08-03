import type { ReferrerRecommendation } from '../../services/api/recommendations';
import { presentSeekerOpportunity } from './seekerOpportunityPresentation';

const recommendation: ReferrerRecommendation = {
  id: 'recommendation-1',
  userId: 'endorser-1',
  displayName: 'Suresh Menon',
  avatarUrl: null,
  companyId: 'company-1',
  companyName: 'PhonePe',
  department: 'Platform',
  jobTitle: 'Tech Lead',
  endorsementScore: 71,
  endorsementTier: 'trusted',
  opportunityId: 'opportunity-1',
  opportunityTitle: 'Platform Engineer',
  roleFamily: 'platform',
  roleLevel: 'senior',
  matchScore: 82,
  reasonCodes: ['eligible', 'market_liquidity'],
  poolKey: 'pool',
  wideningLevel: 0,
};

test('presents a live endorser recommendation as a seeker opportunity card', () => {
  expect(presentSeekerOpportunity(recommendation)).toMatchObject({
    id: 'opportunity-1',
    referrerId: 'endorser-1',
    title: 'Platform Engineer',
    company: 'PhonePe',
    connection: 'Suresh Menon · Tech Lead',
    score: 82,
    fitLabel: 'Great fit',
    endorserJobTitle: 'Tech Lead',
  });
});

test('uses a safe role fallback when a referrer job title is unavailable', () => {
  const result = presentSeekerOpportunity({ ...recommendation, jobTitle: null, matchScore: 33 });

  expect(result.connection).toBe('Suresh Menon · Verified employee');
  expect(result.fitLabel).toBe('Potential fit');
});
