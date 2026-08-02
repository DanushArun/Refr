export const connectSteps = ['confirmed','inbox','filter','chat'] as const;
export type ConnectStep = (typeof connectSteps)[number];
