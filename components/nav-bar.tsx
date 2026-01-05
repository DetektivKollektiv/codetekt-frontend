import { createClient } from '@/lib/supabase/server';
import NavBarClient, { NavUser } from './nav-bar-client';

export default async function NavBar() {
  const supabase = await createClient();
  const { data } = await supabase.auth.getClaims();

  const claims = (data?.claims as Record<string, string | undefined>) || null;

  const user: NavUser | null = claims
    ? {
        name: claims.full_name || claims.name || claims.email || null,
        email: claims.email || null,
      }
    : null;

  return <NavBarClient user={user} />;
}
