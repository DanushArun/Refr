import { identitySteps, progressDots } from './identityOnboarding';

describe('identity onboarding', () => {
  it('keeps the four required profile steps in their journey order', () => {
    expect(identitySteps.map((step) => step.id)).toEqual([
      'basics',
      'current-role',
      'career-history',
      'education',
    ]);
  });

  it('marks only the current step as active in the progress control', () => {
    expect(progressDots(2)).toEqual(['complete', 'complete', 'active', 'upcoming']);
  });
});
