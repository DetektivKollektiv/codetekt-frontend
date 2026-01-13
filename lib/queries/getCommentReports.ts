import { SupabaseClient } from '@supabase/supabase-js';
import { Database } from '../types/database.types';

export function getCommentReports(
  client: SupabaseClient<Database>,
  commentId: string
) {
  return client
    .from('case_comment_reports')
    .select('*')
    .eq('comment_id', commentId);
}

export const commentReportsQuery = (
  client: SupabaseClient,
  commentId: string
) => ({
  queryKey: ['comment-reports', commentId],
  queryFn: async () => {
    const { data, error } = await getCommentReports(client, commentId);
    if (error) throw error;
    return data;
  },
});

export type CommentReports = Awaited<
  ReturnType<ReturnType<typeof commentReportsQuery>['queryFn']>
>;
