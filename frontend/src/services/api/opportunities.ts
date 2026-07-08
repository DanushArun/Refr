import { request } from './http';

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
