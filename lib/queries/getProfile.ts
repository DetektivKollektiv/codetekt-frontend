import { Tables } from '../types/database.types';
import { TypedSupabaseClient } from '../types/TypedSupabaseClient';

export async function getProfile(client: TypedSupabaseClient, userId: string) {
  return client.from('profiles').select('*').eq('id', userId).maybeSingle();
}

export const profileQuery = (client: TypedSupabaseClient, userId: string) => ({
  queryKey: ['profile', userId],
  queryFn: async () => {
    const { data, error } = await getProfile(client, userId);
    if (error) throw error;
    return data as Tables<'profiles'> | null;
  },
});
