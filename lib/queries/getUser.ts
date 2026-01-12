import { SupabaseClient } from '@supabase/supabase-js';
import { Database } from '../types/database.types-generated';

export function getUser(client: SupabaseClient<Database>) {
  return client.auth.getUser();
}

export const userQuery = (client: SupabaseClient<Database>) => ({
  queryKey: ['user'],
  queryFn: async () => {
    const { data, error } = await getUser(client);
    if (error) throw error;
    return data;
  },
});

export type User = Awaited<ReturnType<ReturnType<typeof userQuery>['queryFn']>>;
