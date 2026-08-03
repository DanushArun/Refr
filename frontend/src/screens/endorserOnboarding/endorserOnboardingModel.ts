export const endorserOnboardingStates = [
  'work',
  'checking',
  'verified',
  'roles',
  'scope',
  'capacity',
  'ready',
] as const;

export type EndorserOnboardingState = (typeof endorserOnboardingStates)[number];

const nextRoutes: Record<EndorserOnboardingState, string> = {
  work: '/endorser-onboarding/work?state=checking',
  checking: '/endorser-onboarding/verified',
  verified: '/endorser-onboarding/roles',
  roles: '/endorser-onboarding/scope',
  scope: '/endorser-onboarding/capacity',
  capacity: '/endorser/discover',
  ready: '/endorser/discover',
};

export function nextEndorserOnboardingRoute(state: EndorserOnboardingState): string {
  return nextRoutes[state];
}
