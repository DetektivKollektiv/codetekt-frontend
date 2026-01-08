import { SupabaseClient } from '@supabase/supabase-js';
import { Tables } from '../types/database.types-generated';

export async function getProfile(client: SupabaseClient, userId: string) {
  return client.from('profiles').select('*').eq('id', userId).maybeSingle();
}

export const profileQuery = (client: SupabaseClient, userId: string) => ({
  queryKey: ['profile', userId],
  queryFn: async () => {
    const { data, error } = await getProfile(client, userId);
    if (error) throw error;
    return data as Tables<'profiles'> | null;
  },
});
