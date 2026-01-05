import { TypedSupabaseClient } from '../types/TypedSupabaseClient';

export function getClaims(client: TypedSupabaseClient) {
  return client.auth.getClaims();
}

export const claimsQuery = (client: TypedSupabaseClient) => ({
  queryKey: ['claims'],
  queryFn: async () => {
    const { data, error } = await getClaims(client);
    if (error) throw error;
    return data;
  },
});
