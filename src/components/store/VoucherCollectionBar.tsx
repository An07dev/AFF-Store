'use client';

import React, { useState, useEffect } from 'react';
import { FiGift, FiClock, FiCheck } from 'react-icons/fi';
import { apiFetch } from '@/lib/api';
import { clientCache } from '@/lib/clientCache';
import { useVoucherWallet } from '@/hooks/useVoucherWallet';
import styles from './VoucherCollectionBar.module.css';

interface IVoucherItem {
  _id: string;
  code: string;
  name: string;
  description?: string;
  discountType: 'fixed' | 'percent';
  discountValue: number;
  maxDiscountAmount: number;
  minOrderValue: number;
  endDate: string;
  isUsedByCustomer?: boolean;
}

const DEFAULT_SAMPLE_VOUCHERS: IVoucherItem[] = [
  {
    _id: 'v1',
    code: 'GIAM20K',
    name: 'Giảm 20k cho đơn từ 200k',
    discountType: 'fixed',
    discountValue: 20000,
    maxDiscountAmount: 20000,
    minOrderValue: 200000,
    endDate: '2026-12-31T23:59:59Z',
  },
  {
    _id: 'v2',
    code: 'FREESHIP',
    name: 'Freeship 0Đ cho đơn từ 300k',
    discountType: 'fixed',
    discountValue: 30000,
    maxDiscountAmount: 30000,
    minOrderValue: 300000,
    endDate: '2026-12-31T23:59:59Z',
  },
  {
    _id: 'v3',
    code: 'SIEUDEAL10',
    name: 'Giảm 10% tối đa 50k',
    discountType: 'percent',
    discountValue: 10,
    maxDiscountAmount: 50000,
    minOrderValue: 400000,
    endDate: '2026-12-31T23:59:59Z',
  },
  {
    _id: 'v4',
    code: 'VIP50K',
    name: 'Giảm 50k cho đơn từ 500k',
    discountType: 'fixed',
    discountValue: 50000,
    maxDiscountAmount: 50000,
    minOrderValue: 500000,
    endDate: '2026-12-31T23:59:59Z',
  },
];

export default function VoucherCollectionBar() {
  const [vouchers, setVouchers] = useState<IVoucherItem[]>(DEFAULT_SAMPLE_VOUCHERS);
  const [loading, setLoading] = useState(false);
  const { isSaved, saveVoucher } = useVoucherWallet();

  useEffect(() => {
    async function loadVouchers() {
      try {
        let phone = '';
        try {
          const profile = JSON.parse(localStorage.getItem('shopbig_profile') || '{}');
          if (profile?.phone) phone = profile.phone;
        } catch (e) {}

        const cacheKey = `public_vouchers_${phone}`;
        const data = await clientCache.fetchWithCache(
          cacheKey,
          async () => {
            const res = await apiFetch(`/api/vouchers?phone=${encodeURIComponent(phone)}`);
            return await res.json();
          },
          45000 // 45s TTL
        );

        if (data?.success && Array.isArray(data?.data) && data.data.length > 0) {
          setVouchers(data.data);
        }
      } catch (err) {
        console.error('Error fetching public vouchers:', err);
      } finally {
        setLoading(false);
      }
    }
    loadVouchers();
  }, []);

  const formatCurrency = (amount: number) => {
    if (amount >= 1000) {
      return `${Math.round(amount / 1000)}k`;
    }
    return new Intl.NumberFormat('vi-VN').format(amount);
  };

  const formatMinSpend = (amount: number) => {
    if (!amount || amount === 0) return 'Đơn Tối Thiểu 0đ';
    return `Đơn Tối Thiểu ₫${formatCurrency(amount)}`;
  };

  const formatExpiry = (dateStr: string) => {
    if (!dateStr) return '';
    const d = new Date(dateStr);
    return `HSD: ${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}`;
  };

  return (
    <div className={styles.wrapper}>
      <div className={styles.sectionHeader}>
        <div className={styles.titleGroup}>
          <span className={styles.iconBadge}>
            <FiGift />
          </span>
          <span className={styles.title}>Mã Giảm Giá Của Shop</span>
        </div>
        <span className={styles.subtitle}>Lưu mã ngay để áp dụng giảm giá khi thanh toán</span>
      </div>

      <div className={styles.carousel}>
        {vouchers.map((item) => {
          const saved = isSaved(item.code);
          const isUsed = item.isUsedByCustomer;
          const badgeText =
            item.discountType === 'percent'
              ? `-${item.discountValue}%`
              : `-${formatCurrency(item.discountValue)}`;

          return (
            <div key={item._id || item.code} className={styles.voucherCard}>
              {/* Left Ticket Badge */}
              <div className={styles.leftBadge}>
                <span className={styles.badgeValue}>{badgeText}</span>
                <span className={styles.badgeLabel}>GIẢM GIÁ</span>
              </div>

              {/* Dashed Divider */}
              <div className={styles.dashedDivider} />

              {/* Right Content */}
              <div className={styles.rightContent}>
                <div className={styles.codeName} title={item.name}>
                  {item.name || item.code}
                </div>
                <div className={styles.minSpend}>
                  {formatMinSpend(item.minOrderValue)}
                </div>

                <div className={styles.bottomRow}>
                  <span className={styles.expiry}>
                    <FiClock size={10} /> {formatExpiry(item.endDate)}
                  </span>

                  {isUsed ? (
                    <button type="button" className={styles.usedBtn} disabled>
                      Đã Dùng
                    </button>
                  ) : saved ? (
                    <button type="button" className={styles.savedBtn} disabled>
                      <FiCheck size={11} /> Đã Lưu
                    </button>
                  ) : (
                    <button
                      type="button"
                      className={styles.saveBtn}
                      onClick={() => saveVoucher(item.code)}
                    >
                      Lưu Mã
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
