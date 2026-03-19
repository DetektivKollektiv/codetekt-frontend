import { Database } from '@/lib/types/database.types';
import { SupabaseClient } from '@supabase/supabase-js';
import { CaseCategoryValue } from '../schemas/case-metadata-schemas';

export interface SetCaseCategoryData {
  caseId: string;
  value: CaseCategoryValue;
  userId: string;
}

export async function setCaseCategory(
  client: SupabaseClient<Database>,
  data: SetCaseCategoryData,
) {
  return client
    .from('case_categories')
    .insert({
      case_id: data.caseId,
      value: data.value,
      created_by: data.userId,
    })
    .select()
    .single();
}

export const setCaseCategoryMutation = (client: SupabaseClient<Database>) => ({
  mutationFn: async (data: SetCaseCategoryData) => {
    const { data: result, error } = await setCaseCategory(client, data);
    if (error) throw error;
    return result;
  },
});
