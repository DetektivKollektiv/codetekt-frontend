import { Database } from '@/lib/types/database.types';
import { SupabaseClient } from '@supabase/supabase-js';

export interface SetCaseKeywordsData {
  caseId: string;
  values: string[];
  userId: string;
}

export async function setCaseKeywords(
  client: SupabaseClient<Database>,
  data: SetCaseKeywordsData,
) {
  return client
    .from('case_keywords')
    .insert({
      case_id: data.caseId,
      values: data.values,
      created_by: data.userId,
    })
    .select()
    .single();
}

export const setCaseKeywordsMutation = (client: SupabaseClient<Database>) => ({
  mutationFn: async (data: SetCaseKeywordsData) => {
    const { data: result, error } = await setCaseKeywords(client, data);
    if (error) throw error;
    return result;
  },
});
