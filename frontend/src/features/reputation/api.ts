import { referralsApi } from '../../services/api';

export const reputationApi = {
  getMe: referralsApi.getReputation,
  getLeaderboard: referralsApi.getLeaderboard,
};

export type { LeaderboardEntry, ReputationData } from '../../services/api';
