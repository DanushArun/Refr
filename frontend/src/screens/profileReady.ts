export type ProfileReadyStep = 'resume' | 'verification' | 'visibility' | 'ready';

export const profileReadySteps: readonly ProfileReadyStep[] = [
  'resume', 'verification', 'visibility', 'ready',
];

export function nextProfileReadyRoute(step: ProfileReadyStep): string {
  const next = profileReadySteps[profileReadySteps.indexOf(step) + 1];
  return next ? `/(auth)/profile-ready/${next}` : '/(seeker-tabs)/discover';
}
