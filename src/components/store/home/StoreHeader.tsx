'use client';

import React, { useState, useEffect, memo } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { FiSearch, FiShare2, FiShoppingCart, FiMessageSquare } from 'react-icons/fi';
import toast from 'react-hot-toast';
import styles from '@/app/(store)/page.module.css';

interface StoreHeaderProps {
  logoUrl?: string;
  logoText?: string;
  cartCount: number;
  searchQuery: string;
  onSearchSubmit: (query: string) => void;
  onClearSearch: () => void;
}

const StoreHeaderComponent: React.FC<StoreHeaderProps> = ({
  logoUrl,
  logoText = 'ShopTik',
  cartCount,
  searchQuery,
  onSearchSubmit,
  onClearSearch,
}) => {
  const router = useRouter();
  // Local input state to prevent top-level re-renders on each keystroke
  const [localSearch, setLocalSearch] = useState(searchQuery);

  useEffect(() => {
    setLocalSearch(searchQuery);
  }, [searchQuery]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearchSubmit(localSearch);
  };

  const handleClear = () => {
    setLocalSearch('');
    onClearSearch();
  };

  const handleShare = () => {
    if (typeof window !== 'undefined') {
      navigator.clipboard.writeText(window.location.href);
      toast.success('Đã sao chép liên kết cửa hàng!');
    }
  };

  const avatarInitials = logoText ? logoText.substring(0, 2).toUpperCase() : 'ST';

  return (
    <header className={styles.header}>
      {/* Desktop Logo Branding (Visible only on PC/Tablet) */}
      <Link href="/" className={styles.desktopLogoWrap}>
        {logoUrl ? (
          <img
            src={logoUrl}
            alt={logoText}
            className={styles.desktopLogoImg}
            loading="eager"
            decoding="async"
          />
        ) : (
          <div className={styles.desktopLogoAvatar}>{avatarInitials}</div>
        )}
        <div className={styles.desktopLogoTexts}>
          <span className={styles.desktopLogoTitle}>{logoText}</span>
          <span className={styles.desktopLogoSubtitle}>Cửa Hàng Chính Hãng</span>
        </div>
      </Link>

      <form className={styles.headerSearchForm} onSubmit={handleSubmit}>
        <FiSearch size={16} className={styles.searchIcon} />
        <input
          type="text"
          className={styles.headerSearchInput}
          placeholder="Tìm kiếm sản phẩm, thương hiệu trên shop..."
          value={localSearch}
          onChange={(e) => setLocalSearch(e.target.value)}
        />
        {localSearch && (
          <button
            type="button"
            className={styles.clearSearchBtn}
            onClick={handleClear}
            aria-label="Xóa tìm kiếm"
          >
            ✕
          </button>
        )}
      </form>

      <div className={styles.headerActions}>
        <button
          type="button"
          className={styles.headerIconBtn}
          onClick={() => router.push('/chat')}
          aria-label="Tin nhắn"
          title="Chat với Shop"
        >
          <FiMessageSquare size={18} />
          <span className={styles.headerIconLabel}>Chat</span>
        </button>

        <Link href="/cart" className={styles.headerIconBtn} aria-label="Giỏ hàng" title="Giỏ hàng">
          <FiShoppingCart size={18} />
          {cartCount > 0 && <span className={styles.cartBadge}>{cartCount}</span>}
          <span className={styles.headerIconLabel}>Giỏ Hàng</span>
        </Link>

        <button
          type="button"
          className={styles.headerIconBtn}
          onClick={handleShare}
          aria-label="Chia sẻ"
          title="Chia sẻ cửa hàng"
        >
          <FiShare2 size={17} />
          <span className={styles.headerIconLabel}>Chia Sẻ</span>
        </button>
      </div>
    </header>
  );
};

export const StoreHeader = memo(StoreHeaderComponent);
export default StoreHeader;
