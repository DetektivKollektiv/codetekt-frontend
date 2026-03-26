import { Database } from '@/lib/types/database.types';
import { SupabaseClient } from '@supabase/supabase-js';

export interface SetCaseFactcheckData {
  caseId: string;
  hasFactcheck: boolean;
  value: string | null;
  userId: string;
}

export async function setCaseFactcheck(
  client: SupabaseClient<Database>,
  data: SetCaseFactcheckData,
) {
  return client
    .from('case_factchecks')
    .upsert(
      {
        case_id: data.caseId,
        has_factcheck: data.hasFactcheck,
        value: data.value,
        created_by: data.userId,
        updated_by: data.userId,
      },
      {
        onConflict: 'case_id',
      },
    )
    .select()
    .single();
}

export const setCaseFactcheckMutation = (client: SupabaseClient<Database>) => ({
  mutationFn: async (data: SetCaseFactcheckData) => {
    const { data: result, error } = await setCaseFactcheck(client, data);
    if (error) throw error;
    return result;
  },
});
