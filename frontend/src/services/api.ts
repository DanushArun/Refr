import Constants from 'expo-constants';
import { supabase } from './supabase';
import type { FeedResponse, FeedRequest, BehaviorEvent } from '@refr/shared';

const BASE_URL: string =
  Constants.expoConfig?.extra?.apiBaseUrl ?? 'http://localhost:3000';

// ─── HTTP helpers ───────────────────────────────────────────────────────────

async function getAuthHeaders(): Promise<Record<string, string>> {
  const { data } = await supabase.auth.getSession();
  const token = data.session?.access_token;
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

async function request<T>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const headers = await getAuthHeaders();

  const response = await fetch(`${BASE_URL}${path}`, {
    ...options,
    headers: {
      ...headers,
      ...options.headers,
    },
  });

  if (!response.ok) {
    let body: unknown;
    try {
      body = await response.json();
    } catch {
      body = null;
    }
    throw new ApiError(
      response.status,
      `API ${options.method ?? 'GET'} ${path} failed with ${response.status}`,
      body
    );
  }

  return response.json() as Promise<T>;
}

// ─── Feed ───────────────────────────────────────────────────────────────────

export const feedApi = {
  /**
   * Fetch the next page of feed cards.
   * Uses keyset pagination — pass cursor from previous response.
   */
  getFeed: (params: FeedRequest = {}): Promise<FeedResponse> => {
    const query = new URLSearchParams();
    if (params.cursor) query.set('cursor', params.cursor);
    if (params.limit) query.set('limit', String(params.limit));
    const qs = query.toString() ? `?${query.toString()}` : '';
    return request<FeedResponse>(`/feed${qs}`);
  },

  /**
   * Post a batch of behavior events for feed ranking signals.
   * Fire-and-forget from the client — do not await in hot paths.
   */
  trackBehavior: (events: BehaviorEvent[]): Promise<void> =>
    request<void>('/feed/behavior', {
      method: 'POST',
      body: JSON.stringify({ events }),
    }),
};

// ─── Referrals ──────────────────────────────────────────────────────────────

export const referralApi = {
  /** Seeker requests a referral from a feed card */
  requestReferral: (payload: {
    feedCardId: string;
    seekerNote?: string;
    targetRole: string;
  }) =>
    request<{ referralId: string }>('/referrals', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),

  /** Referrer accepts an incoming request */
  acceptReferral: (referralId: string) =>
    request<void>(`/referrals/${referralId}/accept`, { method: 'POST' }),

  /** Referrer marks the referral as submitted to their company ATS */
  markSubmitted: (referralId: string, referrerNote?: string) =>
    request<void>(`/referrals/${referralId}/submit`, {
      method: 'POST',
      body: JSON.stringify({ referrerNote }),
    }),

  /** Get all referrals for the current user (role-aware endpoint) */
  getMyReferrals: () => request<unknown[]>('/referrals/me'),
};

// ─── Profile ────────────────────────────────────────────────────────────────

export const profileApi = {
  getMe: () => request<unknown>('/users/me'),
  updateMe: (data: unknown) =>
    request<unknown>('/users/me', {
      method: 'PATCH',
      body: JSON.stringify(data),
    }),
};

export { ApiError };
