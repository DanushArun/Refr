import { screenContentFor } from './lightJourneyModel';

describe('light journey screen content', () => {
  it('gives the seeker discover screen an introduction request action', () => {
    const content = screenContentFor('seeker', 'discover');

    expect(content?.primaryAction).toBe('Request introduction');
  });

  it('gives the endorser candidate screen a referral submission action', () => {
    const content = screenContentFor('endorser', 'candidates');

    expect(content?.primaryAction).toBe('Submit referral');
  });

  it('keeps payouts exclusive to the endorser journey', () => {
    expect(screenContentFor('seeker', 'earnings')).toBeNull();
  });
});
