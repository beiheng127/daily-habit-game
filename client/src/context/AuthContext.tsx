import React, { createContext, useState, useContext, useEffect, useCallback, ReactNode } from 'react';
import { User } from '../types';
import { userApi } from '../services/api';

interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (token: string, user: User) => void;
  logout: () => void;
  isAuthenticated: boolean;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  token: null,
  login: () => { },
  logout: () => { },
  isAuthenticated: false,
  refreshUser: async () => { }
});

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(() => {
    const stored = localStorage.getItem('user');
    return stored ? JSON.parse(stored) : null;
  });
  const [token, setToken] = useState<string | null>(() => {
    return localStorage.getItem('token');
  });

  const login = (newToken: string, newUser: User) => {
    setToken(newToken);
    setUser(newUser);
    localStorage.setItem('token', newToken);
    localStorage.setItem('user', JSON.stringify(newUser));
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  };

  const refreshUser = useCallback(async () => {
    if (!token) return;
    try {
      const res = await userApi.getProfile();
      const freshUser = res.data;
      setUser(freshUser);
      localStorage.setItem('user', JSON.stringify(freshUser));
    } catch {
      logout();
    }
  }, [token]);

  useEffect(() => {
    if (token && user) {
      refreshUser();
    }
  }, [token]);

  return (
    <AuthContext.Provider value={{ user, token, login, logout, isAuthenticated: !!token, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);

export default AuthContext;
