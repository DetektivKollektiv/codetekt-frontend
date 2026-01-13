import { SupabaseClient } from '@supabase/supabase-js';
import { Database } from '../types/database.types';

export function getAggregatedReview(
  client: SupabaseClient<Database>,
  caseId: string
) {
  return client
    .from('review_aggregations')
    .select(
      `
      case_id,
      result_score,
      data,
      reviewer_ids,
      calculated_at,
      cases!inner (
        id,
        submitted_by,
        content,
        content_type,
        template_version,
        submitted_at,
        open_graph_data (*)
      )
    `
    )
    .eq('case_id', caseId)
    .maybeSingle();
}

export const aggregatedReviewQuery = (
  client: SupabaseClient<Database>,
  caseId: string
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
