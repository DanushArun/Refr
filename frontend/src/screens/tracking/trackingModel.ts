export const trackingStates = ['shared', 'submitted', 'overview', 'timeline'] as const;

export type TrackingState = (typeof trackingStates)[number];
