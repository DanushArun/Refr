export const handoffStates=['conversation','requested','share','confirm'] as const;export type HandoffState=(typeof handoffStates)[number];
