import { SupabaseClient } from '@supabase/supabase-js';
import { Database } from '../types/database.types';

export function getClaims(client: SupabaseClient<Database>) {
  return client.auth.getClaims();
}

export const claimsQuery = (client: SupabaseClient<Database>) => ({
  queryKey: ['claims'],
  queryFn: async () => {
    const { data, error } = await getClaims(client);
    if (error) throw error;
    return data;
  },
});
export type Claims = Awaited<
  ReturnType<ReturnType<typeof claimsQuery>['queryFn']>
>;
