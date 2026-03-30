import React, { createContext, type ReactNode, useContext, useState } from 'react';
import useToken from '../components/logic/UseToken';
import type { Credentials, Token } from '../types/loginTypes';

interface AuthContextType {
    token: string | null
    user: string | null;
    login: (values: Credentials) => void;
    logout: () => void;
    isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { token, setToken, removeToken } = useToken();
  const [user, setUser] = useState(null);

  const login = async (credentials: Credentials) => {
    const response = await fetch('/api/users/login', {
      method: 'POST',
      credentials: 'include', // TODO: set condition to only use in development
      headers: {
          'Content-Type': 'application/json'
      },
      body: JSON.stringify(credentials)
    })

    if (response.status === 401) {
        throw new Error('Invalid username or password')
    } else if (!response.ok) {
        throw new Error
    }

    const data = await response.json() as Token
    setToken(data)
    return data
  };

  const logout = async () => {
    const response = await fetch('/api/users/logout', {
      method: 'DELETE',
      credentials: 'include'
    })

    if (!response.ok) {
      console.error('response', response)
      throw new Error('An error occurred while logging out.')
    } else {
      removeToken();
      setUser(null);
      return
    }
  };

  const value = {
    token,
    user,
    login,
    logout,
    isAuthenticated: !!token
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}