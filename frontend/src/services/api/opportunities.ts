import { request } from './http';

export type EmploymentType = 'full_time' | 'contract' | 'internship';
export type OpportunitySource = 'manual' | 'company_intel' | 'import' | 'admin';

export interface Opportunity {
  id: string;
  companyId: string;
  companyName: string;
  companyLogo: string | null;
  title: string;
  department: string;
  employmentType: EmploymentType;
  function: string;
  seniority: string;
  location: string;
  remotePolicy: 'onsite' | 'hybrid' | 'remote';
  requiredSkills: string[];
  preferredSkills: string[];
  minYearsExperience: number;
  maxYearsExperience: number | null;
  source: OpportunitySource;
  postedAt: string | null;
  expiresAt: string | null;
  available: boolean;
}

export const opportunitiesApi = {
  get: (id: string): Promise<Opportunity> => {
    const safeId = encodeURIComponent(id);
    return request<{ data: Opportunity }>(
      `/api/v1/opportunities/${safeId}/`,
    ).then((response) => response.data);
  },

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
