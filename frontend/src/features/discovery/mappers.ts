import type {
  ReferrerRecommendation,
  SeekerRecommendation,
} from './api';
import type { EndorserCard } from './components/endorserCardData';
import type { SeekerCard } from './components/seekerCardData';

function clampPercent(value: number): number {
  if (!Number.isFinite(value)) return 0;
  return Math.max(0, Math.min(100, Math.round(value)));
}

function nonEmpty(value: string | null | undefined, fallback: string): string {
  const trimmed = value?.trim();
  return trimmed ? trimmed : fallback;
}

function wordsFrom(value: string, limit: number): string[] {
  return value
    .split(/[^A-Za-z0-9+#.]+/)
    .map((part) => part.trim())
    .filter(Boolean)
    .slice(0, limit);
}

function referrerSkills(item: ReferrerRecommendation): string[] {
  const terms = `${item.roleFamily} ${item.opportunityTitle} ${item.jobTitle ?? ''}`;
  const skills = wordsFrom(terms, 3);
  return skills.length > 0 ? skills : ['Referral', 'Hiring', 'Coaching'];
}

function storyFor(item: SeekerRecommendation): string {
  const headline = nonEmpty(item.headline, '');
  if (headline) return headline;
  return `${item.displayName} is targeting ${targetRoleFor(item)}.`;
}

function targetRoleFor(item: SeekerRecommendation): string {
  return item.targetRoles.find(Boolean) ?? item.opportunityTitle;
}

export function referrerRecommendationToEndorserCard(
  item: ReferrerRecommendation,
): EndorserCard {
  const roleTitle = nonEmpty(item.jobTitle, item.opportunityTitle);
  return {
    id: item.id,
    name: item.displayName,
    jobTitle: roleTitle,
    companyId: item.companyId,
    companyName: item.companyName,
    location: nonEmpty(item.roleLevel, nonEmpty(item.department, 'Verified')),
    trustScore: clampPercent(item.endorsementScore),
    avatarUrl: item.avatarUrl ?? undefined,
    skills: referrerSkills(item),
    matchPercent: clampPercent(item.matchScore),
    opportunityId: item.opportunityId,
    opportunityTitle: item.opportunityTitle,
  };
}

export function seekerRecommendationToSeekerCard(
  item: SeekerRecommendation,
): SeekerCard {
  const story = storyFor(item);
  const targetRoles = item.targetRoles.length
    ? item.targetRoles
    : [item.opportunityTitle];
  return {
    id: item.id,
    name: item.displayName,
    headline: nonEmpty(item.headline, item.opportunityTitle),
    story,
    fullStory: story,
    skills: item.skills.slice(0, 3),
    fullSkills: item.skills,
    yearsOfExperience: item.yearsOfExperience,
    targetRole: targetRoleFor(item),
    targetRoles,
    targetCompanies: item.targetCompanies.slice(0, 3),
    matchPercent: clampPercent(item.matchScore),
    currentSignal: `${item.yearsOfExperience} years experience`,
    photoUrl: item.avatarUrl ?? undefined,
    opportunityId: item.opportunityId,
    opportunityTitle: item.opportunityTitle,
  };
}

export function referrerRecommendationsToEndorserCards(
  items: ReferrerRecommendation[],
): EndorserCard[] {
  return items.map(referrerRecommendationToEndorserCard);
}

export function seekerRecommendationsToSeekerCards(
  items: SeekerRecommendation[],
): SeekerCard[] {
  return items.map(seekerRecommendationToSeekerCard);
}
