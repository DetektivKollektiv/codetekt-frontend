import { FunctionsResponse } from '@supabase/functions-js';
import { SupabaseClient } from '@supabase/supabase-js';
import { ReviewTemplateData } from '../schemas';
import { Database } from '../types/database.types';

export async function getReviewTemplate(
  client: SupabaseClient<Database>,
  caseId: string
): Promise<FunctionsResponse<ReviewTemplateData[]>> {
  return client.functions.invoke<ReviewTemplateData[]>('get-review-template', {
    body: { case_id: caseId },
  });
}

export const reviewTemplateQuery = (
  client: SupabaseClient<Database>,
  caseId: string
) => ({
  queryKey: ['reviewTemplate', caseId],
  queryFn: async () => {
    const { data, error } = await getReviewTemplate(client, caseId);
    if (error) throw error;
    return data;
  },
});

export type ReviewTemplate = Awaited<
  ReturnType<ReturnType<typeof reviewTemplateQuery>['queryFn']>
>;
