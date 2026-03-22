import { useSession } from '../hooks/use-session';
import { Card, SectionTitle } from '../components/ui';
import { StatPill } from '../components/StatPill';

export const ProfilePage = () => {
  const { data } = useSession();

  return (
    <div className="space-y-4">
      <SectionTitle eyebrow="Profile" title={data?.user?.displayName ?? 'Your profile'} subtitle="Track stats, badges, and best catches." />
      <Card className="space-y-4">
        <div>
          <p className="text-lg font-semibold">@{data?.user?.handle}</p>
          <p className="text-sm text-slate-400">{data?.user?.homeRegion}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <StatPill label="Total catches" value={data?.stats?.totalCatches ?? 0} />
          <StatPill label="Best weight" value={`${data?.stats?.biggestWeight ?? 0} lb`} />
          <StatPill label="Verified" value={data?.stats?.verifiedCatches ?? 0} />
        </div>
      </Card>
      <Card className="space-y-3">
        <SectionTitle eyebrow="Badges" title="Recent unlocks" />
        {(data?.badges ?? []).map((badge: any) => (
          <div key={badge.id} className="rounded-2xl bg-white/5 px-3 py-3">
            <p className="font-medium">{badge.name}</p>
            <p className="text-sm text-slate-400">{badge.description}</p>
          </div>
        ))}
      </Card>
    </div>
  );
};
