import { Database } from '@/lib/types/database.types';
import { FunctionsResponse } from '@supabase/functions-js';
import { SupabaseClient } from '@supabase/supabase-js';

export interface DeactivateAccountData {
  confirmation: 'DEAKTIVIEREN';
}

interface DeactivateAccountResponse {
  deactivated: boolean;
}

export async function deactivateAccount(
  client: SupabaseClient<Database>,
  data: DeactivateAccountData,
): Promise<FunctionsResponse<DeactivateAccountResponse>> {
  const {
    data: { session },
  } = await client.auth.getSession();

  if (!session?.access_token) {
    throw new Error('Nicht authentifiziert. Bitte melde dich erneut an.');
  }

  return client.functions.invoke<DeactivateAccountResponse>(
    'deactivate-account',
    {
      headers: {
        Authorization: `Bearer ${session.access_token}`,
      },
      body: {
        confirmation: data.confirmation,
      },
    },
  );
}

export const deactivateAccountMutation = (
  client: SupabaseClient<Database>,
) => ({
  mutationFn: async (data: DeactivateAccountData) => {
    const { data: result, error } = await deactivateAccount(client, data);
    if (error) throw error;
    return result;
  },
});
