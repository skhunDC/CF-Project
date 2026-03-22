import { LeaderboardCard } from '../components/LeaderboardCard';
import { CatchCard } from '../components/CatchCard';
import { ScoreDial } from '../components/ScoreDial';
import { StatPill } from '../components/StatPill';
import { Card, SectionTitle } from '../components/ui';
import { useHomeData } from '../hooks/use-home';
import { useQuery } from '@tanstack/react-query';
import { api } from '../lib/api';

export const HomePage = ({ region }: { region: string }) => {
  const { bite, feed, leagues } = useHomeData(region);
  const league = leagues.data?.[0];
  const leagueDetail = useQuery({ queryKey: ['league-home', league?.id], queryFn: () => api<any>(`/api/leagues/${league.id}`), enabled: Boolean(league?.id) });

  return (
    <div className="space-y-4">
      <SectionTitle eyebrow="Today" title="Where the bite is lining up" subtitle="Daily-use dashboard for planning, logging, and competing." />
      {bite.data ? <ScoreDial score={bite.data.score} confidence={bite.data.confidence} label={bite.data.windowLabel} /> : <Card>Loading bite score…</Card>}
      <div className="flex flex-wrap gap-2">
        <StatPill label="Best window" value={bite.data?.windowLabel ?? 'Loading'} />
        <StatPill label="Region" value={region} />
        <StatPill label="Confidence" value={`${bite.data?.confidence ?? '--'}%`} />
      </div>
      <Card className="space-y-2">
        <SectionTitle eyebrow="Why" title="Why this score" />
        {bite.data?.factors?.map((factor: any) => (
          <div key={factor.label} className="flex items-center justify-between rounded-2xl bg-white/5 px-3 py-2 text-sm">
            <span>{factor.label}</span>
            <span className={factor.effect === 'positive' ? 'text-strike' : factor.effect === 'negative' ? 'text-danger' : 'text-slate-300'}>{factor.weight > 0 ? '+' : ''}{factor.weight}</span>
          </div>
        ))}
      </Card>
      {league ? <LeaderboardCard title={league.name} rows={leagueDetail.data?.leaderboard ?? []} /> : null}
      <div className="space-y-3">
        <SectionTitle eyebrow="Feed" title="Recent verified catches" />
        <div className="grid gap-3 md:grid-cols-2">
          {(feed.data ?? []).map((item) => <CatchCard key={item.id} catchItem={item} />)}
        </div>
      </div>
    </div>
  );
};
