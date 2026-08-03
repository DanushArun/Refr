export const offerStates=['pending','received','review','accepted'] as const;export type OfferState=(typeof offerStates)[number];
