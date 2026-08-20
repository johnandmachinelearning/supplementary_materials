'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

interface AuthContextType {
  isAuthenticated: boolean;
  user: { email: string; role: string } | null;
  login: (token: string) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType>({
  isAuthenticated: false,
  user: null,
  login: () => {},
  logout: () => {},
});

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [user, setUser] = useState<{ email: string; role: string } | null>(null);

  useEffect(() => {
    // Check localStorage for session token (AWS Cognito / OAuth token)
    const token = localStorage.getItem('devops_auth_token');
    if (token) {
      setIsAuthenticated(true);
      setUser({ email: 'admin@company.com', role: 'DevOps Lead' });
    }
  }, []);

  const login = (token: string) => {
    localStorage.setItem('devops_auth_token', token);
    setIsAuthenticated(true);
    setUser({ email: 'admin@company.com', role: 'DevOps Lead' });
  };

  const logout = () => {
    localStorage.removeItem('devops_auth_token');
    setIsAuthenticated(false);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);