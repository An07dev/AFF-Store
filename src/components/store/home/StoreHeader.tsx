'use client';

import React, { useState, useEffect, useRef, useMemo, memo } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  FiSearch,
  FiShoppingCart,
  FiClock,
  FiX,
} from 'react-icons/fi';
import styles from '@/app/(store)/page.module.css';

interface StoreHeaderProps {
  logoUrl?: string;
  logoText?: string;
  cartCount: number;
  searchQuery: string;
  onSearchSubmit: (query: string) => void;
  onClearSearch: () => void;
}

const DEFAULT_KEYWORDS = [
  'Áo Polo Nam',
  'Sơ Mi Oxford',
  'Quần Tây Slimfit',
  'Áo Khoác Gió',
  'Quần Kaki 4 Chiều',
  'Polo Pima Chống Nhăn',
];

const SEARCH_HISTORY_KEY = 'shopee_search_history';

const StoreHeaderComponent: React.FC<StoreHeaderProps> = ({
  logoUrl,
  logoText = 'Shopee',
  cartCount,
  searchQuery,
  onSearchSubmit,
  onClearSearch,
}) => {
  const router = useRouter();
  const [localSearch, setLocalSearch] = useState(searchQuery);
  const [searchHistory, setSearchHistory] = useState<string[]>([]);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [logoError, setLogoError] = useState(false);
  const searchContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setLogoError(false);
  }, [logoUrl]);

  // 1. Load search history from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem(SEARCH_HISTORY_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          setSearchHistory(parsed);
        }
      }
    } catch (e) {
      console.error('Error reading search history from localStorage:', e);
    }
  }, []);

  // 2. Sync with parent searchQuery
  useEffect(() => {
    setLocalSearch(searchQuery);
  }, [searchQuery]);

  // 3. Close search dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (
        searchContainerRef.current &&
        !searchContainerRef.current.contains(e.target as Node)
      ) {
        setIsDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Save term to search history
  const saveToHistory = (term: string) => {
    const trimmed = term.trim();
    if (!trimmed) return;
    const updated = [
      trimmed,
      ...searchHistory.filter((item) => item.toLowerCase() !== trimmed.toLowerCase()),
    ].slice(0, 8);

    setSearchHistory(updated);
    try {
      localStorage.setItem(SEARCH_HISTORY_KEY, JSON.stringify(updated));
    } catch (e) {
      console.error('Error saving search history:', e);
    }
  };

  const handleClearAllHistory = (e: React.MouseEvent) => {
    e.stopPropagation();
    setSearchHistory([]);
    try {
      localStorage.removeItem(SEARCH_HISTORY_KEY);
    } catch (e) {}
  };

  const handleDeleteHistoryItem = (e: React.MouseEvent, item: string) => {
    e.stopPropagation();
    const updated = searchHistory.filter((h) => h !== item);
    setSearchHistory(updated);
    try {
      localStorage.setItem(SEARCH_HISTORY_KEY, JSON.stringify(updated));
    } catch (e) {}
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsDropdownOpen(false);
    if (localSearch.trim()) {
      saveToHistory(localSearch);
    }
    onSearchSubmit(localSearch);
  };

  const handleKeywordClick = (kw: string) => {
    setLocalSearch(kw);
    saveToHistory(kw);
    setIsDropdownOpen(false);
    onSearchSubmit(kw);
  };

  // Keywords displayed directly under the search bar:
  // Shows search history first, then fills with default keywords up to 7 items
  const displayedKeywords = useMemo(() => {
    const list = [...searchHistory];
    for (const kw of DEFAULT_KEYWORDS) {
      if (!list.some((item) => item.toLowerCase() === kw.toLowerCase())) {
        list.push(kw);
      }
      if (list.length >= 7) break;
    }
    return list.slice(0, 7);
  }, [searchHistory]);

  return (
    <div className={styles.shopeeHeaderWrapper}>
      {/* SHOPEE MAIN SEARCH & LOGO ROW */}
      <div className={styles.shopeeMainHeader}>
        <div className={styles.shopeeMainHeaderInner}>
          {/* Shopee Logo Brand */}
          <Link href="/" className={styles.shopeeLogoBrand}>
            {logoUrl && !logoError ? (
              <img
                src={logoUrl}
                alt={logoText || 'Logo'}
                className={styles.shopeeHeaderLogoImg}
                onError={() => setLogoError(true)}
              />
            ) : (
              <div className={styles.shopeeBagIcon}>
                <svg viewBox="0 0 24 24" width="36" height="36" fill="currentColor">
                  <path d="M19 6h-2c0-2.76-2.24-5-5-5S7 3.24 7 6H5c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2zm-7-3c1.66 0 3 1.34 3 3H9c0-1.66 1.34-3 3-3zm7 17H5V8h14v12zm-7-8c-1.66 0-3-1.34-3-3H7c0 2.76 2.24 5 5 5s5-2.24 5-5h-2c0 1.66-1.34 3-3 3z" />
                </svg>
              </div>
            )}
            <span className={styles.shopeeLogoText}>{logoText || 'Shopee'}</span>
          </Link>

          {/* Shopee Center Search Bar */}
          <div ref={searchContainerRef} className={styles.shopeeSearchContainer}>
            <form className={styles.shopeeSearchForm} onSubmit={handleSubmit}>
              <input
                type="text"
                className={styles.shopeeSearchInput}
                placeholder="Tìm kiếm trong Shop..."
                value={localSearch}
                onFocus={() => setIsDropdownOpen(true)}
                onChange={(e) => {
                  setLocalSearch(e.target.value);
                  setIsDropdownOpen(true);
                }}
              />

              <div className={styles.shopeeScopeDropdown}>
                <span>Trong Shop này</span>
                <span style={{ fontSize: 10, marginLeft: 3 }}>▼</span>
              </div>

              <button type="submit" className={styles.shopeeSearchBtn} aria-label="Tìm kiếm">
                <FiSearch size={16} className={styles.shopeeSearchBtnIcon} />
              </button>

              {/* Shopee Search History & Suggestions Dropdown */}
              {isDropdownOpen && (
                <div className={styles.shopeeSearchHistoryDropdown}>
                  {searchHistory.length > 0 && (
                    <>
                      <div className={styles.searchHistoryHeader}>
                        <span>LỊCH SỬ TÌM KIẾM</span>
                        <button
                          type="button"
                          className={styles.clearHistoryBtn}
                          onClick={handleClearAllHistory}
                        >
                          Xóa tất cả
                        </button>
                      </div>
                      <div className={styles.searchHistoryList}>
                        {searchHistory.map((item, idx) => (
                          <div
                            key={idx}
                            className={styles.searchHistoryItem}
                            onClick={() => handleKeywordClick(item)}
                          >
                            <div className={styles.historyItemText}>
                              <FiClock size={13} color="#888888" />
                              <span>{item}</span>
                            </div>
                            <button
                              type="button"
                              className={styles.deleteHistoryItemBtn}
                              onClick={(e) => handleDeleteHistoryItem(e, item)}
                              aria-label={`Xóa ${item}`}
                            >
                              <FiX size={13} />
                            </button>
                          </div>
                        ))}
                      </div>
                    </>
                  )}

                  {/* Popular Suggestions Section */}
                  <div className={styles.searchHistoryHeader}>
                    <span>GỢI Ý TÌM KIẾM PHỔ BIẾN</span>
                  </div>
                  <div className={styles.searchHistoryList}>
                    {DEFAULT_KEYWORDS.map((kw, idx) => (
                      <div
                        key={idx}
                        className={styles.searchHistoryItem}
                        onClick={() => handleKeywordClick(kw)}
                      >
                        <div className={styles.historyItemText}>
                          <FiSearch size={13} color="var(--primary, #ee4d2d)" />
                          <span>{kw}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </form>

            {/* Keyword Quick Links (Lưu và hiển thị lịch sử tìm kiếm cùng từ khóa phổ biến) */}
            <div className={styles.shopeeKeywordRow}>
              {displayedKeywords.map((kw, i) => (
                <button
                  key={i}
                  type="button"
                  className={styles.shopeeKeywordTag}
                  onClick={() => handleKeywordClick(kw)}
                >
                  {kw}
                </button>
              ))}
            </div>
          </div>

          {/* Shopee Cart Icon */}
          <div className={styles.shopeeCartWrap}>
            <Link href="/cart" className={styles.shopeeCartBtn} aria-label="Giỏ hàng">
              <FiShoppingCart className={styles.shopeeCartIconSvg} />
              {cartCount > 0 && <span className={styles.shopeeCartBadge}>{cartCount}</span>}
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export const StoreHeader = memo(StoreHeaderComponent);
export default StoreHeader;

