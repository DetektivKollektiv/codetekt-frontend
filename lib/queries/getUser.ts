import { SupabaseClient } from '@supabase/supabase-js';

export function getUser(client: SupabaseClient) {
  return client.auth.getUser();
}

export const userQuery = (client: SupabaseClient) => ({
  queryKey: ['user'],
  queryFn: async () => {
    const { data, error } = await getUser(client);
    if (error) throw error;
    return data;
  },
});
