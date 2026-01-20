import { Database } from '@/lib/types/database.types';
import { FunctionsResponse } from '@supabase/functions-js';
import { SupabaseClient } from '@supabase/supabase-js';

export interface SubmitReviewAnswersData {
  in_progress_id: string;
}

interface SubmitReviewAnswersResponse {
  saved: boolean;
  review_id: string;
}

export async function submitReviewAnswers(
  client: SupabaseClient<Database>,
  submitData: SubmitReviewAnswersData,
): Promise<FunctionsResponse<SubmitReviewAnswersResponse>> {
  return client.functions.invoke<SubmitReviewAnswersResponse>(
    'set-review-answers-submitted',
    {
      body: {
        in_progress_id: submitData.in_progress_id,
      },
    },
  );
}

export const submitReviewAnswersMutation = (
  client: SupabaseClient<Database>,
) => ({
  mutationFn: async (data: SubmitReviewAnswersData) => {
    const { data: result, error } = await submitReviewAnswers(client, data);
    if (error) throw error;
    return result;
  },
});
