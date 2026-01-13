import { Database } from '@/lib/types/database.types';
import { SupabaseClient } from '@supabase/supabase-js';

export async function createCommentReport(
  client: SupabaseClient<Database>,
  commentId: string,
  userId: string,
  reason: string
) {
  return client
    .from('case_comment_reports')
    .insert({
      comment_id: commentId,
      reported_by: userId,
      reason: reason,
    })
    .select()
    .single();
}

export const createCommentReportMutation = (
  client: SupabaseClient<Database>,
  userId: string
) => ({
  mutationFn: async ({
    commentId,
    reason,
  }: {
    commentId: string;
    reason: string;
  }) => {
    const { data, error } = await createCommentReport(
      client,
      commentId,
      userId,
      reason
    );
    if (error) throw error;
    return data;
  },
});
