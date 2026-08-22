'use client';

import { useState, useEffect, useCallback } from 'react';
import toast from 'react-hot-toast';

const STORAGE_KEY = 'shoptik_saved_vouchers';

export function useVoucherWallet() {
  const [savedVouchers, setSavedVouchers] = useState<string[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  // 1. Load saved voucher codes from localStorage on client mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        setSavedVouchers(JSON.parse(stored));
      }
    } catch (e) {
      console.error('Error loading saved vouchers from storage:', e);
    } finally {
      setIsLoaded(true);
    }
  }, []);

  // 2. Listen to cross-component sync events
  useEffect(() => {
    const handleSync = () => {
      try {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored) {
          setSavedVouchers(JSON.parse(stored));
        }
      } catch (e) {}
    };

    window.addEventListener('shoptik_voucher_saved', handleSync);
    window.addEventListener('storage', handleSync);
    return () => {
      window.removeEventListener('shoptik_voucher_saved', handleSync);
      window.removeEventListener('storage', handleSync);
    };
  }, []);

  // 3. Save voucher code into wallet
  const saveVoucher = useCallback((code: string) => {
    if (!code) return;
    const cleanCode = code.trim().toUpperCase();

    setSavedVouchers((prev) => {
      if (prev.includes(cleanCode)) {
        toast('Mã giảm giá này đã có trong ví của bạn!', { icon: 'ℹ️' });
        return prev;
      }
      const updated = [...prev, cleanCode];
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
        window.dispatchEvent(new CustomEvent('shoptik_voucher_saved'));
      } catch (e) {}
      toast.success(`Đã lưu mã "${cleanCode}" vào ví voucher! 🎉`);
      return updated;
    });
  }, []);

  // 4. Remove voucher code from wallet
  const removeVoucher = useCallback((code: string) => {
    if (!code) return;
    const cleanCode = code.trim().toUpperCase();

    setSavedVouchers((prev) => {
      const updated = prev.filter((c) => c !== cleanCode);
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
        window.dispatchEvent(new CustomEvent('shoptik_voucher_saved'));
      } catch (e) {}
      return updated;
    });
  }, []);

  // 5. Check if voucher code is saved
  const isSaved = useCallback(
    (code: string) => {
      if (!code) return false;
      return savedVouchers.includes(code.trim().toUpperCase());
    },
    [savedVouchers]
  );

  return {
    savedVouchers,
    isLoaded,
    saveVoucher,
    removeVoucher,
    isSaved,
  };
}
