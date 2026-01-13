import { SupabaseClient } from '@supabase/supabase-js';
import { Database } from '../types/database.types';

export function getCaseComments(
  client: SupabaseClient<Database>,
  caseId: string
) {
  return client
    .from('case_comments')
    .select(
      `
      *,
    `
    )
    .eq('case_id', caseId);
}

export const caseCommentsQuery = (client: SupabaseClient, caseId: string) => ({
  queryKey: ['case-comments', caseId],
  queryFn: async () => {
    const { data, error } = await getCaseComments(client, caseId);
    if (error) throw error;
    return data;
  },
});

export type CaseComments = Awaited<
  ReturnType<ReturnType<typeof caseCommentsQuery>['queryFn']>
>;
