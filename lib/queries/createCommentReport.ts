import { createCommentReportSchema } from '@/lib/schemas/comment-schemas';
import { Database } from '@/lib/types/database.types';
import { SupabaseClient } from '@supabase/supabase-js';

export async function createCommentReport(
  client: SupabaseClient<Database>,
  commentId: string,
  userId: string,
  reason: string,
) {
  const validation = createCommentReportSchema.safeParse({
    commentId,
    reason,
  });

  if (!validation.success) {
    throw new Error(
      validation.error.issues[0]?.message ?? 'Fehlerhafte Eingabe.',
    );
  }

  return client
    .from('case_comment_reports')
    .insert({
      comment_id: validation.data.commentId,
      reported_by: userId,
      reason: validation.data.reason,
    })
    .select()
    .single();
}

export const createCommentReportMutation = (
  client: SupabaseClient<Database>,
  userId: string,
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
      reason,
    );
    if (error) throw error;
    return data;
  },
});
