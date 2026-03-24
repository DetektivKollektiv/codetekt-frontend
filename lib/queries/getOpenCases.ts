import { SupabaseClient } from '@supabase/supabase-js';
import { Database } from '../types/database.types';

export function getOpenCases(client: SupabaseClient<Database>) {
  return client.from('cases_without_open_disputes').select(
    `
      *,
      open_graph_data (*),
      case_titles (*),
      review_aggregations (case_id)
    `,
  );
}

export const hasReviewAggregation = (openCase: {
  review_aggregations: unknown;
}) => {
  if (Array.isArray(openCase.review_aggregations)) {
    return openCase.review_aggregations.length > 0;
  }

  return openCase.review_aggregations !== null;
};

export const filterUnaggregatedOpenCases = <T extends {
  review_aggregations: unknown;
}>(openCases: T[] | null | undefined): T[] => {
  return (openCases ?? []).filter((openCase) => !hasReviewAggregation(openCase));
};

export const openCasesQuery = (client: SupabaseClient) => ({
  queryKey: ['open-cases'],
  queryFn: async () => {
    const { data, error } = await getOpenCases(client);
    if (error) throw error;
    return filterUnaggregatedOpenCases(data);
  },
});

export type OpenCases = Awaited<
  ReturnType<ReturnType<typeof openCasesQuery>['queryFn']>
>;
