import type { ReferrerInboxItem, SeekerPipelineItem } from '@refr/shared';

export interface Commitment {
  companyName: string;
  counterpartName: string | null;
  id: string;
  isIncoming: boolean;
  requestKind: string;
  sharedProfile?: Record<string, unknown>;
  status: ReferrerInboxItem['referral']['status'];
  targetRole: string;
}

export function commitmentsForSeeker(items: SeekerPipelineItem[]): Commitment[] {
  return items.map((item) => ({
    companyName: item.companyName,
    counterpartName: item.referrerName ?? item.referral.referrerName ?? null,
    id: item.referral.id,
    isIncoming: false,
    requestKind: item.referral.requestKind ?? 'referral_review',
    status: item.referral.status,
    targetRole: item.referral.targetRole,
  }));
}

export function commitmentsForReferrer(items: ReferrerInboxItem[]): Commitment[] {
  return items.map((item) => ({
    companyName: item.companyName,
    counterpartName: item.seekerName,
    id: item.referral.id,
    isIncoming: true,
    requestKind: item.referral.requestKind ?? 'referral_review',
    sharedProfile: item.sharedProfile,
    status: item.referral.status,
    targetRole: item.referral.targetRole,
  }));
}
