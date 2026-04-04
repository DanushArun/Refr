/** Referral lifecycle states -- the core state machine */
export const ReferralStatus = {
  REQUESTED: 'requested',       // Seeker tapped "Request Referral" from feed
  ACCEPTED: 'accepted',         // Referrer agreed to refer
  SUBMITTED: 'submitted',       // Referrer submitted referral through their company ATS
  INTERVIEWING: 'interviewing', // Candidate in interview process
  HIRED: 'hired',               // Candidate received offer and accepted
  REJECTED: 'rejected',         // Company rejected candidate
  WITHDRAWN: 'withdrawn',       // Seeker or referrer withdrew
  EXPIRED: 'expired',           // No response within SLA window
} as const;

export type ReferralStatus = (typeof ReferralStatus)[keyof typeof ReferralStatus];

/** Content card types that appear in the feed */
export const ContentType = {
  CAREER_STORY: 'career_story',       // Seeker's narrative profile
  COMPANY_INTEL: 'company_intel',     // Anonymous insider post about a company
  REFERRAL_EVENT: 'referral_event',   // System-generated: "X referred Y at Z"
  MILESTONE: 'milestone',             // System-generated: hire success, streak, etc.
  EDITORIAL: 'editorial',            // REFR team-written content (salary data, trends)
} as const;

export type ContentType = (typeof ContentType)[keyof typeof ContentType];

/** Verification checkpoint status */
export const VerificationStatus = {
  PENDING: 'pending',
  VERIFIED: 'verified',
  FAILED: 'failed',
  SKIPPED: 'skipped',
} as const;

export type VerificationStatus = (typeof VerificationStatus)[keyof typeof VerificationStatus];
