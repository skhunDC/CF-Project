import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useMemo } from 'react';
import { Toaster } from 'react-hot-toast';
import { BottomNav } from './components/BottomNav';
import { Card } from './components/ui';
import { useRoute } from './hooks/use-route';
import { useSession } from './hooks/use-session';
import { AdminPage } from './pages/AdminPage';
import { AuthPage } from './pages/AuthPage';
import { CatchDetailPage } from './pages/CatchDetailPage';
import { HomePage } from './pages/HomePage';
import { LeaguesPage } from './pages/LeaguesPage';
import { LogCatchPage } from './pages/LogCatchPage';
import { MapPage } from './pages/MapPage';
import { OnboardingPage } from './pages/OnboardingPage';
import { ProfilePage } from './pages/ProfilePage';

const queryClient = new QueryClient();

const AppShell = () => {
  const { path, navigate } = useRoute();
  const session = useSession();
  const me = session.data;
  const catchId = path.startsWith('/catches/') ? path.split('/')[2] : '';

  if (session.isLoading) {
    return <div className="flex min-h-screen items-center justify-center">Loading session…</div>;
  }

  if (session.isError) {
    return <AuthPage onAuthed={() => queryClient.invalidateQueries({ queryKey: ['me'] })} />;
  }

  const needsOnboarding = !me?.user?.displayName || me.user.displayName === 'New Angler' || me.user.homeRegion === 'Unknown';
  const content = (() => {
    if (needsOnboarding) {
      return <OnboardingPage onDone={() => queryClient.invalidateQueries({ queryKey: ['me'] })} />;
    }

    if (path === '/map') return <MapPage />;
    if (path === '/log') return <LogCatchPage />;
    if (path === '/leagues') return <LeaguesPage />;
    if (path === '/profile') return <ProfilePage />;
    if (path === '/admin') return me.user.role === 'admin' ? <AdminPage /> : <Card>Admin access required.</Card>;
    if (path.startsWith('/catches/')) return <CatchDetailPage catchId={catchId} />;
    return <HomePage region={me.user.homeRegion} />;
  })();

  return (
    <div className="mx-auto min-h-screen max-w-3xl px-4 pb-28 pt-6 md:px-6">
      {content}
      <BottomNav path={path} navigate={navigate} isAdmin={me?.user?.role === 'admin'} />
    </div>
  );
};

export const App = () => {
  useMemo(() => queryClient, []);

  return (
    <QueryClientProvider client={queryClient}>
      <Toaster position="top-center" />
      <AppShell />
    </QueryClientProvider>
  );
};
