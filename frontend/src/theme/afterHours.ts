export type VermilionUse =
  | 'endorse-action'
  | 'match-accepted'
  | 'first-endorsement-landing'
  | 'tier-upgrade'
  | 'status'
  | 'decoration';

export const afterHoursBrand = {
  colors: {
    midnight: '#0C1F19',
    velvet: '#16352B',
    parchment: '#F4EDDD',
    vermilion: '#FF4D2E',
    brass: '#D9A441',
    sage: '#9DB5A4',
  },
  alpha: {
    velvetStrong: 'rgba(22, 53, 43, 0.92)',
    velvetSoft: 'rgba(22, 53, 43, 0.72)',
    parchment08: 'rgba(244, 237, 221, 0.08)',
    parchment12: 'rgba(244, 237, 221, 0.12)',
    parchment18: 'rgba(244, 237, 221, 0.18)',
    parchment35: 'rgba(244, 237, 221, 0.35)',
    parchment62: 'rgba(244, 237, 221, 0.62)',
    parchment78: 'rgba(244, 237, 221, 0.78)',
    brass14: 'rgba(217, 164, 65, 0.14)',
    brass22: 'rgba(217, 164, 65, 0.22)',
    brass34: 'rgba(217, 164, 65, 0.34)',
    brass48: 'rgba(217, 164, 65, 0.48)',
    sage16: 'rgba(157, 181, 164, 0.16)',
    sage30: 'rgba(157, 181, 164, 0.30)',
    vermilion14: 'rgba(255, 77, 46, 0.14)',
    vermilion22: 'rgba(255, 77, 46, 0.22)',
    vermilion38: 'rgba(255, 77, 46, 0.38)',
  },
  fills: {
    vermilionDetonation: ['#FF4D2E', '#FF4D2E', '#FF4D2E'],
  },
} as const;

export const afterHoursDetonations = {
  matchAccepted: {
    headline: 'Consider it done.',
    actionLabel: 'Send a thank you',
  },
  firstEndorsementLanding: {
    headline: 'Your name is in.',
    actionLabel: 'Open pipeline',
  },
  tierUpgrade: {
    headline: "You're in the next room.",
    actionLabel: 'View score',
  },
} as const;

export function isVermilionAllowed(use: VermilionUse): boolean {
  return (
    use === 'endorse-action' ||
    use === 'match-accepted' ||
    use === 'first-endorsement-landing' ||
    use === 'tier-upgrade'
  );
}
