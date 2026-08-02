import { participationChoices } from './participationContent';

describe('participation choices', () => {
  it('starts with the seeker path selected', () => {
    expect(participationChoices[0]).toMatchObject({
      id: 'seeker',
      title: 'I’m seeking a referral',
    });
  });

  it('keeps the endorser path available as the second choice', () => {
    expect(participationChoices[1]).toMatchObject({
      id: 'endorser',
      title: 'I refer great people',
    });
  });
});
