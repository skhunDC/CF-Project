import { Card } from './ui';

export const ScoreDial = ({ score, confidence, label }: { score: number; confidence: number; label: string }) => {
  const circumference = 2 * Math.PI * 54;
  const dash = circumference - (score / 100) * circumference;

  return (
    <Card className="flex items-center gap-4">
      <svg viewBox="0 0 140 140" className="h-28 w-28 shrink-0">
        <circle cx="70" cy="70" r="54" stroke="rgba(255,255,255,0.12)" strokeWidth="12" fill="none" />
        <circle
          cx="70"
          cy="70"
          r="54"
          stroke="#1dd3b0"
          strokeWidth="12"
          fill="none"
          strokeDasharray={circumference}
          strokeDashoffset={dash}
          strokeLinecap="round"
          transform="rotate(-90 70 70)"
        />
        <text x="70" y="66" textAnchor="middle" className="fill-white text-3xl font-bold">{score}</text>
        <text x="70" y="84" textAnchor="middle" className="fill-slate-300 text-xs">/100</text>
      </svg>
      <div className="space-y-2">
        <p className="text-sm uppercase tracking-[0.28em] text-strike/80">Bite score</p>
        <h3 className="text-lg font-semibold">{label}</h3>
        <p className="text-sm text-slate-300">Confidence {confidence}%</p>
      </div>
    </Card>
  );
};
