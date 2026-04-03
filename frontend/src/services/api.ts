import Constants from 'expo-constants';
import { getSession } from './auth';
import type { FeedResponse, FeedRequest, BehaviorEvent } from '@refr/shared';

const BASE_URL: string =
  Constants.expoConfig?.extra?.apiBaseUrl ?? 'http://127.0.0.1:8000';

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

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const headers = await getAuthHeaders();

  const response = await fetch(`${BASE_URL}${path}`, {
    ...options,
    headers: { ...headers, ...options.headers },
  });

  if (!response.ok) {
    let body: unknown;
    try { body = await response.json(); } catch { body = null; }
    throw new ApiError(response.status, `API ${options.method ?? 'GET'} ${path} → ${response.status}`, body);
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
    return request<{ data: FeedResponse['cards']; meta: { cursor: string; hasMore: boolean } }>(`/api/v1/feed${qs}`)
      .then((r: any) => ({ cards: r.data, cursor: r.meta.cursor, hasMore: r.meta.hasMore }));
  },

  trackBehavior: (events: BehaviorEvent[]): Promise<void> =>
    request<void>('/api/v1/feed/events/batch', { method: 'POST', body: JSON.stringify({ events }) }),
};

// ─── Referrals ──────────────────────────────────────────────────────────────

export const referralsApi = {
  createRequest: (payload: { feedCardId?: string; targetRole: string; seekerNote?: string }) =>
    request<any>('/api/v1/referrals/', { method: 'POST', body: JSON.stringify(payload) })
      .then((r: any) => r.data),

  getInbox: () =>
    request<any>('/api/v1/referrals/inbox/').then((r: any) => r.data),

  getPipeline: () =>
    request<any>('/api/v1/referrals/pipeline/').then((r: any) => r.data),

  transition: (id: string, status: string, note?: string) =>
    request<any>(`/api/v1/referrals/${id}/status/`, {
      method: 'PATCH',
      body: JSON.stringify({ status, note }),
    }).then((r: any) => r.data),

  getReputation: () =>
    request<any>('/api/v1/reputation/me/').then((r: any) => r.data),

  getLeaderboard: (companyId?: string) => {
    const qs = companyId ? `?companyId=${companyId}` : '';
    return request<any>(`/api/v1/reputation/leaderboard/${qs}`).then((r: any) => r.data);
  },
};

// Legacy alias
export const referralApi = referralsApi;

// ─── Chat ───────────────────────────────────────────────────────────────────

export const chatApi = {
  getConversation: (referralId: string) =>
    request<any>(`/api/v1/chat/${referralId}/`).then((r: any) => r.data),

  sendMessage: (conversationId: string, body: string) =>
    request<any>(`/api/v1/chat/${conversationId}/messages/`, {
      method: 'POST',
      body: JSON.stringify({ body }),
    }).then((r: any) => r.data),

  subscribeToMessages: (conversationId: string, onMessage: (msg: any) => void) => {
    // Dummy polling implementation as fallback for local dev
    const interval = setInterval(async () => {
      // Fetch latest and compare... 
      // In a real Django setup without websockets, we poll. 
    }, 5000);
    return { unsubscribe: () => clearInterval(interval) };
  }
};

// ─── Profile ────────────────────────────────────────────────────────────────

export const profileApi = {
  getMe: () => request<any>('/api/v1/users/me/').then((r: any) => r.data),
  updateMe: (data: unknown) =>
    request<any>('/api/v1/users/me/', { method: 'PATCH', body: JSON.stringify(data) })
      .then((r: any) => r.data),
};

export { ApiError };
