import { parseStoredDemoRole } from './demoRolePolicy';

describe('parseStoredDemoRole', () => {
  it('returns null when no demo role has been selected', () => {
    expect(parseStoredDemoRole(null)).toBeNull();
  });

  it('returns a selected seeker role', () => {
    expect(parseStoredDemoRole('seeker')).toBe('seeker');
  });

  it('returns null for unsupported persisted values', () => {
    expect(parseStoredDemoRole('candidate')).toBeNull();
  });
});
