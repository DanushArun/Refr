export const UserRole = {
  SEEKER: 'seeker',
  REFERRER: 'referrer',
} as const;

export type UserRole = (typeof UserRole)[keyof typeof UserRole];

export const SEEKER_TABS = ['Discover', 'Matches', 'Pipeline', 'Profile'] as const;
export const REFERRER_TABS = ['Inbox', 'Active', 'Earnings', 'Profile'] as const;
