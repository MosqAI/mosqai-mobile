import { useQueryClient } from '@tanstack/react-query';
import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { api, configureTokens } from './api';
import { getItem, removeItem, setItem } from './storage';
import type { Session, User } from './types';

const KEY = 'mosqai.session';

type Status = 'restoring' | 'signedOut' | 'signedIn';

interface AuthContextValue {
  status: Status;
  user: User | null;
  signIn(email: string, password: string): Promise<void>;
  signUp(input: { name: string; email: string; phone?: string; password: string; language?: string }): Promise<void>;
  signOut(): Promise<void>;
  setUser(user: User): void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const queryClient = useQueryClient();
  const [session, setSession] = useState<Session | null>(null);
  const [status, setStatus] = useState<Status>('restoring');
  const sessionRef = useRef<Session | null>(null);

  const persist = useCallback(
    (next: Session | null) => {
      sessionRef.current = next;
      setSession(next);
      setStatus(next ? 'signedIn' : 'signedOut');
      if (next) void setItem(KEY, JSON.stringify(next));
      else {
        void removeItem(KEY);
        queryClient.clear();
      }
    },
    [queryClient],
  );

  useEffect(() => {
    configureTokens({ get: () => sessionRef.current, set: persist });
    getItem(KEY)
      .then((raw) => persist(raw ? (JSON.parse(raw) as Session) : null))
      .catch(() => persist(null));
  }, [persist]);

  const value = useMemo<AuthContextValue>(
    () => ({
      status,
      user: session?.user ?? null,
      signIn: async (email, password) => persist(await api<Session>('/auth/login', { method: 'POST', json: { email, password } })),
      signUp: async (input) => persist(await api<Session>('/auth/register', { method: 'POST', json: input })),
      signOut: async () => {
        const refreshToken = sessionRef.current?.refreshToken;
        persist(null);
        if (refreshToken) await api('/auth/logout', { method: 'POST', json: { refreshToken } }).catch(() => {});
      },
      setUser: (user) => sessionRef.current && persist({ ...sessionRef.current, user }),
    }),
    [status, session, persist],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
}
