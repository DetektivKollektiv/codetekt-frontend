import { SupabaseClient } from '@supabase/supabase-js';
import { Database } from '../types/database.types';

export function getCommentModeration(
  client: SupabaseClient<Database>,
  commentId: string
) {
  return client
    .from('case_comment_moderations')
    .select('*')
    .eq('comment_id', commentId)
    .maybeSingle();
}

export const commentModerationQuery = (
  client: SupabaseClient,
  commentId: string
) => ({
  queryKey: ['comment-moderation', commentId],
  queryFn: async () => {
    const { data, error } = await getCommentModeration(client, commentId);
    if (error) throw error;
    return data;
  },
});

export type CommentModeration = Awaited<
  ReturnType<ReturnType<typeof commentModerationQuery>['queryFn']>
>;
