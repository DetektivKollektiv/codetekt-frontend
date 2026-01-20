import { InProgressReviewAnswer } from '@/lib/schemas/review-schemas';
import { Database } from '@/lib/types/database.types';
import { FunctionsResponse } from '@supabase/functions-js';
import { SupabaseClient } from '@supabase/supabase-js';

export interface SaveReviewAnswersInProgressData {
  case_id: string;
  data: InProgressReviewAnswer;
}

interface SaveReviewAnswersInProgressResponse {
  saved: boolean;
  in_progress_id: string;
}

export async function saveReviewAnswersInProgress(
  client: SupabaseClient<Database>,
  saveData: SaveReviewAnswersInProgressData,
): Promise<FunctionsResponse<SaveReviewAnswersInProgressResponse>> {
  return client.functions.invoke<SaveReviewAnswersInProgressResponse>(
    'set-review-answers-in-progress',
    {
      body: {
        case_id: saveData.case_id,
        data: saveData.data,
      },
    },
  );
}

export const saveReviewAnswersInProgressMutation = (
  client: SupabaseClient<Database>,
) => ({
  mutationFn: async (data: SaveReviewAnswersInProgressData) => {
    const { data: result, error } = await saveReviewAnswersInProgress(
      client,
      data,
    );
    if (error) throw error;
    return result;
  },
});
