import { SupabaseClient } from '@supabase/supabase-js';
import { Database } from '../types/database.types';

export function getCommentLikes(
  client: SupabaseClient<Database>,
  commentId: string
) {
  return client
    .from('case_comment_likes')
    .select('*')
    .eq('comment_id', commentId);
}

export const commentLikesQuery = (
  client: SupabaseClient,
  commentId: string
) => ({
  queryKey: ['comment-likes', commentId],
  queryFn: async () => {
    const { data, error } = await getCommentLikes(client, commentId);
    if (error) throw error;
    return data;
  },
});

export type CommentLikes = Awaited<
  ReturnType<ReturnType<typeof commentLikesQuery>['queryFn']>
>;
