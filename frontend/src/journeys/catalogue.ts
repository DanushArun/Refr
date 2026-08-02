export type JourneyRole = 'seeker' | 'endorser';
export type ReferenceStatus = 'source-export-required' | 'ready';
export type ReferenceStatusOverrides = Readonly<Record<string, ReferenceStatus>>;

export interface JourneyState {
  id: string;
  phase: string;
  role: JourneyRole;
  referenceStatus: ReferenceStatus;
}

type PhaseDefinition = readonly [phase: string, stateIds: readonly string[]];

const SEEKER_PHASES: readonly PhaseDefinition[] = [
  ['entry', [
    'seeker-01-entry-intent-choice',
    'seeker-01-entry-phone',
    'seeker-01-entry-otp',
    'seeker-01-entry-welcome',
  ]],
  ['identity', [
    'seeker-02-identity-basics',
    'seeker-02-identity-current-role',
    'seeker-02-identity-career-history',
    'seeker-02-identity-education',
  ]],
  ['intent', [
    'seeker-03-intent-skills',
    'seeker-03-intent-impact',
    'seeker-03-intent-target-role',
    'seeker-03-intent-preferences',
  ]],
  ['profile-ready', [
    'seeker-04-profile-ready-resume-upload',
    'seeker-04-profile-ready-verification-status',
    'seeker-04-profile-ready-visibility',
    'seeker-04-profile-ready-profile-ready',
  ]],
  ['discover', [
    'seeker-05-discover-tutorial',
    'seeker-05-discover-role-card',
    'seeker-05-discover-fit-sheet',
    'seeker-05-discover-saved',
  ]],
  ['opportunity', [
    'seeker-06-opportunity-overview',
    'seeker-06-opportunity-responsibilities',
    'seeker-06-opportunity-company',
    'seeker-06-opportunity-endorsers',
  ]],
  ['request', [
    'seeker-07-request-endorser-profile',
    'seeker-07-request-question',
    'seeker-07-request-intro-form',
    'seeker-07-request-sent',
  ]],
  ['connect', [
    'seeker-08-connect-confirmed',
    'seeker-08-connect-inbox',
    'seeker-08-connect-filter',
    'seeker-08-connect-chat',
  ]],
  ['handoff', [
    'seeker-09-handoff-conversation',
    'seeker-09-handoff-details-request',
    'seeker-09-handoff-share-details',
    'seeker-09-handoff-review-consent',
  ]],
  ['track', [
    'seeker-10-track-package-shared',
    'seeker-10-track-submitted',
    'seeker-10-track-overview',
    'seeker-10-track-timeline',
  ]],
  ['interview', [
    'seeker-11-interview-review',
    'seeker-11-interview-invitation',
    'seeker-11-interview-time',
    'seeker-11-interview-preparation',
  ]],
  ['offer', [
    'seeker-12-offer-pending',
    'seeker-12-offer-received',
    'seeker-12-offer-review',
    'seeker-12-offer-accepted',
  ]],
  ['profile', [
    'seeker-13-profile-overview',
    'seeker-13-profile-documents',
    'seeker-13-profile-preferences',
    'seeker-13-profile-privacy',
  ]],
];

const ENDORSER_PHASES: readonly PhaseDefinition[] = [
  ['verify', [
    'endorser-01-verify-participation',
    'endorser-01-verify-work-identity',
    'endorser-01-verify-checking',
    'endorser-01-verify-verified',
  ]],
  ['setup', [
    'endorser-02-setup-roles',
    'endorser-02-setup-scope',
    'endorser-02-setup-capacity',
    'endorser-02-setup-ready',
  ]],
  ['discover', [
    'endorser-03-discover-tutorial',
    'endorser-03-discover-candidate',
    'endorser-03-discover-fit',
    'endorser-03-discover-passed',
  ]],
  ['evidence', [
    'endorser-04-evidence-profile',
    'endorser-04-evidence-impact',
    'endorser-04-evidence-resume',
    'endorser-04-evidence-trust',
  ]],
  ['match', [
    'endorser-05-match-message',
    'endorser-05-match-sent',
    'endorser-05-match-mutual',
    'endorser-05-match-inbox',
  ]],
  ['chat-handoff', [
    'endorser-06-chat-handoff-chat',
    'endorser-06-chat-handoff-details',
    'endorser-06-chat-handoff-received',
    'endorser-06-chat-handoff-ready',
  ]],
  ['refer', [
    'endorser-07-refer-role',
    'endorser-07-refer-consent',
    'endorser-07-refer-note',
    'endorser-07-refer-submitted',
  ]],
  ['pipeline', [
    'endorser-08-pipeline-list',
    'endorser-08-pipeline-review',
    'endorser-08-pipeline-interview',
    'endorser-08-pipeline-decision',
  ]],
  ['join', [
    'endorser-09-join-offer',
    'endorser-09-join-accepted',
    'endorser-09-join-joined',
    'endorser-09-join-verification',
  ]],
  ['reward', [
    'endorser-10-reward-earnings',
    'endorser-10-reward-detail',
    'endorser-10-reward-scheduled',
    'endorser-10-reward-paid',
  ]],
  ['profile', [
    'endorser-11-profile-overview',
    'endorser-11-profile-preferences',
    'endorser-11-profile-payouts',
    'endorser-11-profile-privacy',
  ]],
];

function expandStates(role: JourneyRole, phases: readonly PhaseDefinition[]): JourneyState[] {
  return phases.flatMap(([phase, stateIds]) =>
    stateIds.map((id) => ({
      id,
      phase,
      role,
      referenceStatus: 'source-export-required',
    })),
  );
}

const statesByRole: Record<JourneyRole, readonly JourneyState[]> = {
  seeker: expandStates('seeker', SEEKER_PHASES),
  endorser: expandStates('endorser', ENDORSER_PHASES),
};

const allStates = Object.values(statesByRole).flat();

export function journeyStatesForRole(role: JourneyRole): readonly JourneyState[] {
  return statesByRole[role];
}

export function getJourneyState(id: string): JourneyState | undefined {
  return allStates.find((state) => state.id === id);
}

export function nextJourneyState(id: string): JourneyState | undefined {
  const current = getJourneyState(id);
  if (!current) return undefined;
  const states = statesByRole[current.role];
  const index = states.findIndex((state) => state.id === id);
  return states[index + 1];
}

export function visualStatesReadyForImplementation(
  overrides: ReferenceStatusOverrides = {},
): readonly JourneyState[] {
  return allStates.flatMap((state) => {
    const referenceStatus = overrides[state.id] ?? state.referenceStatus;
    return referenceStatus === 'ready' ? [{ ...state, referenceStatus }] : [];
  });
}
