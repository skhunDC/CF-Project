import { useQuery } from '@tanstack/react-query';
import { HotspotMap } from '../components/HotspotMap';
import { SectionTitle } from '../components/ui';
import { api } from '../lib/api';

export const MapPage = () => {
  const { data } = useQuery({ queryKey: ['hotspots'], queryFn: () => api<any[]>('/api/map/hotspots') });

  return (
    <div className="space-y-4">
      <SectionTitle eyebrow="Map" title="Privacy-safe hotspot intel" subtitle="Explore blurred catch zones, recent activity, and shared regional patterns." />
      <HotspotMap hotspots={data ?? []} />
    </div>
  );
};
