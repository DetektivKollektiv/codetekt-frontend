import NavBar from '@/components/nav-bar';
import { ReactQueryClientProvider } from '@/components/provider/react-query-client-provider';
import type { Metadata } from 'next';
import { Suspense } from 'react';
import './globals.css';

const defaultUrl = process.env.VERCEL_URL
  ? `https://${process.env.VERCEL_URL}`
  : 'http://localhost:3000';

export const metadata: Metadata = {
  metadataBase: new URL(defaultUrl),
  title: 'Next.js and Supabase Starter Kit',
  description: 'The fastest way to build apps with Next.js and Supabase',
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ReactQueryClientProvider>
      <html lang="en" suppressHydrationWarning>
        <body className={`antialiased`}>
          <Suspense fallback={<div>Loading navigation...</div>}>
            <NavBar />
          </Suspense>
          {children}
        </body>
      </html>
    </ReactQueryClientProvider>
  );
}
