import { Database } from '@/lib/types/database.types';
import { SupabaseClient } from '@supabase/supabase-js';

export async function addCommentLike(
  client: SupabaseClient<Database>,
  commentId: string,
  userId: string
) {
  return client
    .from('case_comment_likes')
    .insert({
      comment_id: commentId,
      user_id: userId,
    })
    .select()
    .single();
}

export async function removeCommentLike(
  client: SupabaseClient<Database>,
  commentId: string,
  userId: string
) {
  return client
    .from('case_comment_likes')
    .delete()
    .eq('comment_id', commentId)
    .eq('user_id', userId);
}

export const toggleCommentLikeMutation = (
  client: SupabaseClient<Database>,
  userId: string
) => ({
  mutationFn: async ({
    commentId,
    isLiked,
  }: {
    commentId: string;
    isLiked: boolean;
  }) => {
    if (isLiked) {
      // Remove like
      const { error } = await removeCommentLike(client, commentId, userId);
      if (error) throw error;
      return { action: 'removed' as const };
    } else {
      // Add like
      const { data, error } = await addCommentLike(client, commentId, userId);
      if (error) throw error;
      return { action: 'added' as const, data };
    }
  },
});
