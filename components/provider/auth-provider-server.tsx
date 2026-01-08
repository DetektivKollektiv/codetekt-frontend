import { getClaims } from '@/lib/queries/getClaims';
import { getProfile } from '@/lib/queries/getProfile';
import { getUser } from '@/lib/queries/getUser';
import { createClient } from '@/lib/supabase/server';
import NavBar from '../nav-bar';
import { AuthProvider } from './auth-provider';

export default async function AuthProviderServer({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const client = await createClient();
  const { data } = await getClaims(client);
  const { data: user } = await getUser(client);

  let profile = null;

  if (data?.claims.sub) {
    profile = await getProfile(client, data?.claims.sub);
  }

  return (
    <AuthProvider
      initialClaims={data?.claims}
      initialProfile={profile?.data}
      initialUser={user?.user}
    >
      <NavBar />
      {children}
    </AuthProvider>
  );
}
