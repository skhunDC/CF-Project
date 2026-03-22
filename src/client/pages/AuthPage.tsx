import { useState } from 'react';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { api } from '../lib/api';
import { Button, Card, GhostButton, SectionTitle } from '../components/ui';

export const AuthPage = ({ onAuthed }: { onAuthed: () => void }) => {
  const [magicToken, setMagicToken] = useState('');
  const { register, handleSubmit, formState: { isSubmitting } } = useForm<{ email: string }>();

  const submit = handleSubmit(async ({ email }) => {
    const response = await api<{ token: string; note: string }>('/auth/magic-link', {
      method: 'POST',
      body: JSON.stringify({ email, turnstileToken: 'demo-turnstile-token-pass' }),
    });
    setMagicToken(response.token);
    toast.success('Magic link token generated for local dev.');
  });

  return (
    <div className="mx-auto flex min-h-screen max-w-md flex-col justify-center px-4 py-10">
      <Card className="space-y-6 p-6">
        <SectionTitle eyebrow="Welcome" title="Catch + Compete + Predict" subtitle="Fast catch logging, live leaderboards, and bite forecasting built for mobile anglers." />
        <form className="space-y-3" onSubmit={submit}>
          <input {...register('email', { required: true })} className="min-h-12 w-full rounded-2xl border border-white/10 bg-slate-950/80 px-4" placeholder="Email" />
          <Button className="w-full" disabled={isSubmitting}>{isSubmitting ? 'Sending…' : 'Send magic link'}</Button>
        </form>
        <div className="space-y-3 rounded-2xl border border-white/10 bg-white/5 p-4">
          <p className="text-sm text-slate-300">Google and Apple sign-in endpoints are scaffolded. Connect provider secrets in Wrangler to enable production OAuth.</p>
          <div className="grid grid-cols-2 gap-3">
            <GhostButton type="button">Continue with Google</GhostButton>
            <GhostButton type="button">Continue with Apple</GhostButton>
          </div>
        </div>
        {magicToken ? (
          <div className="space-y-3 rounded-2xl border border-strike/30 bg-strike/10 p-4">
            <p className="text-sm text-slate-200">Local dev token:</p>
            <code className="block break-all text-xs text-strike">{magicToken}</code>
            <Button className="w-full" onClick={async () => {
              await api('/auth/exchange', { method: 'POST', body: JSON.stringify({ token: magicToken }) });
              toast.success('Signed in');
              onAuthed();
            }}>Complete sign in</Button>
          </div>
        ) : null}
      </Card>
    </div>
  );
};
