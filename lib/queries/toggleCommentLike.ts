import { Database } from '@/lib/types/database.types';
import { SupabaseClient } from '@supabase/supabase-js';

export type VoteDirection = 'up' | 'down';

export async function addCommentVote(
  client: SupabaseClient<Database>,
  commentId: string,
  userId: string,
  voteType: VoteDirection,
) {
  return client
    .from('case_comment_likes')
    .insert({
      comment_id: commentId,
      user_id: userId,
      vote_type: voteType,
    })
    .select()
    .single();
}

export async function removeCommentVote(
  client: SupabaseClient<Database>,
  commentId: string,
  userId: string,
) {
  return client
    .from('case_comment_likes')
    .delete()
    .eq('comment_id', commentId)
    .eq('user_id', userId);
}

export async function updateCommentVote(
  client: SupabaseClient<Database>,
  commentId: string,
  userId: string,
  voteType: VoteDirection,
) {
  return client
    .from('case_comment_likes')
    .update({ vote_type: voteType })
    .eq('comment_id', commentId)
    .eq('user_id', userId)
    .select()
    .single();
}

export async function getMyCommentVote(
  client: SupabaseClient<Database>,
  commentId: string,
  userId: string,
) {
  return client
    .from('case_comment_likes')
    .select('vote_type')
    .eq('comment_id', commentId)
    .eq('user_id', userId)
    .maybeSingle();
}

export const toggleCommentVoteMutation = (
  client: SupabaseClient<Database>,
  userId: string,
) => ({
  mutationFn: async ({
    commentId,
    direction,
  }: {
    commentId: string;
    direction: VoteDirection;
  }) => {
    const { data: existingVote, error: existingVoteError } =
      await getMyCommentVote(client, commentId, userId);

    if (existingVoteError) throw existingVoteError;

    if (existingVote?.vote_type === direction) {
      const { error } = await removeCommentVote(client, commentId, userId);
      if (error) throw error;
      return { action: 'removed' as const };
    }

    if (!existingVote) {
      const { data, error } = await addCommentVote(
        client,
        commentId,
        userId,
        direction,
      );
      if (error) throw error;
      return { action: 'added' as const, data };
    }

    const { data, error } = await updateCommentVote(
      client,
      commentId,
      userId,
      direction,
    );
    if (error) throw error;
    return { action: 'updated' as const, data };
  },
});
