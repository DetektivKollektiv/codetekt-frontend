import { getClaims } from '../queries/getClaims';
import { getProfile } from '../queries/getProfile';
import { getUser } from '../queries/getUser';
import { createClient } from './server';

export const getAuth = async () => {
  const client = await createClient();
  const { data } = await getClaims(client);
  const { data: user } = await getUser(client);
  let isAuthenticated = false;

  let profile = null;

  if (data?.claims.sub) {
    profile = await getProfile(client, data?.claims.sub);
  }

  if (user?.user) {
    isAuthenticated = true;
  }

  return {
    claims: data?.claims,
    profile: profile?.data,
    user: user?.user,
    isAuthenticated,
  };
};
