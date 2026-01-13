import { getAuth } from '@/lib/supabase/getAuth';
import { NavLink } from '@/lib/types';
import Header from './header';

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
  { label: 'Fall bearbeiten', href: '/#open-cases' },
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

export default async function NavBar() {
  const { user, profile, isAuthenticated } = await getAuth();
  return (
    <Header
      authenticatedNavigation={authenticatedNavigation}
      guestNavigation={guestNavigation}
      user={user}
      profile={profile}
      isAuthenticated={isAuthenticated}
    />
  );
}
