import type { ButtonHTMLAttributes, PropsWithChildren } from 'react';
import { cn } from '../lib/cn';

export const Card = ({ className, children }: PropsWithChildren<{ className?: string }>) => (
  <div className={cn('rounded-3xl border border-white/10 bg-white/5 p-4 shadow-glow backdrop-blur', className)}>{children}</div>
);

export const SectionTitle = ({ eyebrow, title, subtitle }: { eyebrow?: string; title: string; subtitle?: string }) => (
  <div className="space-y-1">
    {eyebrow ? <p className="text-xs uppercase tracking-[0.3em] text-strike/80">{eyebrow}</p> : null}
    <h2 className="text-xl font-semibold text-white">{title}</h2>
    {subtitle ? <p className="text-sm text-slate-300">{subtitle}</p> : null}
  </div>
);

export const Button = ({ className, children, ...props }: ButtonHTMLAttributes<HTMLButtonElement>) => (
  <button
    className={cn('inline-flex min-h-12 items-center justify-center rounded-2xl bg-strike px-4 py-3 text-sm font-semibold text-ink transition hover:opacity-90 disabled:opacity-50', className)}
    {...props}
  >
    {children}
  </button>
);

export const GhostButton = ({ className, children, ...props }: ButtonHTMLAttributes<HTMLButtonElement>) => (
  <button
    className={cn('inline-flex min-h-12 items-center justify-center rounded-2xl border border-white/15 bg-white/5 px-4 py-3 text-sm font-semibold text-white transition hover:bg-white/10', className)}
    {...props}
  >
    {children}
  </button>
);
