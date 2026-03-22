import { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { FilterPills } from '../components/FilterPills';
import { LeaderboardCard } from '../components/LeaderboardCard';
import { Card, SectionTitle } from '../components/ui';
import { api } from '../lib/api';

export const LeaguesPage = () => {
  const [scope, setScope] = useState('local');
  const leagues = useQuery({ queryKey: ['leagues', scope], queryFn: () => api<any[]>(`/api/leagues?scope=${scope}`) });
  const firstLeagueId = leagues.data?.[0]?.id;
  const detail = useQuery({ queryKey: ['league', firstLeagueId], queryFn: () => api<any>(`/api/leagues/${firstLeagueId}`), enabled: Boolean(firstLeagueId) });
  const league = useMemo(() => detail.data?.league ?? leagues.data?.[0], [detail.data, leagues.data]);

  return (
    <div className="space-y-4">
      <SectionTitle eyebrow="Leagues" title="Compete locally, statewide, or with friends" subtitle="Durable Object-backed scoring keeps live rankings consistent while catches stream in." />
      <FilterPills values={['friends', 'local', 'state', 'species']} active={scope} onChange={setScope} />
      <div className="space-y-3">
        {(leagues.data ?? []).map((entry) => (
          <Card key={entry.id} className="space-y-2">
            <div className="flex items-center justify-between gap-3">
              <div>
                <h3 className="font-semibold">{entry.name}</h3>
                <p className="text-sm text-slate-400">{entry.description}</p>
              </div>
              <span className="rounded-full bg-white/10 px-3 py-1 text-xs uppercase tracking-[0.22em] text-slate-300">{entry.metric}</span>
            </div>
          </Card>
        ))}
      </div>
      {league ? <LeaderboardCard title={league.name} rows={detail.data?.leaderboard ?? []} /> : null}
    </div>
  );
};
