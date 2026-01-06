import { TypedSupabaseClient } from '../types/TypedSupabaseClient';

export function getUser(client: TypedSupabaseClient) {
  return client.auth.getUser();
}

export const userQuery = (client: TypedSupabaseClient) => ({
  queryKey: ['user'],
  queryFn: async () => {
    const { data, error } = await getUser(client);
    if (error) throw error;
    return data;
  },
});
