'use client';

import { Menu } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import * as React from 'react';

import { createClient } from '@/lib/supabase/client';
import { cn, getDisplayName } from '@/lib/utils';

import {
  Sheet,
  SheetContent,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';

import { Button } from '@/components/ui/button';
import { getAuth } from '@/lib/supabase/getAuth';
import { NavLink } from '@/lib/types';
import { useQuery } from '@tanstack/react-query';
import { Toaster } from '../ui/sonner';
import DesktopNavigation from './desktop-navigation';
import UserMenu from './user-menu';

export default function Header({
  auth,
  authenticatedNavigation,
  guestNavigation,
}: {
  auth: Awaited<ReturnType<typeof getAuth>>;
  authenticatedNavigation: NavLink[];
  guestNavigation: NavLink[];
}) {
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = React.useState(false);
  const pathname = usePathname();

  const client = createClient();

  const {
    data: { isAuthenticated, user, profile },
    refetch,
  } = useQuery({
    queryFn: () => getAuth(client),
    queryKey: ['auth'],
    initialData: auth,
  });

  React.useEffect(() => {
    const { data } = client.auth.onAuthStateChange((event, session) => {
      if (event === 'INITIAL_SESSION') {
        return;
      }

      refetch();
    });

    return () => data.subscription.unsubscribe();
  }, []);

  React.useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  React.useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) {
        setMobileOpen(false);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  const navigation = isAuthenticated
    ? authenticatedNavigation
    : guestNavigation;

  const handleLogout = async () => {
    await client.auth.signOut();
    setMobileOpen(false);
    router.push('/auth/login');
  };

  return (
    <header className="fixed w-lvw top-0 z-50 bg-background/90 backdrop-blur h-20">
      <div className="mx-auto h-full flex page-max-w items-center justify-between py-4">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-3">
          <Image
            src="/codetekt_logo.png"
            alt="Codetekt"
            width={156}
            height={40}
            priority
            className="h-8 w-auto"
          />
        </Link>
        {/* Desktop Nav */}
        <div className="hidden lg:block">
          <DesktopNavigation items={navigation} />
        </div>
        {/* Right side */}
        <div className="flex items-center gap-2">
          {/* Desktop auth */}
          {isAuthenticated && user ? (
            <div className="hidden lg:block">
              <UserMenu user={user} profile={profile} onLogout={handleLogout} />
            </div>
          ) : (
            <div className="hidden lg:flex items-center gap-2">
              <Button
                variant="ghost"
                className="text-body-md"
                size={'lg'}
                asChild
              >
                <Link href="/auth/login">Login</Link>
              </Button>
              <Button asChild size={'lg'}>
                <Link href="/auth/sign-up">Detektiv*in werden</Link>
              </Button>
            </div>
          )}

          {/* Mobile */}
          <div className="lg:hidden">
            <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
              <SheetTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon-lg"
                  onClick={() => setMobileOpen(true)}
                >
                  <Menu className="size-6" />
                </Button>
              </SheetTrigger>

              <SheetContent side="right">
                <SheetHeader className="h-20 flex justify-center">
                  <SheetTitle className="text-heading-md">
                    {isAuthenticated && user
                      ? `Hi ${getDisplayName(profile, user)}!`
                      : 'Menü'}
                  </SheetTitle>
                </SheetHeader>
                <div className="w-full bg-gradient-brand h-px -mt-4"></div>
                <div className="grid flex-1 auto-rows-min gap-3 px-4">
                  {isAuthenticated && (
                    <Link
                      href="#"
                      onClick={() => setMobileOpen(false)}
                      className="block text-heading-sm font-medium"
                    >
                      Profil
                    </Link>
                  )}
                  {navigation.map((item) => (
                    <div key={item.label} className="space-y-2">
                      <Link
                        href={item.href}
                        onClick={() => setMobileOpen(false)}
                        className={cn(
                          'block text-heading-sm font-medium',
                          item.highlight && 'text-primary'
                        )}
                      >
                        {item.label}
                      </Link>

                      {item.children && (
                        <div className="space-y-2 pt-1 pl-4">
                          {item.children.map((child) => (
                            <Link
                              key={child.label}
                              href={child.href}
                              onClick={() => setMobileOpen(false)}
                              className="block text-body-md text-muted-foreground hover:text-foreground"
                            >
                              {child.label}
                            </Link>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
                <SheetFooter>
                  {isAuthenticated ? (
                    <Button
                      variant="destructive"
                      className="w-full"
                      onClick={handleLogout}
                    >
                      Abmelden
                    </Button>
                  ) : (
                    <div className="flex gap-2">
                      <Button variant="outline" className="flex-1" asChild>
                        <Link href="/auth/login">Login</Link>
                      </Button>
                      <Button className="flex-1" asChild>
                        <Link href="/auth/sign-up">Detektiv*in werden</Link>
                      </Button>
                    </div>
                  )}
                </SheetFooter>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
      <div className="w-full bg-gradient-brand h-px"></div>
      <Toaster position="top-center" offset="6rem" />
    </header>
  );
}
