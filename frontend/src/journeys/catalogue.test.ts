import {
  getJourneyState,
  journeyStatesForRole,
  nextJourneyState,
  visualStatesReadyForImplementation,
} from './catalogue';

describe('journey catalogue', () => {
  it('keeps every supplied seeker state in its documented journey', () => {
    expect(journeyStatesForRole('seeker')).toHaveLength(52);
  });

  it('keeps every supplied endorser state in its documented journey', () => {
    expect(journeyStatesForRole('endorser')).toHaveLength(44);
  });

  it('advances the seeker request flow to the sent confirmation state', () => {
    const next = nextJourneyState('seeker-07-request-intro-form');

    expect(next?.id).toBe('seeker-07-request-sent');
  });

  it('rejects visual implementation until a state has an approved flat reference', () => {
    const state = getJourneyState('endorser-03-discover-candidate');

    expect(state?.referenceStatus).toBe('source-export-required');
    expect(visualStatesReadyForImplementation()).toEqual([]);
  });

  it('allows only explicitly approved states through the visual gate', () => {
    const ready = visualStatesReadyForImplementation({
      'seeker-05-discover-role-card': 'ready',
    });

    expect(ready.map((state) => state.id)).toEqual([
      'seeker-05-discover-role-card',
    ]);
  });
});
