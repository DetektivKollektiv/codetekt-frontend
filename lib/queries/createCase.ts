import { CaseInsertData } from '@/lib/schemas/case-schemas';
import { Database } from '@/lib/types/database.types';
import { SupabaseClient } from '@supabase/supabase-js';

export async function createCase(
  client: SupabaseClient<Database>,
  data: CaseInsertData
) {
  return client
    .from('cases')
    .insert(data)
    .select('id, submitted_at, content, content_type')
    .single();
}

export const createCaseMutation = (client: SupabaseClient<Database>) => ({
  mutationFn: async (data: CaseInsertData) => {
    const { data: result, error } = await createCase(client, data);
    if (error) throw error;
    return result;
  },
});
