import type { ReferrerInboxItem } from '@refr/shared';

export interface EndorserCandidatePresentation {
  id: string;
  name: string;
  role: string;
  company: string;
  stage: string;
  score: string;
}

function titleCase(value: string): string {
  return value.replace(/(^|_)([a-z])/g, (_, prefix: string, letter: string) => {
    return `${prefix ? ' ' : ''}${letter.toUpperCase()}`;
  });
}

export function presentEndorserCandidate(
  item: ReferrerInboxItem,
): EndorserCandidatePresentation {
  return {
    id: item.referral.id,
    name: item.seekerName,
    role: item.referral.targetRole,
    company: item.companyName,
    stage: titleCase(item.referral.status),
    score: `${item.matchScore}% fit`,
  };
}
