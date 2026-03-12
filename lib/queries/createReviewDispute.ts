import { Database } from '@/lib/types/database.types';
import { SupabaseClient } from '@supabase/supabase-js';

export async function createReviewDispute(
  client: SupabaseClient<Database>,
  caseId: string,
  fieldId: string,
  userId: string,
  originalValue: string,
  reason: string,
) {
  return client
    .from('cases_metadata_disputes')
    .insert({
      case_id: caseId,
      metadata_field: fieldId,
      disputed_by: userId,
      original_value: originalValue,
      reason: reason,
    })
    .select()
    .single();
}

export const createReviewDisputeMutation = (
  client: SupabaseClient<Database>,
  userId: string,
) => ({
  mutationFn: async ({
    caseId,
    fieldId,
    originalValue,
    reason,
  }: {
    caseId: string;
    fieldId: string;
    originalValue: string;
    reason: string;
  }) => {
    const { data, error } = await createReviewDispute(
      client,
      caseId,
      fieldId,
      userId,
      originalValue,
      reason,
    );
    if (error) throw error;
    return data;
  },
});
