import { cn } from '../lib/cn';

export const FilterPills = ({ values, active, onChange }: { values: string[]; active: string; onChange: (value: string) => void }) => (
  <div className="flex gap-2 overflow-x-auto pb-1">
    {values.map((value) => (
      <button
        key={value}
        onClick={() => onChange(value)}
        className={cn('whitespace-nowrap rounded-full border px-3 py-2 text-sm', active === value ? 'border-strike bg-strike/15 text-strike' : 'border-white/10 bg-white/5 text-slate-300')}
      >
        {value}
      </button>
    ))}
  </div>
);
