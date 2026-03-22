import { useQuery } from '@tanstack/react-query';
import { CatchCard } from '../components/CatchCard';
import { Card, SectionTitle } from '../components/ui';
import { api } from '../lib/api';

export const CatchDetailPage = ({ catchId }: { catchId: string }) => {
  const { data } = useQuery({ queryKey: ['catch', catchId], queryFn: () => api<any>(`/api/catches/${catchId}`), enabled: Boolean(catchId) });

  if (!catchId) {
    return <Card>Select a catch from the feed to inspect details.</Card>;
  }

  return (
    <div className="space-y-4">
      <SectionTitle eyebrow="Catch detail" title={data?.speciesName ?? 'Catch'} subtitle="Inspect species, size, lure, and verification notes without exposing exact coordinates." />
      {data ? <CatchCard catchItem={{ ...data, displayName: data.displayName, speciesName: data.speciesName, caughtAt: data.caught_at ?? data.caughtAt, verificationStatus: data.verification_status ?? data.verificationStatus, lengthIn: data.length_in ?? data.lengthIn, weightLb: data.weight_lb ?? data.weightLb, imageUrl: data.imageUrl }} /> : <Card>Loading catch…</Card>}
      <Card className="space-y-2">
        <p className="text-sm text-slate-300">Water: {data?.waterName ?? 'Unknown'}</p>
        <p className="text-sm text-slate-300">Lure: {data?.lure ?? 'Not provided'}</p>
        <p className="text-sm text-slate-300">Notes: {data?.notes ?? 'None'}</p>
        <p className="text-sm text-slate-300">Public zone: {data?.public_geohash_zone ?? data?.publicGeohashZone}</p>
      </Card>
    </div>
  );
};
