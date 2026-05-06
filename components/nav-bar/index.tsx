import { NavLink } from '@/lib/types';
import Header from './header';

const guestNavigation: NavLink[] = [
  { label: 'Gelöste Fälle', href: '/archive' },
  { label: 'Fall einreichen', href: '/submit' },
];

const authenticatedNavigation: NavLink[] = [
  { label: 'Fall checken', href: '/#open-cases' },
  { label: 'Fall einreichen', href: '/submit' },
  { label: 'Gelöste Fälle', href: '/archive' },
];

export default function NavBar() {
  return (
    <Header
      authenticatedNavigation={authenticatedNavigation}
      guestNavigation={guestNavigation}
    />
  );
}
