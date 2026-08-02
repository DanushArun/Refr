export type IdentityStepId =
  | 'basics'
  | 'current-role'
  | 'career-history'
  | 'education';

export type ProgressDot = 'active' | 'complete' | 'upcoming';

export const identitySteps: readonly { id: IdentityStepId; label: string }[] = [
  { id: 'basics', label: 'Basics' },
  { id: 'current-role', label: 'Current role' },
  { id: 'career-history', label: 'Career history' },
  { id: 'education', label: 'Education' },
];

export function progressDots(current: number): ProgressDot[] {
  return identitySteps.map((_, index) => {
    if (index < current) return 'complete';
    if (index === current) return 'active';
    return 'upcoming';
  });
}

export function nextIdentityRoute(step: IdentityStepId): string {
  const index = identitySteps.findIndex((item) => item.id === step);
  const next = identitySteps[index + 1];
  return next ? `/(auth)/onboarding/${next.id}` : '/(auth)/intent/skills';
}
