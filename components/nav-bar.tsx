'use client';

import { ChevronDown, Menu } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import * as React from 'react';

import { createClient } from '@/lib/supabase/client';
import { cn } from '@/lib/utils';

// shadcn

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

import {
  Sheet,
  SheetContent,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';

import { Button } from '@/components/ui/button';
import { Tables } from '@/lib/types/database.types-generated';
import { User } from '@supabase/supabase-js';
import { useAuth } from './provider/auth-provider';
import { Toaster } from './ui/sonner';

/* ------------------------------------------------------------------ */

type NavLink = {
  label: string;
  href: string;
  children?: NavLink[];
  highlight?: boolean;
};

const guestNavigation: NavLink[] = [
  {
    label: 'Plattform & Community',
    href: '#',
    children: [
      { label: 'Gelöste Fälle', href: '/archive' },
      { label: 'Fall einreichen', href: '/submit' },
      { label: 'Login', href: '/auth/login' },
      { label: 'Detektiv*in werden', href: '/auth/sign-up' },
    ],
  },
  { label: 'Workshops', href: '#' },
  {
    label: 'Über Codetekt',
    href: '#',
    children: [
      { label: 'Der Verein', href: '#' },
      { label: 'Trust-Checking', href: '#' },
      { label: 'FAQ', href: '#' },
      { label: 'Spenden', href: '#' },
    ],
  },
];

const authenticatedNavigation: NavLink[] = [
  { label: 'Fall bearbeiten', href: '#open-cases' },
  { label: 'Fall einreichen', href: '/submit' },
  { label: 'Gelöste Fälle', href: '/archive' },
  {
    label: 'Über Codetekt',
    href: '#',
    children: [
      { label: 'Der Verein', href: '#' },
      { label: 'Workshops', href: '#' },
      { label: 'Trust-Checking', href: '#' },
      { label: 'FAQ', href: '#' },
      { label: 'Spenden', href: '#' },
    ],
  },
];

/* ------------------------------------------------------------------ */

function getDisplayName(profile: Tables<'profiles'> | null, user: User | null) {
  return profile?.username || user?.email || 'Account';
}

/* ------------------------------------------------------------------ */
function DesktopNavigation({ items }: { items: NavLink[] }) {
  return (
    <nav className="hidden lg:flex items-center gap-1">
      {items.map((item) => {
        const hasChildren = Boolean(item.children?.length);

        // Simple link (kein Dropdown)
        if (!hasChildren) {
          return (
            <Button
              key={item.label}
              asChild
              variant="ghost"
              className={cn(
                'text-body-md font-medium',
                item.highlight && 'text-primary'
              )}
            >
              <Link href={item.href}>{item.label}</Link>
            </Button>
          );
        }

        // Dropdown
        return (
          <DropdownMenu key={item.label}>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                className={cn(
                  'flex items-center gap-1 text-body-md font-medium',
                  item.highlight && 'text-primary'
                )}
              >
                {item.label}
                <ChevronDown className="h-4 w-4 opacity-70" />
              </Button>
            </DropdownMenuTrigger>

            <DropdownMenuContent align="start" className="min-w-[220px]">
              {item.children!.map((child, index) => (
                <DropdownMenuItem
                  key={child.label}
                  asChild
                  className="text-body-md"
                >
                  <Link href={child.href}>{child.label}</Link>
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        );
      })}
    </nav>
  );
}

/* ------------------------------------------------------------------ */

function UserMenu({
  user,
  profile,
  onLogout,
}: {
  user: User;
  profile: Tables<'profiles'> | null;
  onLogout: () => void;
}) {
  const name = getDisplayName(profile, user);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="gap-3">
          <span className="hidden md:block text-body-md font-medium">
            Hi {name}!
          </span>
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="w-64">
        <DropdownMenuLabel>
          <div className="text-body-md font-medium">{name}</div>
          {user.email && (
            <div className="text-meta text-muted-foreground">{user.email}</div>
          )}
        </DropdownMenuLabel>

        <DropdownMenuSeparator />

        <DropdownMenuItem className="text-body-md" asChild>
          <Link href="#">Profil</Link>
        </DropdownMenuItem>

        <DropdownMenuItem className="text-body-md" asChild>
          <Link href="#">Rangliste</Link>
        </DropdownMenuItem>

        <DropdownMenuSeparator />

        <DropdownMenuItem
          onClick={onLogout}
          className="text-destructive focus:text-destructive text-body-md font-bold"
          variant="destructive"
        >
          Abmelden
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

/* ------------------------------------------------------------------ */

export default function NavBar() {
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = React.useState(false);
  const pathname = usePathname();

  const { user, profile, isAuthenticated } = useAuth();

  React.useEffect(() => {
    console.log(`Route changed to: ${pathname}`);
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
    const supabase = createClient();
    await supabase.auth.signOut();
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
