export const endorserProgressStates = [
  'list', 'review', 'interview', 'decision', 'offer', 'accepted', 'joined', 'verification',
] as const;

export type EndorserProgressState = (typeof endorserProgressStates)[number];

export function endorserProgressRoute(state: EndorserProgressState | 'submitted'): string {
  if (state === 'list') return '/endorser/candidates';
  if (state === 'submitted' || state === 'review') return '/endorser/candidates/priya-razo';
  return `/endorser/candidates/priya-razo?stage=${state}`;
}
