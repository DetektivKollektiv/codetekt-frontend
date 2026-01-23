import { SupabaseClient } from '@supabase/supabase-js';
import { Database } from '../types/database.types';

export function getOpenCases(client: SupabaseClient<Database>) {
  return client
    .from('cases_without_open_disputes')
    .select(
      `
      *,
      open_graph_data (*),
      review_aggregations (case_id)
    `
    );
}

export const openCasesQuery = (client: SupabaseClient) => ({
  queryKey: ['open-cases'],
  queryFn: async () => {
    const { data, error } = await getOpenCases(client);
    if (error) throw error;
    return data.filter((c) => !c.review_aggregations);
  },
});

export type OpenCases = Awaited<
  ReturnType<ReturnType<typeof openCasesQuery>['queryFn']>
>;
