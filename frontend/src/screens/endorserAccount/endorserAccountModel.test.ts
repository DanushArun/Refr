import { endorserAccountStates } from './endorserAccountModel';

test('endorser account covers reward and account catalogue states', () => {
  expect(endorserAccountStates).toEqual([
    'earnings', 'reward-detail', 'payout', 'paid', 'profile', 'preferences', 'payouts', 'privacy',
  ]);
});
