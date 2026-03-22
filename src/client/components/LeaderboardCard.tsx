import { Card, SectionTitle } from './ui';

export const LeaderboardCard = ({ title, rows }: { title: string; rows: any[] }) => (
  <Card className="space-y-3">
    <SectionTitle eyebrow="Leaders" title={title} />
    <div className="space-y-2">
      {rows.map((row, index) => (
        <div key={row.user_id ?? row.userId ?? index} className="flex items-center justify-between rounded-2xl bg-white/5 px-3 py-3">
          <div>
            <p className="font-medium">#{index + 1} {row.displayName}</p>
            <p className="text-sm text-slate-400">@{row.handle}</p>
          </div>
          <div className="text-right">
            <p className="text-lg font-semibold text-strike">{row.score}</p>
            <p className="text-xs uppercase tracking-[0.22em] text-slate-500">points</p>
          </div>
        </div>
      ))}
    </div>
  </Card>
);
