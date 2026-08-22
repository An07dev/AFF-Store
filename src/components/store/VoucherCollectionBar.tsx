'use client';

import React, { useState, useEffect } from 'react';
import { FiGift, FiClock, FiCheck } from 'react-icons/fi';
import { apiFetch } from '@/lib/api';
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
}

export default function VoucherCollectionBar() {
  const [vouchers, setVouchers] = useState<IVoucherItem[]>([]);
  const [loading, setLoading] = useState(true);
  const { isSaved, saveVoucher } = useVoucherWallet();

  useEffect(() => {
    async function loadVouchers() {
      try {
        const res = await apiFetch('/api/vouchers');
        const data = await res.json();
        if (data.success && Array.isArray(data.data)) {
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

  if (loading || vouchers.length === 0) {
    return null; // Hidden if no active vouchers
  }

  const formatCurrency = (amount: number) => {
    if (amount >= 1000) {
      return `${Math.round(amount / 1000)}K`;
    }
    return new Intl.NumberFormat('vi-VN').format(amount);
  };

  const formatMinSpend = (amount: number) => {
    if (!amount || amount === 0) return 'Đơn từ 0đ';
    return `Đơn từ ${new Intl.NumberFormat('vi-VN').format(amount)}đ`;
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
        <span className={styles.subtitle}>Lưu mã để dùng khi thanh toán</span>
      </div>

      <div className={styles.carousel}>
        {vouchers.map((item) => {
          const saved = isSaved(item.code);
          const badgeText =
            item.discountType === 'percent'
              ? `-${item.discountValue}%`
              : `-${formatCurrency(item.discountValue)}`;

          return (
            <div key={item._id || item.code} className={styles.voucherCard}>
              {/* Left Ticket Badge */}
              <div className={styles.leftBadge}>
                <span className={styles.badgeValue}>{badgeText}</span>
                <span className={styles.badgeLabel}>
                  {item.discountType === 'percent' ? 'GIẢM' : 'GIẢM'}
                </span>
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

                  {saved ? (
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
