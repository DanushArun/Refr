import type {
  FeedCard,
  Referral,
  ReferrerInboxItem,
  SeekerPipelineItem,
} from '@refr/shared';
import {
  DEMO,
  DEMO_SEEKERS,
  MOCK_INBOX,
  MOCK_LEADERBOARD,
  MOCK_PIPELINE,
  MOCK_REPUTATION,
  isDemoScreen,
  referrerByCompany,
  referrerById,
} from '../../demo/config';
import { getCurrentDemoCompanyName } from '../../demo/world';
import { request } from './http';
import { uid } from './uid';

const POINTS_PER_REFERRAL = 2;
const POINTS_PER_HIRE = 10;

export interface ReputationData {
  endorsementScore: number;
  totalReferrals: number;
  successfulHires: number;
  department: string;
  jobTitle: string;
  verificationStatus: string;
  user: { id: string; displayName: string };
  company: { id: string; name: string };
}

export interface LeaderboardEntry {
  endorsementScore: number;
  totalReferrals: number;
  successfulHires: number;
  user: { id: string; displayName: string };
  company: { id: string; name: string };
}

export interface CreateReferralRequest {
  companyId?: string | number;
  jobId?: string | number;
  targetRole: string;
  source?: 'specific' | 'browse';
  seekerNote?: string;
  requestKind?: 'advice' | 'introduction' | 'referral_review';
  sharedFields?: Array<
    | 'headline'
    | 'careerStory'
    | 'skills'
    | 'yearsOfExperience'
    | 'currentCompany'
    | 'location'
    | 'education'
  >;
  feedCardId?: string;
  card?: FeedCard;
}

export interface EndorserSwipeInput {
  id: string;
  name: string;
  companyId: string;
  companyName: string;
  jobTitle: string;
  opportunityId?: string;
}

export interface SeekerSwipeInput {
  id: string;
  name: string;
  headline: string;
  yearsOfExperience: number;
  skills: string[];
  targetRole: string;
  opportunityId?: string;
}

export interface EndorserSwipeResult {
  referral: Referral | null;
  mutual: boolean;
}

function targetReferrerForCard(card?: FeedCard): { id: string; companyId: string } {
  if (card && card.type === 'company_intel') {
    const referrer = referrerByCompany(card.companyId);
    if (referrer) return { id: referrer.id, companyId: referrer.company.id };
  }
  return { id: '2', companyId: 'c-1' };
}

function buildMockReferral(
  targetRole: string,
  opts: { feedCardId?: string; seekerNote?: string; card?: FeedCard } = {},
): Referral {
  const target = targetReferrerForCard(opts.card);
  return {
    id: uid('ref-demo'),
    seekerId: '1',
    referrerId: target.id,
    companyId: target.companyId,
    targetRole,
    status: 'requested',
    matchScore: 85,
    requestedAt: new Date().toISOString(),
    feedCardId: opts.feedCardId,
    seekerNote: opts.seekerNote,
  };
}

function findReferralInStores(id: string): Referral | undefined {
  const pipeline = MOCK_PIPELINE.find((i) => i.referral.id === id);
  if (pipeline) return pipeline.referral;
  return MOCK_INBOX.find((i) => i.referral.id === id)?.referral;
}

function storeUpdatedReferral(updated: Referral): void {
  const pIdx = MOCK_PIPELINE.findIndex((i) => i.referral.id === updated.id);
  if (pIdx >= 0) MOCK_PIPELINE[pIdx] = { ...MOCK_PIPELINE[pIdx], referral: updated };
  const iIdx = MOCK_INBOX.findIndex((i) => i.referral.id === updated.id);
  if (iIdx >= 0) MOCK_INBOX[iIdx] = { ...MOCK_INBOX[iIdx], referral: updated };
}

function applyHireScore(previous: Referral['status'], next: Referral['status']): void {
  if (previous !== 'hired' && next === 'hired') {
    MOCK_REPUTATION.successfulHires += 1;
    MOCK_REPUTATION.endorsementScore += POINTS_PER_HIRE;
  }
  if (previous === 'hired' && next !== 'hired') {
    MOCK_REPUTATION.successfulHires = Math.max(0, MOCK_REPUTATION.successfulHires - 1);
    MOCK_REPUTATION.endorsementScore = Math.max(
      0,
      MOCK_REPUTATION.endorsementScore - POINTS_PER_HIRE,
    );
  }
}

function applyDemoTransition(
  id: string,
  newStatus: Referral['status'],
  note?: string,
): Referral {
  const now = new Date().toISOString();
  const base = findReferralInStores(id) ?? buildMockReferral('Unknown');
  const updated: Referral = {
    ...base,
    id,
    status: newStatus,
    referrerNote: note ?? base.referrerNote,
    acceptedAt: newStatus === 'accepted' && !base.acceptedAt ? now : base.acceptedAt,
    submittedAt: newStatus === 'submitted' && !base.submittedAt ? now : base.submittedAt,
    outcomeAt:
      newStatus === 'hired' || newStatus === 'rejected' ? now : base.outcomeAt,
  };
  storeUpdatedReferral(updated);
  applyHireScore(base.status, newStatus);
  return updated;
}

function createDemoRequest(payload: CreateReferralRequest): Referral {
  const referral = buildMockReferral(payload.targetRole, {
    feedCardId: payload.feedCardId,
    seekerNote: payload.seekerNote,
    card: payload.card,
  });
  const referrer = referral.referrerId ? referrerById(referral.referrerId) : undefined;
  MOCK_PIPELINE.unshift({
    referral,
    referrerName: referrer?.name ?? 'Endorsly Endorser',
    companyName: referrer?.company.name ?? getCurrentDemoCompanyName(),
  });
  return referral;
}

function createDemoSeekerSwipe(
  endorser: EndorserSwipeInput,
  seekerNote?: string,
): Referral {
  const now = new Date().toISOString();
  const referral: Referral = {
    id: uid('ref-seeker'),
    seekerId: '1',
    referrerId: endorser.id,
    companyId: endorser.companyId,
    targetRole: endorser.jobTitle,
    status: 'requested',
    matchScore: 85,
    requestedAt: now,
    opportunityId: endorser.opportunityId ?? null,
    jobId: endorser.opportunityId ?? null,
    seekerNote,
  };
  MOCK_PIPELINE.unshift({
    referral,
    referrerName: endorser.name,
    companyName: endorser.companyName,
  });
  return referral;
}

function acceptPendingEndorserSwipe(index: number): { referral: Referral; mutual: boolean } {
  const now = new Date().toISOString();
  const existing = MOCK_INBOX[index];
  const updated: Referral = {
    ...existing.referral,
    status: 'accepted',
    acceptedAt: now,
  };
  MOCK_INBOX[index] = { ...existing, referral: updated };
  MOCK_REPUTATION.totalReferrals += 1;
  MOCK_REPUTATION.endorsementScore += POINTS_PER_REFERRAL;
  return { referral: updated, mutual: true };
}

function createDirectEndorserMatch(seeker: SeekerSwipeInput): Referral {
  const endorser = referrerById('2');
  const now = new Date().toISOString();
  return {
    id: uid('ref-endorser'),
    seekerId: seeker.id,
    referrerId: '2',
    companyId: endorser?.company.id ?? 'c-1',
    targetRole: seeker.targetRole,
    status: 'accepted',
    matchScore: 85,
    requestedAt: now,
    acceptedAt: now,
    opportunityId: seeker.opportunityId ?? null,
    jobId: seeker.opportunityId ?? null,
  };
}

function createDemoEndorserSwipe(
  seeker: SeekerSwipeInput,
): { referral: Referral; mutual: boolean } {
  const pendingIdx = MOCK_INBOX.findIndex(
    (i) => i.referral.seekerId === seeker.id && i.referral.status === 'requested',
  );
  if (pendingIdx >= 0) return acceptPendingEndorserSwipe(pendingIdx);

  const referral = createDirectEndorserMatch(seeker);
  const demoSeeker = DEMO_SEEKERS.find((item) => item.id === seeker.id);
  const headline =
    demoSeeker?.headline ?? `${seeker.yearsOfExperience}y - ${seeker.skills.join(', ')}`;
  MOCK_INBOX.unshift({
    referral,
    seekerName: seeker.name,
    seekerAvatar: demoSeeker?.photoUrl,
    seekerHeadline: headline,
    matchScore: 85,
  });
  MOCK_REPUTATION.totalReferrals += 1;
  MOCK_REPUTATION.endorsementScore += POINTS_PER_REFERRAL;
  return { referral, mutual: false };
}

export const referralsApi = {
  createRequest: (payload: CreateReferralRequest): Promise<Referral> => {
    if (DEMO.enabled) return Promise.resolve(createDemoRequest(payload));
    if (!payload.companyId) return Promise.reject(new Error('companyId is required'));

    return request<{ data: Referral }>('/api/v1/referrals/', {
      method: 'POST',
      body: JSON.stringify({
        companyId: payload.companyId,
        jobId: payload.jobId,
        targetRole: payload.targetRole,
        source: payload.source ?? 'specific',
        seekerNote: payload.seekerNote,
        requestKind: payload.requestKind,
        sharedFields: payload.sharedFields,
      }),
    }).then((r) => r.data);
  },

  recordSeekerSwipe: (
    endorser: EndorserSwipeInput,
    seekerNote?: string,
  ): Promise<Referral> => {
    if (DEMO.enabled) return Promise.resolve(createDemoSeekerSwipe(endorser, seekerNote));
    return request<{ data: Referral }>('/api/v1/referrals/', {
      method: 'POST',
      body: JSON.stringify({
        referrerId: endorser.id,
        jobId: endorser.opportunityId,
        targetRole: endorser.jobTitle,
        source: 'browse',
        seekerNote,
      }),
    }).then((r) => r.data);
  },

  recordEndorserSwipe: (
    seeker: SeekerSwipeInput,
  ): Promise<EndorserSwipeResult> => {
    if (DEMO.enabled) return Promise.resolve(createDemoEndorserSwipe(seeker));
    return request<{
      data: Referral | null;
      meta?: { mutual?: boolean };
    }>('/api/v1/referrals/', {
      method: 'POST',
      body: JSON.stringify({
        seekerId: seeker.id,
        jobId: seeker.opportunityId,
        targetRole: seeker.targetRole,
      }),
    }).then((response) => ({
      referral: response.data,
      mutual: response.meta?.mutual ?? false,
    }));
  },

  getInbox: (): Promise<ReferrerInboxItem[]> => {
    if (isDemoScreen('inbox')) return Promise.resolve(MOCK_INBOX);
    return request<{ data: ReferrerInboxItem[] }>(
      '/api/v1/referrals/inbox/',
    ).then((r) => r.data);
  },

  getPipeline: (): Promise<SeekerPipelineItem[]> => {
    if (isDemoScreen('pipeline')) return Promise.resolve(MOCK_PIPELINE);
    return request<{ data: SeekerPipelineItem[] }>(
      '/api/v1/referrals/pipeline/',
    ).then((r) => r.data);
  },

  transition: (id: string, newStatus: string, note?: string): Promise<Referral> => {
    if (DEMO.enabled) {
      return Promise.resolve(
        applyDemoTransition(id, newStatus as Referral['status'], note),
      );
    }
    return request<{ data: Referral }>(`/api/v1/referrals/${id}/status/`, {
      method: 'PATCH',
      body: JSON.stringify({ status: newStatus, note }),
    }).then((r) => r.data);
  },

  getReputation: (): Promise<ReputationData> => {
    if (isDemoScreen('earnings')) return Promise.resolve(MOCK_REPUTATION);
    return request<{ data: ReputationData }>('/api/v1/reputation/me/').then(
      (r) => r.data,
    );
  },

  getLeaderboard: (companyId?: string): Promise<LeaderboardEntry[]> => {
    if (isDemoScreen('earnings')) return Promise.resolve(MOCK_LEADERBOARD);
    const qs = companyId ? `?companyId=${companyId}` : '';
    return request<{ data: LeaderboardEntry[] }>(
      `/api/v1/reputation/leaderboard/${qs}`,
    ).then((r) => r.data);
  },
};

export const referralApi = referralsApi;
