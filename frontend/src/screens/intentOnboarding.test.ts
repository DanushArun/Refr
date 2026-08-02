import { intentSteps, selectedSkills } from './intentOnboarding';

describe('intent onboarding', () => {
  it('keeps the catalogue panels in their designed order', () => {
    expect(intentSteps).toEqual(['skills', 'impact', 'target-role', 'preferences']);
  });

  it('limits the default verified skill selection to four skills', () => {
    expect(selectedSkills).toHaveLength(4);
  });
});
