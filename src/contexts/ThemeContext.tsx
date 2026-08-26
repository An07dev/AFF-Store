'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import toast from 'react-hot-toast';
import { apiFetch } from '@/lib/api';

export interface BannerSlide {
  tag: string;
  title: string;
  image: string;
  link?: string;
}

export interface ThemeConfig {
  themeName: string;
  mode: 'dark' | 'light';
  pageTitles: {
    siteTitle: string;
    homeTitle: string;
    adminTitle: string;
    logoText: string;
    logoUrl: string;
    faviconUrl: string;
    metaDescription: string;
    bannerNotice: string;
    showBannerNotice: boolean;
  };
  banners: BannerSlide[];
  subBanners?: BannerSlide[];
  socialLinks: {
    tiktokUrl: string;
    facebookUrl: string;
  };
  buttonColors: {
    primaryBg: string;
    primaryText: string;
    primaryHover: string;
    secondaryBg: string;
    secondaryText: string;
    borderRadius: string;
  };
  textColors: {
    textPrimary: string;
    textSecondary: string;
    textMuted: string;
    textAccent: string;
  };
  componentColors: {
    background: string;
    cardBackground: string;
    cardHoverBg: string;
    navbarBg: string;
    sidebarBg: string;
    borderColor: string;
    accentColor: string;
  };
}

export const defaultSubBanners: BannerSlide[] = [
  {
    tag: '9.9 Siêu Sale',
    title: 'Ăn Sáng Ngon Rẻ - Chỉ từ 10.000đ',
    image: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=600&auto=format&fit=crop&q=80',
    link: '/?tab=products',
  },
  {
    tag: 'Hàng Việt Tôi Yêu',
    title: 'Chất Lượng Chính Hãng - Freeship 0Đ',
    image: 'https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?w=600&auto=format&fit=crop&q=80',
    link: '/?tab=products&filter=flash-sale',
  },
];

export const defaultBanners: BannerSlide[] = [
  {
    tag: 'Siêu Sale Shopee',
    title: '🔥 Giảm Đến 50% & Freeship 0Đ Toàn Quốc',
    image: 'https://images.unsplash.com/photo-1556906781-9a412961c28c?w=900&auto=format&fit=crop&q=80',
    link: '/?tab=products&filter=flash-sale',
  },
  {
    tag: 'Hàng Hiệu Mall',
    title: '⭐ Bộ Sưu Tập Thể Thao Mùa Giải Mới 2026',
    image: 'https://images.unsplash.com/photo-1518611012118-696072aa579a?w=900&auto=format&fit=crop&q=80',
    link: '/?tab=products',
  },
  {
    tag: 'Flash Sale Giờ Vàng',
    title: '⚡ Săn Deal Chớp Nhoáng - Số Lượng Có Hạn',
    image: 'https://images.unsplash.com/photo-1579952363873-27f3bade9f55?w=900&auto=format&fit=crop&q=80',
    link: '/?tab=products&filter=flash-sale',
  },
  {
    tag: 'Quà Tặng Độc Quyền',
    title: '🎁 Mua 1 Tặng 1 - Tặng Kèm Phụ Kiện Thể Thao',
    image: 'https://images.unsplash.com/photo-1483985988355-763728e1935b?w=900&auto=format&fit=crop&q=80',
    link: '/?tab=products',
  },
];

export const defaultTheme: ThemeConfig = {
  themeName: 'modern-blue',
  mode: 'dark',
  pageTitles: {
    siteTitle: 'ShopTik - Cửa Hàng Thời Trang & Phụ Kiện Cao Cấp',
    homeTitle: 'Trang Chủ | ShopTik',
    adminTitle: 'ShopTik Quản Trị Hệ Thống',
    logoText: 'ShopTik',
    logoUrl: '',
    faviconUrl: '/favicon.ico',
    metaDescription: 'Trải nghiệm mua sắm thời trang trực tuyến thời thượng, giao hàng nhanh chóng toàn quốc.',
    bannerNotice: '🔥 Miễn phí vận chuyển toàn quốc cho đơn hàng từ 500.000đ',
    showBannerNotice: true,
  },
  banners: defaultBanners,
  subBanners: defaultSubBanners,
  socialLinks: {
    tiktokUrl: '',
    facebookUrl: '',
  },
  buttonColors: {
    primaryBg: '#3b82f6',
    primaryText: '#ffffff',
    primaryHover: '#2563eb',
    secondaryBg: '#1a1e2b',
    secondaryText: '#94a3b8',
    borderRadius: '10px',
  },
  textColors: {
    textPrimary: '#f8fafc',
    textSecondary: '#94a3b8',
    textMuted: '#64748b',
    textAccent: '#3b82f6',
  },
  componentColors: {
    background: '#090a0f',
    cardBackground: '#13161f',
    cardHoverBg: '#1a1e2b',
    navbarBg: '#090a0f',
    sidebarBg: '#131826',
    borderColor: '#232838',
    accentColor: '#10b981',
  },
};

const THEME_CACHE_KEY = 'shoptik_cached_theme_config';

interface ThemeContextType {
  theme: ThemeConfig;
  setTheme: React.Dispatch<React.SetStateAction<ThemeConfig>>;
  saveTheme: (newConfig?: ThemeConfig) => Promise<boolean>;
  resetToDefault: () => Promise<void>;
  toggleThemeMode: (mode: 'dark' | 'light') => void;
  isLoading: boolean;
  applyCSSVariables: (config: ThemeConfig) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<ThemeConfig>(defaultTheme);
  // Non-blocking initialization for instant 0ms First Contentful Paint
  const [isLoading, setIsLoading] = useState(false);

  // Apply CSS variables to :root and html element
  const applyCSSVariables = useCallback((config: ThemeConfig) => {
    if (typeof document === 'undefined') return;
    const root = document.documentElement;

    // Set data-theme attribute on <html>
    root.setAttribute('data-theme', config.mode);

    // Buttons
    root.style.setProperty('--primary', config.buttonColors?.primaryBg || '#3b82f6');
    root.style.setProperty('--primary-hover', config.buttonColors?.primaryHover || '#2563eb');
    root.style.setProperty('--primary-text', config.buttonColors?.primaryText || '#ffffff');
    root.style.setProperty('--secondary-btn-bg', config.buttonColors?.secondaryBg || '#1a1e2b');
    root.style.setProperty('--secondary-btn-text', config.buttonColors?.secondaryText || '#94a3b8');
    root.style.setProperty('--radius-md', config.buttonColors?.borderRadius || '10px');

    // Texts
    root.style.setProperty('--text-main', config.textColors?.textPrimary || '#f8fafc');
    root.style.setProperty('--text-muted', config.textColors?.textSecondary || '#94a3b8');
    root.style.setProperty('--text-dim', config.textColors?.textMuted || '#64748b');
    root.style.setProperty('--text-accent', config.textColors?.textAccent || '#3b82f6');

    // Components & Backgrounds
    root.style.setProperty('--bg-main', config.componentColors?.background || '#090a0f');
    root.style.setProperty('--bg-card', config.componentColors?.cardBackground || '#13161f');
    root.style.setProperty('--bg-card-hover', config.componentColors?.cardHoverBg || '#1a1e2b');
    root.style.setProperty('--navbar-bg', config.componentColors?.navbarBg || '#090a0f');
    root.style.setProperty('--admin-sidebar-bg', config.componentColors?.sidebarBg || '#131826');
    root.style.setProperty('--border-color', config.componentColors?.borderColor || '#232838');
    root.style.setProperty('--accent', config.componentColors?.accentColor || '#10b981');

    // Admin Theme specific variables
    root.style.setProperty('--admin-bg', config.componentColors?.background || '#090a0f');
    root.style.setProperty('--admin-card', config.componentColors?.cardBackground || '#13161f');
    root.style.setProperty('--admin-border', config.componentColors?.borderColor || '#232838');
    root.style.setProperty('--admin-text', config.textColors?.textPrimary || '#f8fafc');
    root.style.setProperty('--admin-text-muted', config.textColors?.textSecondary || '#94a3b8');
    root.style.setProperty('--admin-accent', config.buttonColors?.primaryBg || '#3b82f6');

    // Page Title
    if (config.pageTitles?.siteTitle) {
      document.title = config.pageTitles.siteTitle;
    }
  }, []);

  // 1. Initial Mount: Load cached theme from localStorage synchronously to eliminate flash / delay
  useEffect(() => {
    try {
      const cached = localStorage.getItem(THEME_CACHE_KEY);
      if (cached) {
        const parsed = JSON.parse(cached);
        if (parsed && typeof parsed === 'object') {
          const merged: ThemeConfig = {
            ...defaultTheme,
            ...parsed,
            pageTitles: { ...defaultTheme.pageTitles, ...(parsed.pageTitles || {}) },
            banners: Array.isArray(parsed.banners) && parsed.banners.length > 0 ? parsed.banners : defaultTheme.banners,
            subBanners: Array.isArray(parsed.subBanners) && parsed.subBanners.length > 0 ? parsed.subBanners : defaultTheme.subBanners,
            socialLinks: { ...defaultTheme.socialLinks, ...(parsed.socialLinks || {}) },
            buttonColors: { ...defaultTheme.buttonColors, ...(parsed.buttonColors || {}) },
            textColors: { ...defaultTheme.textColors, ...(parsed.textColors || {}) },
            componentColors: { ...defaultTheme.componentColors, ...(parsed.componentColors || {}) },
          };
          setTheme(merged);
          applyCSSVariables(merged);
        }
      } else {
        applyCSSVariables(defaultTheme);
      }
    } catch (e) {
      applyCSSVariables(defaultTheme);
    }
  }, [applyCSSVariables]);

  // 2. Background Revalidation (Stale-While-Revalidate): Fetch fresh theme from API
  useEffect(() => {
    let isMounted = true;
    async function loadTheme() {
      try {
        const res = await apiFetch('/api/settings/theme');
        const data = await res.json();
        if (data?.success && data?.data && isMounted) {
          const merged: ThemeConfig = {
            ...defaultTheme,
            ...data.data,
            pageTitles: { ...defaultTheme.pageTitles, ...(data.data.pageTitles || {}) },
            banners: Array.isArray(data.data.banners) && data.data.banners.length > 0 ? data.data.banners : defaultTheme.banners,
            subBanners: Array.isArray(data.data.subBanners) && data.data.subBanners.length > 0 ? data.data.subBanners : defaultTheme.subBanners,
            socialLinks: { ...defaultTheme.socialLinks, ...(data.data.socialLinks || {}) },
            buttonColors: { ...defaultTheme.buttonColors, ...(data.data.buttonColors || {}) },
            textColors: { ...defaultTheme.textColors, ...(data.data.textColors || {}) },
            componentColors: { ...defaultTheme.componentColors, ...(data.data.componentColors || {}) },
          };
          setTheme(merged);
          applyCSSVariables(merged);
          try {
            localStorage.setItem(THEME_CACHE_KEY, JSON.stringify(merged));
          } catch (storageErr) {
            // Ignore localStorage quota errors
          }
        }
      } catch (e) {
        console.warn('Background theme refresh failed, using cached/default theme.');
      }
    }
    loadTheme();
    return () => {
      isMounted = false;
    };
  }, [applyCSSVariables]);

  // Toggle Theme Mode between Dark and Light
  const toggleThemeMode = useCallback((mode: 'dark' | 'light') => {
    setTheme((prevTheme) => {
      let updated: ThemeConfig;
      if (mode === 'dark') {
        updated = {
          ...prevTheme,
          mode: 'dark',
          componentColors: {
            ...prevTheme.componentColors,
            background: '#090a0f',
            cardBackground: '#13161f',
            cardHoverBg: '#1a1e2b',
            navbarBg: '#090a0f',
            sidebarBg: '#131826',
            borderColor: '#232838',
          },
          textColors: {
            ...prevTheme.textColors,
            textPrimary: '#f8fafc',
            textSecondary: '#94a3b8',
            textMuted: '#64748b',
          },
          buttonColors: {
            ...prevTheme.buttonColors,
            secondaryBg: '#1a1e2b',
            secondaryText: '#94a3b8',
          },
        };
      } else {
        updated = {
          ...prevTheme,
          mode: 'light',
          componentColors: {
            ...prevTheme.componentColors,
            background: '#f8fafc',
            cardBackground: '#ffffff',
            cardHoverBg: '#f1f5f9',
            navbarBg: '#ffffff',
            sidebarBg: '#ffffff',
            borderColor: '#e2e8f0',
          },
          textColors: {
            ...prevTheme.textColors,
            textPrimary: '#0f172a',
            textSecondary: '#475569',
            textMuted: '#94a3b8',
          },
          buttonColors: {
            ...prevTheme.buttonColors,
            secondaryBg: '#f1f5f9',
            secondaryText: '#475569',
          },
        };
      }
      applyCSSVariables(updated);
      try {
        localStorage.setItem(THEME_CACHE_KEY, JSON.stringify(updated));
      } catch (err) {}
      return updated;
    });
  }, [applyCSSVariables]);

  // Save theme to MongoDB Atlas via API
  const saveTheme = async (newConfig?: ThemeConfig): Promise<boolean> => {
    const configToSave = newConfig || theme;
    try {
      applyCSSVariables(configToSave);
      const res = await apiFetch('/api/settings/theme', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(configToSave),
      });
      const data = await res.json();
      if (data.success) {
        setTheme(data.data);
        try {
          localStorage.setItem(THEME_CACHE_KEY, JSON.stringify(data.data));
        } catch (err) {}
        toast.success('Đã lưu cấu hình giao diện thành công!');
        return true;
      } else {
        toast.error(data.message || 'Lỗi lưu cấu hình');
        return false;
      }
    } catch (e) {
      toast.error('Lỗi kết nối máy chủ');
      return false;
    }
  };

  const resetToDefault = async () => {
    setTheme(defaultTheme);
    applyCSSVariables(defaultTheme);
    try {
      localStorage.removeItem(THEME_CACHE_KEY);
    } catch (err) {}
    await saveTheme(defaultTheme);
    toast.success('Đã khôi phục giao diện mặc định');
  };

  return (
    <ThemeContext.Provider
      value={{
        theme,
        setTheme,
        saveTheme,
        resetToDefault,
        toggleThemeMode,
        isLoading,
        applyCSSVariables,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}
