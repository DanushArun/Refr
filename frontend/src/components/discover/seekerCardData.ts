import { DEMO_SEEKERS, referrerById, type DemoSeeker } from '../../config/demo';

export interface SeekerCard {
  id: string;
  name: string;
  headline: string;          // emotional one-liner
  story: string;             // truncated body copy
  skills: string[];          // top 3
  yearsOfExperience: number;
  targetRole: string;         // first from targetRoles
  targetCompanies: string[];  // shown as chips
  matchPercent: number;       // 0-100 against viewer's company
  currentSignal: string;      // e.g. "Ex-Amazon Pay · 6y" — derived from story+YOE
}

function hash(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) | 0;
  return Math.abs(h);
}

function currentSignalFrom(story: string, yoe: number): string {
  // Pull the most distinctive phrase from the story — "Ex-X · Ny"
  const exMatch = story.match(/(?:at|from)\s+([A-Z][A-Za-z]+(?: [A-Z][A-Za-z]+)?)/);
  if (exMatch) return `${exMatch[1]} · ${yoe}y`;
  return `${yoe} years experience`;
}

/**
 * Build a seeker card from the endorser's perspective.
 * Match% is boosted if the endorser's company is on the seeker's target list.
 */
export function buildSeekerCards(viewerEndorserId = '2'): SeekerCard[] {
  const viewer = referrerById(viewerEndorserId);
  const viewerCompany = viewer?.company.name ?? 'Razorpay';

  return DEMO_SEEKERS
    .map((s: DemoSeeker) => {
      const targeting = s.targetCompanies.includes(viewerCompany);
      const h = hash(s.id + ':' + viewerEndorserId);
      const base = targeting ? 82 : 68;
      const matchPercent = Math.min(98, base + (h % 12));
      return {
        id: s.id,
        name: s.name,
        headline: s.headline,
        story: s.story.length > 180 ? `${s.story.slice(0, 177)}...` : s.story,
        skills: s.skills.slice(0, 3),
        yearsOfExperience: s.yearsOfExperience,
        targetRole: s.targetRoles[0] ?? 'Software Engineer',
        targetCompanies: s.targetCompanies.slice(0, 3),
        matchPercent,
        currentSignal: currentSignalFrom(s.story, s.yearsOfExperience),
      };
    })
    .sort((a: SeekerCard, b: SeekerCard) => b.matchPercent - a.matchPercent);
}
