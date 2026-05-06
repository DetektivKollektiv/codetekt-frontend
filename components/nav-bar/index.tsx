import { getTutorialContent } from '@/lib/queries/getTutorialContent';

import { createClient } from '@/lib/supabase/server';
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

export default async function NavBar() {
  const client = await createClient();
  const tutorialContentResult = await getTutorialContent(client);

  if (tutorialContentResult.error) {
    console.error(tutorialContentResult.error);
  }

  return (
    <Header
      authenticatedNavigation={authenticatedNavigation}
      guestNavigation={guestNavigation}
      tutorialContent={tutorialContentResult.data}
    />
  );
}
