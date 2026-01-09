import Footer from '@/components/footer';
import AuthProviderServer from '@/components/provider/auth-provider-server';
import { ReactQueryClientProvider } from '@/components/provider/react-query-client-provider';

import type { Metadata } from 'next';
import { Suspense } from 'react';
import './globals.css';

const defaultUrl = process.env.VERCEL_URL
  ? `https://${process.env.VERCEL_URL}`
  : 'http://localhost:3000';

export const metadata: Metadata = {
  metadataBase: new URL(defaultUrl),
  title: 'Codetekt - Platform',
  description:
    'Wir sind codetekt: Durch unseren Trust-Checking-Ansatz ermöglichen wir es allen, die Vertrauenswürdigkeit von Informationen einzuschätzen.',
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ReactQueryClientProvider>
      <Suspense fallback={<div>Codetekt Lädt</div>}>
        <html lang="de" suppressHydrationWarning>
          <body className={`antialiased`}>
            <AuthProviderServer>
              <main className="page-mt page-min-h flex flex-col">
                <div className="flex-1 flex flex-col">{children}</div>
                <Footer />
              </main>
            </AuthProviderServer>
          </body>
        </html>
      </Suspense>
    </ReactQueryClientProvider>
  );
}
