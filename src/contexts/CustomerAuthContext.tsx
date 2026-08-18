'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { apiFetch } from '@/lib/api';

export interface CustomerUser {
  id: string;
  name: string;
  email: string;
  phone?: string;
  role: string;
}

export interface PendingAction {
  type: 'ADD_TO_CART' | 'BUY_NOW' | 'CUSTOM';
  product?: any;
  quantity?: number;
  variant?: any;
  callback?: () => void;
}

interface CustomerAuthContextType {
  user: CustomerUser | null;
  token: string | null;
  isLoading: boolean;
  login: (identifier: string, password: string) => Promise<boolean>;
  register: (data: { name: string; email: string; phone: string; password: string }) => Promise<boolean>;
  logout: () => void;
  isAuthModalOpen: boolean;
  openAuthModal: (action?: PendingAction) => void;
  closeAuthModal: () => void;
  pendingAction: PendingAction | null;
  setPendingAction: React.Dispatch<React.SetStateAction<PendingAction | null>>;
  clearPendingAction: () => void;
  executePendingAction: () => void;
}

const CustomerAuthContext = createContext<CustomerAuthContextType | undefined>(undefined);

export function CustomerAuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<CustomerUser | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [pendingAction, setPendingAction] = useState<PendingAction | null>(null);

  useEffect(() => {
    try {
      const savedToken = localStorage.getItem('shoptik_token');
      const savedUser = localStorage.getItem('shoptik_user');
      if (savedToken && savedUser) {
        setToken(savedToken);
        setUser(JSON.parse(savedUser));
      }
    } catch (e) {
      console.error('Failed to load user auth', e);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const executePendingAction = () => {
    if (pendingAction && pendingAction.callback) {
      try {
        pendingAction.callback();
      } catch (err) {
        console.error('Error executing pending action:', err);
      }
      setPendingAction(null);
    }
  };

  const login = async (identifier: string, password: string): Promise<boolean> => {
    try {
      const res = await apiFetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ identifier, password }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        toast.error(data.message || 'Đăng nhập thất bại');
        return false;
      }
      setToken(data.data.token);
      setUser(data.data.user);
      localStorage.setItem('shoptik_token', data.data.token);
      localStorage.setItem('shoptik_user', JSON.stringify(data.data.user));
      toast.success(data.message || 'Đăng nhập thành công!');
      setIsAuthModalOpen(false);

      // Execute pending action if any
      if (pendingAction?.callback) {
        setTimeout(() => {
          pendingAction.callback?.();
          setPendingAction(null);
        }, 100);
      }
      return true;
    } catch (err) {
      toast.error('Lỗi kết nối máy chủ');
      return false;
    }
  };

  const register = async (data: { name: string; email: string; phone: string; password: string }): Promise<boolean> => {
    try {
      const res = await apiFetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      const resData = await res.json();
      if (!res.ok || !resData.success) {
        toast.error(resData.message || 'Đăng ký thất bại');
        return false;
      }
      setToken(resData.data.token);
      setUser(resData.data.user);
      localStorage.setItem('shoptik_token', resData.data.token);
      localStorage.setItem('shoptik_user', JSON.stringify(resData.data.user));
      toast.success(resData.message || 'Đăng ký tài khoản thành công!');
      setIsAuthModalOpen(false);

      // Execute pending action if any
      if (pendingAction?.callback) {
        setTimeout(() => {
          pendingAction.callback?.();
          setPendingAction(null);
        }, 100);
      }
      return true;
    } catch (err) {
      toast.error('Lỗi kết nối máy chủ');
      return false;
    }
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    setPendingAction(null);
    localStorage.removeItem('shoptik_token');
    localStorage.removeItem('shoptik_user');
    toast.success('Đã đăng xuất');
  };

  const openAuthModal = (action?: PendingAction) => {
    if (action) {
      setPendingAction(action);
    }
    setIsAuthModalOpen(true);
  };

  const closeAuthModal = () => {
    setIsAuthModalOpen(false);
  };

  const clearPendingAction = () => {
    setPendingAction(null);
  };

  return (
    <CustomerAuthContext.Provider
      value={{
        user,
        token,
        isLoading,
        login,
        register,
        logout,
        isAuthModalOpen,
        openAuthModal,
        closeAuthModal,
        pendingAction,
        setPendingAction,
        clearPendingAction,
        executePendingAction,
      }}
    >
      {children}
    </CustomerAuthContext.Provider>
  );
}

export function useCustomerAuth() {
  const context = useContext(CustomerAuthContext);
  if (!context) {
    throw new Error('useCustomerAuth must be used within CustomerAuthProvider');
  }
  return context;
}