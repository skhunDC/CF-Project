import { Fish, House, Map, Shield, Trophy, UserCircle2 } from 'lucide-react';

export const bottomNavItems = [
  { to: '/', label: 'Home', icon: House },
  { to: '/map', label: 'Map', icon: Map },
  { to: '/log', label: 'Log', icon: Fish },
  { to: '/leagues', label: 'Leagues', icon: Trophy },
  { to: '/profile', label: 'Profile', icon: UserCircle2 },
];

export const adminNavItem = { to: '/admin', label: 'Admin', icon: Shield };
