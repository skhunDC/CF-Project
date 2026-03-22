import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { Button, Card, SectionTitle } from '../components/ui';
import { api } from '../lib/api';

export const AdminPage = () => {
  const queryClient = useQueryClient();
  const { data } = useQuery({ queryKey: ['admin-flags'], queryFn: () => api<any[]>('/api/admin/flags') });
  const moderation = useMutation({
    mutationFn: (payload: any) => api('/api/admin/moderate', { method: 'POST', body: JSON.stringify(payload) }),
    onSuccess: () => {
      toast.success('Moderation action saved');
      queryClient.invalidateQueries({ queryKey: ['admin-flags'] });
    },
  });

  return (
    <div className="space-y-4">
      <SectionTitle eyebrow="Admin" title="Moderation queue" subtitle="Review suspicious catches, update verification state, and log the reason for every action." />
      <div className="space-y-3">
        {(data ?? []).map((flag) => (
          <Card key={flag.id} className="space-y-3">
            <div className="flex items-center justify-between gap-3">
              <div>
                <h3 className="font-semibold">{flag.displayName}</h3>
                <p className="text-sm text-slate-400">{flag.lengthIn}" • {flag.weightLb} lb</p>
              </div>
              <span className="rounded-full bg-warning/15 px-3 py-1 text-xs text-warning">{flag.status}</span>
            </div>
            <p className="text-sm text-slate-300">Reason: {flag.reason}</p>
            <div className="grid grid-cols-3 gap-2">
              <Button onClick={() => moderation.mutate({ catchId: flag.catch_id ?? flag.catchId, action: 'approve', reason: 'Approved by admin review' })}>Approve</Button>
              <Button className="bg-warning text-ink" onClick={() => moderation.mutate({ catchId: flag.catch_id ?? flag.catchId, action: 'flag', reason: 'Requires manual follow-up' })}>Flag</Button>
              <Button className="bg-danger text-white" onClick={() => moderation.mutate({ catchId: flag.catch_id ?? flag.catchId, action: 'reject', reason: 'Rejected after review' })}>Reject</Button>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};
