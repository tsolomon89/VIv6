import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from './api';
import type { AuthUser, AuthAccount } from './api';

interface AuthContextType {
  user: AuthUser | null;
  accounts: AuthAccount[];
  activeAccountId: string | null;
  setActiveAccountId: (id: string) => void;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  error: string | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [accounts, setAccounts] = useState<AuthAccount[]>([]);
  const [activeAccountId, setActiveAccountId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // On mount, check for existing token and validate
  useEffect(() => {
    async function validateSession() {
      const token = localStorage.getItem('vi_auth_token');
      if (!token) {
        setIsLoading(false);
        return;
      }

      try {
        const response = await api.me();
        setUser(response.user);
        setAccounts(response.accounts);

        // Restore active account from localStorage or use first available
        const savedAccountId = localStorage.getItem('vi_active_account');
        if (savedAccountId && response.accounts.find(a => a.id === savedAccountId)) {
          setActiveAccountId(savedAccountId);
        } else if (response.accounts.length > 0) {
          setActiveAccountId(response.accounts[0].id);
        }
      } catch (err) {
        // Token invalid or expired - clear it
        console.error('Session validation failed:', err);
        localStorage.removeItem('vi_auth_token');
        localStorage.removeItem('vi_active_account');
      } finally {
        setIsLoading(false);
      }
    }

    validateSession();
  }, []);

  const login = async (email: string, password: string) => {
    setError(null);
    try {
      const response = await api.login(email, password);

      // Store token
      localStorage.setItem('vi_auth_token', response.token);

      // Set user state
      setUser(response.user);
      setAccounts(response.accounts);

      // Set active account to first available
      if (response.accounts.length > 0) {
        const accountId = response.accounts[0].id;
        setActiveAccountId(accountId);
        localStorage.setItem('vi_active_account', accountId);
      }
    } catch (err: any) {
      const message = err.error || 'Login failed';
      setError(message);
      throw err;
    }
  };

  const logout = () => {
    localStorage.removeItem('vi_auth_token');
    localStorage.removeItem('vi_active_account');
    setUser(null);
    setAccounts([]);
    setActiveAccountId(null);
    setError(null);
  };

  const setAccount = (id: string) => {
    setActiveAccountId(id);
    localStorage.setItem('vi_active_account', id);
  };

  const value: AuthContextType = {
    user,
    accounts,
    activeAccountId,
    setActiveAccountId: setAccount,
    isAuthenticated: user !== null,
    isLoading,
    login,
    logout,
    error,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
