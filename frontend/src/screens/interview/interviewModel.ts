export const interviewStates = ['review', 'invitation', 'time', 'preparation'] as const;
export type InterviewState = (typeof interviewStates)[number];
