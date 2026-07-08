export type AppRole = 'seeker' | 'referrer';

export interface RoleTab {
  name: string;
  title: string;
}

const SEEKER_TABS: readonly RoleTab[] = [
  { name: 'discover', title: 'Discover' },
  { name: 'matches', title: 'Matches' },
  { name: 'pipeline', title: 'Activity' },
  { name: 'profile', title: 'Profile' },
];

const REFERRER_TABS: readonly RoleTab[] = [
  { name: 'discover', title: 'Discover' },
  { name: 'inbox', title: 'Inbox' },
  { name: 'active', title: 'Active' },
  { name: 'earnings', title: 'Earnings' },
  { name: 'profile', title: 'Profile' },
];

export const ALL_ROLE_TABS: readonly RoleTab[] = [
  { name: 'discover', title: 'Discover' },
  { name: 'matches', title: 'Matches' },
  { name: 'pipeline', title: 'Activity' },
  { name: 'inbox', title: 'Inbox' },
  { name: 'active', title: 'Active' },
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
