'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useSearchParams, useRouter } from 'next/navigation';
import {
  FiCheckCircle,
  FiChevronLeft,
  FiCopy,
  FiCheck,
  FiMapPin,
  FiTruck,
  FiCreditCard,
  FiShoppingBag,
  FiClock,
} from 'react-icons/fi';
import toast from 'react-hot-toast';
import { formatPrice } from '@/lib/utils';
import { useTheme } from '@/contexts/ThemeContext';
import StoreLoading from '@/components/store/StoreLoading';
import { apiFetch } from '@/lib/api';
import styles from './page.module.css';

export default function OrderSuccessPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const code = searchParams.get('code') || '';
  const isPaidQuery = searchParams.get('paid') === 'true';
  const { theme } = useTheme();

  const [order, setOrder] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    async function fetchOrderDetail() {
      if (!code) {
        setLoading(false);
        return;
      }
      try {
        setLoading(true);
        const res = await apiFetch(`/api/orders/${encodeURIComponent(code)}`);
        const data = await res.json();
        if (data.success && data.data) {
          setOrder(data.data);
        }
      } catch (err) {
        console.error('Error loading order details:', err);
      } finally {
        setLoading(false);
      }
    }

    fetchOrderDetail();
  }, [code]);

  const handleCopyCode = () => {
    const targetCode = order?.orderCode || code;
    if (typeof window !== 'undefined' && targetCode) {
      navigator.clipboard.writeText(targetCode);
      setCopied(true);
      toast.success(`Đã sao chép mã đơn #${targetCode}!`);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  if (loading) {
    return <StoreLoading text="Đang tải thông tin xác nhận đơn hàng..." />;
  }

  const orderCode = order?.orderCode || code || 'ST832025';
  const isPaid = isPaidQuery || order?.paymentStatus === 'paid';
  const shopName = theme?.pageTitles?.logoText || 'ShopTik Store';
  const subtotal = order?.subtotal || order?.items?.reduce((acc: number, i: any) => acc + (i.price * i.quantity), 0) || 0;
  const shippingFee = order?.shippingFee || 0;
  const totalAmount = order?.totalAmount || (subtotal + shippingFee);

  return (
    <div className={styles.page}>
      {/* Top Header */}
      <nav className={styles.topNav}>
        <button className={styles.backBtn} onClick={() => router.push('/')} aria-label="Trang chủ">
          <FiChevronLeft size={22} />
        </button>
        <div className={styles.navTitle}>Chi Tiết Đơn Hàng</div>
        <div style={{ width: 32 }} />
      </nav>

      <div className={styles.scrollArea}>
        {/* Success Hero Header */}
        <div className={styles.heroCard}>
          <div className={styles.iconRing}>
            <FiCheckCircle className={styles.successIcon} />
          </div>
          <h1 className={styles.heroTitle}>
            {isPaid ? 'Thanh Toán Thành Công!' : 'Đặt Hàng Thành Công!'}
          </h1>
          <p className={styles.heroDesc}>
            Cảm ơn bạn đã tin tưởng mua sắm tại <strong>{shopName}</strong>. Đơn hàng của bạn đã được ghi nhận vào hệ thống và đang được chuẩn bị.
          </p>

          <div className={styles.codeContainer}>
            <span className={styles.codeLabel}>Mã đơn hàng:</span>
            <div className={styles.codeBox} onClick={handleCopyCode} title="Nhấn để sao chép">
              <span className={styles.codeText}>#{orderCode}</span>
              <button type="button" className={styles.copyBtn} aria-label="Sao chép">
                {copied ? <FiCheck size={14} color="#10b981" /> : <FiCopy size={14} />}
              </button>
            </div>
          </div>
        </div>

        {/* Order Step Progress Tracker */}
        <div className={styles.trackerCard}>
          <h3 className={styles.trackerTitle}>
            <FiClock size={15} color="var(--primary, #3b82f6)" />
            <span>Tiến Trình Đơn Hàng</span>
          </h3>

          <div className={styles.stepperContainer}>
            {/* Step 1 */}
            <div className={`${styles.stepItem} ${styles.stepCompleted}`}>
              <div className={styles.stepDot}>
                <FiCheck size={12} />
              </div>
              <span className={styles.stepName}>Đã Đặt</span>
            </div>

            <div className={`${styles.stepLine} ${styles.lineCompleted}`} />

            {/* Step 2 */}
            <div className={`${styles.stepItem} ${styles.stepActive}`}>
              <div className={styles.stepDot}>2</div>
              <span className={styles.stepName}>Đang Chuẩn Bị</span>
            </div>

            <div className={styles.stepLine} />

            {/* Step 3 */}
            <div className={styles.stepItem}>
              <div className={styles.stepDot}>3</div>
              <span className={styles.stepName}>Đang Giao</span>
            </div>

            <div className={styles.stepLine} />

            {/* Step 4 */}
            <div className={styles.stepItem}>
              <div className={styles.stepDot}>4</div>
              <span className={styles.stepName}>Hoàn Tất</span>
            </div>
          </div>
        </div>

        {/* Ordered Items Card */}
        {order?.items && order.items.length > 0 && (
          <div className={styles.card}>
            <div className={styles.cardHeader}>
              <FiShoppingBag size={16} color="var(--primary, #3b82f6)" />
              <span>Sản Phẩm Đã Mua ({order.items.length})</span>
            </div>

            <div className={styles.itemList}>
              {order.items.map((item: any, idx: number) => (
                <div key={idx} className={styles.itemRow}>
                  <img
                    src={item.image || 'https://images.unsplash.com/photo-1581655353564-df123a1eb820?w=400'}
                    alt={item.name}
                    className={styles.itemImg}
                  />
                  <div className={styles.itemDetails}>
                    <span className={styles.itemName}>{item.name}</span>
                    {item.variant?.name && (
                      <span className={styles.itemVariant}>Phân loại: {item.variant.name}</span>
                    )}
                    <div className={styles.itemPriceRow}>
                      <span className={styles.itemPrice}>
                        {formatPrice((item.variant?.price || item.price) * item.quantity)}
                      </span>
                      <span className={styles.itemQty}>x{item.quantity}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Delivery Address & Shipping Carrier Card */}
        <div className={styles.card}>
          <div className={styles.cardHeader}>
            <FiMapPin size={16} color="var(--primary, #3b82f6)" />
            <span>Địa Chỉ Nhận Hàng</span>
          </div>

          <div className={styles.addressBox}>
            <div className={styles.customerRow}>
              <span className={styles.customerName}>
                {order?.customer?.name || 'Khách Hàng'}
              </span>
              <span className={styles.customerPhone}>
                ({order?.customer?.phone || '0988888888'})
              </span>
            </div>
            <p className={styles.fullAddress}>
              {order?.customer?.address || 'Số 10 Phạm Hùng, Phường Mai Dịch, Quận Cầu Giấy, Hà Nội'}
            </p>
          </div>

          <div className={styles.divider} />

          <div className={styles.carrierRow}>
            <div className={styles.carrierLeft}>
              <FiTruck size={16} color="#10b981" />
              <div className={styles.carrierInfo}>
                <span className={styles.carrierName}>
                  {order?.shippingCarrier || 'Giao Hàng Tiết Kiệm (GHTK)'}
                </span>
                <span className={styles.carrierEstimated}>Dự kiến giao: 1-2 ngày</span>
              </div>
            </div>
            <span className={styles.carrierFee}>{formatPrice(shippingFee)}</span>
          </div>
        </div>

        {/* Payment Details & Bill Summary */}
        <div className={styles.card}>
          <div className={styles.cardHeader}>
            <FiCreditCard size={16} color="var(--primary, #3b82f6)" />
            <span>Phương Thức Thanh Toán</span>
          </div>

          <div className={styles.paymentMethodRow}>
            <span className={styles.paymentTitle}>
              {order?.paymentMethod === 'bank_transfer'
                ? '⚡ Chuyển khoản VietQR (SePay Tự Động)'
                : '💵 Thanh toán khi nhận hàng (COD)'}
            </span>
            <span
              className={`${styles.statusBadge} ${
                isPaid ? styles.statusPaid : styles.statusUnpaid
              }`}
            >
              {isPaid ? 'Đã Thanh Toán' : 'Chưa Thanh Toán'}
            </span>
          </div>

          <div className={styles.divider} />

          <div className={styles.billRows}>
            <div className={styles.billRow}>
              <span>Tổng tiền hàng</span>
              <span>{formatPrice(subtotal)}</span>
            </div>
            <div className={styles.billRow}>
              <span>Phí vận chuyển</span>
              <span>{formatPrice(shippingFee)}</span>
            </div>
            <div className={`${styles.billRow} ${styles.totalRow}`}>
              <span>Tổng thanh toán</span>
              <span className={styles.totalVal}>{formatPrice(totalAmount)}</span>
            </div>
          </div>
        </div>

        {/* Action Controls */}
        <div className={styles.actionGroup}>
          <Link href="/" className={styles.primaryBtn}>
            <FiShoppingBag size={18} />
            <span>Tiếp Tục Mua Sắm</span>
          </Link>
        </div>
      </div>
    </div>
  );
}