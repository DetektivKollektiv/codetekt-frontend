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
      <Suspense fallback={<div>Loading navigation...</div>}>
        <html lang="en" suppressHydrationWarning>
          <body className={`antialiased`}>
            <AuthProviderServer>{children}</AuthProviderServer>
          </body>
        </html>
      </Suspense>
    </ReactQueryClientProvider>
  );
}
