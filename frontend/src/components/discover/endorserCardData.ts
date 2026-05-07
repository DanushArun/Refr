import { DEMO_REFERRERS, type DemoReferrer } from '../../config/demo';

/**
 * Derived card data for the swipe deck. Fields are computed deterministically
 * from DemoReferrer so the demo looks stable across reloads.
 */
export interface EndorserCard {
  id: string;
  name: string;
  jobTitle: string;
  companyName: string;
  trustScore: number;        // 0 – 100 integer, same scale as Endorsement Score
  acceptanceRate: number;    // 0 – 100%, derived from hires / referrals
  responseTime: string;      // e.g. "~2hr"
  hires: number;             // raw successful hires
  skills: string[];           // 3 skills inferred from job title
  matchPercent: number;       // 70 – 94, stable per viewer+endorser pair
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
  if (title.includes('platform') || title.includes('principal')) return ['Kubernetes', 'Terraform', 'Go'];
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
    companyName: referrer.company.name,
    trustScore: Math.min(100, Math.max(0, Math.round(referrer.kingmakerScore))),
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
