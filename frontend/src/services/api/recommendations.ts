import { request } from './http';

export interface RecommendationParams {
  limit?: number;
  roleFamily?: string;
}

export interface ReferrerRecommendationParams extends RecommendationParams {
  companyId?: string | number;
}

export interface SeekerRecommendationParams extends RecommendationParams {
  experienceLevel?: string;
}

export interface ReferrerRecommendation {
  id: string;
  userId: string;
  displayName: string;
  avatarUrl?: string | null;
  companyId: string;
  companyName: string;
  department?: string | null;
  jobTitle?: string | null;
  endorsementScore: number;
  endorsementTier: string;
  opportunityId: string;
  opportunityTitle: string;
  roleFamily: string;
  roleLevel: string;
  matchScore: number;
  reasonCodes: string[];
  poolKey: string;
  wideningLevel: number;
}

export interface SeekerRecommendation {
  id: string;
  userId: string;
  displayName: string;
  avatarUrl?: string | null;
  headline?: string | null;
  skills: string[];
  yearsOfExperience: number;
  targetRoles: string[];
  targetCompanies: string[];
  endorsementScore: number;
  endorsementTier: string;
  opportunityId: string;
  opportunityTitle: string;
  matchScore: number;
  reasonCodes: string[];
  poolKey: string;
  wideningLevel: number;
}

type QueryValue = number | string | undefined;

function recommendationQuery(
  params: ReferrerRecommendationParams | SeekerRecommendationParams,
): string {
  const query = new URLSearchParams();
  const entries = Object.entries(params) as [string, QueryValue][];
  for (const [key, value] of entries) {
    if (value === undefined || value === '') continue;
    query.set(key, String(value));
  }
  const suffix = query.toString();
  return suffix ? `?${suffix}` : '';
}

export const recommendationsApi = {
  getReferrers: (
    params: ReferrerRecommendationParams = {},
  ): Promise<ReferrerRecommendation[]> => {
    const qs = recommendationQuery(params);
    return request<{ data: ReferrerRecommendation[] }>(
      `/api/v1/recommendations/referrers/${qs}`,
    ).then((r) => r.data);
  },

  getSeekers: (
    params: SeekerRecommendationParams = {},
  ): Promise<SeekerRecommendation[]> => {
    const qs = recommendationQuery(params);
    return request<{ data: SeekerRecommendation[] }>(
      `/api/v1/recommendations/seekers/${qs}`,
    ).then((r) => r.data);
  },
};
