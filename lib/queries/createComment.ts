import { CommentInsertData } from '@/lib/schemas/comment-schemas';
import { Database } from '@/lib/types/database.types';
import { SupabaseClient } from '@supabase/supabase-js';

export async function createComment(
  client: SupabaseClient<Database>,
  data: CommentInsertData
) {
  return client
    .from('case_comments')
    .insert(data)
    .select('id, created_at, content')
    .single();
}

export const createCommentMutation = (client: SupabaseClient<Database>) => ({
  mutationFn: async (data: CommentInsertData) => {
    const { data: result, error } = await createComment(client, data);
    if (error) throw error;
    return result;
  },
});
