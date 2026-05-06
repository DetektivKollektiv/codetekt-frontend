import Footer from '@/components/footer';
import { AppShell } from '@/components/app-shell';
import { AuthProvider } from '@/components/provider/auth-provider';
import NavBar from '@/components/nav-bar';
import BProgressProvider from '@/components/provider/bprogress-provider';
import { getAuth } from '@/lib/supabase/getAuth';
import { createClient } from '@/lib/supabase/server';
import type { ReactNode } from 'react';

export async function AuthenticatedApp({ children }: { children: ReactNode }) {
  const client = await createClient();
  const auth = await getAuth(client);

  return (
    <AuthProvider initialAuth={auth}>
      <BProgressProvider>
        <AppShell footer={<Footer />} navbar={<NavBar />}>
          {children}
        </AppShell>
      </BProgressProvider>
    </AuthProvider>
  );
}
