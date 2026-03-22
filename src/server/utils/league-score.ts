import type { LeagueMetric } from '../../shared/types/domain';

interface LeagueCatch {
  lengthIn: number;
  weightLb: number;
  isVerified: boolean;
}

export const calculateLeaguePoints = (metric: LeagueMetric, catchEntry: LeagueCatch) => {
  const verificationBonus = catchEntry.isVerified ? 5 : 0;

  if (metric === 'biggest_fish') {
    return Math.round(catchEntry.lengthIn + catchEntry.weightLb * 2 + verificationBonus);
  }

  if (metric === 'most_fish') {
    return 10 + verificationBonus;
  }

  return Math.round(catchEntry.lengthIn * 0.7 + catchEntry.weightLb * 6 + verificationBonus);
};
