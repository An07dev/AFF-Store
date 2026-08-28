'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import toast from 'react-hot-toast';
import { apiFetch } from '@/lib/api';

export interface CustomerUser {
  id: string;
  name: string;
  email: string;
  phone?: string;
  avatar?: string;
  provider?: 'google' | 'facebook' | 'local';
  role: string;
  isLocked?: boolean;
  lockReason?: string;
}

export interface PendingAction {
  type: 'VIEW_PRODUCT' | 'ADD_TO_CART' | 'BUY_NOW' | 'CUSTOM';
  product?: any;
  quantity?: number;
  variant?: any;
  customMessage?: string;
  redirectUrl?: string;
  callback?: () => void;
}

interface CustomerAuthContextType {
  user: CustomerUser | null;
  token: string | null;
  isLoading: boolean;
  login: (identifier: string, password: string) => Promise<boolean>;
  register: (data: { name: string; email: string; phone: string; password: string }) => Promise<boolean>;
  loginWithSocial: (provider: 'google' | 'facebook', mockData?: { name?: string; email?: string; avatar?: string }) => Promise<boolean>;
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

  // Validate and sync user from localStorage and /api/auth/me
  useEffect(() => {
    const initAuth = async () => {
      try {
        const savedToken = localStorage.getItem('shoptik_token');
        const savedUser = localStorage.getItem('shoptik_user');
        if (savedToken && savedUser) {
          const parsedUser = JSON.parse(savedUser);
          setToken(savedToken);
          setUser(parsedUser);

          // Verify lock status with backend
          try {
            const res = await apiFetch('/api/auth/me', {
              headers: { Authorization: `Bearer ${savedToken}` },
            });
            const data = await res.json();
            if (data.isLocked || res.status === 403) {
              toast.error(data.message || 'Tài khoản của bạn đã bị khóa bởi Quản trị viên!');
              localStorage.removeItem('shoptik_token');
              localStorage.removeItem('shoptik_user');
              setToken(null);
              setUser(null);
            } else if (data.success && data.user) {
              setUser(data.user);
              localStorage.setItem('shoptik_user', JSON.stringify(data.user));
            }
          } catch (verifyErr) {
            // Offline fallback
          }
        }
      } catch (e) {
        console.error('Failed to load user auth', e);
      } finally {
        setIsLoading(false);
      }
    };

    initAuth();
  }, []);

  const executePendingAction = useCallback(() => {
    if (pendingAction) {
      if (pendingAction.callback) {
        try {
          pendingAction.callback();
        } catch (err) {
          console.error('Error executing pending action:', err);
        }
      }
      if (pendingAction.redirectUrl && typeof window !== 'undefined') {
        window.location.href = pendingAction.redirectUrl;
      }
      setPendingAction(null);
    }
  }, [pendingAction]);

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

      if (pendingAction) {
        setTimeout(() => {
          executePendingAction();
        }, 150);
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

      if (pendingAction) {
        setTimeout(() => {
          executePendingAction();
        }, 150);
      }
      return true;
    } catch (err) {
      toast.error('Lỗi kết nối máy chủ');
      return false;
    }
  };

  const loginWithSocial = async (
    provider: 'google' | 'facebook',
    customData?: { name?: string; email?: string; avatar?: string }
  ): Promise<boolean> => {
    // 1. REAL GOOGLE OAUTH 2.0 POPUP FLOW
    if (provider === 'google' && !customData && typeof window !== 'undefined') {
      const googleClientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || '524386701634-hegni7ud3d2f4qbfgqm17dk75715cd4d.apps.googleusercontent.com';
      const win = window as any;

      if (win.google?.accounts?.oauth2 && googleClientId) {
        return new Promise<boolean>((resolve) => {
          try {
            const client = win.google.accounts.oauth2.initTokenClient({
              client_id: googleClientId,
              scope: 'email profile openid',
              callback: async (tokenResponse: any) => {
                if (tokenResponse?.error) {
                  toast.error('Đăng nhập Google bị hủy hoặc thất bại');
                  resolve(false);
                  return;
                }

                if (tokenResponse?.access_token) {
                  try {
                    const userInfoRes = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
                      headers: { Authorization: `Bearer ${tokenResponse.access_token}` },
                    });
                    const googleUser = await userInfoRes.json();

                    const payload = {
                      provider: 'google',
                      name: googleUser.name || googleUser.email?.split('@')[0] || 'Google User',
                      email: googleUser.email,
                      avatar: googleUser.picture,
                    };

                    const res = await apiFetch('/api/auth/social-login', {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify(payload),
                    });
                    const data = await res.json();

                    if (!res.ok || !data.success) {
                      toast.error(data.message || 'Đăng nhập Google thất bại');
                      resolve(false);
                      return;
                    }

                    setToken(data.data.token);
                    setUser(data.data.user);
                    localStorage.setItem('shoptik_token', data.data.token);
                    localStorage.setItem('shoptik_user', JSON.stringify(data.data.user));
                    toast.success(data.message || 'Đăng nhập qua Google thành công!');
                    setIsAuthModalOpen(false);

                    if (pendingAction) {
                      setTimeout(() => executePendingAction(), 150);
                    }
                    resolve(true);
                  } catch (fetchErr) {
                    toast.error('Không thể lấy thông tin tài khoản Google');
                    resolve(false);
                  }
                }
              },
            });

            client.requestAccessToken({ prompt: 'select_account' });
          } catch (initErr) {
            console.error('Google OAuth init error:', initErr);
            performFallbackSocialLogin(provider, customData, resolve);
          }
        });
      }
    }

    // 2. REAL FACEBOOK LOGIN SDK FLOW (Requires HTTPS per Meta Security Policy)
    if (provider === 'facebook' && !customData && typeof window !== 'undefined') {
      const isHttps = window.location.protocol === 'https:';
      const fbAppId = process.env.NEXT_PUBLIC_FB_APP_ID || '2633642337077749';
      const win = window as any;

      if (isHttps && win.FB && fbAppId) {
        return new Promise<boolean>((resolve) => {
          try {
            if (!win.__fbInitialized) {
              win.FB.init({
                appId: fbAppId,
                cookie: true,
                xfbml: true,
                version: 'v19.0',
              });
              win.__fbInitialized = true;
            }

            win.FB.login(
              (response: any) => {
                if (response.authResponse) {
                  win.FB.api(
                    '/me',
                    { fields: 'id,name,email,picture.width(200).height(200)' },
                    async (userInfo: any) => {
                      if (!userInfo || userInfo.error) {
                        toast.error('Không thể lấy thông tin tài khoản Facebook');
                        resolve(false);
                        return;
                      }

                      try {
                        const payload = {
                          provider: 'facebook',
                          name: userInfo.name || 'Facebook User',
                          email: userInfo.email || `fb_${userInfo.id}@facebook.user`,
                          avatar: userInfo.picture?.data?.url,
                          facebookId: userInfo.id,
                        };

                        const res = await apiFetch('/api/auth/social-login', {
                          method: 'POST',
                          headers: { 'Content-Type': 'application/json' },
                          body: JSON.stringify(payload),
                        });
                        const data = await res.json();

                        if (!res.ok || !data.success) {
                          toast.error(data.message || 'Đăng nhập Facebook thất bại');
                          resolve(false);
                          return;
                        }

                        setToken(data.data.token);
                        setUser(data.data.user);
                        localStorage.setItem('shoptik_token', data.data.token);
                        localStorage.setItem('shoptik_user', JSON.stringify(data.data.user));
                        toast.success(data.message || 'Đăng nhập qua Facebook thành công!');
                        setIsAuthModalOpen(false);

                        if (pendingAction) {
                          setTimeout(() => executePendingAction(), 150);
                        }
                        resolve(true);
                      } catch (apiErr) {
                        toast.error('Lỗi kết nối máy chủ khi đăng nhập Facebook');
                        resolve(false);
                      }
                    }
                  );
                } else {
                  toast.error('Đăng nhập Facebook bị hủy');
                  resolve(false);
                }
              },
              { scope: 'public_profile,email' }
            );
          } catch (fbErr) {
            console.error('Facebook OAuth error:', fbErr);
            performFallbackSocialLogin(provider, customData, resolve);
          }
        });
      } else if (!isHttps) {
        // Meta enforces HTTPS for FB.login. On HTTP / Localhost development:
        // Gracefully simulate Facebook account login and notify developer
        return new Promise<boolean>((resolve) => {
          performFallbackSocialLogin(provider, customData, resolve, true);
        });
      }
    }

    // 3. FALLBACK / MOCK SOCIAL LOGIN
    return new Promise<boolean>((resolve) => {
      performFallbackSocialLogin(provider, customData, resolve);
    });
  };

  const performFallbackSocialLogin = async (
    provider: 'google' | 'facebook',
    customData: { name?: string; email?: string; avatar?: string } | undefined,
    resolve: (val: boolean) => void,
    isHttpLocalMode?: boolean
  ) => {
    try {
      const defaultMockEmail = provider === 'google' ? 'nguyenvana.google@gmail.com' : 'tranvanb.fb@facebook.com';
      const defaultMockName = provider === 'google' ? 'Nguyễn Văn An (Google)' : 'Trần Văn Bình (Facebook)';
      const defaultMockAvatar = provider === 'google'
        ? 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=120&auto=format&fit=crop&q=80'
        : 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=120&auto=format&fit=crop&q=80';

      const payload = {
        provider,
        name: customData?.name || defaultMockName,
        email: customData?.email || defaultMockEmail,
        avatar: customData?.avatar || defaultMockAvatar,
      };

      const res = await apiFetch('/api/auth/social-login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await res.json();

      if (!res.ok || !data.success) {
        toast.error(data.message || `Đăng nhập qua ${provider === 'google' ? 'Google' : 'Facebook'} thất bại`);
        resolve(false);
        return;
      }

      setToken(data.data.token);
      setUser(data.data.user);
      localStorage.setItem('shoptik_token', data.data.token);
      localStorage.setItem('shoptik_user', JSON.stringify(data.data.user));

      if (isHttpLocalMode) {
        toast.success('Đăng nhập Facebook thành công! (Chế độ Localhost HTTP)', { duration: 4000 });
      } else {
        toast.success(data.message || `Đăng nhập qua ${provider === 'google' ? 'Google' : 'Facebook'} thành công!`);
      }

      setIsAuthModalOpen(false);

      if (pendingAction) {
        setTimeout(() => executePendingAction(), 150);
      }
      resolve(true);
    } catch (err) {
      toast.error('Lỗi kết nối máy chủ');
      resolve(false);
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
        loginWithSocial,
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