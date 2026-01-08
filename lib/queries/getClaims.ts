import { SupabaseClient } from '@supabase/supabase-js';

export function getClaims(client: SupabaseClient) {
  return client.auth.getClaims();
}

export const claimsQuery = (client: SupabaseClient) => ({
  queryKey: ['claims'],
  queryFn: async () => {
    const { data, error } = await getClaims(client);
    if (error) throw error;
    return data;
  },
});
