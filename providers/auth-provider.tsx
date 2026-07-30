'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { IUser } from '@/interface/IUser';
import api from '@/lib/axios';

interface AuthContextType {
  user: IUser | null;
  isLoading: boolean;
  logout: () => void;
  setUser: React.Dispatch<React.SetStateAction<IUser | null>>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  isLoading: true,
  logout: () => {},
  setUser: () => {},
});

interface AuthProviderProps {
  children: React.ReactNode;
  initialUser: IUser | null;
}

export const AuthProvider = ({ children, initialUser }: AuthProviderProps) => {
  const [user, setUser] = useState<IUser | null>(initialUser);
  const [isLoading, setIsLoading] = useState(!initialUser);

  useEffect(() => {
    if (!initialUser) {
      const fetchUser = async () => {
        try {
          const response = await api.get(`/auth/me`);
          if (response.data && response.data.user) {
            setUser(response.data.user);
          }
        } catch (error) {
          setUser(null);
        } finally {
          setIsLoading(false);
        }
      };
      fetchUser();
    }
  }, [initialUser]);

  const logout = async () => {
    try {
      setIsLoading(true);

      await api.post('/auth/logout');
    } catch (error) {
      console.error('Lỗi khi gọi API logout:', error);
    } finally {
      setUser(null);
      setIsLoading(false);

      window.location.href = '/';
    }
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, logout, setUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
