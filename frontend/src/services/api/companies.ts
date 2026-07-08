import { request } from './http';

export interface CompanySearchItem {
  id: string;
  name: string;
  logoUrl?: string;
  domain?: string;
  employeeCountRange?: string;
}

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
