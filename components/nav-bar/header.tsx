'use client';
import { Bar, Progress } from '@bprogress/next';

import { Menu } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import * as React from 'react';

import { createClient } from '@/lib/supabase/client';
import { updateProfile } from '@/lib/queries/updateProfile';
import { TutorialDialog } from '@/components/tutorial';
import type { TutorialContentData } from '@/lib/schemas';
import type { Tables } from '@/lib/types/database.types';
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
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { Toaster } from '../ui/sonner';
import DesktopNavigation from './desktop-navigation';
import UserMenu from './user-menu';

type AuthQueryData = Awaited<ReturnType<typeof getAuth>>;

export default function Header({
  auth,
  authenticatedNavigation,
  guestNavigation,
  tutorialContent,
}: {
  auth: Awaited<ReturnType<typeof getAuth>>;
  authenticatedNavigation: NavLink[];
  guestNavigation: NavLink[];
  tutorialContent: TutorialContentData | null;
}) {
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = React.useState(false);
  const [isTutorialOpen, setIsTutorialOpen] = React.useState(false);
  const pathname = usePathname();

  const client = createClient();
  const queryClient = useQueryClient();

  const {
    data: authData,
    refetch,
  } = useQuery<AuthQueryData>({
    queryFn: () => getAuth(client),
    queryKey: ['auth'],
    initialData: auth,
  });
  const { isAuthenticated, user, profile } = authData;

  React.useEffect(() => {
    const { data } = client.auth.onAuthStateChange((event) => {
      if (event === 'INITIAL_SESSION') {
        return;
      }
      queryClient.clear();
      queryClient.invalidateQueries({ queryKey: ['auth'] });
      refetch();
    });

    return () => data.subscription.unsubscribe();
  }, [client.auth, queryClient, refetch]);

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
  const tutorialRequiresConfirmation = Boolean(
    tutorialContent &&
      isAuthenticated &&
      user &&
      profile &&
      profile.tutorial_completed_at === null,
  );

  React.useEffect(() => {
    if (tutorialRequiresConfirmation) {
      setIsTutorialOpen(true);
    }
  }, [tutorialRequiresConfirmation]);

  const tutorialReadMutation = useMutation({
    mutationFn: async () => {
      if (!user) {
        throw new Error('Nutzerprofil konnte nicht geladen werden');
      }

      const { data, error } = await updateProfile(client, user.id, {
        tutorial_completed_at: new Date().toISOString(),
      });

      if (error) {
        throw error;
      }

      return data as Tables<'profiles'>;
    },
    onSuccess: (updatedProfile) => {
      queryClient.setQueryData<AuthQueryData>(
        ['auth'],
        (currentAuth) =>
          currentAuth
            ? {
                ...currentAuth,
                profile: updatedProfile,
              }
            : currentAuth,
      );
      queryClient.setQueryData<Tables<'profiles'> | null>(
        ['profile', updatedProfile.id],
        updatedProfile,
      );
      queryClient.invalidateQueries({ queryKey: ['auth'] });
      queryClient.invalidateQueries({ queryKey: ['profile', updatedProfile.id] });
      setIsTutorialOpen(false);
      toast.success('Tutorial als gelesen markiert.');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Tutorial konnte nicht gespeichert werden.');
    },
  });

  const handleLogout = async () => {
    await client.auth.signOut();
    queryClient.clear();
    setMobileOpen(false);
    setIsTutorialOpen(false);
    router.push('/auth/login');
    router.refresh();
  };

  const handleTutorialTrigger = () => {
    if (!tutorialContent) {
      return;
    }

    setMobileOpen(false);
    setIsTutorialOpen(true);
  };

  const handleTutorialOpenChange = (open: boolean) => {
    if (tutorialRequiresConfirmation && !open) {
      return;
    }

    setIsTutorialOpen(open);
  };

  return (
    <>
      <header className="fixed top-0 z-50 h-20 w-lvw bg-background/90 backdrop-blur">
        <div className="mx-auto flex h-full items-center justify-between py-4 page-max-w">
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

          <div className="hidden items-center gap-1 lg:flex">
            <DesktopNavigation items={navigation} />
            {tutorialContent ? (
              <Button
                variant="ghost"
                className="text-body-md font-medium"
                onClick={handleTutorialTrigger}
              >
                Tutorial
              </Button>
            ) : null}
          </div>

          <div className="flex items-center gap-2">
            {isAuthenticated && user ? (
              <div className="hidden lg:block">
                <UserMenu
                  user={user}
                  profile={profile}
                  onLogout={handleLogout}
                />
              </div>
            ) : (
              <div className="hidden items-center gap-2 lg:flex">
                <Button
                  variant="ghost"
                  className="text-body-md"
                  size={'lg'}
                  asChild
                >
                  <Link href="/auth/login">Login</Link>
                </Button>
                <Button asChild size={'lg'}>
                  <Link href="/auth/sign-up">co:detective werden</Link>
                </Button>
              </div>
            )}

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
                  <SheetHeader className="flex h-20 justify-center">
                    <SheetTitle className="text-heading-md">
                      <Link href="/" onClick={() => setMobileOpen(false)}>
                        {isAuthenticated && user
                          ? `Hi ${getDisplayName(profile, user)}!`
                          : 'Zur Startseite'}
                        {isAuthenticated && (
                          <div className="block text-heading-sm font-medium text-primary">
                            Zum Profil
                          </div>
                        )}
                      </Link>
                    </SheetTitle>
                  </SheetHeader>
                  <div className="-mt-4 h-px w-full bg-gradient-brand"></div>
                  <div className="grid flex-1 auto-rows-min gap-3 px-4">
                    {tutorialContent ? (
                      <Button
                        variant="ghost"
                        className="justify-start px-0 text-heading-sm font-medium"
                        onClick={handleTutorialTrigger}
                      >
                        Tutorial
                      </Button>
                    ) : null}
                    {navigation.map((item) => (
                      <div key={item.label} className="space-y-2">
                        <Link
                          href={item.href}
                          onClick={() => setMobileOpen(false)}
                          className={cn(
                            'block text-heading-sm font-medium',
                            item.highlight && 'text-primary',
                          )}
                        >
                          {item.label}
                        </Link>

                        {item.children && (
                          <div className="space-y-2 pl-4 pt-1">
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
                          <Link href="/auth/sign-up">co:detective werden</Link>
                        </Button>
                      </div>
                    )}
                  </SheetFooter>
                </SheetContent>
              </Sheet>
            </div>
          </div>
        </div>
        <div className="relative h-px w-full bg-gradient-brand">
          <Progress>
            <Bar className="!absolute !left-0 !top-0 !h-px !bg-neutral-0 !opacity-60"></Bar>
          </Progress>
        </div>
        <Toaster position="top-center" offset="6rem" />
      </header>
      {tutorialContent ? (
        <TutorialDialog
          open={isTutorialOpen}
          onOpenChange={handleTutorialOpenChange}
          tutorialContent={tutorialContent}
          requiresConfirmation={tutorialRequiresConfirmation}
          isSaving={tutorialReadMutation.isPending}
          onConfirmRead={() => tutorialReadMutation.mutate()}
        />
      ) : null}
    </>
  );
}
