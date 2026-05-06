'use client';

import { useAuth } from '@/components/provider/auth-provider';
import { Toaster } from '@/components/ui/sonner';
import { TUTORIAL_PATH } from '@/lib/tutorial-gate';
import { usePathname } from 'next/navigation';
import type { ReactNode } from 'react';

export function AppShell({
  children,
  footer,
  navbar,
}: {
  children: ReactNode;
  footer: ReactNode;
  navbar: ReactNode;
}) {
  const pathname = usePathname();
  const { auth } = useAuth();
  const hidesAppChrome =
    pathname === TUTORIAL_PATH && auth.profile?.tutorial_completed_at === null;

  return (
    <>
      {hidesAppChrome ? null : navbar}
      <main
        className={
          hidesAppChrome
            ? 'page-min-h flex flex-col'
            : 'page-mt page-min-h flex flex-col'
        }
      >
        <div className="flex flex-1 flex-col">{children}</div>
        {hidesAppChrome ? null : footer}
      </main>
      <Toaster position="top-center" offset={hidesAppChrome ? '1rem' : '6rem'} />
    </>
  );
}
