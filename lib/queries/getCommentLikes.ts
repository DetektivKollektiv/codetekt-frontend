import { SupabaseClient } from '@supabase/supabase-js';
import { Database } from '../types/database.types';

export function getCommentVotes(
  client: SupabaseClient<Database>,
  commentId: string,
) {
  return client
    .from('case_comment_likes')
    .select('user_id, vote_type')
    .eq('comment_id', commentId);
}

export const commentVotesQuery = (
  client: SupabaseClient,
  commentId: string,
) => ({
  queryKey: ['comment-votes', commentId],
  queryFn: async () => {
    const { data, error } = await getCommentVotes(client, commentId);
    if (error) throw error;
    return data;
  },
});

export type CommentVotes = Awaited<
  ReturnType<ReturnType<typeof commentVotesQuery>['queryFn']>
>;
