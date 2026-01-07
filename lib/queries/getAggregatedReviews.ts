import { TypedSupabaseClient } from '../types/TypedSupabaseClient';

export function getAggregatedReviews(client: TypedSupabaseClient) {
  return client.from('review_aggregations').select(`
      case_id,
      result_score,
      data,
      reviewer_ids,
      calculated_at,
      cases (
        id,
        submitted_by,
        content,
        content_type,
        template_version,
        submitted_at,
        open_graph_data (*)
      )
    `);
}

export const aggregatedReviewsQuery = (client: TypedSupabaseClient) => ({
  queryKey: ['aggregated-cases'],
  queryFn: async () => {
    const { data, error } = await getAggregatedReviews(client);
    if (error) throw error;
    return data;
  },
});

export type AggregatedReviews = Awaited<
  ReturnType<ReturnType<typeof aggregatedReviewsQuery>['queryFn']>
>;
