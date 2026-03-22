import { formatDistanceToNow } from 'date-fns';
import { Card } from './ui';
import { VerifiedBadge } from './VerifiedBadge';

export const CatchCard = ({ catchItem }: { catchItem: any }) => (
  <Card className="space-y-3">
    {catchItem.imageUrl ? <img src={catchItem.imageUrl} alt={catchItem.speciesName} className="h-40 w-full rounded-2xl object-cover" /> : null}
    <div className="flex items-start justify-between gap-3">
      <div>
        <h3 className="text-lg font-semibold">{catchItem.speciesName}</h3>
        <p className="text-sm text-slate-300">{catchItem.displayName} • {formatDistanceToNow(new Date(catchItem.caughtAt), { addSuffix: true })}</p>
      </div>
      <VerifiedBadge status={catchItem.verificationStatus} />
    </div>
    <div className="flex gap-2 text-sm text-slate-200">
      <span>{catchItem.lengthIn}"</span>
      <span>•</span>
      <span>{catchItem.weightLb} lb</span>
    </div>
  </Card>
);
