import { Database, Tables } from '@/lib/types/database.types';
import { SupabaseClient } from '@supabase/supabase-js';

export interface UpdateProfileData {
  get_notifications?: boolean;
  tutorial_completed_at?: string | null;
}

export async function updateProfile(
  client: SupabaseClient<Database>,
  userId: string,
  data: UpdateProfileData
) {
  return client.from('profiles').update(data).eq('id', userId).select().single();
}

export const updateProfileMutation = (
  client: SupabaseClient<Database>,
  userId: string
) => ({
  mutationFn: async (data: UpdateProfileData) => {
    const { data: result, error } = await updateProfile(client, userId, data);
    if (error) throw error;
    return result as Tables<'profiles'>;
  },
});
