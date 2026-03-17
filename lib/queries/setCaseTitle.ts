import { Database } from '@/lib/types/database.types';
import { SupabaseClient } from '@supabase/supabase-js';

export interface SetCaseTitleData {
  caseId: string;
  value: string;
  userId: string;
}

export async function setCaseTitle(
  client: SupabaseClient<Database>,
  data: SetCaseTitleData,
) {
  return client
    .from('case_titles')
    .insert({
      case_id: data.caseId,
      value: data.value,
      created_by: data.userId,
    })
    .select()
    .single();
}

export const setCaseTitleMutation = (client: SupabaseClient<Database>) => ({
  mutationFn: async (data: SetCaseTitleData) => {
    const { data: result, error } = await setCaseTitle(client, data);
    if (error) throw error;
    return result;
  },
});
