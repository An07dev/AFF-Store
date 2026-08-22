'use client';

import React, { useState, useEffect } from 'react';
import { FiX, FiCheck, FiTag, FiAlertCircle } from 'react-icons/fi';
import toast from 'react-hot-toast';
import { apiFetch } from '@/lib/api';
import { useVoucherWallet } from '@/hooks/useVoucherWallet';
import styles from './CheckoutVoucherModal.module.css';

export interface IVoucherOption {
  _id?: string;
  code: string;
  name: string;
  description?: string;
  discountType: 'fixed' | 'percent';
  discountValue: number;
  maxDiscountAmount?: number;
  minOrderValue?: number;
  endDate?: string;
  discountAmount?: number;
  isUsedByCustomer?: boolean;
}

interface CheckoutVoucherModalProps {
  isOpen: boolean;
  onClose: () => void;
  orderSubtotal: number;
  customerPhone?: string;
  selectedVoucher: IVoucherOption | null;
  onSelectVoucher: (voucher: IVoucherOption | null) => void;
}

export default function CheckoutVoucherModal({
  isOpen,
  onClose,
  orderSubtotal,
  customerPhone = '',
  selectedVoucher,
  onSelectVoucher,
}: CheckoutVoucherModalProps) {
  const [vouchers, setVouchers] = useState<IVoucherOption[]>([]);
  const [inputCode, setInputCode] = useState('');
  const [validating, setValidating] = useState(false);
  const [tempSelected, setTempSelected] = useState<IVoucherOption | null>(selectedVoucher);
  const { savedVouchers } = useVoucherWallet();

  // Load available shop vouchers when modal opens
  useEffect(() => {
    if (!isOpen) return;
    setTempSelected(selectedVoucher);

    async function fetchVouchers() {
      try {
        const res = await apiFetch(`/api/vouchers?phone=${encodeURIComponent(customerPhone)}`);
        const data = await res.json();
        if (data.success && Array.isArray(data.data)) {
          setVouchers(data.data);
        }
      } catch (e) {
        console.error('Error fetching vouchers in modal:', e);
      }
    }
    fetchVouchers();
  }, [isOpen, selectedVoucher, customerPhone]);

  if (!isOpen) return null;

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('vi-VN').format(val);
  };

  const calculateDiscount = (v: IVoucherOption): number => {
    if (v.discountAmount !== undefined) return v.discountAmount;
    if (v.discountType === 'fixed') {
      return Math.min(v.discountValue, orderSubtotal);
    }
    const calculated = Math.round((orderSubtotal * v.discountValue) / 100);
    if (v.maxDiscountAmount && v.maxDiscountAmount > 0) {
      return Math.min(calculated, v.maxDiscountAmount, orderSubtotal);
    }
    return Math.min(calculated, orderSubtotal);
  };

  // Validate custom voucher code entered manually
  const handleApplyInputCode = async () => {
    if (!inputCode.trim()) {
      toast.error('Vui lòng nhập mã Voucher!');
      return;
    }
    setValidating(true);
    try {
      const res = await apiFetch('/api/vouchers/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code: inputCode.trim(),
          orderSubtotal,
          phone: customerPhone,
        }),
      });
      const data = await res.json();
      if (data.success && data.data) {
        const validVoucher: IVoucherOption = {
          code: data.data.code,
          name: data.data.name,
          description: data.data.description,
          discountType: data.data.discountType,
          discountValue: data.data.discountValue,
          discountAmount: data.data.discountAmount,
          minOrderValue: data.data.minOrderValue,
        };

        // Add to list if not present
        setVouchers((prev) => {
          if (prev.some((it) => it.code === validVoucher.code)) return prev;
          return [validVoucher, ...prev];
        });

        setTempSelected(validVoucher);
        toast.success(data.message || 'Áp dụng mã thành công!');
        setInputCode('');
      } else {
        toast.error(data.message || 'Mã giảm giá không hợp lệ!');
      }
    } catch (e: any) {
      toast.error(e.message || 'Lỗi kiểm tra mã');
    } finally {
      setValidating(false);
    }
  };

  const handleConfirm = () => {
    onSelectVoucher(tempSelected);
    onClose();
  };

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className={styles.modalHeader}>
          <div className={styles.headerTitle}>
            <FiTag style={{ color: 'var(--primary, #f97316)' }} />
            <span>Chọn Shop Voucher</span>
          </div>
          <button type="button" className={styles.closeBtn} onClick={onClose}>
            <FiX />
          </button>
        </div>

        {/* Input Code Section */}
        <div className={styles.inputSection}>
          <div className={styles.inputGroup}>
            <input
              type="text"
              placeholder="Nhập mã giảm giá..."
              value={inputCode}
              onChange={(e) => setInputCode(e.target.value.toUpperCase())}
              onKeyDown={(e) => e.key === 'Enter' && handleApplyInputCode()}
              className={styles.codeInput}
            />
            <button
              type="button"
              className={styles.applyInputBtn}
              onClick={handleApplyInputCode}
              disabled={validating || !inputCode.trim()}
            >
              {validating ? 'Đang kiểm tra...' : 'Áp Dụng'}
            </button>
          </div>
        </div>

        {/* Voucher List */}
        <div className={styles.modalBody}>
          {vouchers.length === 0 ? (
            <div className={styles.emptyState}>
              <FiAlertCircle size={28} style={{ marginBottom: 8, opacity: 0.6 }} />
              <div>Hiện chưa có mã giảm giá nào khả dụng</div>
            </div>
          ) : (
            vouchers.map((v) => {
              const minSpend = v.minOrderValue || 0;
              const isEligible = orderSubtotal >= minSpend;
              const isSelected = tempSelected?.code === v.code;
              const discount = calculateDiscount(v);
              const badgeText =
                v.discountType === 'percent'
                  ? `-${v.discountValue}%`
                  : `-${formatCurrency(v.discountValue / 1000)}K`;

              return (
                <div
                  key={v.code}
                  className={`${styles.voucherItem} ${
                    isSelected ? styles.voucherItemSelected : ''
                  } ${!isEligible || v.isUsedByCustomer ? styles.disabled : ''}`}
                  onClick={() => {
                    if (v.isUsedByCustomer) {
                      toast.error(`Mã "${v.code}" đã được sử dụng với số điện thoại của bạn!`);
                      return;
                    }
                    if (isEligible) {
                      setTempSelected(isSelected ? null : { ...v, discountAmount: discount });
                    } else {
                      const missing = minSpend - orderSubtotal;
                      toast.error(`Cần mua thêm ${formatCurrency(missing)}đ để áp dụng mã này!`);
                    }
                  }}
                >
                  {/* Left Ticket Badge */}
                  <div className={styles.itemLeftBadge}>
                    <span className={styles.itemBadgeValue}>{badgeText}</span>
                    <span className={styles.itemBadgeLabel}>GIẢM</span>
                  </div>

                  {/* Dashed Divider */}
                  <div className={styles.itemDivider} />

                  {/* Right Content */}
                  <div className={styles.itemRightContent}>
                    <div className={styles.itemTopLine}>
                      <span className={styles.itemTitle}>{v.name || v.code}</span>
                      <div
                        className={`${styles.itemRadio} ${
                          isSelected ? styles.itemRadioActive : ''
                        }`}
                      >
                        {isSelected && <FiCheck size={11} />}
                      </div>
                    </div>

                    <div className={styles.itemDesc}>
                      {minSpend > 0
                        ? `Đơn tối thiểu ${formatCurrency(minSpend)}đ`
                        : 'Áp dụng cho mọi đơn hàng'}
                    </div>

                    <div className={styles.itemBottomLine}>
                      {v.isUsedByCustomer ? (
                        <span className={styles.itemMissing} style={{ color: '#94a3b8' }}>
                          ✓ Đã sử dụng trên SĐT này
                        </span>
                      ) : isEligible ? (
                        <span className={styles.itemSavings}>
                          Tiết kiệm: {formatCurrency(discount)}đ
                        </span>
                      ) : (
                        <span className={styles.itemMissing}>
                          Mua thêm {formatCurrency(minSpend - orderSubtotal)}đ
                        </span>
                      )}

                      {v.endDate && (
                        <span className={styles.itemExpiry}>
                          HSD: {new Date(v.endDate).toLocaleDateString('vi-VN')}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className={styles.modalFooter}>
          <button
            type="button"
            className={styles.cancelBtn}
            onClick={() => {
              setTempSelected(null);
              onSelectVoucher(null);
              onClose();
            }}
          >
            Bỏ chọn mã
          </button>
          <button
            type="button"
            className={styles.confirmBtn}
            onClick={handleConfirm}
          >
            Đồng Ý
          </button>
        </div>
      </div>
    </div>
  );
}
