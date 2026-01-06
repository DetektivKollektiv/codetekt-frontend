'use client';
import { createClient } from '@/lib/supabase/client';
import { useQueryClient } from '@tanstack/react-query';

const SubscribeToAuth = ({ children }: { children: React.ReactNode }) => {
  const client = createClient(); // <- deine Supabase Client Erzeugung
  const queryClient = useQueryClient();

  const { data: subscription } = client.auth.onAuthStateChange((event) => {
    // 1) Profil neu laden (oder leeren)
    queryClient.invalidateQueries({ queryKey: ['profile'] });

    // 2) Optional: alle "user-abhängigen" Queries bei Logout hart löschen
    if (event === 'SIGNED_OUT') {
      queryClient.removeQueries({ queryKey: ['profile'] });
      // falls du noch mehr user-spezifische keys hast:
      // queryClient.removeQueries({ predicate: q => q.queryKey[0]?.toString().startsWith('user-') })
    }

    // 3) Optional: bei Login zusätzlich aggressiver refreshen
    if (event === 'SIGNED_IN') {
      queryClient.invalidateQueries(); // oder gezielt nur user-bezogene
    }
  });

  return children;
};

export default SubscribeToAuth;
