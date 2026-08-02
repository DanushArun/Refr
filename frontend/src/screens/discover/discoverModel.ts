export type DiscoverState = 'tutorial' | 'card' | 'fit' | 'saved';

export const discoverTutorialActions = ['Pass', 'Save', 'Request intro'];

export const fitReasons = {
  strong: ['Payments experience', 'Seniority level', 'Bengaluru location'],
  gap: 'Enterprise pricing',
} as const;
