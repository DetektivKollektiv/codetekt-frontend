import { SupabaseClient } from '@supabase/supabase-js';
import { Database } from '../types/database.types';

export function getSubmittedReviewAnswer(
  client: SupabaseClient<Database>,
  caseId: string,
  userId: string,
) {
  return client
    .from('review_answers_submitted')
    .select('*')
    .eq('case_id', caseId)
    .eq('reviewed_by', userId)
    .maybeSingle();
}

export const submittedReviewAnswerQuery = (
  client: SupabaseClient<Database>,
  caseId: string,
  userId: string,
) => ({
  queryKey: ['submitted-review-answer', caseId, userId],
  queryFn: async () => {
    const { data, error } = await getSubmittedReviewAnswer(
      client,
      caseId,
      userId,
    );
    if (error) throw error;
    return data;
  },
});

export type SubmittedReviewAnswer = Awaited<
  ReturnType<ReturnType<typeof submittedReviewAnswerQuery>['queryFn']>
>;
