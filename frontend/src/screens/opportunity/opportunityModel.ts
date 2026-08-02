export type OpportunityTab = 'overview' | 'role' | 'company' | 'endorsers';

export const opportunityTabs: readonly OpportunityTab[] = [
  'overview', 'role', 'company', 'endorsers',
];

export const recommendedEndorser = { id: 'arjun-menon', name: 'Arjun Menon' } as const;
