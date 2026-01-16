import { SupabaseClient } from '@supabase/supabase-js';
import { getClaims } from '../queries/getClaims';
import { getProfile } from '../queries/getProfile';
import { getUser } from '../queries/getUser';
import { Database } from '../types/database.types';

export const getAuth = async (client: SupabaseClient<Database>) => {
  const { data: claimsData, error: ClaimsError } = await getClaims(client);
  const { data: userData } = await getUser(client);
  let isAuthenticated = false;

  let profile = null;

  if (claimsData?.claims.sub) {
    profile = await getProfile(client, claimsData?.claims.sub);
  }

  if (userData?.user) {
    isAuthenticated = true;
  }

  if (ClaimsError) {
    throw ClaimsError;
  }

  return {
    claims: claimsData?.claims,
    profile: profile?.data ?? null,
    user: userData?.user,
    isAuthenticated,
  };
};
