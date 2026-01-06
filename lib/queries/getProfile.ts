import { Tables } from '../types/database.types';
import { TypedSupabaseClient } from '../types/TypedSupabaseClient';

// Lädt das Profile des aktuell eingeloggten Users (oder null wenn ausgeloggt)
export async function getProfile(client: TypedSupabaseClient) {
  const { data: claims, error } = await client.auth.getClaims();

  if (error) {
    console.error('getClaims error:', error);
    return { data: null as any, error };
  }

  // je nach Implementation: claims?.sub oder claims?.user_id etc.
  const userId = claims?.claims.sub;
  if (!userId) return { data: null as any, error: null as any };

  return client.from('profiles').select('*').eq('id', userId).maybeSingle(); // null wenn nicht gefunden
}

export const profileQuery = (client: TypedSupabaseClient) => ({
  queryKey: ['profile'],
  queryFn: async () => {
    const { data, error } = await getProfile(client);
    if (error) throw error;
    return data as Tables<'profiles'> | null;
  },
});
