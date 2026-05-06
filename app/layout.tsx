import { AuthenticatedApp } from '@/components/authenticated-app';
import { ReactQueryClientProvider } from '@/components/provider/react-query-client-provider';
import LoadingComponent from '@/components/loading-component';
import type { Metadata } from 'next';
import { Suspense, type ReactNode } from 'react';
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

export default function RootLayout({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  return (
    <html
      lang="de"
      className="scroll-pt-32 scroll-smooth"
      suppressHydrationWarning
      data-scroll-behavior="smooth"
    >
      <body className="antialiased">
        <ReactQueryClientProvider>
          <Suspense fallback={<LoadingComponent />}>
            <AuthenticatedApp>{children}</AuthenticatedApp>
          </Suspense>
        </ReactQueryClientProvider>
      </body>
    </html>
  );
}
