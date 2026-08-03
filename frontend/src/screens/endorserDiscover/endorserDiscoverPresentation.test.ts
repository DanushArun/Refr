import type { SeekerRecommendation } from '../../services/api/recommendations';
import { presentEndorserCandidate } from './endorserDiscoverPresentation';

const recommendation: SeekerRecommendation = {
  id: 'rec-1',
  userId: 'seeker-1',
  displayName: 'Danush Arun',
  avatarUrl: null,
  headline: 'Backend engineer, 4y at Flipkart',
  skills: ['Node.js', 'PostgreSQL', 'Kafka'],
  yearsOfExperience: 4,
  targetRoles: ['Senior Backend Engineer'],
  targetCompanies: ['Razorpay'],
  endorsementScore: 75,
  endorsementTier: 'trusted',
  opportunityId: 'opportunity-1',
  opportunityTitle: 'Senior Backend Engineer',
  matchScore: 82,
  reasonCodes: ['eligible', 'market_liquidity'],
  poolKey: 'pool',
  wideningLevel: 0,
};

test('presents a live seeker recommendation for the endorser card', () => {
  expect(presentEndorserCandidate(recommendation)).toMatchObject({
    id: 'seeker-1',
    name: 'Danush Arun',
    headline: 'Backend engineer, 4y at Flipkart',
    meta: '4 years · Node.js · PostgreSQL',
    target: 'Looking for: Senior Backend Engineer',
    fitLabel: 'Great fit',
    yearsOfExperience: 4,
    skills: ['Node.js', 'PostgreSQL', 'Kafka'],
    targetRole: 'Senior Backend Engineer',
  });
});

test('presents a trustworthy fallback when optional recommendation details are absent', () => {
  const result = presentEndorserCandidate({
    ...recommendation,
    headline: null,
    skills: [],
    targetRoles: [],
    matchScore: 34,
  });

  expect(result.headline).toBe('Senior Backend Engineer');
  expect(result.meta).toBe('4 years · Verified candidate');
  expect(result.target).toBe('Looking for: Senior Backend Engineer');
  expect(result.fitLabel).toBe('Potential fit');
});
