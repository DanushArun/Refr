export type ParticipationRole = 'seeker' | 'endorser';

export interface ParticipationChoice {
  description: string;
  id: ParticipationRole;
  title: string;
}

export const participationChoices: readonly ParticipationChoice[] = [
  {
    id: 'seeker',
    title: 'I’m seeking a referral',
    description: 'Find roles through trusted connections',
  },
  {
    id: 'endorser',
    title: 'I refer great people',
    description: 'Help others grow their careers',
  },
];
