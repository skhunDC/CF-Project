import { adminNavItem, bottomNavItems } from '../../shared/constants/navigation';
import { cn } from '../lib/cn';

export const BottomNav = ({ path, navigate, isAdmin }: { path: string; navigate: (to: string) => void; isAdmin?: boolean }) => {
  const items = isAdmin ? [...bottomNavItems, adminNavItem] : bottomNavItems;

  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 mx-auto flex max-w-3xl items-center justify-around border-t border-white/10 bg-ink/90 px-2 py-2 backdrop-blur">
      {items.map((item) => {
        const active = path === item.to;
        const Icon = item.icon;
        return (
          <button key={item.to} onClick={() => navigate(item.to)} className={cn('flex min-w-14 flex-col items-center gap-1 rounded-2xl px-3 py-2 text-xs', active ? 'text-strike' : 'text-slate-400')}>
            <Icon className="h-5 w-5" />
            <span>{item.label}</span>
          </button>
        );
      })}
    </nav>
  );
};
