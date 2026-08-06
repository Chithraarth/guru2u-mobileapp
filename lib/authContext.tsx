import React, { createContext, useContext, useEffect, useState } from 'react';
import type { User } from 'firebase/auth';
import { watchAuthState } from '@/lib/firebase';

interface AuthContextValue {
  user: User | null;
  isSignedIn: boolean;
  isLoaded: boolean;
}

const AuthContext = createContext<AuthContextValue>({ user: null, isSignedIn: false, isLoaded: false });

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const unsubscribe = watchAuthState((u) => {
      setUser(u);
      setIsLoaded(true);
    });
    return unsubscribe;
  }, []);

  return (
    <AuthContext.Provider value={{ user, isSignedIn: !!user, isLoaded }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  return useContext(AuthContext);
}
