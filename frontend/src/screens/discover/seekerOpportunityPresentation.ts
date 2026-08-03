import type { ReferrerRecommendation } from '../../services/api/recommendations';

export interface SeekerOpportunityPresentation {
  id: string;
  referrerId: string;
  companyId: string;
  title: string;
  company: string;
  connection: string;
  score: number;
  fitLabel: string;
  reasons: string[];
  endorserJobTitle: string;
}

const reasonLabels: Record<string, string> = {
  eligible: 'Your profile meets the role requirements',
  market_liquidity: 'The company is actively hiring',
  pool_widened_1: 'Matched through an expanded trusted network',
  pool_widened_2: 'Matched through a broader trusted network',
};

function fitLabel(score: number): string {
  if (score >= 80) return 'Great fit';
  if (score >= 60) return 'Strong fit';
  return 'Potential fit';
}

function readableReasons(codes: string[]): string[] {
  const reasons = codes.map((code) => reasonLabels[code]).filter(Boolean);
  return reasons.length ? reasons : ['A trusted employee connection is available to review'];
}

export function presentSeekerOpportunity(
  recommendation: ReferrerRecommendation,
): SeekerOpportunityPresentation {
  const jobTitle = recommendation.jobTitle ?? 'Verified employee';
  return {
    id: recommendation.opportunityId,
    referrerId: recommendation.userId,
    companyId: recommendation.companyId,
    title: recommendation.opportunityTitle,
    company: recommendation.companyName,
    connection: `${recommendation.displayName} · ${jobTitle}`,
    score: Math.round(recommendation.matchScore),
    fitLabel: fitLabel(recommendation.matchScore),
    reasons: readableReasons(recommendation.reasonCodes),
    endorserJobTitle: jobTitle,
  };
}
