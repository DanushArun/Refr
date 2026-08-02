import { discoverTutorialActions, fitReasons } from './discoverModel';

describe('discover journey', () => {
  it('explains both swipe actions before showing opportunities', () => {
    expect(discoverTutorialActions).toEqual(['Pass', 'Save', 'Request intro']);
  });

  it('shows the three positive match reasons before the one gap', () => {
    expect(fitReasons.strong).toHaveLength(3);
    expect(fitReasons.gap).toContain('Enterprise pricing');
  });
});
