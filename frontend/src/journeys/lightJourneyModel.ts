export type LightJourneyRole = 'seeker' | 'endorser';
export type LightJourneySurface =
  | 'discover'
  | 'inbox'
  | 'activity'
  | 'profile'
  | 'candidates'
  | 'earnings';

export interface LightJourneyContent {
  eyebrow: string;
  heading: string;
  subheading: string;
  primaryAction: string;
  scoreLabel: string;
  scoreValue: string;
  listTitle: string;
  listItems: readonly string[];
}

type SeekerSurface = Exclude<LightJourneySurface, 'candidates' | 'earnings'>;

const SEEKER_CONTENT: Record<SeekerSurface, LightJourneyContent> = {
  discover: {
    eyebrow: 'GOOD MORNING, PRIYA',
    heading: 'The right role starts with the right person.',
    subheading: 'A strong match at Razorpay is waiting for a trusted introduction.',
    primaryAction: 'Request introduction',
    scoreLabel: 'ROLE FIT',
    scoreValue: '92%',
    listTitle: 'Why this fits',
    listItems: ['Payments experience', 'Senior product scope', 'Bengaluru · Hybrid'],
  },
  inbox: {
    eyebrow: 'YOUR CONNECTIONS',
    heading: 'Conversations that move your search forward.',
    subheading: 'Stay close to the people who can make a meaningful introduction.',
    primaryAction: 'Open conversation',
    scoreLabel: 'ACTIVE',
    scoreValue: '03',
    listTitle: 'Active connections',
    listItems: ['Arjun Menon · Razorpay', 'Neha Kulkarni · Razorpay', 'Dev Malhotra · Razorpay'],
  },
  activity: {
    eyebrow: 'APPLICATION ACTIVITY',
    heading: 'Every step, clear and visible.',
    subheading: 'Your referral is with the Razorpay talent team for review.',
    primaryAction: 'View timeline',
    scoreLabel: 'STAGE',
    scoreValue: '02/06',
    listTitle: 'Senior Product Manager · Razorpay',
    listItems: ['Matched', 'Referral submitted', 'Recruiter review'],
  },
  profile: {
    eyebrow: 'PROFILE STRENGTH',
    heading: 'A profile people can stand behind.',
    subheading: 'Verified details give endorsers the context to act with confidence.',
    primaryAction: 'Edit profile',
    scoreLabel: 'COMPLETE',
    scoreValue: '92%',
    listTitle: 'Trusted details',
    listItems: ['Work verified', 'Education verified', 'Resume current'],
  },
};

const ENDORSER_CONTENT: Record<Exclude<LightJourneySurface, 'activity'>, LightJourneyContent> = {
  discover: {
    eyebrow: 'YOUR REFERRAL DESK',
    heading: 'Great people deserve to be seen.',
    subheading: 'Priya is a strong match for a Senior Product Manager opening.',
    primaryAction: 'Connect with Priya',
    scoreLabel: 'MATCH',
    scoreValue: '92%',
    listTitle: 'Why Priya stands out',
    listItems: ['Payments and risk experience', '7 years of product leadership', 'Verified work and education'],
  },
  inbox: {
    eyebrow: 'CONNECTIONS',
    heading: 'The people you are helping, in one place.',
    subheading: 'Messages and secure referral details stay connected to the opportunity.',
    primaryAction: 'Open Priya’s chat',
    scoreLabel: 'UNREAD',
    scoreValue: '01',
    listTitle: 'Active conversations',
    listItems: ['Priya Nair · Senior Product Manager', 'Neha Kulkarni · UX Designer', 'Dev Malhotra · Data Analyst'],
  },
  candidates: {
    eyebrow: 'CANDIDATE PIPELINE',
    heading: 'Know the next step for every person.',
    subheading: 'Priya’s referral has reached the recruiter review stage.',
    primaryAction: 'Submit referral',
    scoreLabel: 'ACTIVE',
    scoreValue: '03',
    listTitle: 'Priya Nair · Razorpay',
    listItems: ['Referral submitted', 'Recruiter review', 'Interview'],
  },
  earnings: {
    eyebrow: 'YOUR IMPACT',
    heading: 'Meaningful introductions, recognised.',
    subheading: 'Rewards are released after a successful 60-day verification period.',
    primaryAction: 'View reward details',
    scoreLabel: 'AVAILABLE',
    scoreValue: '₹21K',
    listTitle: 'Upcoming payout',
    listItems: ['Priya Nair · ₹45,000', 'Payout scheduled · 03 Oct', 'Verified bank account'],
  },
  profile: {
    eyebrow: 'WORK VERIFIED',
    heading: 'A trusted introduction starts with you.',
    subheading: 'Your work identity, referral scope, and availability stay in your control.',
    primaryAction: 'Edit referral preferences',
    scoreLabel: 'RELIABLE',
    scoreValue: '93%',
    listTitle: 'Your referral profile',
    listItems: ['Product referrals', 'Capacity: 3 open', 'Replies within 24 hours'],
  },
};

export function screenContentFor(
  role: LightJourneyRole,
  surface: LightJourneySurface,
): LightJourneyContent | null {
  if (role === 'seeker') {
    return SEEKER_CONTENT[surface as keyof typeof SEEKER_CONTENT] ?? null;
  }

  return ENDORSER_CONTENT[surface as keyof typeof ENDORSER_CONTENT] ?? null;
}
