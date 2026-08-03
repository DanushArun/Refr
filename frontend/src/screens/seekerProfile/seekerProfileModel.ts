export const seekerProfileStates = [
  'overview',
  'documents',
  'preferences',
  'privacy',
] as const;

export type SeekerProfileState = (typeof seekerProfileStates)[number];
