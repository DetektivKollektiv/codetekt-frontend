import { SupabaseClient } from '@supabase/supabase-js';
import { Database } from '../types/database.types';

export function getAggregationReviewers(
  client: SupabaseClient<Database>,
  caseIds?: string[],
) {
  return client.rpc('get_aggregation_reviewers', {
    case_ids: caseIds && caseIds.length > 0 ? caseIds : null,
  });
}

export const aggregationReviewersQuery = (
  client: SupabaseClient<Database>,
  caseIds?: string[],
) => ({
  queryKey: ['aggregation-reviewers', caseIds ?? []],
  queryFn: async () => {
    const { data, error } = await getAggregationReviewers(client, caseIds);
    if (error) throw error;
    return data;
  },
});

export type AggregationReviewers = NonNullable<
  Awaited<ReturnType<typeof getAggregationReviewers>>['data']
>;
