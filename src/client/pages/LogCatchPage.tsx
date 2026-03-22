import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { api } from '../lib/api';
import { Button, Card, SectionTitle } from '../components/ui';

export const LogCatchPage = () => {
  const queryClient = useQueryClient();
  const { register, handleSubmit, reset, formState: { isSubmitting } } = useForm({
    defaultValues: {
      speciesId: 'sp_snook',
      lengthIn: 28,
      weightLb: 8.2,
      lure: '',
      notes: '',
      lat: 27.98,
      lng: -82.56,
    },
  });

  const mutation = useMutation({
    mutationFn: async (values: any) => {
      const upload = await api<{ key: string; uploadUrl: string }>('/api/catches/upload-url', { method: 'POST', body: JSON.stringify({}) });
      const blob = new Blob(['demo'], { type: 'image/jpeg' });
      await fetch(upload.uploadUrl, { method: 'PUT', body: blob, headers: { 'content-type': 'image/jpeg' }, credentials: 'include' });
      return api('/api/catches', {
        method: 'POST',
        body: JSON.stringify({ ...values, photoKey: upload.key, caughtAt: new Date().toISOString() }),
      });
    },
    onSuccess: () => {
      toast.success('Catch saved');
      reset();
      queryClient.invalidateQueries({ queryKey: ['feed'] });
    },
  });

  return (
    <div className="space-y-4">
      <SectionTitle eyebrow="Log" title="Save a catch in under 10 seconds" subtitle="Timestamp and blurred location are pre-filled. Save first, refine later." />
      <Card>
        <form className="space-y-3" onSubmit={handleSubmit((values) => mutation.mutate(values))}>
          <select {...register('speciesId')} className="min-h-12 w-full rounded-2xl border border-white/10 bg-slate-950/80 px-4">
            <option value="sp_snook">Snook</option>
            <option value="sp_redfish">Redfish</option>
            <option value="sp_bass">Largemouth Bass</option>
            <option value="sp_trout">Speckled Trout</option>
          </select>
          <div className="grid grid-cols-2 gap-3">
            <input type="number" step="0.1" {...register('lengthIn', { valueAsNumber: true })} className="min-h-12 rounded-2xl border border-white/10 bg-slate-950/80 px-4" placeholder="Length (in)" />
            <input type="number" step="0.1" {...register('weightLb', { valueAsNumber: true })} className="min-h-12 rounded-2xl border border-white/10 bg-slate-950/80 px-4" placeholder="Weight (lb)" />
          </div>
          <input {...register('lure')} className="min-h-12 w-full rounded-2xl border border-white/10 bg-slate-950/80 px-4" placeholder="Optional lure or bait" />
          <textarea {...register('notes')} className="min-h-24 w-full rounded-2xl border border-white/10 bg-slate-950/80 px-4 py-3" placeholder="Quick notes" />
          <div className="grid grid-cols-2 gap-3">
            <input type="number" step="0.0001" {...register('lat', { valueAsNumber: true })} className="min-h-12 rounded-2xl border border-white/10 bg-slate-950/80 px-4" placeholder="Lat" />
            <input type="number" step="0.0001" {...register('lng', { valueAsNumber: true })} className="min-h-12 rounded-2xl border border-white/10 bg-slate-950/80 px-4" placeholder="Lng" />
          </div>
          <Button className="w-full" disabled={isSubmitting || mutation.isPending}>{mutation.isPending ? 'Saving…' : 'Save catch'}</Button>
        </form>
      </Card>
    </div>
  );
};
