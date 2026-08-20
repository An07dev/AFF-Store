'use client';

import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams, useRouter } from 'next/navigation';
import {
  FiSearch,
  FiTruck,
  FiPackage,
  FiMapPin,
  FiClock,
  FiCheckCircle,
  FiCopy,
  FiCheck,
  FiCreditCard,
  FiAlertCircle,
  FiChevronLeft,
  FiX,
  FiArrowRight,
  FiShoppingBag,
  FiExternalLink,
  FiPhoneCall,
  FiNavigation,
  FiActivity,
} from 'react-icons/fi';
import toast from 'react-hot-toast';
import { formatPrice } from '@/lib/utils';
import { useTheme } from '@/contexts/ThemeContext';
import BannerNotice from '@/components/common/BannerNotice';
import OrderTrackingTimeline from '@/components/store/OrderTrackingTimeline';
import { apiFetch } from '@/lib/api';
import styles from './page.module.css';

interface TrackingLog {
  time: string;
  date: string;
  status: string;
  location: string;
  description: string;
  isCurrent?: boolean;
}

function TrackingContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const initialCode = searchParams.get('code') || '';
  const { theme } = useTheme();

  const [inputCode, setInputCode] = useState(initialCode);
  const [activeCode, setActiveCode] = useState(initialCode);
  const [order, setOrder] = useState<any | null>(null);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [copiedCode, setCopiedCode] = useState(false);
  const [copiedWaybill, setCopiedWaybill] = useState(false);
  const [recentCodes, setRecentCodes] = useState<string[]>([]);

  // Load recent order codes from local storage
  useEffect(() => {
    try {
      const stored = localStorage.getItem('shoptik_order_codes');
      if (stored) {
        setRecentCodes(JSON.parse(stored));
      } else {
        setRecentCodes([]);
      }
    } catch (e) {
      console.error('Error loading stored order codes:', e);
    }
  }, []);

  // Fetch order data by code
  const fetchOrder = async (codeToSearch: string) => {
    const cleanCode = codeToSearch.trim().toUpperCase();
    if (!cleanCode) {
      toast.error('Vui lòng nhập mã đơn hàng');
      return;
    }

    try {
      setLoading(true);
      setErrorMsg(null);
      const res = await apiFetch(`/api/orders/${encodeURIComponent(cleanCode)}`);
      const data = await res.json();

      if (data.success && data.data) {
        setOrder(data.data);
        setActiveCode(cleanCode);

        // Update recent search history
        try {
          const updated = [cleanCode, ...recentCodes.filter((c) => c !== cleanCode)].slice(0, 8);
          setRecentCodes(updated);
          localStorage.setItem('shoptik_order_codes', JSON.stringify(updated));
        } catch (e) {
          console.error(e);
        }
      } else {
        setOrder(null);
        setErrorMsg(data.message || `Không tìm thấy đơn hàng với mã #${cleanCode}`);
      }
    } catch (err) {
      console.error('Error fetching order:', err);
      setErrorMsg('Không thể kết nối máy chủ. Vui lòng kiểm tra lại.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (initialCode) {
      setInputCode(initialCode);
      fetchOrder(initialCode);
    }
  }, [initialCode]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputCode.trim()) {
      router.push(`/tracking?code=${encodeURIComponent(inputCode.trim().toUpperCase())}`);
      fetchOrder(inputCode);
    }
  };

  const handleSelectRecentCode = (code: string) => {
    setInputCode(code);
    router.push(`/tracking?code=${encodeURIComponent(code)}`);
    fetchOrder(code);
  };

  const handleCopyCode = (text: string) => {
    if (typeof window !== 'undefined' && text) {
      navigator.clipboard.writeText(text);
      setCopiedCode(true);
      toast.success(`Đã sao chép mã đơn #${text}!`);
      setTimeout(() => setCopiedCode(false), 2000);
    }
  };

  const handleCopyWaybill = (text: string) => {
    if (typeof window !== 'undefined' && text) {
      navigator.clipboard.writeText(text);
      setCopiedWaybill(true);
      toast.success(`Đã sao chép mã vận đơn: ${text}!`);
      setTimeout(() => setCopiedWaybill(false), 2000);
    }
  };

  // Helper status styling
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'confirmed':
        return { label: 'Đã Xác Nhận', className: styles.statusConfirmed };
      case 'shipping':
        return { label: 'Bàn Giao Vận Chuyển', className: styles.statusShipping };
      case 'delivering':
        return { label: 'Đang Giao Hàng', className: styles.statusShipping };
      case 'delivered':
        return { label: 'Giao Thành Công', className: styles.statusDelivered };
      case 'cancelled':
        return { label: 'Đã Hủy Đơn', className: styles.statusCancelled };
      case 'returned':
        return { label: 'Chuyển Hoàn', className: styles.statusCancelled };
      case 'pending':
      default:
        return { label: 'Chờ Xử Lý', className: styles.statusPending };
    }
  };

  // Calculate timeline active steps (5 steps)
  const getStepIndex = (status: string) => {
    switch (status) {
      case 'cancelled':
      case 'returned':
        return 0;
      case 'delivered':
        return 5;
      case 'delivering':
        return 4;
      case 'shipping':
        return 3;
      case 'confirmed':
        return 2;
      case 'pending':
      default:
        return 1;
    }
  };

  // Carrier info & dynamic logs generator
  const getCarrierDetails = (carrierName: string = '', orderCodeStr: string = '') => {
    const rawCarrier = (carrierName || order?.shippingProvider || '').toLowerCase();
    const isGHN = rawCarrier.includes('ghn') || rawCarrier.includes('nhanh');
    const isViettel = rawCarrier.includes('viettel') || rawCarrier.includes('vtp');

    let brandName = order?.shippingCarrier || 'Giao Hàng Tiết Kiệm (GHTK)';
    let trackingCode = order?.trackingCode || '';
    let hotline = '1900 6092';
    let trackUrl = `https://i.ghtk.vn`;
    let color = '#059669';

    if (isGHN) {
      brandName = order?.shippingCarrier || 'Giao Hàng Nhanh (GHN)';
      trackingCode = order?.trackingCode || '';
      hotline = '1900 636677';
      trackUrl = `https://donhang.ghn.vn`;
      color = '#ea580c';
    } else if (isViettel) {
      brandName = order?.shippingCarrier || 'Viettel Post';
      trackingCode = order?.trackingCode || '';
      hotline = '1900 8095';
      trackUrl = `https://viettelpost.com.vn/tra-cuu-hanh-trinh-don`;
      color = '#dc2626';
    }

    return { brandName, trackingCode, hotline, trackUrl, color };
  };

  const carrierInfo = order ? getCarrierDetails(order.shippingCarrier, order.orderCode) : null;

  // Generate realistic carrier logs or use real shippingLogs from order
  const getCarrierLogs = (stepIndex: number): TrackingLog[] => {
    if (order?.shippingLogs && order.shippingLogs.length > 0) {
      return [...order.shippingLogs].reverse().map((log: any, idx: number) => ({
        time: log.time || new Date(log.createdAt || Date.now()).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
        date: log.createdAt ? new Date(log.createdAt).toLocaleDateString('vi-VN') : 'Hôm nay',
        status: log.status || 'Cập nhật vận chuyển',
        location: log.location || 'Bưu cục vận chuyển',
        description: log.description || (log.shipperName ? `Shipper ${log.shipperName} (${log.shipperPhone}) đang giao hàng` : 'Đang xử lý kiện hàng'),
        isCurrent: idx === 0,
      }));
    }

    const orderCreatedDate = new Date(order?.createdAt || Date.now());
    const timeStr = orderCreatedDate.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
    const dateStr = orderCreatedDate.toLocaleDateString('vi-VN');

    if (order?.status === 'cancelled') {
      const cancelDate = new Date(order?.updatedAt || Date.now());
      return [
        {
          time: cancelDate.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
          date: cancelDate.toLocaleDateString('vi-VN'),
          status: 'Đơn Hàng Đã Hủy',
          location: 'Hệ thống Quản Trị',
          description: 'Đơn hàng này đã được hủy và ngưng xử lý.',
          isCurrent: true,
        },
        {
          time: timeStr,
          date: dateStr,
          status: 'Đã Đặt Hàng Thành Công',
          location: 'Hệ thống ShopTik Store',
          description: `Đơn hàng #${order?.orderCode} đã được ghi nhận vào hệ thống.`,
          isCurrent: false,
        }
      ];
    }

    const logs: TrackingLog[] = [
      {
        time: timeStr,
        date: dateStr,
        status: 'Đã Đặt Hàng Thành Công',
        location: 'Hệ thống ShopTik Store',
        description: `Đơn hàng #${order?.orderCode} đã được ghi nhận vào hệ thống.`,
        isCurrent: stepIndex === 1,
      }
    ];

    if (stepIndex >= 2) {
      logs.unshift({
        time: timeStr,
        date: dateStr,
        status: 'Đang Chuẩn Bị & Đóng Gói',
        location: 'Kho tổng đóng gói',
        description: 'Shop đã duyệt đơn hàng, nhân viên đang đóng gói sản phẩm.',
        isCurrent: stepIndex === 2,
      });
    }

    if (stepIndex >= 3) {
      logs.unshift({
        time: timeStr,
        date: dateStr,
        status: 'Bàn Giao Vận Chuyển',
        location: carrierInfo?.brandName || 'Đơn vị vận chuyển',
        description: carrierInfo?.trackingCode ? `Hãng đã tiếp nhận kiện hàng (Mã vận đơn: ${carrierInfo.trackingCode})` : 'Đã bàn giao kiện hàng cho đơn vị vận chuyển.',
        isCurrent: stepIndex === 3,
      });
    }

    if (stepIndex >= 4) {
      logs.unshift({
        time: timeStr,
        date: dateStr,
        status: 'Đang Giao Hàng',
        location: `Bưu cục phát ${order?.customer?.district || 'khu vực giao hàng'}`,
        description: 'Shipper đang trên đường giao hàng đến địa chỉ của bạn.',
        isCurrent: stepIndex === 4,
      });
    }

    if (stepIndex >= 5) {
      logs.unshift({
        time: timeStr,
        date: dateStr,
        status: 'Giao Hàng Thành Công',
        location: order?.customer?.address || 'Địa chỉ người nhận',
        description: 'Kiện hàng đã được giao thành công tới người nhận.',
        isCurrent: true,
      });
    }

    return logs;
  };

  const currentStep = order ? getStepIndex(order.status) : 1;
  const carrierLogs = order ? getCarrierLogs(currentStep) : [];
  const statusInfo = order ? getStatusBadge(order.status) : null;
  const subtotal = order?.subtotal || order?.items?.reduce((acc: number, i: any) => acc + (i.price * i.quantity), 0) || 0;
  const shippingFee = order?.shippingFee || 0;
  const totalAmount = order?.totalAmount || (subtotal + shippingFee);
  const isPaid = order?.paymentStatus === 'paid';

  return (
    <div className={styles.page}>
      {/* Top Header */}
      <nav className={styles.topNav}>
        <button className={styles.backBtn} onClick={() => router.push('/')} aria-label="Trang chủ">
          <FiChevronLeft size={22} />
        </button>
        <div className={styles.navTitle}>Theo Dõi Đơn Hàng</div>
        <div style={{ width: 32 }} />
      </nav>

      {/* Scrolling Banner Notice */}
      <BannerNotice />

      <div className={styles.content}>
        {/* Search Header Card */}
        <div className={styles.searchCard}>
          <div className={styles.searchHeader}>
            <FiTruck size={20} color="var(--primary, #3b82f6)" />
            <h2 className={styles.searchTitle}>Tra Cứu Hành Trình Đơn Hàng</h2>
          </div>
          <p className={styles.searchDesc}>
            Nhập mã đơn hàng của bạn để kiểm tra tình trạng đóng gói, lộ trình shipper và hành trình vận chuyển chi tiết.
          </p>

          <form className={styles.searchForm} onSubmit={handleSearchSubmit}>
            <div className={styles.inputWrap}>
              <FiSearch size={17} className={styles.inputIcon} />
              <input
                type="text"
                className={styles.searchInput}
                placeholder="Nhập mã đơn (VD: ST832025)"
                value={inputCode}
                onChange={(e) => setInputCode(e.target.value)}
              />
              {inputCode && (
                <button
                  type="button"
                  className={styles.clearInputBtn}
                  onClick={() => setInputCode('')}
                  aria-label="Xóa"
                >
                  <FiX size={15} />
                </button>
              )}
            </div>
            <button type="submit" className={styles.searchBtn} disabled={loading}>
              {loading ? 'Đang tìm...' : 'Tra Cứu'}
            </button>
          </form>

          {/* Recent searched order codes */}
          {recentCodes.length > 0 && (
            <div className={styles.recentSection}>
              <span className={styles.recentLabel}>Đơn hàng gần đây:</span>
              <div className={styles.chipsContainer}>
                {recentCodes.map((code) => (
                  <button
                    key={code}
                    type="button"
                    className={`${styles.chip} ${activeCode === code ? styles.activeChip : ''}`}
                    onClick={() => handleSelectRecentCode(code)}
                  >
                    #{code}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Loading State */}
        {loading && (
          <div className={styles.loadingBox}>
            <div className={styles.spinner} />
            <span>Đang tra cứu dữ liệu đơn hàng...</span>
          </div>
        )}

        {/* Error State */}
        {!loading && errorMsg && (
          <div className={styles.errorBox}>
            <FiAlertCircle size={24} color="#ef4444" />
            <p className={styles.errorText}>{errorMsg}</p>
            <p className={styles.errorSubtext}>
              Vui lòng kiểm tra lại ký tự mã đơn hoặc chọn mã có sẵn trong danh sách trên.
            </p>
          </div>
        )}

        {/* Order Details Result */}
        {!loading && order && (
          <div className={styles.resultContainer}>
            {/* Header Info Card */}
            <div className={styles.orderHeaderCard}>
              <div className={styles.orderTopRow}>
                <div className={styles.codeGroup}>
                  <span className={styles.orderCodeTitle}>#{order.orderCode}</span>
                  <button
                    type="button"
                    className={styles.copyBtn}
                    onClick={() => handleCopyCode(order.orderCode)}
                    title="Sao chép mã"
                  >
                    {copiedCode ? <FiCheck size={11} color="#10b981" /> : <FiCopy size={11} />}
                    <span>{copiedCode ? 'Đã chép' : 'Sao chép'}</span>
                  </button>
                </div>

                {statusInfo && (
                  <span className={`${styles.statusBadge} ${statusInfo.className}`}>
                    {statusInfo.label}
                  </span>
                )}
              </div>

              <div className={styles.dateRow}>
                <FiClock size={11} color="var(--text-muted, #94a3b8)" />
                <span>
                  Thời gian đặt: {new Date(order.createdAt || Date.now()).toLocaleString('vi-VN')}
                </span>
              </div>
            </div>

            {/* Stepper / Journey Timeline 5 Bước Minh Bạch & Bản Đồ Roadmap */}
            <div className={styles.timelineCard}>
              <div className={styles.stepperHeader}>
                <div className={styles.stepperHeaderLeft}>
                  <div className={styles.stepperIconWrap}>
                    <FiPackage size={18} />
                  </div>
                  <div>
                    <h3 className={styles.stepperMainTitle}>
                      Tiến Trình Đơn Hàng ({currentStep}/5 Bước)
                    </h3>
                    <p className={styles.stepperSubtitle}>
                      Tự động cập nhật hành trình từ hãng vận chuyển theo thời gian thực
                    </p>
                  </div>
                </div>

                <div className={styles.stepperHeaderRight}>
                  <span className={`${styles.livePillTag} ${currentStep === 5 ? styles.pillDelivered : styles.pillActive}`}>
                    <span className={styles.pillPulseDot} />
                    <span>
                      {currentStep === 5
                        ? '✓ Giao Thành Công'
                        : currentStep === 4
                        ? '🛵 Shipper Đang Giao'
                        : currentStep === 3
                        ? '🚚 Đang Luân Chuyển'
                        : currentStep === 2
                        ? '📦 Đã Duyệt Đơn'
                        : '🛒 Đã Ghi Nhận'}
                    </span>
                  </span>
                </div>
              </div>

              {/* 1. Horizontal 5-Step Visual Chain with Modern Icons */}
              <div className={styles.horizontalStepper}>
                <div className={styles.hStepLine}>
                  <div
                    className={styles.hStepLineFill}
                    style={{
                      width:
                        currentStep === 5
                          ? '100%'
                          : currentStep === 4
                          ? '75%'
                          : currentStep === 3
                          ? '50%'
                          : currentStep === 2
                          ? '25%'
                          : '4%',
                    }}
                  />
                </div>

                {[
                  { num: 1, label: 'Đặt đơn', sub: 'Tiếp nhận', icon: <FiShoppingBag size={14} /> },
                  { num: 2, label: 'Xác nhận', sub: 'Đã duyệt', icon: <FiPackage size={14} /> },
                  { num: 3, label: 'Vận chuyển', sub: 'Kho tổng', icon: <FiTruck size={14} /> },
                  { num: 4, label: 'Đang giao', sub: 'Bưu tá phát', icon: <FiNavigation size={14} /> },
                  { num: 5, label: 'Đã nhận', sub: 'Hoàn tất', icon: <FiCheckCircle size={14} /> },
                ].map((st) => {
                  const isDone = currentStep > st.num || (currentStep === 5 && st.num === 5);
                  const isActive = currentStep === st.num && currentStep < 5;
                  return (
                    <div
                      key={st.num}
                      className={`${styles.hStepItem} ${isDone ? styles.hStepDone : ''} ${
                        isActive ? styles.hStepActive : ''
                      }`}
                    >
                      <div className={styles.hStepCircle}>
                        {isDone ? <FiCheck size={16} /> : st.icon}
                        <span className={styles.stepNumBadge}>{st.num}</span>
                      </div>
                      <span className={styles.hStepLabel}>{st.label}</span>
                      <span className={styles.hStepSubLabel}>{st.sub}</span>
                    </div>
                  );
                })}
              </div>

              {/* 2. Real-time Shipping Journey & Interactive Roadmap */}
              <OrderTrackingTimeline
                orderCode={order.orderCode}
                trackingCode={order.trackingCode || carrierInfo?.trackingCode}
                carrier={order.shippingProvider || order.shippingCarrier || carrierInfo?.brandName}
              />
            </div>

            {/* Delivery & Address Info */}
            <div className={styles.card}>
              <h3 className={styles.cardTitle}>
                <FiMapPin size={16} color="var(--primary, #3b82f6)" />
                <span>Thông Tin Nhận Hàng</span>
              </h3>

              <div className={styles.addressSection}>
                <div className={styles.customerLine}>
                  <strong className={styles.customerName}>
                    {order.customer?.name || 'Khách Hàng'}
                  </strong>
                  <span className={styles.customerPhone}>
                    ({order.customer?.phone || '0988xxxxxx'})
                  </span>
                </div>
                <p className={styles.addressDetail}>
                  {order.customer?.address || 'Số 10 Phạm Hùng, Phường Mai Dịch, Quận Cầu Giấy, Hà Nội'}
                </p>
                {order.notes && (
                  <p className={styles.orderNotes}>
                    <strong>Ghi chú:</strong> {order.notes}
                  </p>
                )}
              </div>
            </div>

            {/* Products Card - Sản Phẩm Trong Đơn Hàng Từ API */}
            {order.items && order.items.length > 0 && (
              <div className={styles.card}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: 8, borderBottom: '1px solid var(--border-color, #232838)' }}>
                  <h3 className={styles.cardTitle} style={{ border: 'none', padding: 0, margin: 0 }}>
                    <FiShoppingBag size={16} color="var(--primary, #3b82f6)" />
                    <span>Sản Phẩm Trong Đơn ({order.items.reduce((s: number, i: any) => s + (i.quantity || 1), 0)})</span>
                  </h3>
                  <span style={{ fontSize: 11, color: 'var(--text-muted, #94a3b8)', fontWeight: 600 }}>
                    {order.items.length} mặt hàng
                  </span>
                </div>

                <div className={styles.itemList}>
                  {order.items.map((item: any, idx: number) => {
                    const variantText =
                      item.variant?.name ||
                      [item.variant?.color, item.variant?.size].filter(Boolean).join(' - ') ||
                      (typeof item.variant === 'string' ? item.variant : '');
                    const unitPrice = item.price || item.variant?.price || 0;
                    const itemTotal = unitPrice * (item.quantity || 1);

                    return (
                      <div key={item._id || idx} className={styles.itemRow}>
                        <img
                          src={item.image || 'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=400'}
                          alt={item.name}
                          className={styles.itemImg}
                          onError={(e: any) => {
                            e.target.src = 'https://images.unsplash.com/photo-1581655353564-df123a1eb820?w=400';
                          }}
                        />
                        <div className={styles.itemDetails}>
                          <span className={styles.itemName}>{item.name}</span>
                          {variantText ? (
                            <span className={styles.itemVariant}>
                              Phân loại: <strong style={{ color: '#e2e8f0' }}>{variantText}</strong>
                            </span>
                          ) : null}
                          <div className={styles.itemPriceRow}>
                            <div style={{ display: 'flex', alignItems: 'baseline', gap: 6 }}>
                              <span className={styles.itemPrice}>{formatPrice(itemTotal)}</span>
                              {item.quantity > 1 && (
                                <span style={{ fontSize: 10, color: '#94a3b8' }}>
                                  ({formatPrice(unitPrice)}/cái)
                                </span>
                              )}
                            </div>
                            <span className={styles.itemQty}>x{item.quantity || 1}</span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Payment & Bill Breakdown Card */}
            <div className={styles.card}>
              <div className={styles.paymentHeaderRow}>
                <h3 className={styles.cardTitle} style={{ border: 'none', padding: 0, margin: 0 }}>
                  <FiCreditCard size={16} color="var(--primary, #3b82f6)" />
                  <span>Thanh Toán & Hóa Đơn</span>
                </h3>
                <span
                  className={`${styles.paymentStatusBadge} ${
                    isPaid ? styles.paidBadge : styles.unpaidBadge
                  }`}
                >
                  {isPaid ? 'Đã Thanh Toán' : 'Chưa Thanh Toán'}
                </span>
              </div>

              <div className={styles.paymentMethodRow}>
                <span className={styles.paymentName}>
                  {order.paymentMethod === 'bank_transfer'
                    ? '⚡ Chuyển khoản VietQR (SePay Tự Động)'
                    : '💵 Thanh toán khi nhận hàng (COD)'}
                </span>
              </div>

              {/* Pay Now Button if Bank Transfer Unpaid */}
              {order.paymentMethod === 'bank_transfer' && !isPaid && (
                <Link
                  href={`/payment?code=${order.orderCode}`}
                  className={styles.payNowBtn}
                >
                  <FiCreditCard size={15} />
                  <span>Quét Mã VietQR Để Thanh Toán Ngay</span>
                  <FiArrowRight size={14} />
                </Link>
              )}

              <div className={styles.divider} />

              <div className={styles.billRows}>
                <div className={styles.billRow}>
                  <span>Tiền hàng</span>
                  <span>{formatPrice(subtotal)}</span>
                </div>
                <div className={styles.billRow}>
                  <span>Phí giao hàng</span>
                  <span>{formatPrice(shippingFee)}</span>
                </div>
                <div className={`${styles.billRow} ${styles.totalRow}`}>
                  <span>Tổng tiền đơn hàng</span>
                  <span className={styles.totalVal}>{formatPrice(totalAmount)}</span>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className={styles.actionGroup}>
              <Link href="/" className={styles.homeBtn}>
                <FiShoppingBag size={18} />
                <span>Khám Phá Thêm Sản Phẩm Khác</span>
              </Link>
            </div>
          </div>
        )}

        {/* Initial Empty Guide when no order searched */}
        {!loading && !order && !errorMsg && (
          <div className={styles.guideCard}>
            <FiPackage size={44} className={styles.guideIcon} />
            <h3 className={styles.guideTitle}>Bạn muốn kiểm tra đơn hàng nào?</h3>
            <p className={styles.guideText}>
              Nhập mã đơn hàng của bạn vào ô tìm kiếm phía trên để theo dõi hành trình vận chuyển chi tiết.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

export default function OrderTrackingPage() {
  return (
    <Suspense fallback={<div style={{ padding: 40, textAlign: 'center' }}>Đang tải...</div>}>
      <TrackingContent />
    </Suspense>
  );
}
