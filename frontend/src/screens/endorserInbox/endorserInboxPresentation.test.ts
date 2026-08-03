import type { ReferrerInboxItem } from '@refr/shared';
import { presentEndorserInboxItem } from './endorserInboxPresentation';

const item: ReferrerInboxItem = {
  companyName: 'Razorpay',
  referral: {
    id: 'referral-1',
    seekerId: 'seeker-1',
    referrerId: 'referrer-1',
    companyId: 'company-1',
    targetRole: 'Senior Backend Engineer',
    status: 'requested',
    matchScore: 84,
    requestedAt: '2026-08-03T10:00:00.000Z',
    seekerNote: 'I would value your advice before applying.',
  },
  seekerName: 'Danush Arun',
  seekerHeadline: 'Backend engineer at Flipkart',
  matchScore: 84,
};

test('presents a live referral inbox item without fixture copy', () => {
  expect(presentEndorserInboxItem(item)).toEqual({
    id: 'referral-1',
    seekerId: 'seeker-1',
    name: 'Danush Arun',
    headline: 'Backend engineer at Flipkart',
    status: 'Requested',
    fit: '84% fit',
    preview: 'I would value your advice before applying.',
  });
});

test('uses a safe conversation fallback when no note was shared', () => {
  const result = presentEndorserInboxItem({
    ...item,
    referral: { ...item.referral, seekerNote: undefined, status: 'accepted' },
  });

  expect(result.status).toBe('Accepted');
  expect(result.preview).toBe('Connection update available.');
});
