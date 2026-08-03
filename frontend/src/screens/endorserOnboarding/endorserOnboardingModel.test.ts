import { endorserOnboardingStates, nextEndorserOnboardingRoute } from './endorserOnboardingModel';

test('endorser onboarding preserves the verification and setup order', () => {
  expect(endorserOnboardingStates).toEqual([
    'work', 'checking', 'verified', 'roles', 'scope', 'capacity', 'ready',
  ]);
});

test('verification advances to work setup', () => {
  expect(nextEndorserOnboardingRoute('verified')).toBe('/endorser-onboarding/roles');
});
