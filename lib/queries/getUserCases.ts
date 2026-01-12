import { SupabaseClient } from '@supabase/supabase-js';
import { Database } from '../types/database.types';

export function getUserCases(client: SupabaseClient<Database>, userId: string) {
  return client
    .from('cases_without_open_disputes')
    .select(
      `
    *,
    open_graph_data (*)
    `
    )
    .eq('submitted_by', userId);
}

export const userCasesQuery = (
  client: SupabaseClient<Database>,
  userId: string
) => ({
  queryKey: ['user-cases'],
  queryFn: async () => {
    const { data, error } = await getUserCases(client, userId);
    if (error) throw error;
    return data;
  },
});
export type UserCases = Awaited<
  ReturnType<ReturnType<typeof userCasesQuery>['queryFn']>
>;
