import { SupabaseClient } from '@supabase/supabase-js';
import { Database } from '../types/database.types';

interface GetUserCasesOptions {
  withoutOpenDisputes: boolean;
}

const USER_CASES_SELECT = `
      *,
      open_graph_data (*),
      review_answers_in_progress (*),
      case_titles (*),
      case_categories (*),
      case_keywords (*),
      review_aggregations (*)
    `;

export function getUserCases(
  client: SupabaseClient<Database>,
  userId: string,
  options: GetUserCasesOptions,
) {
  if (options.withoutOpenDisputes) {
    return client
      .from('cases_without_open_disputes')
      .select(USER_CASES_SELECT)
      .eq('submitted_by', userId);
  }

  return client
    .from('cases')
    .select(USER_CASES_SELECT)
    .eq('submitted_by', userId);
}

export const userCasesQuery = (
  client: SupabaseClient<Database>,
  userId: string,
  options: GetUserCasesOptions,
) => ({
  queryKey: ['user-cases', userId, options.withoutOpenDisputes],
  queryFn: async () => {
    const { data, error } = await getUserCases(client, userId, options);
    if (error) throw error;
    return data;
  },
});
export type UserCases = Awaited<
  ReturnType<ReturnType<typeof userCasesQuery>['queryFn']>
>;
