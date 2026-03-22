import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { api } from '../lib/api';
import { Button, Card, SectionTitle } from '../components/ui';

export const OnboardingPage = ({ onDone }: { onDone: () => void }) => {
  const { register, handleSubmit, formState: { isSubmitting } } = useForm({
    defaultValues: { displayName: '', handle: '', homeRegion: 'Tampa Bay', favoriteSpecies: 'Snook' },
  });

  return (
    <div className="space-y-4">
      <SectionTitle eyebrow="Setup" title="Create your angler profile" subtitle="We use this to personalize bite windows, leaderboards, and your public identity." />
      <Card>
        <form className="space-y-3" onSubmit={handleSubmit(async (values) => {
          await api('/auth/onboarding', { method: 'POST', body: JSON.stringify(values) });
          toast.success('Onboarding saved');
          onDone();
        })}>
          <input {...register('displayName', { required: true })} className="min-h-12 w-full rounded-2xl border border-white/10 bg-slate-950/80 px-4" placeholder="Display name" />
          <input {...register('handle', { required: true })} className="min-h-12 w-full rounded-2xl border border-white/10 bg-slate-950/80 px-4" placeholder="Handle" />
          <input {...register('homeRegion', { required: true })} className="min-h-12 w-full rounded-2xl border border-white/10 bg-slate-950/80 px-4" placeholder="Home region" />
          <input {...register('favoriteSpecies')} className="min-h-12 w-full rounded-2xl border border-white/10 bg-slate-950/80 px-4" placeholder="Favorite species" />
          <Button className="w-full" disabled={isSubmitting}>{isSubmitting ? 'Saving…' : 'Finish onboarding'}</Button>
        </form>
      </Card>
    </div>
  );
};
