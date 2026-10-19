import React, { createContext, useContext, useState, useEffect } from 'react';
import { IUser } from '../types';
import { api } from '../services/api';

interface AuthContextType {
  user: IUser | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  demoLogin: () => Promise<void>;
  logout: () => void;
  updateProfile: (data: Partial<IUser>) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<IUser | null>(null);
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('auth_token'));
  const [isLoading, setIsLoading] = useState(true);

  const initAuth = async () => {
    const savedToken = localStorage.getItem('auth_token');

    if (savedToken) {
      try {
        const profile = await api.auth.getProfile();
        setUser(profile);
      } catch (err) {
        console.warn('Session expired or invalid token');
        localStorage.removeItem('auth_token');
        setToken(null);
        setUser(null);
      }
    }
    setIsLoading(false);
  };

  useEffect(() => {
    initAuth();
    const syncSession = (event: StorageEvent) => {
      if (event.key !== 'auth_token') return;
      if (!event.newValue) {
        setToken(null);
        setUser(null);
        setIsLoading(false);
      } else if (event.newValue !== event.oldValue) {
        setToken(event.newValue);
        setIsLoading(true);
        api.auth.getProfile().then(profile => {
          if (localStorage.getItem('auth_token') === event.newValue) setUser(profile);
        }).catch(() => {
          if (localStorage.getItem('auth_token') === event.newValue) {
            localStorage.removeItem('auth_token');
            setToken(null);
            setUser(null);
          }
        }).finally(() => setIsLoading(false));
      }
    };
    const onSessionExpired = () => {
      localStorage.removeItem('auth_token');
      setToken(null);
      setUser(null);
      setIsLoading(false);
    };
    window.addEventListener('storage', syncSession);
    window.addEventListener('fintrack:session-expired', onSessionExpired);
    return () => {
      window.removeEventListener('storage', syncSession);
      window.removeEventListener('fintrack:session-expired', onSessionExpired);
    };
  }, []);

  const login = async (email: string, password: string) => {
    const res = await api.auth.login({ email, password });
    localStorage.removeItem('fintrack_logged_out');
    localStorage.setItem('auth_token', res.token);
    setToken(res.token);
    setUser(res.user);
  };

  const register = async (name: string, email: string, password: string) => {
    const res = await api.auth.register({ name, email, password });
    localStorage.removeItem('fintrack_logged_out');
    localStorage.setItem('auth_token', res.token);
    setToken(res.token);
    setUser(res.user);
  };

  const demoLogin = async () => {
    const res = await api.auth.demoLogin();
    localStorage.removeItem('fintrack_logged_out');
    localStorage.setItem('auth_token', res.token);
    setToken(res.token);
    setUser(res.user);
  };

  const logout = () => {
    localStorage.removeItem('auth_token');
    localStorage.setItem('fintrack_logged_out', 'true');
    setToken(null);
    setUser(null);
  };

  const updateProfile = async (data: Partial<IUser>) => {
    const updated = await api.auth.updateProfile(data);
    setUser(updated);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!user,
        isLoading,
        login,
        register,
        demoLogin,
        logout,
        updateProfile
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
