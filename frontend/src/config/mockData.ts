/**
 * Mock data for REFR demo mode. Bangalore tech narrative.
 *
 * Primary personas:
 *   - Seeker  Danush Arun  (id '1')  -- ex-Amazon Pay, targeting fintech
 *   - Referrer Nivrant Goswami  (id '2')  -- Sr Backend @ Razorpay, Kingmaker 47
 *
 * Everything in this file is mutable by design. The demo-mode helpers in
 * api.ts write to these arrays so that demos feel stateful across screens
 * (e.g. accepting a request in Inbox shows up in Active Referrals).
 */
import type {
  FeedCard,
  SeekerPipelineItem,
  ReferrerInboxItem,
  FeedResponse,
} from '@refr/shared';
import type {
  ChatMessage,
  ReputationData,
  LeaderboardEntry,
} from '../services/api';
import type { Session } from '../services/auth';

// ── Time helpers ──────────────────────────────────────────────────────
const hoursAgo = (h: number) =>
  new Date(Date.now() - h * 3600_000).toISOString();
const daysAgo = (d: number) => hoursAgo(d * 24);
const minutesAgo = (m: number) =>
  new Date(Date.now() - m * 60_000).toISOString();

// ── Companies ─────────────────────────────────────────────────────────
const COMPANY = {
  razorpay: { id: 'c-1', name: 'Razorpay' },
  flipkart: { id: 'c-2', name: 'Flipkart' },
  zepto: { id: 'c-3', name: 'Zepto' },
  swiggy: { id: 'c-4', name: 'Swiggy' },
  phonepe: { id: 'c-5', name: 'PhonePe' },
  cred: { id: 'c-6', name: 'CRED' },
  meesho: { id: 'c-7', name: 'Meesho' },
  groww: { id: 'c-8', name: 'Groww' },
  google: { id: 'c-9', name: 'Google Bangalore' },
  microsoft: { id: 'c-10', name: 'Microsoft IDC' },
  atlassian: { id: 'c-11', name: 'Atlassian India' },
  coinbase: { id: 'c-12', name: 'Coinbase India' },
} as const;

// ── Referrers (12) ────────────────────────────────────────────────────
// Primary demo referrer is Nivrant (id '2', rank 3, Kingmaker 47).
export interface DemoReferrer {
  id: string;
  name: string;
  jobTitle: string;
  company: { id: string; name: string };
  kingmakerScore: number;
  totalReferrals: number;
  successfulHires: number;
}

export const DEMO_REFERRERS: DemoReferrer[] = [
  { id: '20', name: 'Priya Sharma', jobTitle: 'Sr Engineering Manager', company: COMPANY.flipkart, kingmakerScore: 86, totalReferrals: 28, successfulHires: 9 },
  { id: '21', name: 'Vikram Rao', jobTitle: 'Engineering Director', company: COMPANY.google, kingmakerScore: 63, totalReferrals: 19, successfulHires: 6 },
  { id: '2', name: 'Nivrant Goswami', jobTitle: 'Senior Backend Engineer', company: COMPANY.razorpay, kingmakerScore: 47, totalReferrals: 12, successfulHires: 3 },
  { id: '22', name: 'Sneha Patel', jobTitle: 'Product Manager', company: COMPANY.phonepe, kingmakerScore: 41, totalReferrals: 15, successfulHires: 3 },
  { id: '3', name: 'Deepak Nair', jobTitle: 'Staff Engineer', company: COMPANY.zepto, kingmakerScore: 38, totalReferrals: 10, successfulHires: 3 },
  { id: '23', name: 'Amit Verma', jobTitle: 'Staff Engineer', company: COMPANY.cred, kingmakerScore: 34, totalReferrals: 10, successfulHires: 2 },
  { id: '4', name: 'Anita Desai', jobTitle: 'Tech Lead', company: COMPANY.swiggy, kingmakerScore: 29, totalReferrals: 8, successfulHires: 2 },
  { id: '24', name: 'Rajesh Iyer', jobTitle: 'VP Engineering', company: COMPANY.meesho, kingmakerScore: 28, totalReferrals: 9, successfulHires: 2 },
  { id: '25', name: 'Nandini Krishnan', jobTitle: 'Data Science Lead', company: COMPANY.groww, kingmakerScore: 22, totalReferrals: 7, successfulHires: 1 },
  { id: '26', name: 'Kavya Reddy', jobTitle: 'Principal Engineer', company: COMPANY.microsoft, kingmakerScore: 19, totalReferrals: 6, successfulHires: 1 },
  { id: '27', name: 'Manish Gupta', jobTitle: 'Tech Lead', company: COMPANY.atlassian, kingmakerScore: 17, totalReferrals: 5, successfulHires: 1 },
  { id: '28', name: 'Ishaan Thakur', jobTitle: 'Senior Developer', company: COMPANY.coinbase, kingmakerScore: 14, totalReferrals: 4, successfulHires: 1 },
];

// Lookup helpers used by the feed (to attach authoring referrer to
// company_intel cards) and the request modal.
export function referrerByCompany(companyId: string): DemoReferrer | undefined {
  return DEMO_REFERRERS.find((r) => r.company.id === companyId);
}
export function referrerById(id: string): DemoReferrer | undefined {
  return DEMO_REFERRERS.find((r) => r.id === id);
}

// ── Seekers (12) ──────────────────────────────────────────────────────
export interface DemoSeeker {
  id: string;
  name: string;
  email: string;
  headline: string;
  story: string;
  skills: string[];
  yearsOfExperience: number;
  targetRoles: string[];
  targetCompanies: string[];
}

export const DEMO_SEEKERS: DemoSeeker[] = [
  {
    id: '1',
    name: 'Danush Arun',
    email: 'danush@gmail.com',
    headline: 'Backend Engineer, 6y at Amazon Pay',
    story:
      '4 years building payment infra at Amazon Pay. The scale was incredible '
      + 'but pace of shipping felt glacial. Quit last month to explore '
      + 'Bangalore startups where I can own a system end-to-end.',
    skills: ['Go', 'PostgreSQL', 'Kafka', 'AWS', 'System Design'],
    yearsOfExperience: 6,
    targetRoles: ['Senior Backend Engineer', 'Staff Engineer'],
    targetCompanies: ['Razorpay', 'Zepto', 'Swiggy'],
  },
  {
    id: '5',
    name: 'Meera Iyer',
    email: 'meera.iyer@gmail.com',
    headline: 'Payments engineer tired of legacy code. Want greenfield.',
    story:
      '3 years at PhonePe building merchant onboarding. I learned a lot but '
      + 'the codebase is 8 years old and change velocity is brutal. Looking '
      + 'for fintech teams where I can ship weekly.',
    skills: ['Go', 'Kafka', 'PostgreSQL', 'gRPC', 'Kubernetes'],
    yearsOfExperience: 4,
    targetRoles: ['Senior Backend Engineer'],
    targetCompanies: ['Razorpay', 'CRED', 'Groww'],
  },
  {
    id: '6',
    name: 'Sahil Jain',
    email: 'sahil.jain@gmail.com',
    headline: 'React Native specialist moving into web. Full-stack energy.',
    story:
      '3.5 years leading mobile at CRED. Shipped the premium card flow end '
      + 'to end. Want to broaden into web + backend before I go too deep on '
      + 'any one stack. Interested in product engineering roles.',
    skills: ['React Native', 'TypeScript', 'React', 'Node', 'GraphQL'],
    yearsOfExperience: 5,
    targetRoles: ['Senior Product Engineer', 'Full-stack Engineer'],
    targetCompanies: ['Zepto', 'Meesho', 'Groww'],
  },
  {
    id: '7',
    name: 'Neha Kulkarni',
    email: 'neha.kulkarni@gmail.com',
    headline: 'Data engineer. Built the Flipkart personalization data layer.',
    story:
      '4 years at Flipkart. Owned the Spark pipelines that feed the '
      + 'recommendation model. Want to work on a smaller team where data '
      + 'engineers have product ownership, not just a ticket queue.',
    skills: ['Spark', 'Airflow', 'Python', 'dbt', 'BigQuery'],
    yearsOfExperience: 4,
    targetRoles: ['Senior Data Engineer', 'Analytics Engineer'],
    targetCompanies: ['Swiggy', 'PhonePe', 'Groww'],
  },
  {
    id: '8',
    name: 'Karthik Ramesh',
    email: 'karthik.r@gmail.com',
    headline: 'Ex-Walmart Labs backend. Targeting pure product startups.',
    story:
      '5 years at Walmart Labs building supply chain services in Java/Kotlin. '
      + 'Big company systems are fun but I want product-market-fit velocity '
      + 'next. Open to pivoting stack if the mission is right.',
    skills: ['Kotlin', 'Java', 'Spring', 'PostgreSQL', 'Redis'],
    yearsOfExperience: 5,
    targetRoles: ['Senior Backend Engineer', 'Tech Lead'],
    targetCompanies: ['Zepto', 'Meesho', 'Razorpay'],
  },
  {
    id: '9',
    name: 'Divya Menon',
    email: 'divya.menon@gmail.com',
    headline: 'Frontend engineer obsessed with design systems and motion.',
    story:
      '3 years at Myntra. Built the design system that now powers the whole '
      + 'consumer app. Love the intersection of engineering, animation, and '
      + 'accessibility. Want to join a product-led team.',
    skills: ['React', 'TypeScript', 'Framer Motion', 'Tailwind', 'Figma'],
    yearsOfExperience: 3,
    targetRoles: ['Senior Frontend Engineer', 'Design Engineer'],
    targetCompanies: ['CRED', 'Razorpay', 'Atlassian India'],
  },
  {
    id: '10',
    name: 'Rohan Bhat',
    email: 'rohan.bhat@gmail.com',
    headline: 'SRE at Uber India. Exploring platform engineering roles.',
    story:
      '4 years on-call at Uber. Shipped the multi-region failover playbook. '
      + 'Tired of reactive work. Want to move into platform engineering '
      + 'where I build for other engineers rather than firefight.',
    skills: ['Kubernetes', 'Terraform', 'Go', 'Prometheus', 'ArgoCD'],
    yearsOfExperience: 6,
    targetRoles: ['Platform Engineer', 'Staff Engineer'],
    targetCompanies: ['Razorpay', 'Atlassian India', 'Google Bangalore'],
  },
  {
    id: '11',
    name: 'Aditi Sharma',
    email: 'aditi.sharma@gmail.com',
    headline: 'PM at Swiggy Instamart. Ready to own a 0 to 1 product.',
    story:
      '3 years at Swiggy, the last year running Instamart grocery category. '
      + 'Looking for a product role where I go end-to-end from strategy to '
      + 'launch. Bonus for consumer fintech.',
    skills: ['Product Strategy', 'SQL', 'A/B testing', 'Figma', 'Mixpanel'],
    yearsOfExperience: 4,
    targetRoles: ['Senior Product Manager', 'Product Lead'],
    targetCompanies: ['CRED', 'PhonePe', 'Zepto'],
  },
  {
    id: '12',
    name: 'Nikhil Rao',
    email: 'nikhil.rao@gmail.com',
    headline: 'ML engineer. Ranking systems at scale. Want bigger data.',
    story:
      '3 years at InMobi building ad ranking models. Moved 5% of the global '
      + 'ad revenue needle last year. Looking for scale problems at consumer '
      + 'companies where ML drives the core product.',
    skills: ['Python', 'PyTorch', 'Spark', 'SQL', 'MLOps'],
    yearsOfExperience: 4,
    targetRoles: ['ML Engineer', 'Applied Scientist'],
    targetCompanies: ['Flipkart', 'Swiggy', 'Google Bangalore'],
  },
  {
    id: '13',
    name: 'Tanvi Gupta',
    email: 'tanvi.gupta@gmail.com',
    headline: 'Product designer, 5y. Shipped design systems at Atlassian.',
    story:
      '5 years at Atlassian India. Owned the Jira design system used by 200k '
      + 'teams. Love complex workflows and information density. Want a team '
      + 'where design has a seat at the founding table.',
    skills: ['Figma', 'Design Systems', 'Prototyping', 'Motion', 'UX Research'],
    yearsOfExperience: 5,
    targetRoles: ['Senior Product Designer', 'Design Lead'],
    targetCompanies: ['CRED', 'Razorpay', 'Meesho'],
  },
  {
    id: '14',
    name: 'Harsh Agarwal',
    email: 'harsh.agarwal@gmail.com',
    headline: 'DevOps + security. Left consulting, want product company.',
    story:
      '4 years at Deloitte doing DevSecOps for banks. Miserable. Want to '
      + 'build internal developer tools at a real product company where my '
      + 'work ships to engineers weekly, not audits annually.',
    skills: ['AWS', 'Terraform', 'Python', 'Kubernetes', 'Vault'],
    yearsOfExperience: 4,
    targetRoles: ['DevOps Engineer', 'Security Engineer'],
    targetCompanies: ['Razorpay', 'PhonePe', 'CRED'],
  },
  {
    id: '15',
    name: 'Shreya Nair',
    email: 'shreya.nair@gmail.com',
    headline: 'Full-stack at Zerodha. Curious about non-broker fintech.',
    story:
      '3 years at Zerodha building Kite web. Deep exposure to trading '
      + 'systems. Want to see how fintech outside broking looks -- lending, '
      + 'cards, payments. Stack-agnostic but love TypeScript end to end.',
    skills: ['TypeScript', 'React', 'Node', 'PostgreSQL', 'WebSockets'],
    yearsOfExperience: 3,
    targetRoles: ['Senior Full-stack Engineer', 'Product Engineer'],
    targetCompanies: ['Razorpay', 'Groww', 'CRED'],
  },
];

function seekerById(id: string): DemoSeeker | undefined {
  return DEMO_SEEKERS.find((s) => s.id === id);
}
function seekerHeadline(s: DemoSeeker): string {
  const exp = `${s.yearsOfExperience}y`;
  const skills = s.skills.slice(0, 2).join(', ');
  return `${s.targetRoles[0]} | ${exp} | ${skills}`;
}

// ── Sessions ──────────────────────────────────────────────────────────
const danush = seekerById('1')!;
const nivrant = referrerById('2')!;

export const MOCK_SEEKER_SESSION: Session = {
  access_token: 'demo-seeker-access-token',
  refresh_token: 'demo-seeker-refresh-token',
  user: { id: danush.id, email: danush.email, displayName: danush.name, role: 'seeker' },
};

export const MOCK_REFERRER_SESSION: Session = {
  access_token: 'demo-referrer-access-token',
  refresh_token: 'demo-referrer-refresh-token',
  user: { id: nivrant.id, email: 'nivrant@razorpay.com', displayName: nivrant.name, role: 'referrer' },
};

// ── Feed cards (30 total) ─────────────────────────────────────────────
// Mix: 8 career_story + 10 company_intel + 5 referral_event + 3 milestone
// + 4 editorial. Ordered newest to oldest to mirror a real feed.

const FEED_CARDS: FeedCard[] = [
  // 0-5m ago: just happened, feels alive
  {
    id: 'fc-rev-1',
    type: 'referral_event',
    createdAt: minutesAgo(4),
    updatedAt: minutesAgo(4),
    score: 0.99,
    reactionCount: 8,
    isBookmarked: false,
    referrerDisplayName: 'Priya Sharma',
    seekerDisplayName: 'Karthik R.',
    companyName: 'Flipkart',
    eventDescription: 'referred Karthik to the Flipkart platform engineering team',
  },
  {
    id: 'fc-cs-danush',
    type: 'career_story',
    createdAt: minutesAgo(22),
    updatedAt: minutesAgo(22),
    score: 0.97,
    reactionCount: 41,
    isBookmarked: false,
    seekerId: danush.id,
    seekerName: danush.name,
    headline: danush.headline,
    story: danush.story,
    skills: danush.skills,
    yearsOfExperience: danush.yearsOfExperience,
    targetRoles: danush.targetRoles,
    targetCompanies: danush.targetCompanies,
  },
  {
    id: 'fc-ci-razorpay',
    type: 'company_intel',
    createdAt: hoursAgo(1),
    updatedAt: hoursAgo(1),
    score: 0.95,
    reactionCount: 124,
    isBookmarked: true,
    companyId: COMPANY.razorpay.id,
    companyName: COMPANY.razorpay.name,
    authorLabel: 'Verified employee at Razorpay',
    title: 'Backend hiring is on fire right now',
    body:
      'We are backfilling 12 backend roles across payments and banking. '
      + 'Bar is high but interviews are fair - two DSA, one system design, '
      + 'one hiring manager. Offer turnaround under 10 days. Senior TC is '
      + '45-55L base + 15-20L RSUs.',
    tags: ['hiring', 'engineering', 'salary'],
  },
  {
    id: 'fc-cs-meera',
    type: 'career_story',
    createdAt: hoursAgo(2),
    updatedAt: hoursAgo(2),
    score: 0.93,
    reactionCount: 63,
    isBookmarked: false,
    ...buildCareerStoryFrom(seekerById('5')!),
  },
  {
    id: 'fc-ci-zepto',
    type: 'company_intel',
    createdAt: hoursAgo(3),
    updatedAt: hoursAgo(3),
    score: 0.91,
    reactionCount: 201,
    isBookmarked: false,
    companyId: COMPANY.zepto.id,
    companyName: COMPANY.zepto.name,
    authorLabel: 'Verified employee at Zepto',
    title: 'How 10-minute delivery actually works under the hood',
    body:
      'Everyone thinks it is magic. It is not. We run 350 dark stores with '
      + 'a central routing brain that picks the store based on predicted '
      + 'stock, rider position, and traffic. The hard problem is inventory '
      + 'rebalancing at 4am. That is where most engineering effort goes.',
    tags: ['engineering', 'ops', 'logistics'],
  },
  {
    id: 'fc-ms-neha',
    type: 'milestone',
    createdAt: hoursAgo(4),
    updatedAt: hoursAgo(4),
    score: 0.89,
    reactionCount: 187,
    isBookmarked: false,
    title: 'Neha got hired at Swiggy through Endorsly',
    description:
      'After a referral from Vikram, Neha cleared all 4 rounds and joined '
      + 'as a Senior Data Engineer. Referral to offer: 18 days.',
    relatedUserId: '7',
  },
  {
    id: 'fc-cs-sahil',
    type: 'career_story',
    createdAt: hoursAgo(5),
    updatedAt: hoursAgo(5),
    score: 0.87,
    reactionCount: 29,
    isBookmarked: false,
    ...buildCareerStoryFrom(seekerById('6')!),
  },
  {
    id: 'fc-ci-swiggy',
    type: 'company_intel',
    createdAt: hoursAgo(6),
    updatedAt: hoursAgo(6),
    score: 0.84,
    reactionCount: 98,
    isBookmarked: false,
    companyId: COMPANY.swiggy.id,
    companyName: COMPANY.swiggy.name,
    authorLabel: 'Verified employee at Swiggy',
    title: 'Instamart is the real growth engine now',
    body:
      'Food delivery is flat quarter over quarter. Instamart is growing '
      + '4x. If you are joining Swiggy and have a choice, pick Instamart. '
      + 'The team is small, fast, and closer to the business.',
    tags: ['growth', 'product', 'career'],
  },
  {
    id: 'fc-rev-2',
    type: 'referral_event',
    createdAt: hoursAgo(7),
    updatedAt: hoursAgo(7),
    score: 0.82,
    reactionCount: 15,
    isBookmarked: false,
    referrerDisplayName: 'Nivrant Goswami',
    seekerDisplayName: 'Meera I.',
    companyName: 'Razorpay',
    eventDescription: 'submitted Meera for the Sr Backend Engineer role',
  },
  {
    id: 'fc-ed-salaries',
    type: 'editorial',
    createdAt: hoursAgo(8),
    updatedAt: hoursAgo(8),
    score: 0.80,
    reactionCount: 312,
    isBookmarked: false,
    title: 'Bangalore Backend Salaries Q1 2026: The Real Numbers',
    body:
      'We aggregated 340 verified offer letters. Median TC for 4-6 YOE '
      + 'backend engineers: 38L. Top quartile at Razorpay, Flipkart, and '
      + 'PhonePe: 52-65L. Startups like Zepto and Groww competing on RSU '
      + 'upside.',
    author: 'Endorsly Editorial',
    tags: ['salary', 'market-data', 'backend'],
  },
  {
    id: 'fc-ci-flipkart',
    type: 'company_intel',
    createdAt: hoursAgo(10),
    updatedAt: hoursAgo(10),
    score: 0.78,
    reactionCount: 76,
    isBookmarked: false,
    companyId: COMPANY.flipkart.id,
    companyName: COMPANY.flipkart.name,
    authorLabel: 'Verified employee at Flipkart',
    title: 'Platform reorg: 300 services becoming 150',
    body:
      'Ongoing consolidation. If you interview, ask specifically about '
      + 'platform engineering roles - those are protected from the cuts. '
      + 'The migration work is genuinely interesting and career-defining.',
    tags: ['reorg', 'platform', 'interview'],
  },
  {
    id: 'fc-cs-neha',
    type: 'career_story',
    createdAt: hoursAgo(12),
    updatedAt: hoursAgo(12),
    score: 0.76,
    reactionCount: 52,
    isBookmarked: false,
    ...buildCareerStoryFrom(seekerById('7')!),
  },
  {
    id: 'fc-ci-cred',
    type: 'company_intel',
    createdAt: hoursAgo(14),
    updatedAt: hoursAgo(14),
    score: 0.74,
    reactionCount: 189,
    isBookmarked: false,
    companyId: COMPANY.cred.id,
    companyName: COMPANY.cred.name,
    authorLabel: 'Verified employee at CRED',
    title: 'CRED hires differently from the rest of Bangalore',
    body:
      'Your portfolio matters more than your DSA. They review your GitHub '
      + 'and Dribbble live during the interview. Mobile team is under 30 '
      + 'people, you will touch everything. Comp is top of market.',
    tags: ['interview', 'mobile', 'compensation'],
  },
  {
    id: 'fc-rev-3',
    type: 'referral_event',
    createdAt: hoursAgo(16),
    updatedAt: hoursAgo(16),
    score: 0.72,
    reactionCount: 11,
    isBookmarked: false,
    referrerDisplayName: 'Vikram Rao',
    seekerDisplayName: 'Rohan B.',
    companyName: 'Google Bangalore',
    eventDescription: 'referred Rohan to the SRE team',
  },
  {
    id: 'fc-cs-karthik',
    type: 'career_story',
    createdAt: hoursAgo(18),
    updatedAt: hoursAgo(18),
    score: 0.70,
    reactionCount: 34,
    isBookmarked: false,
    ...buildCareerStoryFrom(seekerById('8')!),
  },
  {
    id: 'fc-ci-phonepe',
    type: 'company_intel',
    createdAt: hoursAgo(20),
    updatedAt: hoursAgo(20),
    score: 0.68,
    reactionCount: 143,
    isBookmarked: false,
    companyId: COMPANY.phonepe.id,
    companyName: COMPANY.phonepe.name,
    authorLabel: 'Verified employee at PhonePe',
    title: 'Platform team handles 12B+ transactions a year',
    body:
      'Java + Go, Kafka at 50k events/sec. If you want distributed systems '
      + 'experience that rivals FAANG, this is it. Onboarding is 3-4 '
      + 'months though - the codebase is massive.',
    tags: ['scale', 'distributed-systems'],
  },
  {
    id: 'fc-ms-priya',
    type: 'milestone',
    createdAt: hoursAgo(22),
    updatedAt: hoursAgo(22),
    score: 0.66,
    reactionCount: 241,
    isBookmarked: false,
    title: 'Priya Sharma crossed 8 successful hires',
    description:
      'She is now the #1 Endorser in Bangalore. Flipkart platform is '
      + 'quietly being built by Priya\'s referrals.',
    relatedUserId: '20',
  },
  {
    id: 'fc-cs-divya',
    type: 'career_story',
    createdAt: daysAgo(1),
    updatedAt: daysAgo(1),
    score: 0.64,
    reactionCount: 27,
    isBookmarked: false,
    ...buildCareerStoryFrom(seekerById('9')!),
  },
  {
    id: 'fc-ci-google',
    type: 'company_intel',
    createdAt: daysAgo(1),
    updatedAt: daysAgo(1),
    score: 0.62,
    reactionCount: 167,
    isBookmarked: false,
    companyId: COMPANY.google.id,
    companyName: COMPANY.google.name,
    authorLabel: 'Verified employee at Google Bangalore',
    title: 'L4 to L5 promo: what the committee actually looks for',
    body:
      'You need one project with cross-team impact, documented. A GUM '
      + 'feedback trail. Peer reviews from outside your team. Technical '
      + 'depth is assumed. Most people get stuck on the cross-team signal.',
    tags: ['career', 'promotion', 'google'],
  },
  {
    id: 'fc-ed-referrals',
    type: 'editorial',
    createdAt: daysAgo(1),
    updatedAt: daysAgo(1),
    score: 0.60,
    reactionCount: 198,
    isBookmarked: false,
    title: 'Why your referral matters more than your resume',
    body:
      'Data from 500+ Endorsly endorsements: endorsed candidates are 4.2x more '
      + 'likely to get an interview and 2.8x more likely to get an offer. '
      + 'A referrer puts their reputation on the line. That changes '
      + 'everything.',
    author: 'Endorsly Editorial',
    tags: ['referrals', 'data', 'career-advice'],
  },
  {
    id: 'fc-cs-rohan',
    type: 'career_story',
    createdAt: daysAgo(2),
    updatedAt: daysAgo(2),
    score: 0.58,
    reactionCount: 18,
    isBookmarked: false,
    ...buildCareerStoryFrom(seekerById('10')!),
  },
  {
    id: 'fc-ci-meesho',
    type: 'company_intel',
    createdAt: daysAgo(2),
    updatedAt: daysAgo(2),
    score: 0.55,
    reactionCount: 89,
    isBookmarked: false,
    companyId: COMPANY.meesho.id,
    companyName: COMPANY.meesho.name,
    authorLabel: 'Verified employee at Meesho',
    title: 'Social commerce pivot is real. Eng hiring reflects it.',
    body:
      'Entire new product org spun up for creator-led commerce. '
      + 'If you have worked on social, community, or creator tools, this '
      + 'is the team you want to join at Meesho right now.',
    tags: ['product', 'hiring', 'social-commerce'],
  },
  {
    id: 'fc-rev-4',
    type: 'referral_event',
    createdAt: daysAgo(2),
    updatedAt: daysAgo(2),
    score: 0.52,
    reactionCount: 9,
    isBookmarked: false,
    referrerDisplayName: 'Anita Desai',
    seekerDisplayName: 'Sahil J.',
    companyName: 'Swiggy',
    eventDescription: 'accepted referral for Sahil in Instamart product engineering',
  },
  {
    id: 'fc-cs-aditi',
    type: 'career_story',
    createdAt: daysAgo(3),
    updatedAt: daysAgo(3),
    score: 0.50,
    reactionCount: 22,
    isBookmarked: false,
    ...buildCareerStoryFrom(seekerById('11')!),
  },
  {
    id: 'fc-ci-groww',
    type: 'company_intel',
    createdAt: daysAgo(3),
    updatedAt: daysAgo(3),
    score: 0.47,
    reactionCount: 74,
    isBookmarked: false,
    companyId: COMPANY.groww.id,
    companyName: COMPANY.groww.name,
    authorLabel: 'Verified employee at Groww',
    title: 'ML team is 9 people and owns the whole recommendation stack',
    body:
      'Flat structure, direct line to the CTO. If you are strong in '
      + 'ranking models and comfortable owning production inference, this '
      + 'is the most high-leverage ML team I have seen in Bangalore.',
    tags: ['ml', 'team', 'hiring'],
  },
  {
    id: 'fc-ed-market',
    type: 'editorial',
    createdAt: daysAgo(3),
    updatedAt: daysAgo(3),
    score: 0.44,
    reactionCount: 256,
    isBookmarked: false,
    title: 'State of Bangalore Hiring: Q2 2026',
    body:
      'Backend/platform up 40% QoQ. ML hiring cooled after the initial '
      + 'hype. Fintech is the most aggressive - Razorpay, PhonePe, Groww '
      + 'leading. Average time-to-hire for senior roles: 18 days. '
      + 'Referrals drive 3x the hire rate of job boards.',
    author: 'Endorsly Editorial',
    tags: ['market-trends', 'hiring'],
  },
  {
    id: 'fc-cs-nikhil',
    type: 'career_story',
    createdAt: daysAgo(4),
    updatedAt: daysAgo(4),
    score: 0.40,
    reactionCount: 14,
    isBookmarked: false,
    ...buildCareerStoryFrom(seekerById('12')!),
  },
  {
    id: 'fc-ci-microsoft',
    type: 'company_intel',
    createdAt: daysAgo(4),
    updatedAt: daysAgo(4),
    score: 0.37,
    reactionCount: 58,
    isBookmarked: false,
    companyId: COMPANY.microsoft.id,
    companyName: COMPANY.microsoft.name,
    authorLabel: 'Verified employee at Microsoft IDC',
    title: 'L62 compensation in Bangalore: what is actually on offer',
    body:
      'Base 55-65L, stock vesting 40-80L over 4 years, annual bonus '
      + '10-20%. Lower than US but absolute top of Indian market. '
      + 'Interview is 5 rounds, 2 coding, 1 design, 1 behavioral, 1 hiring manager.',
    tags: ['compensation', 'interview', 'faang'],
  },
  {
    id: 'fc-ms-weekly',
    type: 'milestone',
    createdAt: daysAgo(5),
    updatedAt: daysAgo(5),
    score: 0.32,
    reactionCount: 412,
    isBookmarked: false,
    title: '100 endorsements submitted this week on Endorsly',
    description:
      'New high-water mark. 27 of them converted to first-round interviews '
      + 'within 5 days. Bangalore is moving fast.',
  },
];

// Helper: spread a career-story card from a DemoSeeker.
function buildCareerStoryFrom(s: DemoSeeker) {
  return {
    seekerId: s.id,
    seekerName: s.name,
    headline: s.headline,
    story: s.story,
    skills: s.skills,
    yearsOfExperience: s.yearsOfExperience,
    targetRoles: s.targetRoles,
    targetCompanies: s.targetCompanies,
  };
}

export const MOCK_FEED_RESPONSE: FeedResponse = {
  cards: FEED_CARDS,
  cursor: null,
  hasMore: false,
};

// ── Pipeline (Seeker view: Danush's referrals across every status) ─────
// Shown as Danush's 7 referrals - the whole funnel story in one glance.
const baseSeekerReferral = {
  seekerId: danush.id,
  matchScore: 85,
  seekerNote: 'Would love a referral for this role.',
} as const;

export const MOCK_PIPELINE: SeekerPipelineItem[] = [
  {
    referral: {
      ...baseSeekerReferral,
      id: 'ref-p1',
      referrerId: '21',
      companyId: COMPANY.google.id,
      targetRole: 'Senior Backend Engineer',
      status: 'hired',
      matchScore: 94,
      requestedAt: daysAgo(21),
      acceptedAt: daysAgo(20),
      submittedAt: daysAgo(18),
      outcomeAt: daysAgo(2),
    },
    referrerName: 'Vikram Rao',
    companyName: COMPANY.google.name,
  },
  {
    referral: {
      ...baseSeekerReferral,
      id: 'ref-p2',
      referrerId: '3',
      companyId: COMPANY.zepto.id,
      targetRole: 'Senior Backend Engineer',
      status: 'interviewing',
      matchScore: 92,
      requestedAt: daysAgo(9),
      acceptedAt: daysAgo(8),
      submittedAt: daysAgo(5),
    },
    referrerName: 'Deepak Nair',
    companyName: COMPANY.zepto.name,
  },
  {
    referral: {
      ...baseSeekerReferral,
      id: 'ref-p3',
      referrerId: '2',
      companyId: COMPANY.razorpay.id,
      targetRole: 'Staff Engineer - Payments',
      status: 'submitted',
      matchScore: 88,
      requestedAt: daysAgo(4),
      acceptedAt: daysAgo(3.5),
      submittedAt: daysAgo(2),
    },
    referrerName: 'Nivrant Goswami',
    companyName: COMPANY.razorpay.name,
  },
  {
    referral: {
      ...baseSeekerReferral,
      id: 'ref-p4',
      referrerId: '4',
      companyId: COMPANY.swiggy.id,
      targetRole: 'Backend Engineer',
      status: 'accepted',
      matchScore: 78,
      requestedAt: hoursAgo(24),
      acceptedAt: hoursAgo(12),
    },
    referrerName: 'Anita Desai',
    companyName: COMPANY.swiggy.name,
  },
  {
    referral: {
      ...baseSeekerReferral,
      id: 'ref-p5',
      referrerId: '20',
      companyId: COMPANY.flipkart.id,
      targetRole: 'Platform Engineer',
      status: 'requested',
      matchScore: 81,
      requestedAt: hoursAgo(6),
    },
    referrerName: 'Priya Sharma',
    companyName: COMPANY.flipkart.name,
  },
  {
    referral: {
      ...baseSeekerReferral,
      id: 'ref-p6',
      referrerId: '22',
      companyId: COMPANY.phonepe.id,
      targetRole: 'Senior Backend Engineer',
      status: 'rejected',
      matchScore: 65,
      requestedAt: daysAgo(12),
      acceptedAt: daysAgo(11),
      submittedAt: daysAgo(9),
      outcomeAt: daysAgo(3),
    },
    referrerName: 'Sneha Patel',
    companyName: COMPANY.phonepe.name,
  },
  {
    referral: {
      ...baseSeekerReferral,
      id: 'ref-p7',
      referrerId: '23',
      companyId: COMPANY.cred.id,
      targetRole: 'Senior Backend Engineer',
      status: 'withdrawn',
      matchScore: 70,
      requestedAt: daysAgo(8),
      acceptedAt: daysAgo(7),
    },
    referrerName: 'Amit Verma',
    companyName: COMPANY.cred.name,
  },
];

// ── Inbox (Referrer view: Nivrant's 6 incoming requests) ─────────────────
// 3 requested (new), 2 accepted (chatting), 1 submitted (in flight).
const baseReferrerReferral = {
  referrerId: nivrant.id,
  companyId: COMPANY.razorpay.id,
} as const;

function inboxFromSeeker(seekerId: string, overrides: {
  id: string;
  targetRole: string;
  status: 'requested' | 'accepted' | 'submitted' | 'interviewing';
  matchScore: number;
  requestedHoursAgo: number;
  acceptedHoursAgo?: number;
  submittedHoursAgo?: number;
  seekerNote?: string;
}): ReferrerInboxItem {
  const s = seekerById(seekerId)!;
  return {
    referral: {
      ...baseReferrerReferral,
      id: overrides.id,
      seekerId: s.id,
      targetRole: overrides.targetRole,
      status: overrides.status,
      matchScore: overrides.matchScore,
      requestedAt: hoursAgo(overrides.requestedHoursAgo),
      acceptedAt: overrides.acceptedHoursAgo !== undefined
        ? hoursAgo(overrides.acceptedHoursAgo)
        : undefined,
      submittedAt: overrides.submittedHoursAgo !== undefined
        ? hoursAgo(overrides.submittedHoursAgo)
        : undefined,
      seekerNote: overrides.seekerNote ?? `Hi Nivrant, I am ${s.name.split(' ')[0]}. ${s.story.slice(0, 100)}...`,
    },
    seekerName: s.name,
    seekerHeadline: seekerHeadline(s),
    matchScore: overrides.matchScore,
  };
}

export const MOCK_INBOX: ReferrerInboxItem[] = [
  inboxFromSeeker('5', {
    id: 'ref-i1',
    targetRole: 'Senior Backend Engineer',
    status: 'requested',
    matchScore: 91,
    requestedHoursAgo: 1,
    seekerNote:
      'Hi Nivrant, I built payment infra at PhonePe for 3 years. '
      + 'Saw your post on Razorpay backend hiring - I think I would be '
      + 'a strong fit for the payments team. Would love your thoughts.',
  }),
  inboxFromSeeker('10', {
    id: 'ref-i2',
    targetRole: 'Platform Engineer',
    status: 'requested',
    matchScore: 84,
    requestedHoursAgo: 3,
    seekerNote:
      'Hey Nivrant, Uber SRE looking to move into platform engineering. '
      + 'Would love to chat about the Razorpay platform team.',
  }),
  inboxFromSeeker('14', {
    id: 'ref-i3',
    targetRole: 'DevOps Engineer',
    status: 'requested',
    matchScore: 77,
    requestedHoursAgo: 8,
    seekerNote:
      'Hi, coming out of 4 years of DevSecOps at Deloitte. Want to '
      + 'build internal tooling at a product company. Razorpay feels '
      + 'right.',
  }),
  inboxFromSeeker('15', {
    id: 'ref-i4',
    targetRole: 'Senior Full-stack Engineer',
    status: 'accepted',
    matchScore: 88,
    requestedHoursAgo: 48,
    acceptedHoursAgo: 36,
    seekerNote:
      'Hi Nivrant, Zerodha full-stack engineer. Would love to explore '
      + 'Razorpay - specifically curious about the merchant dashboard team.',
  }),
  inboxFromSeeker('7', {
    id: 'ref-i5',
    targetRole: 'Senior Data Engineer',
    status: 'accepted',
    matchScore: 83,
    requestedHoursAgo: 72,
    acceptedHoursAgo: 60,
    seekerNote:
      'Hi! Flipkart data engineer looking at Razorpay\'s analytics team. '
      + 'Spark/Airflow background.',
  }),
  inboxFromSeeker('8', {
    id: 'ref-i6',
    targetRole: 'Senior Backend Engineer',
    status: 'submitted',
    matchScore: 86,
    requestedHoursAgo: 96,
    acceptedHoursAgo: 84,
    submittedHoursAgo: 36,
    seekerNote:
      'Hey, ex-Walmart Labs, 5y JVM backend. Looking at Razorpay for '
      + 'the payments platform team.',
  }),
];

// ── Chat (per-referral conversations) ─────────────────────────────────
export const MOCK_CHAT_CONVERSATION_ID = 'conv-demo-default';

const danushSender = { id: danush.id, displayName: danush.name };
const nivrantSender = { id: nivrant.id, displayName: nivrant.name };

// Default conversation: Danush <-> Nivrant (used when no specific map hits).
const DEFAULT_CHAT: ChatMessage[] = [
  { id: 'm-d1', body: 'Hi Nivrant! Saw the Razorpay backend post. 6y building payment systems at Amazon Pay - strong fit, I think.', createdAt: daysAgo(3), sender: danushSender },
  { id: 'm-d2', body: 'Hey Danush, solid background. We are hiring aggressively for payments. What stack?', createdAt: daysAgo(3), sender: nivrantSender },
  { id: 'm-d3', body: 'Go + PostgreSQL with Kafka for event streaming. Also did the monolith-to-microservices migration.', createdAt: daysAgo(2), sender: danushSender },
  { id: 'm-d4', body: 'Perfect - exactly what we need. I\'ll submit your referral today. Recruiter usually reaches out within 3-4 days.', createdAt: daysAgo(2), sender: nivrantSender },
  { id: 'm-d5', body: 'Amazing, thank you! Anything specific to prep for the system design round?', createdAt: hoursAgo(20), sender: danushSender },
  { id: 'm-d6', body: 'Focus on distributed payments - idempotency, saga patterns, exactly-once delivery. That\'s what they dig into.', createdAt: hoursAgo(19), sender: nivrantSender },
  { id: 'm-d7', body: 'Got it. One more thing - what\'s the TC band for staff level?', createdAt: hoursAgo(3), sender: danushSender },
  { id: 'm-d8', body: '50-60L base + 20-30L RSUs for staff. Joining bonus of 10L usually. Bring up comp early, they respect directness.', createdAt: hoursAgo(2), sender: nivrantSender },
];

// Per-referral chat histories. Each is a small, realistic conversation.
const CHAT_HISTORIES: Record<string, ChatMessage[]> = {
  // Seeker-side pipeline referrals
  'ref-p2': [
    { id: 'm-zepto-1', body: 'Hey Danush, got your request. The 10-min delivery team is hiring seniors. Thoughts on the stack?', createdAt: daysAgo(8), sender: { id: '3', displayName: 'Deepak Nair' } },
    { id: 'm-zepto-2', body: 'Interested! I saw the company intel post about routing. That system sounds like a blast to work on.', createdAt: daysAgo(7), sender: danushSender },
    { id: 'm-zepto-3', body: 'Great. Submitting you for the Sr Backend role. Interview loop is 5 rounds over 2 weeks.', createdAt: daysAgo(5), sender: { id: '3', displayName: 'Deepak Nair' } },
    { id: 'm-zepto-4', body: 'Cleared round 3 today! System design went really well. Thank you for the pointer on event sourcing.', createdAt: daysAgo(1), sender: danushSender },
    { id: 'm-zepto-5', body: 'Incredible. 2 rounds left - both behavioral. Just tell stories about past ownership. You got this.', createdAt: hoursAgo(6), sender: { id: '3', displayName: 'Deepak Nair' } },
  ],
  'ref-p3': DEFAULT_CHAT, // Danush + Nivrant, the Razorpay referral
  'ref-p4': [
    { id: 'm-swiggy-1', body: 'Hi Danush, Anita here. Accepted your Swiggy request. We have Instamart roles opening up - interested?', createdAt: hoursAgo(12), sender: { id: '4', displayName: 'Anita Desai' } },
    { id: 'm-swiggy-2', body: 'Yes, definitely. Saw the post about Instamart being the growth engine. That\'s where I want to be.', createdAt: hoursAgo(10), sender: danushSender },
    { id: 'm-swiggy-3', body: 'Sending you the JD. Let me know by tomorrow if you want to move forward.', createdAt: hoursAgo(8), sender: { id: '4', displayName: 'Anita Desai' } },
  ],
  // Referrer-side inbox referrals (when Nivrant opens chat from Inbox)
  'ref-i4': [
    { id: 'm-shreya-1', body: 'Hi Nivrant, thanks for accepting! I\'m really curious about the merchant dashboard team.', createdAt: hoursAgo(35), sender: { id: '15', displayName: 'Shreya Nair' } },
    { id: 'm-shreya-2', body: 'Happy to help. Merchant dashboard is React + TypeScript end to end. They care about UX deeply. What was your Zerodha Kite stack?', createdAt: hoursAgo(30), sender: nivrantSender },
    { id: 'm-shreya-3', body: 'React, TS, WebSockets for live data. Built real-time order book views. Comfortable with Node backends too.', createdAt: hoursAgo(28), sender: { id: '15', displayName: 'Shreya Nair' } },
    { id: 'm-shreya-4', body: 'Perfect fit. Can I submit your profile today? The hiring manager is shipping offers fast this week.', createdAt: hoursAgo(20), sender: nivrantSender },
  ],
  'ref-i5': [
    { id: 'm-neha-1', body: 'Hey Nivrant! Flipkart data engineer. Would love a referral to Razorpay analytics.', createdAt: hoursAgo(70), sender: { id: '7', displayName: 'Neha Kulkarni' } },
    { id: 'm-neha-2', body: 'Hi Neha, great. Our analytics team is small but powerful. 4 engineers and a lot of ownership. What\'s your Spark background?', createdAt: hoursAgo(65), sender: nivrantSender },
    { id: 'm-neha-3', body: 'Owned the Flipkart recommendation data layer. Pipelines processing 300M events/day. Airflow + dbt for downstream.', createdAt: hoursAgo(62), sender: { id: '7', displayName: 'Neha Kulkarni' } },
    { id: 'm-neha-4', body: 'Exactly the scale we operate at. I\'ll connect you with the team lead this week.', createdAt: hoursAgo(58), sender: nivrantSender },
  ],
  'ref-i6': [
    { id: 'm-karthik-1', body: 'Hi Nivrant, Karthik here. Thanks for accepting - super excited about Razorpay payments platform.', createdAt: hoursAgo(82), sender: { id: '8', displayName: 'Karthik Ramesh' } },
    { id: 'm-karthik-2', body: 'Walmart Labs JVM background will translate well. I\'ve submitted your referral to the hiring team.', createdAt: hoursAgo(78), sender: nivrantSender },
    { id: 'm-karthik-3', body: 'Recruiter reached out - first round is Tuesday. Any advice?', createdAt: hoursAgo(40), sender: { id: '8', displayName: 'Karthik Ramesh' } },
    { id: 'm-karthik-4', body: 'They\'ll ask about concurrency and idempotency in payment flows. Think about what happens on duplicate webhooks.', createdAt: hoursAgo(38), sender: nivrantSender },
  ],
};

export const MOCK_CHAT_MESSAGES = DEFAULT_CHAT;

/** Look up the chat history for a specific referral.
 *  Falls back to: (1) a synthetic opener built from the inbox seekerNote, or
 *  (2) the default Danush <-> Nivrant conversation. Ensures that when a referrer
 *  accepts a request and opens chat, they see the seeker's actual pitch. */
export function chatForReferral(referralId: string): ChatMessage[] {
  const stored = CHAT_HISTORIES[referralId];
  if (stored) return stored;

  const inbox = MOCK_INBOX.find((i) => i.referral.id === referralId);
  if (inbox?.referral.seekerNote) {
    const seeker = seekerById(inbox.referral.seekerId);
    const opener: ChatMessage = {
      id: `m-open-${referralId}`,
      body: inbox.referral.seekerNote,
      createdAt: inbox.referral.requestedAt,
      sender: {
        id: inbox.referral.seekerId,
        displayName: seeker?.name ?? inbox.seekerName,
      },
    };
    CHAT_HISTORIES[referralId] = [opener];
    return CHAT_HISTORIES[referralId];
  }

  return DEFAULT_CHAT;
}

/** Append a message to a referral's chat (demo mutation for live feel). */
export function appendChatMessage(referralId: string, message: ChatMessage) {
  if (!CHAT_HISTORIES[referralId]) CHAT_HISTORIES[referralId] = [...DEFAULT_CHAT];
  CHAT_HISTORIES[referralId].push(message);
}

// ── Reputation + Leaderboard ──────────────────────────────────────────
function leaderboardFromReferrer(r: DemoReferrer): LeaderboardEntry {
  return {
    kingmakerScore: r.kingmakerScore,
    totalReferrals: r.totalReferrals,
    successfulHires: r.successfulHires,
    user: { id: r.id, displayName: r.name },
    company: { id: r.company.id, name: r.company.name },
  };
}

export const MOCK_LEADERBOARD: LeaderboardEntry[] = [...DEMO_REFERRERS]
  .sort((a, b) => b.kingmakerScore - a.kingmakerScore)
  .map(leaderboardFromReferrer);

export const MOCK_REPUTATION: ReputationData = {
  kingmakerScore: nivrant.kingmakerScore,
  totalReferrals: nivrant.totalReferrals,
  successfulHires: nivrant.successfulHires,
  department: 'Engineering',
  jobTitle: nivrant.jobTitle,
  verificationStatus: 'verified',
  user: { id: nivrant.id, displayName: nivrant.name },
  company: { id: nivrant.company.id, name: nivrant.company.name },
};

// ── Profiles ──────────────────────────────────────────────────────────
export const MOCK_SEEKER_PROFILE = {
  id: Number(danush.id),
  email: danush.email,
  displayName: danush.name,
  role: 'seeker' as const,
  headline: danush.headline,
  seekerProfile: {
    headline: danush.headline,
    career_story: danush.story,
    skills: danush.skills,
    years_of_experience: danush.yearsOfExperience,
    target_companies: danush.targetCompanies,
    target_roles: danush.targetRoles,
    is_open_to_work: true,
  },
};

export const MOCK_REFERRER_PROFILE = {
  id: Number(nivrant.id),
  email: 'nivrant@razorpay.com',
  displayName: nivrant.name,
  role: 'referrer' as const,
  jobTitle: nivrant.jobTitle,
  companyName: nivrant.company.name,
  kingmakerScore: nivrant.kingmakerScore,
  referrerProfile: {
    company: { id: Number(nivrant.company.id.replace('c-', '')), name: nivrant.company.name },
    department: 'Engineering',
    job_title: nivrant.jobTitle,
    kingmaker_score: nivrant.kingmakerScore,
    total_referrals: nivrant.totalReferrals,
    successful_hires: nivrant.successfulHires,
    verification_status: 'verified',
  },
};
