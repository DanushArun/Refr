import type { ReferralStatus } from '../constants/status';

/** A referral request from seeker to referrer */
export interface Referral {
  id: string;
  seekerId: string;
  referrerId: string;
  companyId: string;
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
}

/** Pipeline view for seeker: track all their referral requests */
export interface SeekerPipelineItem {
  referral: Referral;
  referrerName: string;
  companyName: string;
  companyLogo?: string;
}

/** Inbox item for referrer: incoming referral requests */
export interface ReferrerInboxItem {
  referral: Referral;
  seekerName: string;
  seekerHeadline: string;
  seekerAvatar?: string;
  matchScore: number;
}
