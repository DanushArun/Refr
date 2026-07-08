import {
  DEMO,
  MOCK_REFERRER_PROFILE,
  MOCK_SEEKER_PROFILE,
  isDemoScreen,
} from '../../demo/config';
import { request } from './http';

export interface ProfileCompletion {
  complete: boolean;
  missingFields: string[];
}

export const profileApi = {
  getMe: (): Promise<unknown> => {
    if (isDemoScreen('profile')) {
      const profile = DEMO.demoRole === 'seeker'
        ? MOCK_SEEKER_PROFILE
        : MOCK_REFERRER_PROFILE;
      return Promise.resolve(profile);
    }
    return request<{ data: unknown }>('/api/v1/users/me/').then((r) => r.data);
  },

  updateMe: (data: unknown): Promise<unknown> => {
    if (isDemoScreen('profile')) return Promise.resolve(data);
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
