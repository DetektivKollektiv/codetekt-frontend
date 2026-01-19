import { InProgressReviewAnswer } from '@/lib/schemas/review-schemas';
import { Database } from '@/lib/types/database.types';
import { SupabaseClient } from '@supabase/supabase-js';

export interface SaveReviewAnswersInProgressData {
  case_id: string;
  reviewed_by: string;
  data: InProgressReviewAnswer;
}

export async function saveReviewAnswersInProgress(
  client: SupabaseClient<Database>,
  saveData: SaveReviewAnswersInProgressData
) {
  // Use upsert to create or update the in-progress review
  return client
    .from('review_answers_in_progress')
    .upsert(
      {
        case_id: saveData.case_id,
        reviewed_by: saveData.reviewed_by,
        data: saveData.data,
        has_unpublished_changes: true,
      },
      {
        onConflict: 'case_id,reviewed_by',
      }
    )
    .select('id, updated_at')
    .single();
}

export const saveReviewAnswersInProgressMutation = (
  client: SupabaseClient<Database>
) => ({
  mutationFn: async (data: SaveReviewAnswersInProgressData) => {
    const { data: result, error } = await saveReviewAnswersInProgress(
      client,
      data
    );
    if (error) throw error;
    return result;
  },
});
