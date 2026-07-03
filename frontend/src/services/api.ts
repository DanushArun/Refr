import { getSession, saveSession } from './auth';
import { BASE_URL } from './baseUrl';
import type {
  FeedResponse,
  FeedRequest,
  BehaviorEvent,
  ReferrerInboxItem,
  SeekerPipelineItem,
  Referral,
} from '@refr/shared';
import {
  isDemoScreen,
  DEMO,
  MOCK_FEED_RESPONSE,
  MOCK_PIPELINE,
  MOCK_INBOX,
  MOCK_CHAT_CONVERSATION_ID,
  MOCK_REPUTATION,
  MOCK_LEADERBOARD,
  MOCK_SEEKER_PROFILE,
  MOCK_REFERRER_PROFILE,
  chatForReferral,
  appendChatMessage,
  referrerByCompany,
  referrerById,
  DEMO_SEEKERS,
} from '../config/demo';
import { getCurrentDemoCompanyName } from '../config/demoWorld';

const POINTS_PER_REFERRAL = 2;
const POINTS_PER_HIRE = 10;

/** Monotonic counter to guarantee unique IDs even when multiple items are
 *  created in the same millisecond (rapid sends, auto-reply colliding). */
let _uidCounter = 0;
function uid(prefix: string): string {
  _uidCounter += 1;
  return `${prefix}-${Date.now()}-${_uidCounter}`;
}
import type { FeedCard } from '@refr/shared';

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

export interface CompanySearchItem {
  id: string;
  name: string;
  logoUrl?: string;
  domain?: string;
  employeeCountRange?: string;
}

export interface Opportunity {
  id: string;
  companyId: string;
  companyName: string;
  title: string;
  function: string;
  seniority: string;
  location: string;
  remotePolicy: 'onsite' | 'hybrid' | 'remote';
  available: boolean;
}

export interface ProfileCompletion {
  complete: boolean;
  missingFields: string[];
}

export interface NotificationEvent {
  id: string;
  eventType: string;
  payload: Record<string, unknown>;
  isRead: boolean;
  createdAt: string;
}

export interface CreateReferralRequest {
  companyId?: string | number;
  jobId?: string | number;
  targetRole: string;
  source?: 'specific' | 'browse';
  seekerNote?: string;
  feedCardId?: string;
  card?: FeedCard;
}

// HTTP helpers
async function getAuthHeaders(): Promise<Record<string, string>> {
  const session = await getSession();
  const token = session?.access_token;
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

class ApiError extends Error {
  constructor(
    public readonly status: number,
    message: string,
    public readonly body?: unknown
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

let isRefreshing = false;
let refreshPromise: Promise<boolean> | null = null;

async function refreshToken(): Promise<boolean> {
  const session = await getSession();
  if (!session?.refresh_token) return false;

  try {
    const res = await fetch(`${BASE_URL}/api/token/refresh/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refresh: session.refresh_token }),
    });

    if (!res.ok) {
      await saveSession(null);
      return false;
    }

    const data = await res.json();
    await saveSession({
      ...session,
      access_token: data.access,
      refresh_token: data.refresh ?? session.refresh_token,
    });
    return true;
  } catch {
    await saveSession(null);
    return false;
  }
}

async function request<T>(
  path: string,
  options: RequestInit = {},
): Promise<T> {
  const headers = await getAuthHeaders();

  const response = await fetch(`${BASE_URL}${path}`, {
    ...options,
    headers: { ...headers, ...options.headers },
  });

  if (response.status === 401) {
    if (!isRefreshing) {
      isRefreshing = true;
      refreshPromise = refreshToken().finally(() => {
        isRefreshing = false;
        refreshPromise = null;
      });
    }

    const refreshed = await refreshPromise;
    if (refreshed) {
      const newHeaders = await getAuthHeaders();
      const retry = await fetch(`${BASE_URL}${path}`, {
        ...options,
        headers: { ...newHeaders, ...options.headers },
      });
      if (retry.ok) {
        return retry.json() as Promise<T>;
      }
    }

    throw new ApiError(401, 'Session expired');
  }

  if (!response.ok) {
    let body: unknown;
    try { body = await response.json(); } catch { body = null; }
    throw new ApiError(
      response.status,
      `API ${options.method ?? 'GET'} ${path} -> ${response.status}`,
      body,
    );
  }

  return response.json() as Promise<T>;
}

// Demo helpers
// Demo mode mutates the mock arrays so the demo feels stateful across
// screens (accept in Inbox -> visible in Active Referrals, etc.).

function targetReferrerForCard(card?: FeedCard): { id: string; companyId: string } {
  if (card && card.type === 'company_intel') {
    const r = referrerByCompany(card.companyId);
    if (r) return { id: r.id, companyId: r.company.id };
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
    seekerId: DEMO.demoRole === 'seeker' ? '1' : '1',
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
  const p = MOCK_PIPELINE.find((i) => i.referral.id === id);
  if (p) return p.referral;
  const inbox = MOCK_INBOX.find((i) => i.referral.id === id);
  if (inbox) return inbox.referral;
  return undefined;
}

/** Apply a status transition to the in-memory demo stores (mutates).
 *  Also keeps MOCK_REPUTATION in sync so the Earnings dashboard reads true. */
function applyDemoTransition(
  id: string,
  newStatus: Referral['status'],
  note?: string,
): Referral {
  const now = new Date().toISOString();
  const existing = findReferralInStores(id);
  const base: Referral = existing ?? buildMockReferral('Unknown');

  const updated: Referral = {
    ...base,
    id,
    status: newStatus,
    referrerNote: note ?? base.referrerNote,
    acceptedAt: newStatus === 'accepted' && !base.acceptedAt ? now : base.acceptedAt,
    submittedAt: newStatus === 'submitted' && !base.submittedAt ? now : base.submittedAt,
    outcomeAt:
      (newStatus === 'hired' || newStatus === 'rejected')
        ? now
        : base.outcomeAt,
  };

  const pIdx = MOCK_PIPELINE.findIndex((i) => i.referral.id === id);
  if (pIdx >= 0) MOCK_PIPELINE[pIdx] = { ...MOCK_PIPELINE[pIdx], referral: updated };
  const iIdx = MOCK_INBOX.findIndex((i) => i.referral.id === id);
  if (iIdx >= 0) MOCK_INBOX[iIdx] = { ...MOCK_INBOX[iIdx], referral: updated };

  // Reputation side-effects — only fire on FIRST transition into the state,
  // so repeated taps don't inflate the score. Mutates MOCK_REPUTATION in place.
  const wasHired = base.status === 'hired';
  const isHired = newStatus === 'hired';
  if (isHired && !wasHired) {
    MOCK_REPUTATION.successfulHires += 1;
    MOCK_REPUTATION.endorsementScore += POINTS_PER_HIRE;
  }
  if (!isHired && wasHired) {
    // Reversal (e.g. undo or manual fix) — decrement
    MOCK_REPUTATION.successfulHires = Math.max(
      0,
      MOCK_REPUTATION.successfulHires - 1,
    );
    MOCK_REPUTATION.endorsementScore = Math.max(
      0,
      MOCK_REPUTATION.endorsementScore - POINTS_PER_HIRE,
    );
  }

  return updated;
}

function buildMockChatMessage(body: string): ChatMessage {
  const sender = DEMO.demoRole === 'seeker'
    ? { id: '1', displayName: 'Danush Arun' }
    : { id: '2', displayName: 'Nivrant Goswami' };
  return {
    id: uid('msg-demo'),
    body,
    createdAt: new Date().toISOString(),
    sender,
  };
}

function pollForMessages(
  referralId: string,
  onMessage: (msg: ChatMessage) => void,
) {
  let lastMessageId: string | null = null;

  const poll = async () => {
    try {
      const data = await chatApi.getConversation(referralId);
      const messages = data.messages;
      if (messages.length === 0) return;
      const latest = messages[messages.length - 1];
      if (!lastMessageId || latest.id === lastMessageId) {
        lastMessageId = latest.id;
        return;
      }
      const newIdx = messages.findIndex(
        (m) => m.id === lastMessageId,
      );
      const fresh = newIdx >= 0
        ? messages.slice(newIdx + 1)
        : [latest];
      fresh.forEach((m) => onMessage(m));
      lastMessageId = latest.id;
    } catch {
      // Silently skip poll failures
    }
  };

  const interval = setInterval(poll, 3000);
  poll();

  return { unsubscribe: () => clearInterval(interval) };
}

// Feed
export const feedApi = {
  getFeed: (params: FeedRequest = {}): Promise<FeedResponse> => {
    if (isDemoScreen('feed')) {
      return Promise.resolve(MOCK_FEED_RESPONSE);
    }
    const query = new URLSearchParams();
    if (params.cursor) query.set('cursor', params.cursor);
    if (params.limit) query.set('limit', String(params.limit));
    const qs = query.toString() ? `?${query.toString()}` : '';
    return request<{
      data: FeedResponse['cards'];
      meta: { cursor: string; hasMore: boolean };
    }>(`/api/v1/feed${qs}`).then((r) => ({
      cards: r.data,
      cursor: r.meta.cursor,
      hasMore: r.meta.hasMore,
    }));
  },

  trackBehavior: (events: BehaviorEvent[]): Promise<void> => {
    if (isDemoScreen('feed')) return Promise.resolve();
    return request<void>('/api/v1/feed/events/batch', {
      method: 'POST',
      body: JSON.stringify({ events }),
    });
  },
};

// Referrals

/** Information about the endorser the seeker is swiping on. */
export interface EndorserSwipeInput {
  id: string;
  name: string;
  companyId: string;
  companyName: string;
  jobTitle: string;
}

/** Information about the seeker the endorser is swiping on. */
export interface SeekerSwipeInput {
  id: string;
  name: string;
  headline: string;           // one-liner from career story
  yearsOfExperience: number;
  skills: string[];
  targetRole: string;
}

export const referralsApi = {
  createRequest: (payload: CreateReferralRequest): Promise<Referral> => {
    if (DEMO.enabled) {
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
      return Promise.resolve(referral);
    }
    if (!payload.companyId) {
      return Promise.reject(new Error('companyId is required'));
    }
    return request<{ data: Referral }>('/api/v1/referrals/', {
      method: 'POST',
      body: JSON.stringify({
        companyId: payload.companyId,
        jobId: payload.jobId,
        targetRole: payload.targetRole,
        source: payload.source ?? 'specific',
        seekerNote: payload.seekerNote,
      }),
    }).then((r) => r.data);
  },

  /**
   * Seeker viewer swiped right on an endorser's card.
   * Creates a pending referral (status='requested') and pushes to MOCK_PIPELINE.
   * The seeker sees this in Activity; in a real system, the endorser would
   * see this in their incoming queue. Demo simplification.
   */
  recordSeekerSwipe: (endorser: EndorserSwipeInput, seekerNote?: string): Promise<Referral> => {
    if (DEMO.enabled) {
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
        seekerNote,
      };
      MOCK_PIPELINE.unshift({
        referral,
        referrerName: endorser.name,
        companyName: endorser.companyName,
      });
      return Promise.resolve(referral);
    }
    return request<{ data: Referral }>('/api/v1/referrals/', {
      method: 'POST',
      body: JSON.stringify({
        companyId: endorser.companyId,
        targetRole: endorser.jobTitle,
        source: 'browse',
        seekerNote,
      }),
    }).then((r) => r.data);
  },

  /**
   * Endorser viewer swiped right on a seeker's card.
   * If the seeker had a pending 'requested' entry in MOCK_INBOX — MUTUAL MATCH,
   * promote to 'accepted'. Otherwise create a fresh 'accepted' entry.
   * Either way, Active sees it and the chat opens.
   */
  recordEndorserSwipe: (
    seeker: SeekerSwipeInput,
  ): Promise<{ referral: Referral; mutual: boolean }> => {
    if (DEMO.enabled) {
      const endorser = referrerById('2');
      const now = new Date().toISOString();

      // Check for mutual match
      const pendingIdx = MOCK_INBOX.findIndex(
        (i) => i.referral.seekerId === seeker.id && i.referral.status === 'requested',
      );
      if (pendingIdx >= 0) {
        const existing = MOCK_INBOX[pendingIdx];
        const updated: Referral = {
          ...existing.referral,
          status: 'accepted',
          acceptedAt: now,
        };
        MOCK_INBOX[pendingIdx] = { ...existing, referral: updated };
        // Reputation side-effect: mutual match also counts as a new endorsement
        MOCK_REPUTATION.totalReferrals += 1;
        MOCK_REPUTATION.endorsementScore += POINTS_PER_REFERRAL;
        return Promise.resolve({ referral: updated, mutual: true });
      }

      // New direct match
      const referral: Referral = {
        id: uid('ref-endorser'),
        seekerId: seeker.id,
        referrerId: '2',
        companyId: endorser?.company.id ?? 'c-1',
        targetRole: seeker.targetRole,
        status: 'accepted',
        matchScore: 85,
        requestedAt: now,
        acceptedAt: now,
      };
      const demoSeeker = DEMO_SEEKERS.find((item) => item.id === seeker.id);
      const headline = demoSeeker?.headline
        ?? `${seeker.yearsOfExperience}y · ${seeker.skills.slice(0, 2).join(', ')}`;
      MOCK_INBOX.unshift({
        referral,
        seekerName: seeker.name,
        seekerAvatar: demoSeeker?.photoUrl,
        seekerHeadline: headline,
        matchScore: 85,
      });
      // Reputation side-effect: a new endorsement bumps totalReferrals + score
      MOCK_REPUTATION.totalReferrals += 1;
      MOCK_REPUTATION.endorsementScore += POINTS_PER_REFERRAL;
      return Promise.resolve({ referral, mutual: false });
    }
    return request<{ data: Referral }>('/api/v1/referrals/', {
      method: 'POST',
      body: JSON.stringify({
        seekerId: seeker.id,
        targetRole: seeker.targetRole,
      }),
    }).then((r) => ({ referral: r.data, mutual: false }));
  },

  getInbox: (): Promise<ReferrerInboxItem[]> => {
    if (isDemoScreen('inbox')) {
      return Promise.resolve(MOCK_INBOX);
    }
    return request<{ data: ReferrerInboxItem[] }>(
      '/api/v1/referrals/inbox/',
    ).then((r) => r.data);
  },

  getPipeline: (): Promise<SeekerPipelineItem[]> => {
    if (isDemoScreen('pipeline')) {
      return Promise.resolve(MOCK_PIPELINE);
    }
    return request<{ data: SeekerPipelineItem[] }>(
      '/api/v1/referrals/pipeline/',
    ).then((r) => r.data);
  },

  transition: (
    id: string,
    newStatus: string,
    note?: string,
  ): Promise<Referral> => {
    if (DEMO.enabled) {
      return Promise.resolve(
        applyDemoTransition(id, newStatus as Referral['status'], note),
      );
    }
    return request<{ data: Referral }>(
      `/api/v1/referrals/${id}/status/`,
      {
        method: 'PATCH',
        body: JSON.stringify({ status: newStatus, note }),
      },
    ).then((r) => r.data);
  },

  getReputation: (): Promise<ReputationData> => {
    if (isDemoScreen('earnings')) {
      return Promise.resolve(MOCK_REPUTATION);
    }
    return request<{ data: ReputationData }>(
      '/api/v1/reputation/me/',
    ).then((r) => r.data);
  },

  getLeaderboard: (
    companyId?: string,
  ): Promise<LeaderboardEntry[]> => {
    if (isDemoScreen('earnings')) {
      return Promise.resolve(MOCK_LEADERBOARD);
    }
    const qs = companyId ? `?companyId=${companyId}` : '';
    return request<{ data: LeaderboardEntry[] }>(
      `/api/v1/reputation/leaderboard/${qs}`,
    ).then((r) => r.data);
  },
};

export const referralApi = referralsApi;

export const companiesApi = {
  search: (query: string): Promise<CompanySearchItem[]> => {
    const qs = new URLSearchParams();
    if (query) qs.set('q', query);
    const suffix = qs.toString() ? `?${qs.toString()}` : '';
    return request<{ data: CompanySearchItem[] }>(
      `/api/v1/companies/search/${suffix}`,
    ).then((r) => r.data);
  },
};

export const opportunitiesApi = {
  list: (params: { companyId?: string; q?: string } = {}): Promise<Opportunity[]> => {
    const qs = new URLSearchParams();
    if (params.companyId) qs.set('companyId', params.companyId);
    if (params.q) qs.set('q', params.q);
    const suffix = qs.toString() ? `?${qs.toString()}` : '';
    return request<{ data: Opportunity[] }>(
      `/api/v1/opportunities/${suffix}`,
    ).then((r) => r.data);
  },

  browse: (params: {
    function?: string;
    seniority?: string;
    location?: string;
    remote?: boolean;
  } = {}): Promise<Opportunity[]> => {
    const qs = new URLSearchParams();
    if (params.function) qs.set('function', params.function);
    if (params.seniority) qs.set('seniority', params.seniority);
    if (params.location) qs.set('location', params.location);
    if (params.remote) qs.set('remote', 'true');
    const suffix = qs.toString() ? `?${qs.toString()}` : '';
    return request<{ data: Opportunity[] }>(
      `/api/v1/opportunities/browse/${suffix}`,
    ).then((r) => r.data);
  },
};

// Chat
export interface ChatMessage {
  id: string;
  body: string;
  createdAt: string;
  sender: { id: string; displayName: string; avatarUrl?: string };
}

export const chatApi = {
  getConversation: (
    referralId: string,
  ): Promise<{ id: string; messages: ChatMessage[] }> => {
    if (isDemoScreen('chat')) {
      return Promise.resolve({
        id: `conv-${referralId}`,
        messages: chatForReferral(referralId),
      });
    }
    return request<{
      data: { id: string; messages: ChatMessage[] };
    }>(`/api/v1/chat/${referralId}/`).then((r) => r.data);
  },

  sendMessage: (
    conversationId: string,
    body: string,
  ): Promise<ChatMessage> => {
    if (isDemoScreen('chat')) {
      const msg = buildMockChatMessage(body);
      // conversationId shape is `conv-<referralId>` in demo mode.
      const referralId = conversationId.startsWith('conv-')
        ? conversationId.slice(5)
        : conversationId;
      appendChatMessage(referralId, msg);
      return Promise.resolve(msg);
    }
    return request<{ data: ChatMessage }>(
      `/api/v1/chat/${conversationId}/messages/`,
      { method: 'POST', body: JSON.stringify({ body }) },
    ).then((r) => r.data);
  },

  subscribeToMessages: (
    referralId: string,
    _onMessage: (msg: ChatMessage) => void,
  ) => {
    if (isDemoScreen('chat')) {
      return { unsubscribe: () => {} };
    }
    return pollForMessages(referralId, _onMessage);
  },
};

// Profile
export const profileApi = {
  getMe: (): Promise<unknown> => {
    if (isDemoScreen('profile')) {
      const profile = DEMO.demoRole === 'seeker'
        ? MOCK_SEEKER_PROFILE
        : MOCK_REFERRER_PROFILE;
      return Promise.resolve(profile);
    }
    return request<{ data: unknown }>(
      '/api/v1/users/me/',
    ).then((r) => r.data);
  },
  updateMe: (data: unknown): Promise<unknown> => {
    if (isDemoScreen('profile')) {
      return Promise.resolve(data);
    }
    return request<{ data: unknown }>('/api/v1/users/me/', {
      method: 'PATCH',
      body: JSON.stringify(data),
    }).then((r) => r.data);
  },
  getCompletion: (): Promise<ProfileCompletion> => {
    return request<{ data: ProfileCompletion }>(
      '/api/v1/profile/completion/',
    ).then((r) => r.data);
  },
};

export const notificationsApi = {
  list: (): Promise<NotificationEvent[]> => {
    return request<{ data: NotificationEvent[] }>(
      '/api/v1/notifications/',
    ).then((r) => r.data);
  },
  markRead: (id: string): Promise<NotificationEvent> => {
    return request<{ data: NotificationEvent }>(
      `/api/v1/notifications/${id}/read/`,
      { method: 'PATCH', body: JSON.stringify({}) },
    ).then((r) => r.data);
  },
};

export { ApiError };
