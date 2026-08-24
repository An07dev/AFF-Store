'use client';

import React, { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  FiChevronLeft,
  FiCopy,
  FiCheck,
  FiClock,
  FiRefreshCw,
  FiShield,
  FiAlertCircle,
  FiZap,
  FiHome,
  FiCheckCircle,
} from 'react-icons/fi';
import toast from 'react-hot-toast';
import { useCart } from '@/contexts/CartContext';
import { useTheme } from '@/contexts/ThemeContext';
import { formatPrice } from '@/lib/utils';
import { generateQrUrl } from '@/lib/payment/sepay';
import StoreLoading from '@/components/store/StoreLoading';
import { apiFetch } from '@/lib/api';
import styles from './page.module.css';

export default function PaymentPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { removeCheckedOutItems } = useCart();
  const { theme } = useTheme();
  const orderId = searchParams.get('orderId');
  const code = searchParams.get('code') || '';

  const [order, setOrder] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [timeLeft, setTimeLeft] = useState(15 * 60); // 15 minutes in seconds
  const [isChecking, setIsChecking] = useState(false);
  const [simulating, setSimulating] = useState(false);

  const [bankConfig, setBankConfig] = useState({
    bankCode: process.env.NEXT_PUBLIC_VIETQR_BANK || 'MBBank',
    bankName: 'MBBank (Ngân hàng TMCP Quân Đội)',
    accountNumber: process.env.NEXT_PUBLIC_VIETQR_ACCOUNT_NO || '0528438642',
    accountName: process.env.NEXT_PUBLIC_VIETQR_ACCOUNT_NAME || 'LE VAN AN',
  });

  // Load real bank settings from DB
  useEffect(() => {
    const loadBankConfig = async () => {
      try {
        const res = await apiFetch('/api/settings/payment');
        const data = await res.json();
        if (data.success && data.data) {
          setBankConfig({
            bankCode: data.data.bankName || 'MBBank',
            bankName: data.data.bankName || 'MBBank',
            accountNumber: data.data.accountNumber || '0528438642',
            accountName: data.data.accountName || 'LE VAN AN',
          });
        }
      } catch (e) {
        console.error('Error loading bank config:', e);
      }
    };
    loadBankConfig();
  }, []);

  // 1. Fetch & Poll payment status
  const checkStatus = async (showManualToast = false) => {
    if (!code && !orderId) return;
    try {
      if (showManualToast) setIsChecking(true);
      const url = code ? `/api/payment/status?code=${code}` : `/api/payment/status?orderId=${orderId}`;
      const res = await apiFetch(url);
      const data = await res.json();

      if (data.success && data.data) {
        setOrder(data.data);
        if (data.data.isPaid) {
          toast.success('🎉 Thanh toán thành công! Đang chuyển hướng...');

          // Xóa sản phẩm đã thanh toán xong khỏi giỏ hàng
          try {
            const pending = sessionStorage.getItem('shoptik_pending_payment_items');
            if (pending) {
              const pendingItems = JSON.parse(pending);
              if (Array.isArray(pendingItems) && pendingItems.length > 0) {
                removeCheckedOutItems(pendingItems);
              }
              sessionStorage.removeItem('shoptik_pending_payment_items');
            } else if (data.data.items && Array.isArray(data.data.items)) {
              removeCheckedOutItems(data.data.items);
            }
          } catch (e) {
            console.error('Error removing paid items from cart:', e);
          }

          setTimeout(() => {
            router.push(`/order-success?code=${data.data.orderCode || code}&paid=true`);
          }, 1000);
        } else if (showManualToast) {
          toast('Chưa nhận được giao dịch. Vui lòng thử lại sau vài giây!', {
            icon: '⏳',
          });
        }
      }
    } catch (e) {
      console.error('Error polling payment status:', e);
    } finally {
      setLoading(false);
      if (showManualToast) setIsChecking(false);
    }
  };

  useEffect(() => {
    checkStatus();
    const pollInterval = setInterval(() => {
      checkStatus();
    }, 2500);

    return () => clearInterval(pollInterval);
  }, [code, orderId]);

  // 2. Countdown timer
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const formatTimer = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleCopy = (text: string, key: string, label: string) => {
    if (typeof window !== 'undefined') {
      navigator.clipboard.writeText(text);
      setCopiedKey(key);
      toast.success(`Đã sao chép ${label}!`);
      setTimeout(() => setCopiedKey(null), 2000);
    }
  };

  // Simulate payment for quick testing / demonstration
  const handleSimulatePayment = async () => {
    try {
      setSimulating(true);
      const res = await apiFetch('/api/webhooks/sepay', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orderCode: code || order?.orderCode,
          content: `Thanh toan don hang ${code || order?.orderCode}`,
          transferAmount: order?.totalAmount || 100000,
          transferType: 'in',
        }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success('Mô phỏng thanh toán thành công!');
        checkStatus();
      } else {
        toast.error(data.message || 'Lỗi mô phỏng thanh toán');
      }
    } catch (err) {
      console.error(err);
      toast.error('Lỗi khi kích hoạt webhook');
    } finally {
      setSimulating(false);
    }
  };

  if (loading) {
    return <StoreLoading text="Đang tải thông tin thanh toán VietQR..." />;
  }

  const amount = order?.totalAmount || 0;
  const transferContent = `Thanh toan ${code || order?.orderCode || 'DH'}`;
  const qrUrl = generateQrUrl(
    bankConfig.accountNumber,
    bankConfig.bankCode,
    amount,
    transferContent,
    bankConfig.accountName
  );

  return (
    <div className={styles.page}>
      {/* Top Bar / Breadcrumbs */}
      <nav className={styles.topNav}>
        <button className={styles.backBtn} onClick={() => router.push('/')} aria-label="Trang chủ">
          <FiChevronLeft size={22} />
        </button>
        <div className={styles.navTitle}>Thanh Toán VietQR Tự Động</div>
        <div className={styles.secureBadge}>
          <FiShield size={14} />
          <span>Bảo mật 256-bit</span>
        </div>
      </nav>

      {/* PC Breadcrumb */}
      <div className={styles.pcBreadcrumbWrap}>
        <div className={styles.pcBreadcrumb}>
          <Link href="/" className={styles.pcBreadcrumbLink}>
            <FiHome size={14} /> Trang Chủ
          </Link>
          <span className={styles.pcBreadcrumbDivider}>/</span>
          <span className={styles.pcBreadcrumbActive}>Thanh Toán Đơn Hàng #{code || order?.orderCode}</span>
        </div>
      </div>

      <div className={styles.content}>
        {/* Timer Banner */}
        <div className={styles.timerBanner}>
          <FiClock size={16} className={styles.clockIcon} />
          <span>Đơn hàng sẽ tự động hủy sau:</span>
          <span className={styles.countdown}>{formatTimer(timeLeft)}</span>
        </div>

        {/* Responsive Grid: 1 Column on Mobile, 2 Columns on PC */}
        <div className={styles.paymentGrid}>
          {/* Left / Top: QR Code Container */}
          <div className={styles.qrCard}>
            <div className={styles.bankHeader}>
              <div className={styles.bankLogoWrap}>
                <span className={styles.bankBadge}>{(bankConfig.bankCode || 'MBBANK').toUpperCase()}</span>
              </div>
              <div className={styles.bankTitleBox}>
                <h3 className={styles.bankName}>{bankConfig.bankName}</h3>
                <p className={styles.subtext}>Chuyển khoản 24/7 qua mã QR tự động</p>
              </div>
            </div>

            <div className={styles.qrWrapper}>
              <img src={qrUrl} alt="Mã VietQR Thanh Toán" className={styles.qrImage} />
              <div className={styles.scanHint}>Mở App Ngân Hàng để Quét Mã QR</div>
            </div>

            {/* Realtime Pulsing Status */}
            <div className={styles.statusIndicator}>
              <span className={styles.pulseDot}></span>
              <span>Hệ thống tự động nhận diện giao dịch (mỗi 2.5s)...</span>
            </div>
          </div>

          {/* Right / Bottom: Transfer Details & Actions */}
          <div className={styles.detailsColumn}>
            {/* Bank Transfer Details Table */}
            <div className={styles.detailsCard}>
              <h4 className={styles.detailsTitle}>Thông Tin Chuyển Khoản Thủ Công</h4>

              {/* Amount Row */}
              <div className={styles.detailRow}>
                <div className={styles.detailCol}>
                  <span className={styles.detailLabel}>Số tiền cần chuyển:</span>
                  <span className={styles.amountValue}>{formatPrice(amount)}</span>
                </div>
                <button
                  type="button"
                  className={styles.copyBtn}
                  onClick={() => handleCopy(amount.toString(), 'amount', 'Số tiền')}
                >
                  {copiedKey === 'amount' ? <FiCheck size={14} color="#10b981" /> : <FiCopy size={14} />}
                  <span>{copiedKey === 'amount' ? 'Đã chép' : 'Sao chép'}</span>
                </button>
              </div>

              {/* Content Row */}
              <div className={`${styles.detailRow} ${styles.importantRow}`}>
                <div className={styles.detailCol}>
                  <span className={styles.detailLabel}>
                    Nội dung chuyển khoản (bắt buộc chính xác):
                  </span>
                  <span className={styles.contentValue}>{transferContent}</span>
                </div>
                <button
                  type="button"
                  className={styles.copyBtn}
                  onClick={() => handleCopy(transferContent, 'content', 'Nội dung CK')}
                >
                  {copiedKey === 'content' ? <FiCheck size={14} color="#10b981" /> : <FiCopy size={14} />}
                  <span>{copiedKey === 'content' ? 'Đã chép' : 'Sao chép'}</span>
                </button>
              </div>

              {/* Account Number */}
              <div className={styles.detailRow}>
                <div className={styles.detailCol}>
                  <span className={styles.detailLabel}>Số tài khoản thụ hưởng:</span>
                  <span className={styles.normalValue}>{bankConfig.accountNumber}</span>
                </div>
                <button
                  type="button"
                  className={styles.copyBtn}
                  onClick={() => handleCopy(bankConfig.accountNumber, 'acc', 'Số tài khoản')}
                >
                  {copiedKey === 'acc' ? <FiCheck size={14} color="#10b981" /> : <FiCopy size={14} />}
                  <span>{copiedKey === 'acc' ? 'Đã chép' : 'Sao chép'}</span>
                </button>
              </div>

              {/* Account Name */}
              <div className={styles.detailRow}>
                <div className={styles.detailCol}>
                  <span className={styles.detailLabel}>Chủ tài khoản:</span>
                  <span className={styles.normalValue}>{bankConfig.accountName}</span>
                </div>
              </div>

              {/* Order Code */}
              <div className={styles.detailRow}>
                <div className={styles.detailCol}>
                  <span className={styles.detailLabel}>Mã đơn hàng:</span>
                  <span className={styles.codeValue}>#{code || order?.orderCode}</span>
                </div>
              </div>
            </div>

            {/* Warning Note */}
            <div className={styles.warningBox}>
              <FiAlertCircle size={16} className={styles.warningIcon} />
              <p>
                Vui lòng điền <strong>chính xác nội dung chuyển khoản</strong> để hệ thống tự động kích hoạt đơn hàng ngay lập tức.
              </p>
            </div>

            {/* Action Controls */}
            <div className={styles.actionGroup}>
              <button
                type="button"
                className={styles.checkBtn}
                onClick={() => checkStatus(true)}
                disabled={isChecking}
              >
                <FiRefreshCw className={isChecking ? styles.spinning : ''} size={16} />
                <span>{isChecking ? 'Đang kiểm tra...' : 'Tôi Đã Chuyển Khoản'}</span>
              </button>

              <button
                type="button"
                className={styles.demoBtn}
                onClick={handleSimulatePayment}
                disabled={simulating}
                title="Nhấn để mô phỏng SePay gửi webhook thanh toán đơn hàng này"
              >
                <FiZap size={15} />
                <span>{simulating ? 'Đang kích hoạt...' : 'Mô Phỏng Thanh Toán Thành Công (Demo)'}</span>
              </button>

              <Link href="/" className={styles.homeLink}>
                Quay về Trang Chủ
              </Link>
            </div>

            {/* Trust Assurance Section */}
            <div className={styles.trustSection}>
              <div className={styles.trustItem}>
                <FiShield size={15} className={styles.trustIcon} />
                <span>Bảo mật giao dịch 100% chuẩn ngân hàng</span>
              </div>
              <div className={styles.trustItem}>
                <FiCheckCircle size={15} className={styles.trustIcon} />
                <span>Tự động kích hoạt đơn hàng ngay khi nhận tiền</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}