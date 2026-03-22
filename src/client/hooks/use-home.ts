import { useQuery } from '@tanstack/react-query';
import { api } from '../lib/api';

export const useHomeData = (region = 'Tampa Bay') => {
  const bite = useQuery({ queryKey: ['bite', region], queryFn: () => api<any>(`/api/bite?region=${encodeURIComponent(region)}`) });
  const feed = useQuery({ queryKey: ['feed'], queryFn: () => api<any[]>('/api/feed') });
  const leagues = useQuery({ queryKey: ['leagues', 'local'], queryFn: () => api<any[]>('/api/leagues?scope=local') });
  return { bite, feed, leagues };
};
