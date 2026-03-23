import { SupabaseClient } from '@supabase/supabase-js';
import { Database } from '../types/database.types';

type CommentWithVoteStats =
  Database['public']['Tables']['case_comments']['Row'] & {
    profiles: {
      username: string | null;
    } | null;
    case_comment_likes?: {
      vote_type: 'up' | 'down';
    }[];
    upvote_count: number;
    downvote_count: number;
    score: number;
  };

export async function getCaseComments(
  client: SupabaseClient<Database>,
  caseId: string,
) {
  const response = await client
    .from('case_comments')
    .select(
      `
      *,
      profiles (
        username
      ),
      case_comment_likes (
        vote_type
      )
    `,
    )
    .eq('case_id', caseId);

  if (response.error || !response.data) {
    return response;
  }

  const sortedComments = response.data
    .map((comment) => {
      const upvoteCount =
        comment.case_comment_likes?.filter((vote) => vote.vote_type === 'up')
          .length ?? 0;
      const downvoteCount =
        comment.case_comment_likes?.filter((vote) => vote.vote_type === 'down')
          .length ?? 0;

      return {
        ...comment,
        upvote_count: upvoteCount,
        downvote_count: downvoteCount,
        score: upvoteCount - downvoteCount,
      };
    })
    .sort((left, right) => {
      if (right.score !== left.score) {
        return right.score - left.score;
      }

      return (
        new Date(right.created_at).getTime() -
        new Date(left.created_at).getTime()
      );
    }) as CommentWithVoteStats[];

  return {
    data: sortedComments,
    error: null,
  };
}

export const caseCommentsQuery = (client: SupabaseClient, caseId: string) => ({
  queryKey: ['case-comments', caseId],
  queryFn: async () => {
    const { data, error } = await getCaseComments(client, caseId);
    if (error) throw error;
    return data;
  },
});

export type CaseComments = Awaited<
  ReturnType<ReturnType<typeof caseCommentsQuery>['queryFn']>
>;
