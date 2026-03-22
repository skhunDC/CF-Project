export type LeagueScope = 'friends' | 'local' | 'state' | 'species';
export type LeagueMetric = 'biggest_fish' | 'most_fish' | 'mixed';
export type VerificationStatus = 'pending' | 'verified' | 'flagged';

export interface BiteFactor {
  label: string;
  effect: 'positive' | 'neutral' | 'negative';
  weight: number;
}

export interface BiteScoreResult {
  score: number;
  confidence: number;
  windowLabel: string;
  summary: string;
  factors: BiteFactor[];
}
