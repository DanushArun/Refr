import type { ContentType } from '@refr/shared';

// The shape stored in content_cards.payload (JSONB) for each content type.
// Application layer validates before write and casts after read.

export interface CareerStoryPayload {
  seekerId: string;
  seekerName: string;
  seekerAvatar?: string;
  headline: string;
  story: string;
  skills: string[];
  yearsOfExperience: number;
  targetRoles: string[];
  targetCompanies: string[];
}

export interface CompanyIntelPayload {
  companyId: string;
  companyName: string;
  companyLogo?: string;
  // The public label is "Verified employee at <company>"; real identity is hidden
  authorLabel: string;
  title: string;
  body: string;
  tags: string[];
}

export interface ReferralEventPayload {
  referralId: string;
  referrerDisplayName: string;
  seekerDisplayName: string;
  companyName: string;
  eventDescription: string;
}

export interface MilestonePayload {
  title: string;
  description: string;
  relatedUserId?: string;
}

export interface EditorialPayload {
  title: string;
  body: string;
  author: string;
  tags: string[];
}

export type ContentPayload =
  | CareerStoryPayload
  | CompanyIntelPayload
  | ReferralEventPayload
  | MilestonePayload
  | EditorialPayload;

// Raw DB row returned by Prisma before mapping to shared FeedCard shape
export interface ContentCardRow {
  id: string;
  type: ContentType;
  score: number;
  reactionCount: number;
  payload: unknown; // JSONB — cast after read
  authorId: string | null;
  companyId: string | null;
  isRemoved: boolean;
  createdAt: Date;
  updatedAt: Date;
}
