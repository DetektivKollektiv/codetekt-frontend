'use client';
import { getClaims } from '@/lib/queries/getClaims';
import { getProfile } from '@/lib/queries/getProfile';
import { getUser } from '@/lib/queries/getUser';
import { createClient } from '@/lib/supabase/client';
import { Tables } from '@/lib/types/database.types';
import { JwtPayload, User } from '@supabase/supabase-js';
import {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useState,
} from 'react';

type AuthContextType = {
  profile: Tables<'profiles'> | null;
  claims: JwtPayload | null;
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
};

const AuthContext = createContext<AuthContextType>({
  profile: null,
  claims: null,
  user: null,
  isLoading: true,
  isAuthenticated: false,
});

export const useAuth = () => useContext(AuthContext);

export function AuthProvider({
  children,
  initialUser,
  initialProfile,
  initialClaims,
}: {
  children: ReactNode;
  initialUser: User | null;
  initialProfile?: Tables<'profiles'> | null;
  initialClaims?: JwtPayload | null;
}) {
  const client = createClient();

  const [user, setUser] = useState<User | null>(initialUser ?? null);

  const [profile, setProfile] = useState<Tables<'profiles'> | null>(
    initialProfile ?? null
  );
  const [claims, setClaims] = useState<JwtPayload | null>(
    initialClaims ?? null
  );
  const [isLoading, setIsLoading] = useState(false);

  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(
    initialUser !== null
  );

  useEffect(() => {
    setProfile(initialProfile ?? null);
    setClaims(initialClaims ?? null);
    setUser(initialUser ?? null);
    setIsAuthenticated(initialUser !== null);

    setIsLoading(false);

    const updateClaimsAndUser = async () => {
      const [claimsResult, userResult] = await Promise.allSettled([
        getClaims(client),
        getUser(client),
      ]);

      const claims =
        claimsResult.status === 'fulfilled'
          ? claimsResult.value.data?.claims || null
          : null;
      setClaims(claims);

      const user =
        userResult.status === 'fulfilled'
          ? userResult.value.data?.user || null
          : null;
      setUser(user);

      if (claims?.sub) {
        try {
          const profile = await getProfile(client, claims.sub);
          setProfile(profile.data);
          setIsAuthenticated(true);
        } catch (error) {
          console.error('AuthProvider - Failed to load profile:', error);
          setProfile(null);
          setIsAuthenticated(!!claims.sub);
        }
      } else {
        setProfile(null);
        setIsAuthenticated(false);
        console.warn('AuthProvider - No valid user session found.');
      }
    };

    const {
      data: { subscription },
    } = client.auth.onAuthStateChange((event, session) => {
      if (event === 'INITIAL_SESSION' && initialUser && initialProfile) {
        // we trust the initial data from the server, no need to update
        return;
      }

      if (event === 'SIGNED_OUT') {
        setProfile(null);
        setClaims(null);
        setUser(null);
        setIsAuthenticated(false);
        return;
      }

      updateClaimsAndUser();
    });

    return () => subscription.unsubscribe();
  }, [initialProfile, initialClaims]);

  return (
    <AuthContext.Provider
      value={{ profile, claims, user, isLoading, isAuthenticated }}
    >
      {children}
    </AuthContext.Provider>
  );
}
