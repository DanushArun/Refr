import type { FullProfile } from './profileTypes';

export function getIdentityLine(profile: FullProfile | null, isReferrer: boolean): string {
  if (isReferrer && profile?.referrerProfile) {
    return `${profile.referrerProfile.job_title} at ${profile.referrerProfile.company.name}`;
  }
  if (!isReferrer && profile?.seekerProfile?.headline) {
    return profile.seekerProfile.headline;
  }
  return isReferrer ? 'Verified professional network' : 'Building the next move';
}

export function formatExperience(years: number): string {
  if (years <= 0) return 'Fresher';
  return `${years}y`;
}

export function formatStatus(status: string): string {
  return status
    .split('_')
    .filter(Boolean)
    .map((part) => part[0].toUpperCase() + part.slice(1))
    .join(' ');
}

export function getErrorMessage(error: unknown): string {
  if (error instanceof Error && error.message.trim()) {
    return error.message;
  }
  return 'Please try again.';
}
