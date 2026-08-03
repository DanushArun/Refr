export const candidateEvidenceStates = ['profile', 'impact', 'resume', 'trust'] as const;

export type CandidateEvidenceState = (typeof candidateEvidenceStates)[number];

const actionRoutes: Record<CandidateEvidenceState, string> = {
  profile: '/candidate/priya-nair/connect',
  impact: '/candidate/priya-nair/resume',
  resume: '/candidate/priya-nair',
  trust: '/candidate/priya-nair/connect',
};

export function candidateEvidenceRoute(state: CandidateEvidenceState): string {
  return actionRoutes[state];
}
