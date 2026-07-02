import { SupabaseClient } from '@supabase/supabase-js';
import { Database } from '../types/database.types';

interface GetUserReviewAnswersInProgressOptions {
  withoutOpenDisputes: boolean;
}

const USER_REVIEW_ANSWERS_IN_PROGRESS_SELECT = `
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
    `;

export function getUserReviewAnswersInProgress(
  client: SupabaseClient<Database>,
  userId: string,
  options: GetUserReviewAnswersInProgressOptions,
) {
  if (options.withoutOpenDisputes) {
    return client
      .from('review_answers_in_progress_without_open_disputes')
      .select(USER_REVIEW_ANSWERS_IN_PROGRESS_SELECT)
      .eq('reviewed_by', userId);
  }

  return client
    .from('review_answers_in_progress')
    .select(USER_REVIEW_ANSWERS_IN_PROGRESS_SELECT)
    .eq('reviewed_by', userId);
}

export function getUserReviewAnswersSubmitted(
  client: SupabaseClient<Database>,
  userId: string,
) {
  return client
    .from('review_answers_submitted')
    .select('*')
    .eq('reviewed_by', userId);
}

export const userReviewAnswersInProgressQuery = (
  client: SupabaseClient<Database>,
  userId: string,
  options: GetUserReviewAnswersInProgressOptions,
) => ({
  queryKey: [
    'user-review-answers-in-progress',
    userId,
    options.withoutOpenDisputes,
  ],
  queryFn: async () => {
    const { data, error } = await getUserReviewAnswersInProgress(
      client,
      userId,
      options,
    );
    if (error) throw error;
    return data;
  },
});

export const userReviewAnswersSubmittedQuery = (
  client: SupabaseClient<Database>,
  userId: string,
) => ({
  queryKey: ['user-review-answers-submitted', userId],
  queryFn: async () => {
    const { data, error } = await getUserReviewAnswersSubmitted(client, userId);
    if (error) throw error;
    return data;
  },
});

export type UserReviewAnswersInProgress = Awaited<
  ReturnType<ReturnType<typeof userReviewAnswersInProgressQuery>['queryFn']>
>;

export type UserReviewAnswersSubmitted = Awaited<
  ReturnType<ReturnType<typeof userReviewAnswersSubmittedQuery>['queryFn']>
>;
