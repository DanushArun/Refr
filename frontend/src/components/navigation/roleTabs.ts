export type AppRole = 'seeker' | 'referrer';

export interface RoleTab {
  name: string;
  title: string;
}

const SEEKER_TABS: readonly RoleTab[] = [
  { name: 'discover', title: 'Discover' },
  { name: 'matches', title: 'Inbox' },
  { name: 'pipeline', title: 'Activity' },
  { name: 'profile', title: 'Profile' },
];

const REFERRER_TABS: readonly RoleTab[] = [
  { name: 'discover', title: 'Discover' },
  { name: 'inbox', title: 'Inbox' },
  { name: 'active', title: 'Candidates' },
  { name: 'earnings', title: 'Earnings' },
  { name: 'profile', title: 'Profile' },
];

export const ALL_ROLE_TABS: readonly RoleTab[] = [
  { name: 'discover', title: 'Discover' },
  { name: 'matches', title: 'Inbox' },
  { name: 'pipeline', title: 'Activity' },
  { name: 'inbox', title: 'Inbox' },
  { name: 'active', title: 'Candidates' },
  { name: 'earnings', title: 'Earnings' },
  { name: 'profile', title: 'Profile' },
];

export function tabsForRole(role: AppRole | undefined): readonly RoleTab[] {
  return role === 'referrer' ? REFERRER_TABS : SEEKER_TABS;
}

export function tabIsVisibleForRole(
  tabName: string,
  role: AppRole | undefined,
): boolean {
  return tabsForRole(role).some((tab) => tab.name === tabName);
}

export function routeForRole(role: AppRole): '/seeker/discover' | '/referrer/discover' {
  return role === 'referrer' ? '/referrer/discover' : '/seeker/discover';
}
