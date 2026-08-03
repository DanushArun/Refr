import type { SeekerPipelineItem } from '@refr/shared';
import { presentSeekerInboxItem } from './seekerInboxPresentation';

const item: SeekerPipelineItem = {
  companyName: 'Razorpay',
  referrerName: 'Arjun Menon',
  referral: {
    id: 'referral-1',
    seekerId: 'seeker-1',
    referrerId: 'endorser-1',
    companyId: 'company-1',
    targetRole: 'Senior Product Manager',
    status: 'submitted',
    matchScore: 82,
    requestedAt: '2026-08-03T10:00:00Z',
    seekerNote: 'Would love an introduction.',
  },
};

test('presents a real seeker referral as an inbox conversation', (): void => {
  expect(presentSeekerInboxItem(item)).toEqual({
    company: 'Razorpay',
    id: 'referral-1',
    name: 'Arjun Menon',
    preview: 'Would love an introduction.',
    role: 'Senior Product Manager',
    status: 'Submitted',
  });
});
