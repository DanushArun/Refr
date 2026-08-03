export const endorserDiscoverStates = ['tutorial', 'candidate', 'fit', 'passed'] as const;

export type EndorserDiscoverState = (typeof endorserDiscoverStates)[number];

export function endorserDiscoverStateFromParams(params: {
  sheet?: string;
  state?: string;
}): EndorserDiscoverState {
  if (params.sheet === 'fit') return 'fit';
  if (params.state === 'passed') return 'passed';
  if (params.state === 'tutorial') return 'tutorial';
  return 'candidate';
}
