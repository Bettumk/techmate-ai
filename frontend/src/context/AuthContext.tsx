import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, UserProfile } from '../types';
import { api } from '../services/api';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (data: { email: string; password: string }) => Promise<void>;
  register: (data: { email: string; password: string; full_name: string }) => Promise<void>;
  demoLogin: () => Promise<void>;
  googleLogin: (data: { credential?: string; email?: string; full_name?: string }) => Promise<void>;
  logout: () => void;
  updateProfile: (profile: UserProfile) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    const initAuth = async () => {
      const token = localStorage.getItem('techmate_token');
      if (token) {
        try {
          const userData = await api.getMe();
          setUser(userData);
        } catch {
          api.clearToken();
          setUser(null);
        }
      }
      setIsLoading(false);
    };

    initAuth();
  }, []);

  const login = async (data: { email: string; password: string }) => {
    const res = await api.login(data);
    setUser(res.user);
  };

  const register = async (data: { email: string; password: string; full_name: string }) => {
    const res = await api.register(data);
    setUser(res.user);
  };

  const demoLogin = async () => {
    const res = await api.demoLogin();
    setUser(res.user);
  };

  const googleLogin = async (data: { credential?: string; email?: string; full_name?: string }) => {
    const res = await api.googleLogin(data);
    setUser(res.user);
  };

  const logout = () => {
    api.clearToken();
    setUser(null);
  };

  const updateProfile = async (profile: UserProfile) => {
    const updated = await api.updateProfile(profile);
    if (user) {
      setUser({ ...user, profile: updated });
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        login,
        register,
        demoLogin,
        googleLogin,
        logout,
        updateProfile,
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
