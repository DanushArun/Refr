export const endorserReferralStates = [
  'details',
  'received',
  'role',
  'consent',
  'note',
  'submitted',
] as const;

export type EndorserReferralState = (typeof endorserReferralStates)[number];

const nextRoutes: Record<EndorserReferralState, string> = {
  details: '/endorser/handoff/priya-razo/received',
  received: '/endorser/referral/priya-razo',
  role: '/endorser/referral/priya-razo/consent',
  consent: '/endorser/referral/priya-razo/note',
  note: '/endorser/referral/priya-razo/submitted',
  submitted: '/endorser/candidates/priya-razo',
};

export function nextEndorserReferralRoute(state: EndorserReferralState): string {
  return nextRoutes[state];
}
