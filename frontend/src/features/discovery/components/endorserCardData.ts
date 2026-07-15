import { DEMO_REFERRERS, type DemoReferrer } from '../../../demo/config';

/**
 * Derived card data for the swipe deck. Fields are computed deterministically
 * from DemoReferrer so the demo looks stable across reloads.
 */
export interface EndorserCard {
  id: string;
  name: string;
  jobTitle: string;
  companyId: string;
  companyName: string;
  location: string;
  trustScore: number;        // 0 – 100 integer, same scale as Endorsement Score
  acceptanceRate?: number;   // present only when supplied by a trusted source
  avatarUrl?: string;         // optional demo portrait for compact proof rows
  responseTime?: string;     // present only when supplied by a trusted source
  hires?: number;            // present only when supplied by a trusted source
  skills: string[];           // 3 skills inferred from job title
  matchPercent: number;       // 70 – 94, stable per viewer+endorser pair
  opportunityId?: string;
  opportunityTitle?: string;
}

function hash(input: string): number {
  let h = 0;
  for (let i = 0; i < input.length; i++) h = (h * 31 + input.charCodeAt(i)) | 0;
  return Math.abs(h);
}

function skillsFor(jobTitle: string): string[] {
  const title = jobTitle.toLowerCase();
  if (title.includes('backend')) return ['Go', 'Kafka', 'PostgreSQL'];
  if (title.includes('frontend')) return ['React', 'TypeScript', 'CSS'];
  if (title.includes('data science') || title.includes('ml')) return ['Python', 'PyTorch', 'MLOps'];
  if (title.includes('data')) return ['Python', 'Spark', 'SQL'];
  if (title.includes('platform') || title.includes('principal')) {
    return ['Kubernetes', 'Terraform', 'Go'];
  }
  if (title.includes('devops') || title.includes('sre')) return ['AWS', 'Terraform', 'Docker'];
  if (title.includes('product')) return ['Product', 'SQL', 'Mixpanel'];
  if (title.includes('manager') || title.includes('director') || title.includes('vp')) {
    return ['Leadership', 'System Design', 'Strategy'];
  }
  return ['Engineering', 'System Design', 'Architecture'];
}

function responseBucket(seed: number): string {
  const buckets = ['~1hr', '~2hr', '~4hr', '~6hr', '~1d'];
  return buckets[seed % buckets.length];
}

function avatarUrlFor(id: string): string | undefined {
  const avatarIds: Record<string, string> = {
    '2': 'photo-1500648767791-00dcc994a43e',
    '3': 'photo-1506794778202-cad84cf45f1d',
    '4': 'photo-1494790108377-be9c29b29330',
    '20': 'photo-1573496359142-b8d87734a5a2',
    '21': 'photo-1519085360753-af0119f7cbe7',
    '22': 'photo-1438761681033-6461ffad8d80',
    '23': 'photo-1507003211169-0a1dd7228f2d',
    '24': 'photo-1560250097-0b93528c311a',
    '25': 'photo-1544005313-94ddf0286df2',
    '26': 'photo-1534528741775-53994a69daeb',
    '27': 'photo-1519345182560-3f2917c472ef',
    '28': 'photo-1507591064344-4c6ce005b128',
  };
  const avatarId = avatarIds[id];
  if (!avatarId) return undefined;
  return `https://images.unsplash.com/${avatarId}?w=160&q=80&auto=format&fit=crop&crop=faces`;
}

/**
 * Build the full card data for one endorser, from the viewer's perspective.
 * viewerId is used to make matchPercent stable per pair.
 */
export function buildEndorserCard(
  referrer: DemoReferrer,
  viewerId = '1',
): EndorserCard {
  const seed = hash(referrer.id + ':' + viewerId);
  return {
    id: referrer.id,
    name: referrer.name,
    jobTitle: referrer.jobTitle,
    avatarUrl: avatarUrlFor(referrer.id),
    companyId: referrer.company.id,
    companyName: referrer.company.name,
    location: referrer.location,
    trustScore: Math.min(100, Math.max(0, Math.round(referrer.endorsementScore))),
    acceptanceRate: referrer.totalReferrals > 0
      ? Math.round((referrer.successfulHires / referrer.totalReferrals) * 100)
      : 0,
    responseTime: responseBucket(seed),
    hires: referrer.successfulHires,
    skills: skillsFor(referrer.jobTitle),
    matchPercent: 70 + (seed % 25),
  };
}

/** All endorser cards, sorted by match% descending for the first session. */
export function buildEndorserCards(viewerId = '1'): EndorserCard[] {
  return DEMO_REFERRERS
    .map((r) => buildEndorserCard(r, viewerId))
    .sort((a, b) => b.matchPercent - a.matchPercent);
}
