import { request } from './http';

export interface NotificationEvent {
  id: string;
  eventType: string;
  payload: Record<string, unknown>;
  isRead: boolean;
  createdAt: string;
}

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
