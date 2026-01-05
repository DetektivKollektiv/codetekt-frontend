'use client';

import { ChevronDown, Gift, Menu, X } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

import { createClient } from '@/lib/supabase/client';
import { cn } from '@/lib/utils';

export type NavUser = {
  name?: string | null;
  email?: string | null;
  levelDescription?: string | null;
};

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
      { label: 'Fall einreichen', href: '#' },
      { label: 'Login', href: '#' },
      { label: 'Detektiv*in werden', href: '#' },
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
  { label: 'Fall bearbeiten', href: '#open-cases', highlight: true },
  { label: 'Fall einreichen', href: '#' },
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

const baseLinkClasses =
  'inline-flex items-center gap-2 text-sm font-medium text-slate-800 transition-colors hover:text-indigo-700';

const flyoutClasses =
  'absolute left-0 top-full hidden min-w-[220px] pt-3 group-hover:block group-focus-within:block';

function DesktopNav({ items }: { items: NavLink[] }) {
  return (
    <nav className="hidden lg:flex items-center gap-6">
      {items.map((item) => (
        <div key={item.label} className="relative group">
          <Link
            href={item.href}
            className={cn(baseLinkClasses, item.highlight && 'text-indigo-700')}
          >
            <span>{item.label}</span>
            {item.children?.length ? (
              <ChevronDown className="h-4 w-4 text-slate-500" />
            ) : null}
          </Link>

          {item.children?.length ? (
            <div className={flyoutClasses}>
              <div className="overflow-hidden rounded-2xl border bg-white shadow-xl">
                <ul className="py-2">
                  {item.children.map((child) => (
                    <li key={child.label}>
                      <Link
                        href={child.href}
                        className="block px-4 py-2 text-sm text-slate-700 transition-colors hover:bg-slate-50 hover:text-indigo-700"
                      >
                        {child.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ) : null}
        </div>
      ))}
    </nav>
  );
}

function MobileNav({
  items,
  onNavigate,
}: {
  items: NavLink[];
  onNavigate: () => void;
}) {
  return (
    <nav className="lg:hidden">
      <ul className="space-y-4">
        {items.map((item) => (
          <li key={item.label} className="space-y-2">
            <Link
              href={item.href}
              onClick={onNavigate}
              className={cn(
                'flex items-center justify-between text-base font-semibold text-slate-800',
                item.highlight && 'text-indigo-700'
              )}
            >
              <span>{item.label}</span>
              {item.children?.length ? (
                <ChevronDown className="h-4 w-4 text-slate-500" />
              ) : null}
            </Link>
            {item.children?.length ? (
              <ul className="space-y-1 border-l border-slate-200 pl-4">
                {item.children.map((child) => (
                  <li key={child.label}>
                    <Link
                      href={child.href}
                      onClick={onNavigate}
                      className="block text-sm text-slate-600 transition-colors hover:text-indigo-700"
                    >
                      {child.label}
                    </Link>
                  </li>
                ))}
              </ul>
            ) : null}
          </li>
        ))}
      </ul>
    </nav>
  );
}

export default function NavBarClient({ user }: { user: NavUser | null }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [showMessageBar, setShowMessageBar] = useState(true);
  const router = useRouter();

  const isAuthenticated = Boolean(user);
  const displayName = user?.name || user?.email || 'Account';
  const initial = displayName.charAt(0).toUpperCase();

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
    <header className="sticky top-0 z-50">
      {showMessageBar ? (
        <div className="bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-600 text-white">
          <div className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-4 py-2 text-sm">
            <a
              href="https://mitwirken-crowd.de/codetekt"
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-2 font-medium hover:underline"
            >
              <Gift className="h-4 w-4" />
              <span>
                Unterstütze unser Crowdfunding und sichere dir eine coole
                Prämie!
              </span>
            </a>
            <button
              onClick={() => setShowMessageBar(false)}
              className="rounded-full p-1 transition hover:bg-white/10"
              aria-label="Hinweis schließen"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
      ) : null}

      <div className="border-b border-slate-200 bg-white/90 backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4">
          <Link href="/" className="flex items-center gap-3">
            <Image
              src="/codetekt_logo.png"
              alt="Codetekt Startseite"
              width={156}
              height={40}
              priority
              className="h-8 w-auto"
            />
          </Link>

          <DesktopNav items={navigation} />

          <div className="flex items-center gap-3 lg:hidden">
            {isAuthenticated ? (
              <div className="flex items-center gap-2 rounded-full bg-slate-100 px-3 py-1.5 text-sm font-medium text-slate-800">
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-purple-600 text-white">
                  {initial}
                </span>
                <span className="max-w-[10rem] truncate">{displayName}</span>
              </div>
            ) : null}
            <button
              onClick={() => setMobileOpen((open) => !open)}
              aria-label="Navigation umschalten"
              className="rounded-full border border-slate-200 bg-white p-2 text-slate-700 shadow-sm transition hover:shadow-md"
            >
              {mobileOpen ? (
                <X className="h-5 w-5" />
              ) : (
                <Menu className="h-5 w-5" />
              )}
            </button>
          </div>

          {isAuthenticated ? (
            <div className="hidden lg:flex">
              <div className="relative group">
                <button className="flex items-center gap-3 px-3 py-2 text-left transition  focus:outline-none">
                  <div className="flex flex-col">
                    <span className="text-sm font-semibold text-slate-900">
                      {displayName}
                    </span>
                  </div>
                  <div className="flex h-9 w-9 items-center justify-center rounded-full bg-purple-600 text-sm font-semibold text-white">
                    {initial}
                  </div>
                </button>
                <div className="absolute right-0 top-full hidden pt-3 group-hover:block group-focus-within:block">
                  <div className="w-64 overflow-hidden rounded-2xl border bg-white shadow-2xl">
                    <div className="border-b px-4 py-3">
                      <p className="text-sm font-semibold text-slate-900">
                        {displayName}
                      </p>
                      {user?.email ? (
                        <p className="text-xs text-slate-500">{user.email}</p>
                      ) : null}
                    </div>
                    <div className="py-2">
                      <Link
                        href="#"
                        className="block px-4 py-2 text-sm text-slate-700 transition hover:bg-slate-50 hover:text-indigo-700"
                      >
                        Profil
                      </Link>
                      <Link
                        href="#"
                        className="block px-4 py-2 text-sm text-slate-700 transition hover:bg-slate-50 hover:text-indigo-700"
                      >
                        Rangliste
                      </Link>
                    </div>
                    <div className="border-t px-4 py-3">
                      <button
                        onClick={handleLogout}
                        className="w-full text-left text-sm font-semibold text-rose-600 transition hover:text-rose-700"
                      >
                        Abmelden
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="hidden lg:flex items-center gap-3">
              <Link
                href="#"
                className="text-sm font-medium text-slate-700 transition hover:text-indigo-700"
              >
                Login
              </Link>
              <Link
                href="#"
                className="rounded-full bg-indigo-700 px-4 py-2 text-sm font-semibold text-white transition hover:-translate-y-px hover:bg-indigo-800 hover:shadow-md"
              >
                Detektiv*in werden
              </Link>
            </div>
          )}
        </div>

        {mobileOpen ? (
          <div className="border-t border-slate-200 bg-white px-4 py-6 lg:hidden">
            <MobileNav
              items={navigation}
              onNavigate={() => setMobileOpen(false)}
            />

            <div className="mt-6 space-y-3">
              {isAuthenticated ? (
                <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-purple-600 text-lg font-semibold text-white">
                      {initial}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-slate-900">
                        {displayName}
                      </p>
                      {user?.email ? (
                        <p className="text-xs text-slate-500">{user.email}</p>
                      ) : null}
                    </div>
                  </div>
                  <div className="mt-4 space-y-2">
                    <Link
                      href="#"
                      onClick={() => setMobileOpen(false)}
                      className="block text-sm font-medium text-indigo-700"
                    >
                      Profil
                    </Link>
                    <Link
                      href="#"
                      onClick={() => setMobileOpen(false)}
                      className="block text-sm font-medium text-slate-700"
                    >
                      Rangliste
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="mt-2 inline-flex w-full items-center justify-center rounded-full bg-rose-50 px-4 py-2 text-sm font-semibold text-rose-600 transition hover:bg-rose-100"
                    >
                      Abmelden
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex items-center gap-3">
                  <Link
                    href="#"
                    onClick={() => setMobileOpen(false)}
                    className="flex-1 rounded-full border border-slate-200 px-4 py-2 text-center text-sm font-semibold text-slate-800 transition hover:border-indigo-200 hover:text-indigo-700"
                  >
                    Login
                  </Link>
                  <Link
                    href="#"
                    onClick={() => setMobileOpen(false)}
                    className="flex-1 rounded-full bg-indigo-700 px-4 py-2 text-center text-sm font-semibold text-white transition hover:-translate-y-px hover:bg-indigo-800 hover:shadow-md"
                  >
                    Detektiv*in werden
                  </Link>
                </div>
              )}
            </div>
          </div>
        ) : null}
      </div>
    </header>
  );
}
