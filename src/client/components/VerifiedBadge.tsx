import { BadgeCheck } from 'lucide-react';
import { cn } from '../lib/cn';

export const VerifiedBadge = ({ status }: { status: string }) => (
  <span
    className={cn(
      'inline-flex items-center gap-1 rounded-full px-2 py-1 text-xs font-medium',
      status === 'verified' ? 'bg-strike/20 text-strike' : status === 'flagged' ? 'bg-danger/20 text-danger' : 'bg-white/10 text-slate-300',
    )}
  >
    <BadgeCheck className="h-3.5 w-3.5" />
    {status}
  </span>
);
