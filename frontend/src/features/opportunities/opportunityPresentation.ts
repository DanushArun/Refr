import type {
  EmploymentType,
  OpportunitySource,
} from '../../services/api/opportunities';

export type WorkplaceType = 'onsite' | 'hybrid' | 'remote';

const DAY_IN_MS = 24 * 60 * 60 * 1000;
const EMPLOYMENT_LABELS: Record<EmploymentType, string> = {
  full_time: 'Full time',
  contract: 'Contract',
  internship: 'Internship',
};
const SOURCE_LABELS: Record<OpportunitySource, string> = {
  manual: 'Manual listing',
  company_intel: 'Company intel',
  import: 'Imported listing',
  admin: 'Admin listing',
};

export function formatWorkplace(policy: WorkplaceType, location: string): string {
  const label = `${policy.charAt(0).toUpperCase()}${policy.slice(1)}`;
  const places = location
    .split(',')
    .map((item) => item.trim())
    .filter((item) => item && item.toLowerCase() !== policy);
  return places.length > 0 ? `${label} · ${places.join(', ')}` : label;
}

export function formatExperience(minimum: number, maximum: number | null): string {
  if (maximum === null) return `${minimum}+ years`;
  if (minimum === maximum) return `${minimum} years`;
  return `${minimum}-${maximum} years`;
}

export function formatEmploymentType(value: EmploymentType): string {
  return EMPLOYMENT_LABELS[value];
}

export function formatExpiry(expiresAt: string | null): string | null {
  if (!expiresAt) return null;
  const expiresTime = Date.parse(expiresAt);
  if (Number.isNaN(expiresTime)) return null;
  const date = new Intl.DateTimeFormat('en-US', {
    day: 'numeric',
    month: 'short',
    timeZone: 'UTC',
  }).format(new Date(expiresTime));
  return `Closes ${date}`;
}

export function formatSource(source: OpportunitySource): string {
  return SOURCE_LABELS[source];
}

export function formatFreshness(postedAt: string | null, now = new Date()): string {
  if (!postedAt) return 'Posting date unavailable';
  const postedTime = Date.parse(postedAt);
  if (Number.isNaN(postedTime)) return 'Posting date unavailable';
  const elapsedDays = Math.max(0, Math.floor((now.getTime() - postedTime) / DAY_IN_MS));
  if (elapsedDays === 0) return 'Posted today';
  if (elapsedDays === 1) return 'Posted yesterday';
  return `Posted ${elapsedDays} days ago`;
}
