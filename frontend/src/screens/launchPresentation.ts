export type LaunchRole = 'seeker' | 'endorser';

export interface LaunchContent {
  artwork: 'launch-common.png';
  headline: string;
  subheading: string;
}

const COMMON_LAUNCH_CONTENT: LaunchContent = {
  artwork: 'launch-common.png',
  headline: 'Opportunity moves through people.',
  subheading: 'Find a trusted introduction—or make one.',
};

const LAUNCH_CONTENT: Record<LaunchRole, LaunchContent> = {
  seeker: COMMON_LAUNCH_CONTENT,
  endorser: COMMON_LAUNCH_CONTENT,
};

export function launchContentFor(role: LaunchRole): LaunchContent {
  return LAUNCH_CONTENT[role];
}
