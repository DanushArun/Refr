export type IntentStep = 'skills' | 'impact' | 'target-role' | 'preferences';

export const intentSteps: readonly IntentStep[] = [
  'skills',
  'impact',
  'target-role',
  'preferences',
];

export const selectedSkills = ['Payments', 'Risk & Fraud', 'Product Strategy', 'Analytics'];

export function nextIntentRoute(step: IntentStep): string {
  const index = intentSteps.indexOf(step);
  const next = intentSteps[index + 1];
  return next ? `/(auth)/intent/${next}` : '/(seeker-tabs)/discover';
}
