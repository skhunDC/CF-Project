import type { BiteFactor, BiteScoreResult } from '../../shared/types/domain';

interface Input {
  moonPhase: number;
  pressureTrend: 'rising' | 'steady' | 'falling';
  windMph: number;
  cloudCover: number;
  recentCatchRate: number;
  tempDelta: number;
}

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));

export const calculateBiteScore = (input: Input): BiteScoreResult => {
  const factors: BiteFactor[] = [];
  let score = 50;

  const moonBoost = Math.round((1 - Math.abs(input.moonPhase - 0.5) * 2) * 12);
  score += moonBoost;
  factors.push({ label: 'Moon phase alignment', effect: moonBoost > 6 ? 'positive' : 'neutral', weight: moonBoost });

  const pressureWeight = input.pressureTrend === 'falling' ? 14 : input.pressureTrend === 'steady' ? 6 : -8;
  score += pressureWeight;
  factors.push({ label: `Pressure ${input.pressureTrend}`, effect: pressureWeight > 0 ? 'positive' : 'negative', weight: pressureWeight });

  const windWeight = input.windMph >= 4 && input.windMph <= 12 ? 10 : input.windMph <= 20 ? 3 : -10;
  score += windWeight;
  factors.push({ label: 'Wind setup', effect: windWeight > 0 ? 'positive' : 'negative', weight: windWeight });

  const cloudWeight = input.cloudCover >= 30 && input.cloudCover <= 75 ? 8 : 2;
  score += cloudWeight;
  factors.push({ label: 'Light penetration', effect: cloudWeight > 4 ? 'positive' : 'neutral', weight: cloudWeight });

  const tempWeight = clamp(10 - Math.abs(input.tempDelta) * 2, -10, 10);
  score += tempWeight;
  factors.push({ label: 'Water temperature stability', effect: tempWeight > 0 ? 'positive' : 'negative', weight: tempWeight });

  const catchRateWeight = clamp(Math.round(input.recentCatchRate * 12), -6, 14);
  score += catchRateWeight;
  factors.push({ label: 'Recent angler success', effect: catchRateWeight > 0 ? 'positive' : 'negative', weight: catchRateWeight });

  const normalized = clamp(Math.round(score), 0, 100);
  const confidence = clamp(45 + Math.round(factors.reduce((sum, factor) => sum + Math.abs(factor.weight), 0) / 4), 40, 96);
  const windowLabel = normalized >= 75 ? 'Prime bite window' : normalized >= 55 ? 'Solid feeding window' : 'Tough bite window';
  const summary = normalized >= 75
    ? 'Conditions favor aggressive feeding, especially around structure edges.'
    : normalized >= 55
      ? 'There is enough alignment to plan a focused session near transition water.'
      : 'Fish may be catchable, but expect slower reactions and shorter windows.';

  return { score: normalized, confidence, windowLabel, summary, factors };
};
