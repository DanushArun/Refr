export type DemoRole = 'seeker' | 'referrer';

export function parseStoredDemoRole(value: string | null): DemoRole | null {
  if (value === 'seeker' || value === 'referrer') {
    return value;
  }

  return null;
}
