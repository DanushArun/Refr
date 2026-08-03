export const endorserAccountStates = [
  'earnings', 'reward-detail', 'payout', 'paid', 'profile', 'preferences', 'payouts', 'privacy',
] as const;

export type EndorserAccountState = (typeof endorserAccountStates)[number];
