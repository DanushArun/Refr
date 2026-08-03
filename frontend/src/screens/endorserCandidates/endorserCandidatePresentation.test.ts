import type { ReferrerInboxItem } from '@refr/shared';
import { presentEndorserCandidate } from './endorserCandidatePresentation';

const item: ReferrerInboxItem = {
  companyName: 'Razorpay',
  seekerName: 'Priya Nair',
  seekerHeadline: 'Product leader in payments',
  matchScore: 91,
  referral: {
    id: 'referral-1',
    seekerId: 'seeker-1',
    companyId: 'company-1',
    targetRole: 'Senior Product Manager',
    status: 'interviewing',
    matchScore: 91,
    requestedAt: '2026-08-03T10:00:00Z',
  },
};

test('presents an incoming referral as a live endorser candidate', (): void => {
  expect(presentEndorserCandidate(item)).toEqual({
    company: 'Razorpay',
    id: 'referral-1',
    name: 'Priya Nair',
    role: 'Senior Product Manager',
    score: '91% fit',
    stage: 'Interviewing',
  });
});
