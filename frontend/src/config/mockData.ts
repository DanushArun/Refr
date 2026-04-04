/** Mock data for REFR demo mode. Bangalore tech content.
 * Seeker: Arjun Mehta (id '1') | Referrer: Ravi Kumar (id '2') */
import type {
  FeedCard,
  SeekerPipelineItem,
  ReferrerInboxItem,
  Referral,
  FeedResponse,
} from '@refr/shared';
import type {
  ChatMessage,
  ReputationData,
  LeaderboardEntry,
} from '../services/api';
import type { Session } from '../services/auth';

// ── Sessions ────────────────────────────────────────────────────────
export const MOCK_SEEKER_SESSION: Session = {
  access_token: 'demo-seeker-access-token',
  refresh_token: 'demo-seeker-refresh-token',
  user: {
    id: '1',
    email: 'arjun@gmail.com',
    displayName: 'Arjun Mehta',
    role: 'seeker',
  },
};

export const MOCK_REFERRER_SESSION: Session = {
  access_token: 'demo-referrer-access-token',
  refresh_token: 'demo-referrer-refresh-token',
  user: {
    id: '2',
    email: 'ravi@razorpay.com',
    displayName: 'Ravi Kumar',
    role: 'referrer',
  },
};

// ── Feed Cards ──────────────────────────────────────────────────────
const hoursAgo = (h: number) =>
  new Date(Date.now() - h * 3600_000).toISOString();

const MOCK_FEED_CARDS: FeedCard[] = [
  {
    id: 'fc-1',
    type: 'career_story',
    createdAt: hoursAgo(2),
    updatedAt: hoursAgo(2),
    score: 0.92,
    reactionCount: 38,
    isBookmarked: false,
    seekerId: '1',
    seekerName: 'Arjun Mehta',
    headline: 'Left Amazon after 4 years. Here is why Bangalore startups won.',
    story:
      'I spent 4 years building payment infra at Amazon Pay. The scale was '
      + 'incredible but the pace of shipping felt glacial. Three months ago '
      + 'I quit to explore Bangalore startups where I could own a system '
      + 'end-to-end. Currently targeting backend roles at Razorpay, Zepto, '
      + 'and Swiggy.',
    skills: ['Go', 'PostgreSQL', 'Kafka', 'AWS', 'System Design'],
    yearsOfExperience: 6,
    targetRoles: ['Senior Backend Engineer', 'Staff Engineer'],
    targetCompanies: ['Razorpay', 'Zepto', 'Swiggy'],
  },
  {
    id: 'fc-2',
    type: 'company_intel',
    createdAt: hoursAgo(5),
    updatedAt: hoursAgo(5),
    score: 0.87,
    reactionCount: 124,
    isBookmarked: true,
    companyId: 'c-1',
    companyName: 'Razorpay',
    authorLabel: 'Verified employee at Razorpay',
    title: 'Backend hiring is on fire right now',
    body:
      'We are backfilling 12 backend roles across payments and banking. '
      + 'The bar is high but the interviews are fair -- two DSA rounds, '
      + 'one system design, one hiring manager chat. Offer turnaround is '
      + 'under 10 days. TC for senior roles is 45-55L base + 15-20L RSUs.',
    tags: ['hiring', 'engineering', 'salary', 'backend'],
  },
  {
    id: 'fc-3',
    type: 'referral_event',
    createdAt: hoursAgo(8),
    updatedAt: hoursAgo(8),
    score: 0.74,
    reactionCount: 12,
    isBookmarked: false,
    referrerDisplayName: 'Priya Sharma',
    seekerDisplayName: 'Karthik R.',
    companyName: 'Flipkart',
    eventDescription:
      'referred Karthik to the Flipkart platform engineering team',
  },
  {
    id: 'fc-4',
    type: 'milestone',
    createdAt: hoursAgo(12),
    updatedAt: hoursAgo(12),
    score: 0.68,
    reactionCount: 89,
    isBookmarked: false,
    title: 'Neha got hired at Swiggy through REFR!',
    description:
      'After a referral from Vikram, Neha cleared all 4 rounds and '
      + 'joined as a Senior Frontend Engineer. Total time from referral '
      + 'to offer: 18 days.',
    relatedUserId: '7',
  },
  {
    id: 'fc-5',
    type: 'editorial',
    createdAt: hoursAgo(18),
    updatedAt: hoursAgo(18),
    score: 0.61,
    reactionCount: 203,
    isBookmarked: false,
    title: 'Bangalore Backend Salaries Q1 2026: The Real Numbers',
    body:
      'We aggregated offer letters from 340 verified REFR users. '
      + 'Median total comp for 4-6 YOE backend engineers: 38L. '
      + 'Top quartile at Razorpay, Flipkart, and PhonePe: 52-65L. '
      + 'Startups like Zepto and Groww are competing on RSU upside.',
    author: 'REFR Editorial',
    tags: ['salary', 'market-data', 'backend', 'bangalore'],
  },
];

export const MOCK_FEED_RESPONSE: FeedResponse = {
  cards: MOCK_FEED_CARDS,
  cursor: null,
  hasMore: false,
};

// ── Pipeline (Seeker view) ──────────────────────────────────────────
const baseSeekerReferral = {
  seekerId: '1',
  matchScore: 85,
  seekerNote: 'Would love a referral for this role.',
} as const;

export const MOCK_PIPELINE: SeekerPipelineItem[] = [
  {
    referral: {
      ...baseSeekerReferral,
      id: 'ref-1',
      referrerId: '3',
      companyId: 'c-3',
      targetRole: 'Senior Backend Engineer',
      status: 'interviewing',
      matchScore: 92,
      requestedAt: hoursAgo(168),
      acceptedAt: hoursAgo(160),
      submittedAt: hoursAgo(120),
    },
    referrerName: 'Deepak Nair',
    companyName: 'Zepto',
  },
  {
    referral: {
      ...baseSeekerReferral,
      id: 'ref-2',
      referrerId: '2',
      companyId: 'c-1',
      targetRole: 'Staff Engineer - Payments',
      status: 'submitted',
      matchScore: 88,
      requestedAt: hoursAgo(96),
      acceptedAt: hoursAgo(90),
      submittedAt: hoursAgo(48),
    },
    referrerName: 'Ravi Kumar',
    companyName: 'Razorpay',
  },
  {
    referral: {
      ...baseSeekerReferral,
      id: 'ref-3',
      referrerId: '4',
      companyId: 'c-4',
      targetRole: 'Backend Engineer',
      status: 'accepted',
      matchScore: 78,
      requestedAt: hoursAgo(24),
      acceptedAt: hoursAgo(12),
    },
    referrerName: 'Anita Desai',
    companyName: 'Swiggy',
  },
];

// ── Inbox (Referrer view) ───────────────────────────────────────────
const baseReferrerReferral = {
  referrerId: '2',
  companyId: 'c-1',
} as const;

export const MOCK_INBOX: ReferrerInboxItem[] = [
  {
    referral: {
      ...baseReferrerReferral,
      id: 'ref-10',
      seekerId: '5',
      targetRole: 'Senior Backend Engineer',
      status: 'requested',
      matchScore: 91,
      requestedAt: hoursAgo(3),
      seekerNote: 'Built payment infra at PhonePe for 3 years.',
    },
    seekerName: 'Meera Iyer',
    seekerHeadline: 'Backend Engineer | Ex-PhonePe | Go, Kafka',
    matchScore: 91,
  },
  {
    referral: {
      ...baseReferrerReferral,
      id: 'ref-11',
      seekerId: '6',
      targetRole: 'Frontend Engineer',
      status: 'requested',
      matchScore: 76,
      requestedAt: hoursAgo(8),
      seekerNote: 'React Native specialist looking to move into web.',
    },
    seekerName: 'Sahil Jain',
    seekerHeadline: 'Mobile Engineer | CRED | React Native, TypeScript',
    matchScore: 76,
  },
  {
    referral: {
      ...baseReferrerReferral,
      id: 'ref-12',
      seekerId: '7',
      targetRole: 'Data Engineer',
      status: 'accepted',
      matchScore: 83,
      requestedAt: hoursAgo(48),
      acceptedAt: hoursAgo(36),
      seekerNote: 'Spark + Airflow background, targeting fintech.',
    },
    seekerName: 'Neha Kulkarni',
    seekerHeadline: 'Data Engineer | Flipkart | Spark, Airflow, Python',
    matchScore: 83,
  },
];

// ── Chat Messages ───────────────────────────────────────────────────
export const MOCK_CHAT_CONVERSATION_ID = 'conv-demo-1';

const arjun = { id: '1', displayName: 'Arjun Mehta' };
const ravi = { id: '2', displayName: 'Ravi Kumar' };

export const MOCK_CHAT_MESSAGES: ChatMessage[] = [
  {
    id: 'msg-1',
    body: 'Hi Ravi! I saw the Razorpay backend roles on REFR. '
      + 'I have 6 years building payment systems at Amazon Pay.',
    createdAt: hoursAgo(72),
    sender: arjun,
  },
  {
    id: 'msg-2',
    body: 'Hey Arjun, great background. We are hiring aggressively '
      + 'for the payments team right now. What stack are you on?',
    createdAt: hoursAgo(70),
    sender: ravi,
  },
  {
    id: 'msg-3',
    body: 'Primarily Go and PostgreSQL with Kafka for event streaming. '
      + 'I also did the migration from monolith to microservices.',
    createdAt: hoursAgo(68),
    sender: arjun,
  },
  {
    id: 'msg-4',
    body: 'That is exactly what we need. I will submit your referral '
      + 'today. The recruiter usually reaches out within 3-4 days.',
    createdAt: hoursAgo(66),
    sender: ravi,
  },
  {
    id: 'msg-5',
    body: 'Amazing, thank you! Should I prep anything specific '
      + 'for the system design round?',
    createdAt: hoursAgo(48),
    sender: arjun,
  },
  {
    id: 'msg-6',
    body: 'Focus on distributed payments -- idempotency, saga patterns, '
      + 'and exactly-once delivery. That is what they dig into.',
    createdAt: hoursAgo(46),
    sender: ravi,
  },
];

// ── Reputation + Leaderboard ────────────────────────────────────────
export const MOCK_REPUTATION: ReputationData = {
  kingmakerScore: 47,
  totalReferrals: 12,
  successfulHires: 3,
  department: 'Engineering',
  jobTitle: 'Senior Backend Engineer',
  verificationStatus: 'verified',
  user: { id: '2', displayName: 'Ravi Kumar' },
  company: { id: 'c-1', name: 'Razorpay' },
};

export const MOCK_LEADERBOARD: LeaderboardEntry[] = [
  {
    kingmakerScore: 72,
    totalReferrals: 24,
    successfulHires: 8,
    user: { id: '10', displayName: 'Priya Sharma' },
    company: { id: 'c-2', name: 'Flipkart' },
  },
  {
    kingmakerScore: 63,
    totalReferrals: 19,
    successfulHires: 6,
    user: { id: '11', displayName: 'Vikram Rao' },
    company: { id: 'c-4', name: 'Swiggy' },
  },
  {
    kingmakerScore: 47,
    totalReferrals: 12,
    successfulHires: 3,
    user: { id: '2', displayName: 'Ravi Kumar' },
    company: { id: 'c-1', name: 'Razorpay' },
  },
  {
    kingmakerScore: 41,
    totalReferrals: 15,
    successfulHires: 3,
    user: { id: '12', displayName: 'Sneha Patel' },
    company: { id: 'c-5', name: 'PhonePe' },
  },
  {
    kingmakerScore: 34,
    totalReferrals: 10,
    successfulHires: 2,
    user: { id: '13', displayName: 'Amit Verma' },
    company: { id: 'c-6', name: 'CRED' },
  },
];

// ── Profile ─────────────────────────────────────────────────────────
export const MOCK_SEEKER_PROFILE = {
  id: 1,
  email: 'arjun@gmail.com',
  displayName: 'Arjun Mehta',
  role: 'seeker',
  headline: 'Senior Backend Engineer | Ex-Amazon Pay',
  seekerProfile: {
    headline: 'Senior Backend Engineer | Ex-Amazon Pay',
    career_story:
      '4 years building payment infra at Amazon Pay. '
      + 'Now exploring Bangalore startups.',
    skills: ['Go', 'PostgreSQL', 'Kafka', 'AWS', 'System Design'],
    years_of_experience: 6,
    target_companies: ['Razorpay', 'Zepto', 'Swiggy'],
    target_roles: ['Senior Backend Engineer', 'Staff Engineer'],
    is_open_to_work: true,
  },
};

export const MOCK_REFERRER_PROFILE = {
  id: 2,
  email: 'ravi@razorpay.com',
  displayName: 'Ravi Kumar',
  role: 'referrer',
  jobTitle: 'Senior Backend Engineer',
  companyName: 'Razorpay',
  kingmakerScore: 47,
  referrerProfile: {
    company: { id: 1, name: 'Razorpay' },
    department: 'Engineering',
    job_title: 'Senior Backend Engineer',
    kingmaker_score: 47,
    total_referrals: 12,
    successful_hires: 3,
    verification_status: 'verified',
  },
};
