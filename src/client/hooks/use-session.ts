import { useQuery } from '@tanstack/react-query';
import { api } from '../lib/api';

export const useSession = () =>
  useQuery({
    queryKey: ['me'],
    queryFn: () => api<any>('/api/me'),
    retry: false,
  });
