import { SupabaseClient } from '@supabase/supabase-js';
import { Database } from '../types/database.types';

export function getAggregatedReview(
  client: SupabaseClient<Database>,
  caseId: string,
) {
  return client
    .from('review_aggregations')
    .select(
      `
      *,
      cases!inner (
        *,
        open_graph_data (*),
        case_titles (*),
        case_keywords (*),
        case_categories (*),
        case_factchecks (*)
      )
    `,
    )
    .eq('case_id', caseId)
    .maybeSingle();
}

export const aggregatedReviewQuery = (
  client: SupabaseClient<Database>,
  caseId: string,
) => ({
  queryKey: ['aggregated-case', caseId],
  queryFn: async () => {
    const { data, error } = await getAggregatedReview(client, caseId);
    if (error) throw error;
    return data;
  },
});

export type AggregatedReview = Awaited<
  ReturnType<ReturnType<typeof aggregatedReviewQuery>['queryFn']>
>;
