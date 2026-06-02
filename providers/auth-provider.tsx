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
  initialUser: IUser | null; // <-- Nhận data từ Server truyền xuống
}

export const AuthProvider = ({ children, initialUser }: AuthProviderProps) => {
  const [user, setUser] = useState<IUser | null>(initialUser);
  const [isLoading, setIsLoading] = useState(!initialUser); // Nếu có sẵn user từ server thì ko cần loading

  useEffect(() => {
    // Nếu Server không tìm thấy user (chưa đăng nhập hoặc token hết hạn),
    // nhưng nhỡ đâu interceptor client có thể cứu vãn hoặc cần fetch lại:
    if (!initialUser) {
      const fetchUser = async () => {
        try {
          const response = await api.get(`/auth/me`);
          setUser(response.data.user);
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
    const logout = async () => {
      try {
        setIsLoading(true);

        // 1. Gọi lên Route Handler của Next.js để server xóa cookie httpOnly
        await api.post('/auth/logout');
      } catch (error) {
        console.error('Lỗi khi gọi API logout:', error);
      } finally {
        // 2. Xóa sạch state user ở Client dù API có lỗi hay thành công
        setUser(null);
        setIsLoading(false);

        // 3. Đá user về trang chủ hoặc trang login và xóa sạch bộ nhớ tạm (clear state)
        window.location.href = '/';
      }
    };
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, logout, setUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
