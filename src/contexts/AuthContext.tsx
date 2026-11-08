import React, { createContext, useCallback, useContext, useEffect, useState, ReactNode } from 'react';
import { TeamUser } from '../../shared/types';
import { ApiError, apiFetch, setUnauthorizedHandler } from '../lib/api';
import { clearToken, getToken, setToken } from '../lib/storage';

interface AuthContextValue {
  user: TeamUser | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<string | null>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

const ERROR_MESSAGES: Record<string, string> = {
  invalid_credentials: 'Incorrect email or password.',
  account_revoked: 'Access to this account has been revoked. Ask an approver to restore it.',
  too_many_login_attempts: 'Too many attempts. Try again in a few minutes.',
  unauthenticated: 'Your session expired. Sign in again.',
  invalid_token: 'Your session expired. Sign in again.',
  inactive_or_missing: 'Your session is no longer valid. Sign in again.'
};

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<TeamUser | null>(null);
  const [loading, setLoading] = useState(true);

  const logout = useCallback(() => {
    clearToken();
    setUser(null);
  }, []);

  useEffect(() => {
    setUnauthorizedHandler(() => {
      clearToken();
      setUser(null);
    });
  }, []);

  useEffect(() => {
    const token = getToken();
    if (!token) {
      setLoading(false);
      return;
    }
    apiFetch<{ user: TeamUser }>('/api/auth/me')
      .then(({ user: me }) => setUser(me))
      .catch(() => {
        clearToken();
        setUser(null);
      })
      .finally(() => setLoading(false));
  }, []);

  const login = useCallback(
    async (email: string, password: string): Promise<string | null> => {
      try {
        const { token, user: me } = await apiFetch<{ token: string; user: TeamUser }>(
          '/api/auth/login',
          {
            method: 'POST',
            body: JSON.stringify({ email, password })
          }
        );
        setToken(token);
        setUser(me);
        return null;
      } catch (err) {
        if (err instanceof ApiError) {
          return ERROR_MESSAGES[err.code] ?? 'Sign in failed.';
        }
        return 'Sign in failed. Check your connection.';
      }
    },
    []
  );

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
}