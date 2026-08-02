import { launchContentFor } from './launchPresentation';

describe('launch presentation', () => {
  it('uses the shared launch artwork and seeker copy from screen zero', () => {
    expect(launchContentFor('seeker')).toEqual({
      artwork: 'launch-common.png',
      headline: 'Opportunity moves through people.',
      subheading: 'Find a trusted introduction—or make one.',
    });
  });

  it('uses the same launch presentation for the endorser flow', () => {
    expect(launchContentFor('endorser')).toEqual(launchContentFor('seeker'));
  });
});
