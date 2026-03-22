export const StatPill = ({ label, value }: { label: string; value: string | number }) => (
  <div className="rounded-full border border-white/10 bg-white/5 px-3 py-2 text-sm">
    <span className="text-slate-400">{label}</span>
    <span className="ml-2 font-semibold text-white">{value}</span>
  </div>
);
