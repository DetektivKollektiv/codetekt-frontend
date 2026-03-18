import { SupabaseClient } from '@supabase/supabase-js';
import { Database } from '../types/database.types';

export function getUserReviews(
  client: SupabaseClient<Database>,
  userId: string,
) {
  return client
    .from('review_answers_in_progress_without_open_disputes')
    .select(
      `
    *,
    cases (
      *,
      open_graph_data (*),
      review_answers_in_progress (*),
      case_titles (*),
      case_categories (*),
      case_keywords (*),
      review_aggregations (*)
    )
    `,
    )
    .eq('reviewed_by', userId);
}

export const userReviewsQuery = (
  client: SupabaseClient<Database>,
  userId: string,
) => ({
  queryKey: ['user-reviews'],
  queryFn: async () => {
    const { data, error } = await getUserReviews(client, userId);
    if (error) throw error;
    return data;
  },
});
export type UserReviews = Awaited<
  ReturnType<ReturnType<typeof userReviewsQuery>['queryFn']>
>;
