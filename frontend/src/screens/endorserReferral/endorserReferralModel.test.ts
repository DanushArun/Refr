import { endorserReferralStates, nextEndorserReferralRoute } from './endorserReferralModel';

test('endorser handoff and referral states stay in the documented order', () => {
  expect(endorserReferralStates).toEqual([
    'details', 'received', 'role', 'consent', 'note', 'submitted',
  ]);
});

test('a verified package opens the referral role selection', () => {
  expect(nextEndorserReferralRoute('received')).toBe('/endorser/referral/priya-razo');
});
