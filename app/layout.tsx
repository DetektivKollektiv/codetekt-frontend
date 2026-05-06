import Footer from '@/components/footer';
import { AuthProvider } from '@/components/provider/auth-provider';
import { ReactQueryClientProvider } from '@/components/provider/react-query-client-provider';

import LoadingComponent from '@/components/loading-component';
import NavBar from '@/components/nav-bar';
import BProgressProvider from '@/components/provider/bprogress-provider';
import { getAuth } from '@/lib/supabase/getAuth';
import { createClient } from '@/lib/supabase/server';
import type { Metadata } from 'next';
import { Suspense } from 'react';
import './globals.css';

const defaultUrl = process.env.VERCEL_URL
  ? `https://${process.env.VERCEL_URL}`
  : 'http://localhost:3000';

export const metadata: Metadata = {
  metadataBase: new URL(defaultUrl),
  title: 'codetekt - Plattform',
  description:
    'Wir sind codetekt: Durch unseren Trust-Checking-Ansatz ermöglichen wir es allen, die Vertrauenswürdigkeit von Informationen einzuschätzen.',
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const client = await createClient();
  const auth = await getAuth(client);

  return (
    <ReactQueryClientProvider>
      <html
        lang="de"
        className="scroll-pt-32 scroll-smooth"
        suppressHydrationWarning
        data-scroll-behavior="smooth"
      >
        <body className={`antialiased`}>
          <AuthProvider initialAuth={auth}>
            <BProgressProvider>
              <Suspense fallback={<LoadingComponent />}>
                <NavBar />
                <main className="page-mt page-min-h flex flex-col">
                  <div className="flex-1 flex flex-col">{children}</div>
                  <Footer />
                </main>
              </Suspense>
            </BProgressProvider>
          </AuthProvider>
        </body>
      </html>
    </ReactQueryClientProvider>
  );
}
