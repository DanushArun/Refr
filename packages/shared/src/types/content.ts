import type { ContentType } from '../constants/status';

/** Base content card -- everything in the feed is a content card */
export interface ContentCard {
  id: string;
  type: ContentType;
  createdAt: string;
  updatedAt: string;
  score: number;               // Computed ranking score
  reactionCount: number;
  isBookmarked: boolean;       // Viewer-specific
}

/** Seeker's career narrative displayed in the feed */
export interface CareerStoryCard extends ContentCard {
  type: 'career_story';
  seekerId: string;
  seekerName: string;
  seekerAvatar?: string;
  headline: string;            // "Left Amazon after 4 years. Here's why."
  story: string;               // The full narrative (markdown-supported)
  skills: string[];
  yearsOfExperience: number;
  targetRoles: string[];
  targetCompanies: string[];
}

/** Anonymous insider post about a company */
export interface CompanyIntelCard extends ContentCard {
  type: 'company_intel';
  companyId: string;
  companyName: string;
  companyLogo?: string;
  authorLabel: string;         // "Verified employee at Flipkart" (never real name)
  title: string;               // "What the backend team actually ships"
  body: string;                // The intel content
  tags: string[];              // "engineering", "culture", "hiring", "salary"
}

/** System-generated event when a referral happens */
export interface ReferralEventCard extends ContentCard {
  type: 'referral_event';
  referrerDisplayName: string; // Public name of referrer
  seekerDisplayName: string;   // Public name of seeker
  companyName: string;
  eventDescription: string;    // "referred someone to the backend team"
}

/** System-generated milestone (hire, streak, leaderboard) */
export interface MilestoneCard extends ContentCard {
  type: 'milestone';
  title: string;               // "Priya got hired at Swiggy through REFR!"
  description: string;
  relatedUserId?: string;
}

/** REFR editorial content (salary data, market trends, hiring insights) */
export interface EditorialCard extends ContentCard {
  type: 'editorial';
  title: string;
  body: string;
  author: string;              // "REFR Editorial"
  tags: string[];
}

export type FeedCard =
  | CareerStoryCard
  | CompanyIntelCard
  | ReferralEventCard
  | MilestoneCard
  | EditorialCard;
