import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import type { User } from 'firebase/auth';
import type { AdminUser } from '@/types';
import { watchAuthState, fetchAdminProfile } from '@/services/auth';

interface AuthContextValue {
  user: User | null;
  admin: AdminUser | null;
  loading: boolean;
}

const AuthContext = createContext<AuthContextValue>({ user: null, admin: null, loading: true });

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [admin, setAdmin] = useState<AdminUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsub = watchAuthState(async (u) => {
      setUser(u);
      if (u) {
        try {
          const profile = await fetchAdminProfile(u.uid);
          setAdmin(profile);
        } catch (err) {
          console.error('Failed to load admin profile', err);
          setAdmin(null);
        }
      } else {
        setAdmin(null);
      }
      setLoading(false);
    });
    return unsub;
  }, []);

  return <AuthContext.Provider value={{ user, admin, loading }}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}
