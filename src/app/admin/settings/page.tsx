'use client';

import React, { useState, useRef } from 'react';
import {
  FiSave,
  FiRotateCcw,
  FiMoon,
  FiSun,
  FiLayout,
  FiType,
  FiBox,
  FiImage,
  FiUploadCloud,
  FiCheck,
  FiEye,
  FiLock,
} from 'react-icons/fi';
import toast from 'react-hot-toast';
import { useTheme, ThemeConfig, defaultTheme } from '@/contexts/ThemeContext';
import { apiFetch } from '@/lib/api';
import styles from './page.module.css';

// Preset Themes for 1-click styling
const PRESET_THEMES: { id: string; name: string; primaryColor: string; bg: string; config: Partial<ThemeConfig> }[] = [
  {
    id: 'modern-blue',
    name: 'Modern Blue (Mặc định)',
    primaryColor: '#3b82f6',
    bg: '#090a0f',
    config: {
      themeName: 'modern-blue',
      mode: 'dark',
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
    },
  },
  {
    id: 'emerald-luxury',
    name: 'Emerald Luxury (Xanh Lục Bảo)',
    primaryColor: '#10b981',
    bg: '#06130e',
    config: {
      themeName: 'emerald-luxury',
      mode: 'dark',
      buttonColors: {
        primaryBg: '#10b981',
        primaryText: '#ffffff',
        primaryHover: '#059669',
        secondaryBg: '#0e261e',
        secondaryText: '#a7f3d0',
        borderRadius: '12px',
      },
      textColors: {
        textPrimary: '#f0fdf4',
        textSecondary: '#a7f3d0',
        textMuted: '#6ee7b7',
        textAccent: '#34d399',
      },
      componentColors: {
        background: '#06130e',
        cardBackground: '#0d221b',
        cardHoverBg: '#123026',
        navbarBg: '#06130e',
        sidebarBg: '#0a1d17',
        borderColor: '#193f32',
        accentColor: '#fbbf24',
      },
    },
  },
  {
    id: 'cyberpunk-neon',
    name: 'Cyberpunk Neon (Tím Dạ Quang)',
    primaryColor: '#8b5cf6',
    bg: '#0c071e',
    config: {
      themeName: 'cyberpunk-neon',
      mode: 'dark',
      buttonColors: {
        primaryBg: '#8b5cf6',
        primaryText: '#ffffff',
        primaryHover: '#7c3aed',
        secondaryBg: '#1f133d',
        secondaryText: '#c4b5fd',
        borderRadius: '8px',
      },
      textColors: {
        textPrimary: '#faf5ff',
        textSecondary: '#c4b5fd',
        textMuted: '#a78bfa',
        textAccent: '#ec4899',
      },
      componentColors: {
        background: '#0c071e',
        cardBackground: '#170d38',
        cardHoverBg: '#21134e',
        navbarBg: '#0c071e',
        sidebarBg: '#130a2e',
        borderColor: '#2e1c6b',
        accentColor: '#ec4899',
      },
    },
  },
  {
    id: 'sunset-amber',
    name: 'Sunset Amber (Cam Hoàng Hôn)',
    primaryColor: '#f97316',
    bg: '#140c06',
    config: {
      themeName: 'sunset-amber',
      mode: 'dark',
      buttonColors: {
        primaryBg: '#f97316',
        primaryText: '#ffffff',
        primaryHover: '#ea580c',
        secondaryBg: '#26170d',
        secondaryText: '#fed7aa',
        borderRadius: '10px',
      },
      textColors: {
        textPrimary: '#fff7ed',
        textSecondary: '#fed7aa',
        textMuted: '#fdba74',
        textAccent: '#f97316',
      },
      componentColors: {
        background: '#140c06',
        cardBackground: '#24140a',
        cardHoverBg: '#331c0e',
        navbarBg: '#140c06',
        sidebarBg: '#1c0f08',
        borderColor: '#432311',
        accentColor: '#ef4444',
      },
    },
  },
  {
    id: 'minimal-light',
    name: 'Minimal Clean (Sáng Tinh Tế)',
    primaryColor: '#2563eb',
    bg: '#f8fafc',
    config: {
      themeName: 'minimal-light',
      mode: 'light',
      buttonColors: {
        primaryBg: '#2563eb',
        primaryText: '#ffffff',
        primaryHover: '#1d4ed8',
        secondaryBg: '#f1f5f9',
        secondaryText: '#475569',
        borderRadius: '8px',
      },
      textColors: {
        textPrimary: '#0f172a',
        textSecondary: '#475569',
        textMuted: '#94a3b8',
        textAccent: '#2563eb',
      },
      componentColors: {
        background: '#f8fafc',
        cardBackground: '#ffffff',
        cardHoverBg: '#f1f5f9',
        navbarBg: '#ffffff',
        sidebarBg: '#f1f5f9',
        borderColor: '#e2e8f0',
        accentColor: '#10b981',
      },
    },
  },
];

export default function AdminSettingsPage() {
  const { theme, setTheme, saveTheme, resetToDefault, toggleThemeMode, applyCSSVariables } = useTheme();
  const [activeTab, setActiveTab] = useState<'titles' | 'mode' | 'buttons' | 'texts' | 'components' | 'password'>('titles');
  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Change Password State
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [changingPassword, setChangingPassword] = useState(false);

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!passwordForm.currentPassword || !passwordForm.newPassword) {
      toast.error('Vui lòng nhập mật khẩu hiện tại và mật khẩu mới');
      return;
    }
    if (passwordForm.newPassword.length < 6) {
      toast.error('Mật khẩu mới phải có ít nhất 6 ký tự');
      return;
    }
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      toast.error('Mật khẩu xác nhận không khớp');
      return;
    }

    setChangingPassword(true);
    try {
      const token = localStorage.getItem('admin_token') || '';
      const res = await apiFetch('/api/auth/change-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(passwordForm),
      });

      const data = await res.json();
      if (data.success) {
        toast.success('Đổi mật khẩu tài khoản Admin thành công!');
        setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
      } else {
        toast.error(data.message || 'Lỗi khi đổi mật khẩu');
      }
    } catch (err: any) {
      toast.error('Lỗi kết nối máy chủ');
    } finally {
      setChangingPassword(false);
    }
  };

  // Quick preset apply
  const handleApplyPreset = (preset: typeof PRESET_THEMES[0]) => {
    const updated: ThemeConfig = {
      ...theme,
      ...preset.config,
      buttonColors: { ...theme.buttonColors, ...(preset.config.buttonColors || {}) },
      textColors: { ...theme.textColors, ...(preset.config.textColors || {}) },
      componentColors: { ...theme.componentColors, ...(preset.config.componentColors || {}) },
    };
    setTheme(updated);
    applyCSSVariables(updated);
    toast.success(`Đã chọn theme ${preset.name}!`);
  };

  // Upload logo
  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);

    setIsUploading(true);
    try {
      const res = await apiFetch('/api/upload', {
        method: 'POST',
        body: formData,
      });
      const data = await res.json();
      if (data.success && data.data?.url) {
        const updated: ThemeConfig = {
          ...theme,
          pageTitles: { ...theme.pageTitles, logoUrl: data.data.url },
        };
        setTheme(updated);
        toast.success('Upload Logo thành công!');
      } else {
        toast.error(data.message || 'Lỗi upload ảnh');
      }
    } catch (err) {
      toast.error('Lỗi khi tải ảnh lên');
    } finally {
      setIsUploading(false);
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    await saveTheme(theme);
    setIsSaving(false);
  };

  return (
    <div className={styles.container}>
      {/* Header */}
      <div className={styles.header}>
        <div className={styles.titleBox}>
          <h1>Cấu Hình Giao Diện & Theme Hệ Thống</h1>
          <p>Tùy biến màu sắc, thương hiệu, font chữ và chế độ hiển thị toàn bộ cửa hàng</p>
        </div>

        <div className={styles.headerActions}>
          <button className={styles.resetBtn} onClick={resetToDefault} title="Đặt lại về ban đầu">
            <FiRotateCcw /> Khôi phục mặc định
          </button>
          <button className={styles.saveBtn} onClick={handleSave} disabled={isSaving}>
            <FiSave /> {isSaving ? 'Đang lưu...' : 'Lưu Cấu Hình'}
          </button>
        </div>
      </div>

      {/* Preset Themes Selector */}
      <div className={styles.presetsCard}>
        <span className={styles.presetLabel}>Bộ Theme có sẵn:</span>
        <div className={styles.presetList}>
          {PRESET_THEMES.map((preset) => (
            <button
              key={preset.id}
              className={`${styles.presetBtn} ${theme.themeName === preset.id ? styles.activePreset : ''}`}
              onClick={() => handleApplyPreset(preset)}
            >
              <span className={styles.colorDot} style={{ background: preset.primaryColor }}></span>
              <span>{preset.name}</span>
              {theme.themeName === preset.id && <FiCheck style={{ color: '#10b981' }} />}
            </button>
          ))}
        </div>
      </div>

      {/* Main Grid: Form Settings & Live Preview */}
      <div className={styles.mainGrid}>
        {/* Left Column: Tabbed Settings */}
        <div className={styles.tabsContainer}>
          <div className={styles.tabHeader}>
            <button
              className={`${styles.tabBtn} ${activeTab === 'titles' ? styles.activeTabBtn : ''}`}
              onClick={() => setActiveTab('titles')}
            >
              <FiImage /> Tiêu Đề & Logo
            </button>
            <button
              className={`${styles.tabBtn} ${activeTab === 'mode' ? styles.activeTabBtn : ''}`}
              onClick={() => setActiveTab('mode')}
            >
              <FiMoon /> Chế Độ Sáng / Tối
            </button>
            <button
              className={`${styles.tabBtn} ${activeTab === 'buttons' ? styles.activeTabBtn : ''}`}
              onClick={() => setActiveTab('buttons')}
            >
              <FiBox /> Màu Button (Nút)
            </button>
            <button
              className={`${styles.tabBtn} ${activeTab === 'texts' ? styles.activeTabBtn : ''}`}
              onClick={() => setActiveTab('texts')}
            >
              <FiType /> Màu Chữ (Text)
            </button>
            <button
              className={`${styles.tabBtn} ${activeTab === 'components' ? styles.activeTabBtn : ''}`}
              onClick={() => setActiveTab('components')}
            >
              <FiLayout /> Màu Component
            </button>
            <button
              className={`${styles.tabBtn} ${activeTab === 'password' ? styles.activeTabBtn : ''}`}
              onClick={() => setActiveTab('password')}
            >
              <FiLock /> Đổi Mật Khẩu
            </button>
          </div>

          <div className={styles.tabContent}>
            {/* TAB 1: TITLES & LOGO */}
            {activeTab === 'titles' && (
              <>
                <div className={styles.sectionHeader}>
                  <h3>Thương Hiệu & Tiêu Đề Trang</h3>
                  <p>Cài đặt tên shop, tiêu đề SEO và hình ảnh Logo hiển thị trên Header</p>
                </div>

                <div className={styles.fieldGrid}>
                  <div className={styles.formGroup}>
                    <label>Tiêu đề Website chính (Meta Title)</label>
                    <input
                      type="text"
                      className={styles.input}
                      value={theme.pageTitles?.siteTitle || ''}
                      onChange={(e) =>
                        setTheme({
                          ...theme,
                          pageTitles: { ...theme.pageTitles, siteTitle: e.target.value },
                        })
                      }
                    />
                  </div>

                  <div className={styles.formGroup}>
                    <label>Tên chữ hiển thị Logo (Logo Text)</label>
                    <input
                      type="text"
                      className={styles.input}
                      value={theme.pageTitles?.logoText || ''}
                      onChange={(e) =>
                        setTheme({
                          ...theme,
                          pageTitles: { ...theme.pageTitles, logoText: e.target.value },
                        })
                      }
                    />
                  </div>
                </div>

                <div className={styles.formGroup}>
                  <label>Hình ảnh Logo (URL hoặc Upload)</label>
                  <div className={styles.uploadRow}>
                    <input
                      type="text"
                      className={styles.input}
                      placeholder="https://... hoặc /uploads/logo.png"
                      value={theme.pageTitles?.logoUrl || ''}
                      onChange={(e) =>
                        setTheme({
                          ...theme,
                          pageTitles: { ...theme.pageTitles, logoUrl: e.target.value },
                        })
                      }
                      style={{ flex: 1 }}
                    />
                    <button
                      type="button"
                      className={styles.uploadBtn}
                      onClick={() => fileInputRef.current?.click()}
                    >
                      <FiUploadCloud /> {isUploading ? 'Đang tải...' : 'Upload ảnh'}
                    </button>
                    <input
                      type="file"
                      ref={fileInputRef}
                      style={{ display: 'none' }}
                      accept="image/*"
                      onChange={handleLogoUpload}
                    />
                  </div>
                </div>

                <div className={styles.formGroup}>
                  <label>Thông báo khuyến mãi đầu trang (Banner Notice)</label>
                  <input
                    type="text"
                    className={styles.input}
                    value={theme.pageTitles?.bannerNotice || ''}
                    onChange={(e) =>
                      setTheme({
                        ...theme,
                        pageTitles: { ...theme.pageTitles, bannerNotice: e.target.value },
                      })
                    }
                  />
                </div>

                <div className={styles.formGroup}>
                  <label>Mô tả ngắn trang (Meta Description SEO)</label>
                  <input
                    type="text"
                    className={styles.input}
                    value={theme.pageTitles?.metaDescription || ''}
                    onChange={(e) =>
                      setTheme({
                        ...theme,
                        pageTitles: { ...theme.pageTitles, metaDescription: e.target.value },
                      })
                    }
                  />
                </div>
              </>
            )}

            {/* TAB 2: MODE (DARK / LIGHT) */}
            {activeTab === 'mode' && (
              <>
                <div className={styles.sectionHeader}>
                  <h3>Chế Độ Giao Diện (Theme Mode)</h3>
                  <p>Lựa chọn tông màu tối hiện đại hoặc tông sáng thanh lịch</p>
                </div>

                <div className={styles.modeSelector}>
                  <div
                    className={`${styles.modeCard} ${theme.mode === 'dark' ? styles.activeMode : ''}`}
                    onClick={() => {
                      toggleThemeMode('dark');
                      toast.success('Đã chuyển sang Chế độ Tối (Dark Mode)');
                    }}
                  >
                    <FiMoon className={styles.modeIcon} />
                    <div>
                      <strong style={{ color: theme.textColors?.textPrimary || '#fff', display: 'block' }}>
                        Chế độ Tối (Dark Mode)
                      </strong>
                      <span style={{ color: theme.textColors?.textSecondary || '#94a3b8', fontSize: '0.8125rem' }}>
                        Bảo vệ mắt, thiết kế công nghệ cao cấp
                      </span>
                    </div>
                  </div>

                  <div
                    className={`${styles.modeCard} ${theme.mode === 'light' ? styles.activeMode : ''}`}
                    onClick={() => {
                      toggleThemeMode('light');
                      toast.success('Đã chuyển sang Chế độ Sáng (Light Mode)');
                    }}
                  >
                    <FiSun className={styles.modeIcon} style={{ color: '#f59e0b' }} />
                    <div>
                      <strong style={{ color: theme.textColors?.textPrimary || '#fff', display: 'block' }}>
                        Chế độ Sáng (Light Mode)
                      </strong>
                      <span style={{ color: theme.textColors?.textSecondary || '#94a3b8', fontSize: '0.8125rem' }}>
                        Gọn gàng, sạch sẽ, độ tương phản cao
                      </span>
                    </div>
                  </div>
                </div>
              </>
            )}

            {/* TAB 3: BUTTON COLORS */}
            {activeTab === 'buttons' && (
              <>
                <div className={styles.sectionHeader}>
                  <h3>Màu Sắc Nút Bấm (Button Styles)</h3>
                  <p>Tùy chỉnh màu nút Mua ngay, Thêm vào giỏ và độ bo góc</p>
                </div>

                <div className={styles.fieldGrid}>
                  <div className={styles.formGroup}>
                    <label>Màu nền nút chính (Primary Button Bg)</label>
                    <div className={styles.colorPickerRow}>
                      <input
                        type="color"
                        className={styles.colorInput}
                        value={theme.buttonColors.primaryBg}
                        onChange={(e) => {
                          const updated = {
                            ...theme,
                            buttonColors: { ...theme.buttonColors, primaryBg: e.target.value },
                          };
                          setTheme(updated);
                          applyCSSVariables(updated);
                        }}
                      />
                      <span className={styles.colorHex}>{theme.buttonColors.primaryBg}</span>
                    </div>
                  </div>

                  <div className={styles.formGroup}>
                    <label>Màu chữ nút chính (Primary Button Text)</label>
                    <div className={styles.colorPickerRow}>
                      <input
                        type="color"
                        className={styles.colorInput}
                        value={theme.buttonColors.primaryText}
                        onChange={(e) => {
                          const updated = {
                            ...theme,
                            buttonColors: { ...theme.buttonColors, primaryText: e.target.value },
                          };
                          setTheme(updated);
                          applyCSSVariables(updated);
                        }}
                      />
                      <span className={styles.colorHex}>{theme.buttonColors.primaryText}</span>
                    </div>
                  </div>

                  <div className={styles.formGroup}>
                    <label>Màu khi Hover nút chính</label>
                    <div className={styles.colorPickerRow}>
                      <input
                        type="color"
                        className={styles.colorInput}
                        value={theme.buttonColors.primaryHover}
                        onChange={(e) =>
                          setTheme({
                            ...theme,
                            buttonColors: { ...theme.buttonColors, primaryHover: e.target.value },
                          })
                        }
                      />
                      <span className={styles.colorHex}>{theme.buttonColors.primaryHover}</span>
                    </div>
                  </div>

                  <div className={styles.formGroup}>
                    <label>Màu nền nút phụ (Secondary Button)</label>
                    <div className={styles.colorPickerRow}>
                      <input
                        type="color"
                        className={styles.colorInput}
                        value={theme.buttonColors.secondaryBg}
                        onChange={(e) =>
                          setTheme({
                            ...theme,
                            buttonColors: { ...theme.buttonColors, secondaryBg: e.target.value },
                          })
                        }
                      />
                      <span className={styles.colorHex}>{theme.buttonColors.secondaryBg}</span>
                    </div>
                  </div>
                </div>

                <div className={styles.formGroup}>
                  <label>Độ bo góc nút (Border Radius)</label>
                  <select
                    className={styles.input}
                    value={theme.buttonColors.borderRadius}
                    onChange={(e) => {
                      const updated = {
                        ...theme,
                        buttonColors: { ...theme.buttonColors, borderRadius: e.target.value },
                      };
                      setTheme(updated);
                      applyCSSVariables(updated);
                    }}
                  >
                    <option value="4px">Góc vuông nhẹ (4px)</option>
                    <option value="8px">Bo góc tiêu chuẩn (8px)</option>
                    <option value="12px">Bo góc hiện đại (12px)</option>
                    <option value="999px">Bo tròn viên thuốc (Pill - 999px)</option>
                  </select>
                </div>
              </>
            )}

            {/* TAB 4: TEXT COLORS */}
            {activeTab === 'texts' && (
              <>
                <div className={styles.sectionHeader}>
                  <h3>Màu Sắc Văn Bản (Typography Colors)</h3>
                  <p>Tùy biến màu tiêu đề chính, màu đoạn văn và màu ghi chú</p>
                </div>

                <div className={styles.fieldGrid}>
                  <div className={styles.formGroup}>
                    <label>Màu chữ tiêu đề / Chính (Text Primary)</label>
                    <div className={styles.colorPickerRow}>
                      <input
                        type="color"
                        className={styles.colorInput}
                        value={theme.textColors.textPrimary}
                        onChange={(e) => {
                          const updated = {
                            ...theme,
                            textColors: { ...theme.textColors, textPrimary: e.target.value },
                          };
                          setTheme(updated);
                          applyCSSVariables(updated);
                        }}
                      />
                      <span className={styles.colorHex}>{theme.textColors.textPrimary}</span>
                    </div>
                  </div>

                  <div className={styles.formGroup}>
                    <label>Màu chữ nội dung phụ (Text Secondary)</label>
                    <div className={styles.colorPickerRow}>
                      <input
                        type="color"
                        className={styles.colorInput}
                        value={theme.textColors.textSecondary}
                        onChange={(e) => {
                          const updated = {
                            ...theme,
                            textColors: { ...theme.textColors, textSecondary: e.target.value },
                          };
                          setTheme(updated);
                          applyCSSVariables(updated);
                        }}
                      />
                      <span className={styles.colorHex}>{theme.textColors.textSecondary}</span>
                    </div>
                  </div>

                  <div className={styles.formGroup}>
                    <label>Màu chữ làm mờ (Text Muted / Dim)</label>
                    <div className={styles.colorPickerRow}>
                      <input
                        type="color"
                        className={styles.colorInput}
                        value={theme.textColors.textMuted}
                        onChange={(e) => {
                          const updated = {
                            ...theme,
                            textColors: { ...theme.textColors, textMuted: e.target.value },
                          };
                          setTheme(updated);
                          applyCSSVariables(updated);
                        }}
                      />
                      <span className={styles.colorHex}>{theme.textColors.textMuted}</span>
                    </div>
                  </div>

                  <div className={styles.formGroup}>
                    <label>Màu chữ nổi bật (Text Accent)</label>
                    <div className={styles.colorPickerRow}>
                      <input
                        type="color"
                        className={styles.colorInput}
                        value={theme.textColors.textAccent}
                        onChange={(e) => {
                          const updated = {
                            ...theme,
                            textColors: { ...theme.textColors, textAccent: e.target.value },
                          };
                          setTheme(updated);
                          applyCSSVariables(updated);
                        }}
                      />
                      <span className={styles.colorHex}>{theme.textColors.textAccent}</span>
                    </div>
                  </div>
                </div>
              </>
            )}

            {/* TAB 5: COMPONENT COLORS */}
            {activeTab === 'components' && (
              <>
                <div className={styles.sectionHeader}>
                  <h3>Màu Sắc Khung & Thành Phần (Component Colors)</h3>
                  <p>Tùy chỉnh màu nền trang, thẻ sản phẩm, thanh menu và viền</p>
                </div>

                <div className={styles.fieldGrid}>
                  <div className={styles.formGroup}>
                    <label>Màu nền toàn bộ trang (Body Background)</label>
                    <div className={styles.colorPickerRow}>
                      <input
                        type="color"
                        className={styles.colorInput}
                        value={theme.componentColors.background}
                        onChange={(e) => {
                          const updated = {
                            ...theme,
                            componentColors: { ...theme.componentColors, background: e.target.value },
                          };
                          setTheme(updated);
                          applyCSSVariables(updated);
                        }}
                      />
                      <span className={styles.colorHex}>{theme.componentColors.background}</span>
                    </div>
                  </div>

                  <div className={styles.formGroup}>
                    <label>Màu nền thẻ Card / Box (Card Background)</label>
                    <div className={styles.colorPickerRow}>
                      <input
                        type="color"
                        className={styles.colorInput}
                        value={theme.componentColors.cardBackground}
                        onChange={(e) => {
                          const updated = {
                            ...theme,
                            componentColors: { ...theme.componentColors, cardBackground: e.target.value },
                          };
                          setTheme(updated);
                          applyCSSVariables(updated);
                        }}
                      />
                      <span className={styles.colorHex}>{theme.componentColors.cardBackground}</span>
                    </div>
                  </div>

                  <div className={styles.formGroup}>
                    <label>Màu nền Thanh Menu Header (Navbar)</label>
                    <div className={styles.colorPickerRow}>
                      <input
                        type="color"
                        className={styles.colorInput}
                        value={theme.componentColors.navbarBg}
                        onChange={(e) => {
                          const updated = {
                            ...theme,
                            componentColors: { ...theme.componentColors, navbarBg: e.target.value },
                          };
                          setTheme(updated);
                          applyCSSVariables(updated);
                        }}
                      />
                      <span className={styles.colorHex}>{theme.componentColors.navbarBg}</span>
                    </div>
                  </div>

                  <div className={styles.formGroup}>
                    <label>Màu đường viền khung (Border Color)</label>
                    <div className={styles.colorPickerRow}>
                      <input
                        type="color"
                        className={styles.colorInput}
                        value={theme.componentColors.borderColor}
                        onChange={(e) => {
                          const updated = {
                            ...theme,
                            componentColors: { ...theme.componentColors, borderColor: e.target.value },
                          };
                          setTheme(updated);
                          applyCSSVariables(updated);
                        }}
                      />
                      <span className={styles.colorHex}>{theme.componentColors.borderColor}</span>
                    </div>
                  </div>
                </div>
              </>
            )}

            {/* TAB 6: CHANGE PASSWORD */}
            {activeTab === 'password' && (
              <form onSubmit={handleChangePassword} style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
                <div className={styles.sectionHeader}>
                  <h3>Đổi Mật Khẩu Quản Trị</h3>
                  <p>Cập nhật mật khẩu bảo mật cho tài khoản Quản trị đang đăng nhập</p>
                </div>

                <div className={styles.formGroup}>
                  <label>Mật khẩu hiện tại *</label>
                  <input
                    type="password"
                    required
                    className={styles.input}
                    placeholder="Nhập mật khẩu hiện tại"
                    value={passwordForm.currentPassword}
                    onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
                  />
                </div>

                <div className={styles.formGroup}>
                  <label>Mật khẩu mới *</label>
                  <input
                    type="password"
                    required
                    className={styles.input}
                    placeholder="Tối thiểu 6 ký tự"
                    value={passwordForm.newPassword}
                    onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                  />
                </div>

                <div className={styles.formGroup}>
                  <label>Xác nhận mật khẩu mới *</label>
                  <input
                    type="password"
                    required
                    className={styles.input}
                    placeholder="Nhập lại mật khẩu mới"
                    value={passwordForm.confirmPassword}
                    onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                  />
                </div>

                <button
                  type="submit"
                  className={styles.saveBtn}
                  disabled={changingPassword}
                  style={{ alignSelf: 'flex-start', marginTop: 8 }}
                >
                  <FiLock /> {changingPassword ? 'Đang cập nhật...' : 'Cập Nhật Mật Khẩu'}
                </button>
              </form>
            )}
          </div>
        </div>

        {/* Right Column: Live Interactive Preview */}
        <div className={styles.previewSticky}>
          <div className={styles.previewCard}>
            <div className={styles.previewHeader}>
              <h3>
                <FiEye style={{ color: '#3b82f6' }} /> Xem Trước Trực Tiếp (Live Preview)
              </h3>
              <span className={styles.badgeLive}>Realtime</span>
            </div>

            <div
              className={styles.previewContainer}
              style={{
                backgroundColor: theme.componentColors.background,
                color: theme.textColors.textPrimary,
              }}
            >
              {/* Mock Banner */}
              {theme.pageTitles.showBannerNotice && (
                <div
                  className={styles.mockBanner}
                  style={{
                    backgroundColor: theme.buttonColors.primaryBg,
                    color: theme.buttonColors.primaryText,
                  }}
                >
                  {theme.pageTitles.bannerNotice}
                </div>
              )}

              {/* Mock Header */}
              <div
                className={styles.mockHeader}
                style={{
                  backgroundColor: theme.componentColors.navbarBg,
                  borderColor: theme.componentColors.borderColor,
                }}
              >
                <div className={styles.mockLogo} style={{ color: theme.textColors.textPrimary }}>
                  {theme.pageTitles.logoUrl ? (
                    <img
                      src={theme.pageTitles.logoUrl}
                      alt="Logo"
                      style={{ height: 28, objectFit: 'contain' }}
                    />
                  ) : (
                    <span>
                      {theme.pageTitles.logoText || 'ShopTik'}
                      <span style={{ color: theme.buttonColors.primaryBg }}>.vn</span>
                    </span>
                  )}
                </div>
                <span
                  style={{
                    fontSize: '0.75rem',
                    color: theme.textColors.textSecondary,
                    padding: '4px 10px',
                    borderRadius: theme.buttonColors.borderRadius,
                    backgroundColor: theme.buttonColors.secondaryBg,
                    border: `1px solid ${theme.componentColors.borderColor}`,
                  }}
                >
                  Giỏ hàng (2)
                </span>
              </div>

              {/* Mock Product Card */}
              <div
                className={styles.mockProductCard}
                style={{
                  backgroundColor: theme.componentColors.cardBackground,
                  borderColor: theme.componentColors.borderColor,
                }}
              >
                <img
                  src="https://images.unsplash.com/photo-1581655353564-df123a1eb820?auto=format&fit=crop&w=200&q=80"
                  alt="Mock Product"
                  className={styles.mockImg}
                />
                <div className={styles.mockProductInfo}>
                  <span
                    style={{
                      fontSize: '0.6875rem',
                      color: theme.buttonColors.primaryBg,
                      fontWeight: 700,
                      textTransform: 'uppercase',
                    }}
                  >
                    Thời Trang Nam
                  </span>
                  <h4 className={styles.mockTitle} style={{ color: theme.textColors.textPrimary }}>
                    Áo Polo Phối Bo Cổ Cao Cấp
                  </h4>
                  <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
                    <span
                      className={styles.mockPrice}
                      style={{ color: theme.buttonColors.primaryBg }}
                    >
                      189.000đ
                    </span>
                    <span
                      style={{
                        fontSize: '0.75rem',
                        color: theme.textColors.textMuted,
                        textDecoration: 'line-through',
                      }}
                    >
                      250.000đ
                    </span>
                  </div>
                </div>
              </div>

              {/* Mock Action Buttons */}
              <div className={styles.mockButtonsRow}>
                <button
                  className={styles.mockPrimaryBtn}
                  style={{
                    backgroundColor: theme.buttonColors.primaryBg,
                    color: theme.buttonColors.primaryText,
                    borderRadius: theme.buttonColors.borderRadius,
                  }}
                >
                  Mua Ngay
                </button>
                <button
                  className={styles.mockSecondaryBtn}
                  style={{
                    backgroundColor: theme.buttonColors.secondaryBg,
                    color: theme.buttonColors.secondaryText,
                    borderColor: theme.componentColors.borderColor,
                    borderRadius: theme.buttonColors.borderRadius,
                  }}
                >
                  Chi Tiết
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
