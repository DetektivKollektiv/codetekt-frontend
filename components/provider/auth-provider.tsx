'use client';

import { createClient } from '@/lib/supabase/client';
import { getAuth } from '@/lib/supabase/getAuth';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';

export type AuthQueryData = Awaited<ReturnType<typeof getAuth>>;

const signedOutAuth: AuthQueryData = {
  claims: undefined,
  profile: null,
  user: null,
  isAuthenticated: false,
};

type AuthContextValue = {
  auth: AuthQueryData;
  client: ReturnType<typeof createClient>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({
  children,
  initialAuth,
}: {
  children: ReactNode;
  initialAuth: AuthQueryData;
}) {
  const [client] = useState(() => createClient());
  const queryClient = useQueryClient();
  const lastUserIdRef = useRef(initialAuth.user?.id ?? null);

  const { data: auth } = useQuery<AuthQueryData>({
    queryFn: () => getAuth(client),
    queryKey: ['auth'],
    initialData: initialAuth,
  });

  useEffect(() => {
    const { data } = client.auth.onAuthStateChange((event, session) => {
      if (event === 'INITIAL_SESSION') {
        lastUserIdRef.current = session?.user?.id ?? lastUserIdRef.current;
        return;
      }

      const nextUserId = session?.user?.id ?? null;
      const previousUserId = lastUserIdRef.current;
      lastUserIdRef.current = nextUserId;

      if (event === 'SIGNED_OUT' || !nextUserId) {
        queryClient.setQueryData(['auth'], signedOutAuth);
        queryClient.removeQueries({ queryKey: ['profile'] });
        return;
      }

      if (previousUserId && previousUserId !== nextUserId) {
        queryClient.removeQueries({ queryKey: ['profile'] });
      }

      queryClient.invalidateQueries({ queryKey: ['auth'] });
    });

    return () => data.subscription.unsubscribe();
  }, [client.auth, queryClient]);

  const value = useMemo<AuthContextValue>(
    () => ({
      auth,
      client,
    }),
    [auth, client],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }

  return context;
}
