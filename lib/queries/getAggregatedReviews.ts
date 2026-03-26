import { SupabaseClient } from '@supabase/supabase-js';
import { Database } from '../types/database.types';

export function getAggregatedReviews(client: SupabaseClient<Database>) {
  return client.from('review_aggregations_without_open_disputes').select(`
      *,
      cases!inner (
        *,
        open_graph_data (*),
        case_titles (*),
        case_categories (*),
        case_keywords (*),
        case_factchecks (*)
      )
    `);
}

export const aggregatedReviewsQuery = (client: SupabaseClient) => ({
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
