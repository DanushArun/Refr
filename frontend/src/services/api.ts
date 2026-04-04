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

export interface ReputationData {
  kingmakerScore: number;
  totalReferrals: number;
  successfulHires: number;
  department: string;
  jobTitle: string;
  verificationStatus: string;
  user: { id: string; displayName: string };
  company: { id: string; name: string };
}

export interface LeaderboardEntry {
  kingmakerScore: number;
  totalReferrals: number;
  successfulHires: number;
  user: { id: string; displayName: string };
  company: { id: string; name: string };
}

// ─── HTTP helpers ───────────────────────────────────────────────────────────

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

// ─── Feed ───────────────────────────────────────────────────────────────────

export const feedApi = {
  getFeed: (params: FeedRequest = {}): Promise<FeedResponse> => {
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

  trackBehavior: (events: BehaviorEvent[]): Promise<void> =>
    request<void>('/api/v1/feed/events/batch', {
      method: 'POST',
      body: JSON.stringify({ events }),
    }),
};

// ─── Referrals ──────────────────────────────────────────────────────────────

export const referralsApi = {
  createRequest: (payload: {
    feedCardId?: string;
    targetRole: string;
    seekerNote?: string;
  }) =>
    request<{ data: Referral }>('/api/v1/referrals/', {
      method: 'POST',
      body: JSON.stringify(payload),
    }).then((r) => r.data),

  getInbox: () =>
    request<{ data: ReferrerInboxItem[] }>('/api/v1/referrals/inbox/').then(
      (r) => r.data,
    ),

  getPipeline: () =>
    request<{ data: SeekerPipelineItem[] }>(
      '/api/v1/referrals/pipeline/',
    ).then((r) => r.data),

  transition: (id: string, newStatus: string, note?: string) =>
    request<{ data: Referral }>(`/api/v1/referrals/${id}/status/`, {
      method: 'PATCH',
      body: JSON.stringify({ status: newStatus, note }),
    }).then((r) => r.data),

  getReputation: () =>
    request<{ data: ReputationData }>('/api/v1/reputation/me/').then(
      (r) => r.data,
    ),

  getLeaderboard: (companyId?: string) => {
    const qs = companyId ? `?companyId=${companyId}` : '';
    return request<{ data: LeaderboardEntry[] }>(
      `/api/v1/reputation/leaderboard/${qs}`,
    ).then((r) => r.data);
  },
};

export const referralApi = referralsApi;

// ─── Chat ───────────────────────────────────────────────────────────────────

export interface ChatMessage {
  id: string;
  body: string;
  createdAt: string;
  sender: { id: string; displayName: string; avatarUrl?: string };
}

export const chatApi = {
  getConversation: (referralId: string) =>
    request<{ data: { id: string; messages: ChatMessage[] } }>(
      `/api/v1/chat/${referralId}/`,
    ).then((r) => r.data),

  sendMessage: (conversationId: string, body: string) =>
    request<{ data: ChatMessage }>(`/api/v1/chat/${conversationId}/messages/`, {
      method: 'POST',
      body: JSON.stringify({ body }),
    }).then((r) => r.data),

  subscribeToMessages: (
    referralId: string,
    onMessage: (msg: ChatMessage) => void,
  ) => {
    let lastMessageId: string | null = null;

    const poll = async () => {
      try {
        const data = await chatApi.getConversation(referralId);
        const messages = data.messages;
        if (messages.length > 0) {
          const latest = messages[messages.length - 1];
          if (lastMessageId && latest.id !== lastMessageId) {
            const newIdx = messages.findIndex(
              (m) => m.id === lastMessageId,
            );
            const newMessages =
              newIdx >= 0 ? messages.slice(newIdx + 1) : [latest];
            newMessages.forEach((m) => onMessage(m));
          }
          lastMessageId = latest.id;
        }
      } catch {
        // Silently skip poll failures
      }
    };

    const interval = setInterval(poll, 3000);
    poll();

    return { unsubscribe: () => clearInterval(interval) };
  },
};

// ─── Profile ────────────────────────────────────────────────────────────────

export const profileApi = {
  getMe: () =>
    request<{ data: unknown }>('/api/v1/users/me/').then((r) => r.data),
  updateMe: (data: unknown) =>
    request<{ data: unknown }>('/api/v1/users/me/', {
      method: 'PATCH',
      body: JSON.stringify(data),
    }).then((r) => r.data),
};

export { ApiError };
