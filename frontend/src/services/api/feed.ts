import type {
  BehaviorEvent,
  FeedRequest,
  FeedResponse,
} from '@refr/shared';
import { isDemoScreen, MOCK_FEED_RESPONSE } from '../../demo/config';
import { request } from './http';

export const feedApi = {
  getFeed: (params: FeedRequest = {}): Promise<FeedResponse> => {
    if (isDemoScreen('feed')) return Promise.resolve(MOCK_FEED_RESPONSE);

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
