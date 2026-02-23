import { SupabaseClient } from '@supabase/supabase-js';
import { Database } from '../types/database.types';

export function getLeaderboard(
  client: SupabaseClient<Database>,
  limitCount?: number,
) {
  return client.rpc('get_user_leaderboard', {
    limit_count: limitCount,
  });
}

export type Leaderboard = NonNullable<
  Awaited<ReturnType<typeof getLeaderboard>>['data']
>;
