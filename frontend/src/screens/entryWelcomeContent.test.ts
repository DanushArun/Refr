import { entryWelcomeBenefits } from './entryWelcomeContent';

describe('entry welcome content', () => {
  it('explains the three verification benefits in the designed order', () => {
    expect(entryWelcomeBenefits.map((benefit) => benefit.title)).toEqual([
      'Your details are verified',
      'Endorsers find and trust',
      'Opportunities, faster',
    ]);
  });
});
