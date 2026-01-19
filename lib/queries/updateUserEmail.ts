import { Database } from '@/lib/types/database.types';
import { SupabaseClient } from '@supabase/supabase-js';

export interface UpdateUserEmailData {
  email: string;
}

export async function updateUserEmail(
  client: SupabaseClient<Database>,
  email: string
) {
  return client.auth.updateUser({
    email,
  });
}

export const updateUserEmailMutation = (client: SupabaseClient<Database>) => ({
  mutationFn: async (data: UpdateUserEmailData) => {
    const { data: result, error } = await updateUserEmail(client, data.email);

    if (error) throw error;
    return result;
  },
});
