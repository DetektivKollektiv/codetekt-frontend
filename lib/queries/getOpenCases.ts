import { SupabaseClient } from '@supabase/supabase-js';
import { Database } from '../types/database.types';

export function getOpenCases(client: SupabaseClient<Database>) {
  return client
    .from('cases_without_open_disputes')
    .select(
      `
      id,
      submitted_by,
      content,
      content_type,
      template_version,
      submitted_at,
      open_graph_data (*)
    `
    )
    .not('id', 'in', client.from('review_answers_submitted').select('case_id'));
}

export const openCasesQuery = (client: SupabaseClient) => ({
  queryKey: ['open-cases'],
  queryFn: async () => {
    const { data, error } = await getOpenCases(client);
    if (error) throw error;
    return data;
  },
});

export type OpenCases = Awaited<
  ReturnType<ReturnType<typeof openCasesQuery>['queryFn']>
>;
