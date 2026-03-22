import { Fish } from 'lucide-react';
import { Card, SectionTitle } from './ui';

export const HotspotMap = ({ hotspots }: { hotspots: any[] }) => (
  <Card className="space-y-4">
    <SectionTitle eyebrow="Map" title="Blurred hotspot zones" subtitle="Exact coordinates stay private. Shared zones are rounded to protect anglers and fisheries." />
    <div className="grid gap-3 md:grid-cols-2">
      {hotspots.map((spot) => (
        <div key={spot.zone} className="rounded-3xl border border-white/10 bg-slate-950/60 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-semibold">Zone {spot.zone}</p>
              <p className="text-sm text-slate-400">{spot.catchCount} recent catches</p>
            </div>
            <Fish className="h-5 w-5 text-strike" />
          </div>
          <div className="mt-4 h-28 rounded-2xl bg-[radial-gradient(circle_at_30%_30%,rgba(29,211,176,0.35),transparent_20%),linear-gradient(180deg,rgba(255,255,255,0.08),rgba(255,255,255,0.02))]" />
        </div>
      ))}
    </div>
  </Card>
);
