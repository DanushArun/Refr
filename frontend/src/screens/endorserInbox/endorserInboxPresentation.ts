import type { ReferrerInboxItem } from '@refr/shared';

export interface EndorserInboxPresentation {
  id: string;
  seekerId: string;
  name: string;
  headline: string;
  status: string;
  fit: string;
  preview: string;
}

function titleCase(value: string): string {
  return value.replace(/(^|_)([a-z])/g, (_, prefix: string, letter: string) => {
    return `${prefix ? ' ' : ''}${letter.toUpperCase()}`;
  });
}

export function presentEndorserInboxItem(
  item: ReferrerInboxItem,
): EndorserInboxPresentation {
  return {
    id: item.referral.id,
    seekerId: item.referral.seekerId,
    name: item.seekerName,
    headline: item.seekerHeadline,
    status: titleCase(item.referral.status),
    fit: `${item.matchScore}% fit`,
    preview: item.referral.seekerNote ?? 'Connection update available.',
  };
}
