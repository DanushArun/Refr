import type { ReferralStatus } from '../constants/status';

/** A referral request from seeker to referrer */
export interface Referral {
  id: string;
  seekerId: string;
  referrerId?: string | null;
  companyId: string;
  opportunityId?: string | null;
  jobId?: string | null;
  targetRole: string;
  status: ReferralStatus;
  matchScore: number;          // 0-100, rule-based scoring
  requestedAt: string;
  acceptedAt?: string;
  submittedAt?: string;
  outcomeAt?: string;
  seekerNote?: string;         // Message from seeker when requesting
  referrerNote?: string;       // Internal note from referrer
  feedCardId?: string;         // Which feed card triggered this referral
  source?: 'specific' | 'browse';
  requestKind?: 'advice' | 'introduction' | 'referral_review';
  sharedFields?: string[];
  referrerName?: string | null;
}

/** Pipeline view for seeker: track all their referral requests */
export interface SeekerPipelineItem {
  referral: Referral;
  referrerName?: string | null;
  companyName: string;
  companyLogo?: string;
}

/** Inbox item for referrer: incoming referral requests */
export interface ReferrerInboxItem {
  companyName: string;
  referral: Referral;
  seekerName: string;
  seekerHeadline: string;
  seekerAvatar?: string;
  matchScore: number;
  sharedProfile?: Record<string, unknown>;
}
