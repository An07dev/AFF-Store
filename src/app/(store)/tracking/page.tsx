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
        // Default demo order codes
        setRecentCodes(['ST832025', 'ST341653']);
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
        return { label: 'Đang Giao Hàng', className: styles.statusShipping };
      case 'delivered':
        return { label: 'Giao Thành Công', className: styles.statusDelivered };
      case 'cancelled':
        return { label: 'Đã Hủy Đơn', className: styles.statusCancelled };
      case 'pending':
      default:
        return { label: 'Chờ Xử Lý', className: styles.statusPending };
    }
  };

  // Calculate timeline active steps
  const getStepIndex = (status: string) => {
    switch (status) {
      case 'cancelled':
        return 0;
      case 'delivered':
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
  const getCarrierDetails = (carrierName: string = '', orderCodeStr: string = 'ST832025') => {
    const isGHN = carrierName.toLowerCase().includes('ghn') || carrierName.toLowerCase().includes('nhanh');
    const isViettel = carrierName.toLowerCase().includes('viettel');

    let brandName = 'Giao Hàng Tiết Kiệm (GHTK)';
    let trackingCode = `GHTK.${orderCodeStr.replace(/\D/g, '') || '83920194'}`;
    let hotline = '1900 6092';
    let trackUrl = `https://i.ghtk.vn`;
    let color = '#059669';

    if (isGHN) {
      brandName = 'Giao Nhanh (GHN)';
      trackingCode = `GHN-${orderCodeStr.replace(/\D/g, '') || '92837102'}`;
      hotline = '1900 636677';
      trackUrl = `https://donhang.ghn.vn`;
      color = '#ea580c';
    } else if (isViettel) {
      brandName = 'Viettel Post Tiêu Chuẩn';
      trackingCode = `VTP${orderCodeStr.replace(/\D/g, '') || '74829103'}`;
      hotline = '1900 8095';
      trackUrl = `https://viettelpost.com.vn/tra-cuu-hanh-trinh-don`;
      color = '#dc2626';
    }

    return { brandName, trackingCode, hotline, trackUrl, color };
  };

  const carrierInfo = order ? getCarrierDetails(order.shippingCarrier, order.orderCode) : null;

  // Generate realistic carrier logs
  const getCarrierLogs = (): TrackingLog[] => {
    const carrier = carrierInfo?.brandName || 'GHTK';
    const destination = order?.customer?.district ? `${order.customer.district}, ${order.customer.province}` : 'Quận Cầu Giấy, Hà Nội';

    return [
      {
        time: '15:30',
        date: 'Hôm nay',
        status: 'Đang Giao Hàng',
        location: `Bưu cục phát ${destination}`,
        description: `Tài xế shipper đang liên hệ giao hàng đến bạn (Hotline: 0981.823.945)`,
        isCurrent: true,
      },
      {
        time: '08:15',
        date: 'Hôm nay',
        status: 'Đến Bưu Cục Phát',
        location: `Bưu cục phát ${destination}`,
        description: `Kiện hàng đã nhập kho phát ${destination} và được phân tuyến cho shipper`,
      },
      {
        time: '22:40',
        date: 'Hôm qua',
        status: 'Đang Trung Chuyển',
        location: 'Kho tổng phân loại Miền Bắc (SOC Hub)',
        description: 'Kiện hàng đã xuất kho trung chuyển và đang di chuyển đến bưu cục phát',
      },
      {
        time: '16:20',
        date: 'Hôm qua',
        status: 'Đã Lấy Hàng Thành Công',
        location: 'Kho ShopTik Store - Hà Nội',
        description: `Nhân viên lấy hàng của ${carrier} đã nhận kiện hàng từ Shop`,
      },
      {
        time: '14:10',
        date: 'Hôm qua',
        status: 'Đã Tạo Vận Đơn Điện Tử',
        location: 'Hệ thống điều vận trung tâm',
        description: `Đã sinh mã vận đơn ${carrierInfo?.trackingCode} và đồng bộ dữ liệu giao hàng`,
      },
    ];
  };

  const carrierLogs = order ? getCarrierLogs() : [];
  const currentStep = order ? getStepIndex(order.status) : 1;
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
                  <span className={styles.orderCodeTitle}>Mã Đơn: #{order.orderCode}</span>
                  <button
                    type="button"
                    className={styles.copyBtn}
                    onClick={() => handleCopyCode(order.orderCode)}
                    title="Sao chép mã"
                  >
                    {copiedCode ? <FiCheck size={13} color="#10b981" /> : <FiCopy size={13} />}
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
                <FiClock size={13} color="var(--text-muted, #94a3b8)" />
                <span>
                  Thời gian đặt: {new Date(order.createdAt || Date.now()).toLocaleString('vi-VN')}
                </span>
              </div>
            </div>

            {/* Stepper / Journey Timeline */}
            <div className={styles.timelineCard}>
              <h3 className={styles.cardTitle}>
                <FiPackage size={16} color="var(--primary, #3b82f6)" />
                <span>Trạng Thái Tiến Trình Vận Chuyển</span>
              </h3>

              <div className={styles.stepperWrap}>
                {/* Step 1 */}
                <div className={`${styles.stepBox} ${currentStep >= 1 ? styles.stepDone : ''}`}>
                  <div className={styles.stepCircle}>
                    {currentStep > 1 ? <FiCheck size={12} /> : '1'}
                  </div>
                  <div className={styles.stepTexts}>
                    <span className={styles.stepTitle}>Đã Tiếp Nhận</span>
                    <span className={styles.stepDesc}>Hệ thống đã ghi nhận đơn hàng</span>
                  </div>
                </div>

                <div className={`${styles.stepBar} ${currentStep >= 2 ? styles.barDone : ''}`} />

                {/* Step 2 */}
                <div className={`${styles.stepBox} ${currentStep >= 2 ? styles.stepDone : ''}`}>
                  <div className={styles.stepCircle}>
                    {currentStep > 2 ? <FiCheck size={12} /> : '2'}
                  </div>
                  <div className={styles.stepTexts}>
                    <span className={styles.stepTitle}>Đang Đóng Gói</span>
                    <span className={styles.stepDesc}>Shop kiểm tra sản phẩm & đóng gói cẩn thận</span>
                  </div>
                </div>

                <div className={`${styles.stepBar} ${currentStep >= 3 ? styles.barDone : ''}`} />

                {/* Step 3: Đang Giao Hàng & Bàn giao đơn vị vận chuyển */}
                <div className={`${styles.stepBox} ${currentStep >= 3 ? styles.stepDone : ''}`}>
                  <div className={styles.stepCircle}>
                    {currentStep > 3 ? <FiCheck size={12} /> : <FiActivity size={12} />}
                  </div>
                  <div className={styles.stepTexts}>
                    <div className={styles.stepTitleRow}>
                      <span className={styles.stepTitle}>Đang Giao Hàng</span>
                      <span className={styles.liveTag}>Live Tracking</span>
                    </div>
                    <span className={styles.stepDesc}>
                      Bàn giao đơn vị <strong>{carrierInfo?.brandName}</strong>
                    </span>
                    <div className={styles.waybillInline}>
                      <span>Mã vận đơn: <strong>{carrierInfo?.trackingCode}</strong></span>
                      <button
                        type="button"
                        className={styles.copyWaybillInlineBtn}
                        onClick={() => handleCopyWaybill(carrierInfo?.trackingCode || '')}
                      >
                        {copiedWaybill ? <FiCheck size={11} color="#10b981" /> : <FiCopy size={11} />}
                        <span>{copiedWaybill ? 'Đã chép' : 'Chép mã'}</span>
                      </button>
                    </div>
                  </div>
                </div>

                <div className={`${styles.stepBar} ${currentStep >= 4 ? styles.barDone : ''}`} />

                {/* Step 4 */}
                <div className={`${styles.stepBox} ${currentStep >= 4 ? styles.stepDone : ''}`}>
                  <div className={styles.stepCircle}>
                    {currentStep >= 4 ? <FiCheck size={12} /> : '4'}
                  </div>
                  <div className={styles.stepTexts}>
                    <span className={styles.stepTitle}>Đã Giao Thành Công</span>
                    <span className={styles.stepDesc}>Khách hàng đã nhận kiện hàng</span>
                  </div>
                </div>
              </div>
            </div>

            {/* DEDICATED CARRIER LIVE TRACKING HUB */}
            <div className={styles.carrierTrackingCard}>
              <div className={styles.carrierHubHeader}>
                <div className={styles.carrierHubLeft}>
                  <div className={styles.carrierIconBox}>
                    <FiNavigation size={18} color="#fff" />
                  </div>
                  <div className={styles.carrierHubTitleBox}>
                    <h3 className={styles.carrierHubTitle}>
                      Theo Dõi Đơn Vị Vận Chuyển
                    </h3>
                    <span className={styles.carrierHubSubtitle}>
                      {carrierInfo?.brandName}
                    </span>
                  </div>
                </div>

                <span className={styles.pulseActive}>
                  <span className={styles.pulseDot} />
                  <span>Đang di chuyển</span>
                </span>
              </div>

              {/* Waybill & Carrier Quick Actions */}
              <div className={styles.waybillBox}>
                <div className={styles.waybillLeft}>
                  <span className={styles.waybillLabel}>Mã vận đơn bưu tá:</span>
                  <span className={styles.waybillCode}>{carrierInfo?.trackingCode}</span>
                </div>
                <button
                  type="button"
                  className={styles.copyWaybillBtn}
                  onClick={() => handleCopyWaybill(carrierInfo?.trackingCode || '')}
                >
                  {copiedWaybill ? <FiCheck size={13} color="#10b981" /> : <FiCopy size={13} />}
                  <span>{copiedWaybill ? 'Đã chép' : 'Sao chép'}</span>
                </button>
              </div>

              {/* Carrier Logs Timeline */}
              <div className={styles.carrierLogsSection}>
                <h4 className={styles.logsSectionTitle}>
                  <FiClock size={14} color="var(--primary, #3b82f6)" />
                  <span>Nhật Ký Hành Trình Chi Tiết (Realtime)</span>
                </h4>

                <div className={styles.logsList}>
                  {carrierLogs.map((log, index) => (
                    <div
                      key={index}
                      className={`${styles.logItem} ${log.isCurrent ? styles.logCurrent : ''}`}
                    >
                      <div className={styles.logLeftCol}>
                        <span className={styles.logTime}>{log.time}</span>
                        <span className={styles.logDate}>{log.date}</span>
                      </div>

                      <div className={styles.logTimelineCol}>
                        <div className={styles.logDot}>
                          {log.isCurrent ? <span className={styles.activeInnerDot} /> : null}
                        </div>
                        {index < carrierLogs.length - 1 && <div className={styles.logLine} />}
                      </div>

                      <div className={styles.logRightCol}>
                        <div className={styles.logStatusRow}>
                          <span className={styles.logStatus}>{log.status}</span>
                          {log.isCurrent && <span className={styles.newestBadge}>Mới nhất</span>}
                        </div>
                        <p className={styles.logDesc}>{log.description}</p>
                        <span className={styles.logLocation}>📍 {log.location}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Direct Carrier External Actions */}
              <div className={styles.carrierActionRow}>
                <a
                  href={carrierInfo?.trackUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={styles.carrierLinkBtn}
                >
                  <FiExternalLink size={14} />
                  <span>Tra cứu trên Web {carrierInfo?.brandName.split(' ')[0]}</span>
                </a>

                <a
                  href={`tel:${carrierInfo?.hotline}`}
                  className={styles.carrierHotlineBtn}
                >
                  <FiPhoneCall size={14} />
                  <span>Tổng đài: {carrierInfo?.hotline}</span>
                </a>
              </div>
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

            {/* Products Card */}
            {order.items && order.items.length > 0 && (
              <div className={styles.card}>
                <h3 className={styles.cardTitle}>
                  <FiShoppingBag size={16} color="var(--primary, #3b82f6)" />
                  <span>Sản Phẩm Trong Đơn ({order.items.length})</span>
                </h3>

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

            {/* Payment & Bill Breakdown Card */}
            <div className={styles.card}>
              <h3 className={styles.cardTitle}>
                <FiCreditCard size={16} color="var(--primary, #3b82f6)" />
                <span>Thanh Toán & Hóa Đơn</span>
              </h3>

              <div className={styles.paymentRow}>
                <span className={styles.paymentName}>
                  {order.paymentMethod === 'bank_transfer'
                    ? '⚡ Chuyển khoản VietQR (SePay Tự Động)'
                    : '💵 Thanh toán khi nhận hàng (COD)'}
                </span>
                <span
                  className={`${styles.paymentStatusBadge} ${
                    isPaid ? styles.paidBadge : styles.unpaidBadge
                  }`}
                >
                  {isPaid ? 'Đã Thanh Toán' : 'Chưa Thanh Toán'}
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
              Nhập mã đơn hàng hoặc bấm vào các mã đơn mẫu phía trên để trải nghiệm theo dõi đơn hàng trực tiếp.
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
