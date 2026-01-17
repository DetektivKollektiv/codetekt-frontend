import { getAuth } from '@/lib/supabase/getAuth';

import { createClient } from '@/lib/supabase/server';
import { NavLink } from '@/lib/types';
import Header from './header';

const guestNavigation: NavLink[] = [
  { label: 'Gelöste Fälle', href: '/archive' },
  { label: 'Fall einreichen', href: '/submit' },
  {
    label: 'Zu Codetekt',
    href: 'https://codetekt.org/',
  },
];

const authenticatedNavigation: NavLink[] = [
  { label: 'Fall bearbeiten', href: '/#open-cases' },
  { label: 'Fall einreichen', href: '/submit' },
  { label: 'Gelöste Fälle', href: '/archive' },
  {
    label: 'Zu Codetekt',
    href: 'https://codetekt.org/',
  },
];

export default async function NavBar() {
  const client = await createClient();
  const auth = await getAuth(client);
  return (
    <Header
      authenticatedNavigation={authenticatedNavigation}
      guestNavigation={guestNavigation}
      auth={auth}
    />
  );
}
