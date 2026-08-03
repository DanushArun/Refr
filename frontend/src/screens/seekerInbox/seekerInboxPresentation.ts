import type { SeekerPipelineItem } from '@refr/shared';

export interface SeekerInboxPresentation {
  id: string;
  name: string;
  company: string;
  role: string;
  status: string;
  preview: string;
}

function titleCase(value: string): string {
  return value.replace(/(^|_)([a-z])/g, (_, prefix: string, letter: string) => {
    return `${prefix ? ' ' : ''}${letter.toUpperCase()}`;
  });
}

export function presentSeekerInboxItem(item: SeekerPipelineItem): SeekerInboxPresentation {
  return {
    id: item.referral.id,
    name: item.referrerName ?? item.referral.referrerName ?? 'Your Endorser',
    company: item.companyName,
    role: item.referral.targetRole,
    status: titleCase(item.referral.status),
    preview: item.referral.seekerNote ?? 'Referral update available.',
  };
}
