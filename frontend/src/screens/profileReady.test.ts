import { profileReadySteps } from './profileReady';

describe('profile ready journey', () => {
  it('keeps resume, verification, privacy, and ready states in order', () => {
    expect(profileReadySteps).toEqual(['resume', 'verification', 'visibility', 'ready']);
  });
});
