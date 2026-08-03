import type { SeekerRecommendation } from '../../services/api/recommendations';

export interface EndorserCandidatePresentation {
  id: string;
  name: string;
  headline: string;
  meta: string;
  target: string;
  score: number;
  fitLabel: string;
  opportunityId: string;
  reasons: string[];
  yearsOfExperience: number;
  skills: string[];
  targetRole: string;
}

const reasonLabels: Record<string, string> = {
  eligible: 'Profile meets the role requirements',
  market_liquidity: 'Opportunity is actively hiring',
  pool_widened_1: 'Matched through an expanded trusted network',
  pool_widened_2: 'Matched through a broader trusted network',
};

function candidateMeta(recommendation: SeekerRecommendation): string {
  const skills = recommendation.skills.slice(0, 2);
  const detail = skills.length ? skills.join(' · ') : 'Verified candidate';
  return `${recommendation.yearsOfExperience} years · ${detail}`;
}

function fitLabel(score: number): string {
  if (score >= 80) return 'Great fit';
  if (score >= 60) return 'Strong fit';
  return 'Potential fit';
}

function readableReasons(codes: string[]): string[] {
  const reasons = codes.map((code) => reasonLabels[code]).filter(Boolean);
  return reasons.length ? reasons : ['Profile and opportunity context are available to review'];
}

export function presentEndorserCandidate(
  recommendation: SeekerRecommendation,
): EndorserCandidatePresentation {
  const targetRole = recommendation.targetRoles[0] ?? recommendation.opportunityTitle;
  return {
    id: recommendation.userId,
    name: recommendation.displayName,
    headline: recommendation.headline ?? targetRole,
    meta: candidateMeta(recommendation),
    target: `Looking for: ${targetRole}`,
    score: Math.round(recommendation.matchScore),
    fitLabel: fitLabel(recommendation.matchScore),
    opportunityId: recommendation.opportunityId,
    reasons: readableReasons(recommendation.reasonCodes),
    yearsOfExperience: recommendation.yearsOfExperience,
    skills: recommendation.skills,
    targetRole,
  };
}
