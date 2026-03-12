import { SupabaseClient } from '@supabase/supabase-js';
import { Database } from '../types/database.types';

export function getCase(client: SupabaseClient<Database>, caseId: string) {
  return client
    .from('cases')
    .select(
      `
      *,
      open_graph_data (
        *
      ),
      case_titles (*)
    `,
    )
    .eq('id', caseId)
    .maybeSingle();
}

export const caseQuery = (client: SupabaseClient, caseId: string) => ({
  queryKey: ['case-comments', caseId],
  queryFn: async () => {
    const { data, error } = await getCase(client, caseId);
    if (error) throw error;
    return data;
  },
});

export type Case = Awaited<ReturnType<ReturnType<typeof caseQuery>['queryFn']>>;
