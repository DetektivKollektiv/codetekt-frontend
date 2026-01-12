import { SupabaseClient } from '@supabase/supabase-js';
import { Database, Tables } from '../types/database.types';

export async function getProfile(
  client: SupabaseClient<Database>,
  userId: string
) {
  return client.from('profiles').select('*').eq('id', userId).maybeSingle();
}

export const profileQuery = (
  client: SupabaseClient<Database>,
  userId: string
) => ({
  queryKey: ['profile', userId],
  queryFn: async () => {
    const { data, error } = await getProfile(client, userId);
    if (error) throw error;
    return data as Tables<'profiles'> | null;
  },
});

export type Profile = Awaited<
  ReturnType<ReturnType<typeof profileQuery>['queryFn']>
>;
