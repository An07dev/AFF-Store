'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  FiChevronLeft,
  FiMapPin,
  FiEdit2,
  FiShoppingBag,
  FiTruck,
  FiCreditCard,
  FiShield,
  FiCheckCircle,
  FiCheck,
  FiChevronRight,
} from 'react-icons/fi';
import toast from 'react-hot-toast';
import { useCart, CartItem, getCartItemPrice, getCartItemOriginalPrice } from '@/contexts/CartContext';
import { useTheme } from '@/contexts/ThemeContext';
import { formatPrice } from '@/lib/utils';
import { vietnamProvinces } from '@/lib/vietnamLocations';
import { apiFetch } from '@/lib/api';
import styles from './page.module.css';

interface CarrierOption {
  id: string;
  carrier: string;
  name: string;
  shortName: string;
  fee: number;
  originalFee?: number;
  isFree?: boolean;
  estimatedDays: string;
  tag?: string;
  description?: string;
}

// Helper to sanitize any previously corrupted accumulated addresses
function cleanStreetAddress(raw: string = ''): string {
  if (!raw) return 'Số 10 Phạm Hùng';
  const parts = raw.split(',').map((s) => s.trim()).filter(Boolean);
  if (parts.length > 0) {
    return parts[0];
  }
  return raw;
}

export default function CheckoutPage() {
  const router = useRouter();
  const { items: cartItems, checkoutItems, removeCheckedOutItems } = useCart();
  const { theme } = useTheme();

  // Active checkout items for this purchase
  const [activeItems, setActiveItems] = useState<CartItem[]>([]);
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    try {
      const savedCheckout = sessionStorage.getItem('shoptik_checkout_items');
      if (savedCheckout) {
        const parsed = JSON.parse(savedCheckout);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setActiveItems(parsed);
          setIsInitialized(true);
          return;
        }
      }
    } catch (e) {
      console.error('Error reading checkout items:', e);
    }

    if (checkoutItems && checkoutItems.length > 0) {
      setActiveItems(checkoutItems);
    } else {
      setActiveItems(cartItems);
    }
    setIsInitialized(true);
  }, [checkoutItems, cartItems]);

  useEffect(() => {
    if (activeItems.length > 0) {
      if (typeof window !== 'undefined') {
        window.dispatchEvent(
          new CustomEvent('shoptik-track-event', {
            detail: {
              eventName: 'InitiateCheckout',
              customData: {
                value: activeItems.reduce((sum, item) => sum + getCartItemPrice(item) * item.quantity, 0),
                currency: 'VND',
                num_items: activeItems.reduce((sum, item) => sum + item.quantity, 0),
                content_ids: activeItems.map((item) => item.productId),
              },
            },
          })
        );
      }
    }
  }, [activeItems.length]);

  const [isEditingAddress, setIsEditingAddress] = useState(false);
  const [customer, setCustomer] = useState({
    name: '',
    phone: '',
    email: '',
    province: 'Hà Nội',
    district: 'Quận Cầu Giấy',
    ward: 'Phường Dịch Vọng Hậu',
    streetAddress: '',
    notes: '',
  });

  // Auto-fill from local profile with sanitization
  useEffect(() => {
    try {
      const savedProfile = localStorage.getItem('shoptik_profile');
      if (savedProfile) {
        const p = JSON.parse(savedProfile);
        setCustomer((prev) => ({
          ...prev,
          name: p.name || prev.name,
          phone: p.phone || prev.phone,
          email: p.email || prev.email,
          province: p.province || prev.province,
          district: p.district || prev.district,
          ward: p.ward || prev.ward,
          streetAddress: p.streetAddress ? cleanStreetAddress(p.streetAddress) : cleanStreetAddress(p.address || prev.streetAddress),
        }));
      }
    } catch (e) {
      console.error('Error loading checkout profile:', e);
    }
  }, []);

  const [paymentConfig, setPaymentConfig] = useState({ codEnabled: true, bankTransferEnabled: true });
  const [paymentMethod, setPaymentMethod] = useState<'bank_transfer' | 'cod'>('bank_transfer');
  const [submitting, setSubmitting] = useState(false);

  // Shipping carriers state
  const [carriers, setCarriers] = useState<CarrierOption[]>([]);
  const [selectedCarrierKey, setSelectedCarrierKey] = useState<string>('ghn');
  const [loadingShipping, setLoadingShipping] = useState(false);
  const [isFreeShipping, setIsFreeShipping] = useState(false);
  const [freeShippingThreshold, setFreeShippingThreshold] = useState(500000);

  // Fetch payment config to show only enabled payment methods
  useEffect(() => {
    async function fetchPaymentConfig() {
      try {
        const res = await apiFetch('/api/settings/payment');
        const data = await res.json();
        if (data.success && data.data) {
          const cod = data.data.codEnabled !== false;
          const bank = data.data.bankTransferEnabled !== false;
          setPaymentConfig({ codEnabled: cod, bankTransferEnabled: bank });

          if (bank) {
            setPaymentMethod('bank_transfer');
          } else if (cod) {
            setPaymentMethod('cod');
          }
        }
      } catch (e) {
        console.error('Error loading payment config in checkout:', e);
      }
    }
    fetchPaymentConfig();
  }, []);

  // Derived subtotal for this purchase
  const checkoutSubtotal = activeItems.reduce((acc, item) => {
    return acc + getCartItemPrice(item) * item.quantity;
  }, 0);

  // Fetch dynamic shipping options based on customer province & order subtotal
  useEffect(() => {
    async function fetchShippingRates() {
      try {
        setLoadingShipping(true);
        const res = await apiFetch('/api/shipping/calculate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            province: customer.province || 'Hà Nội',
            district: customer.district || '',
            weight: 500,
            orderValue: checkoutSubtotal,
          }),
        });
        const data = await res.json();
        if (data.success && data.data?.carriers) {
          const list: CarrierOption[] = data.data.carriers;
          setCarriers(list);
          setIsFreeShipping(!!data.data.isFreeShipping);
          if (data.data.freeShippingThreshold) {
            setFreeShippingThreshold(data.data.freeShippingThreshold);
          }

          // If current selected carrier is not in list, pick the first available
          if (list.length > 0) {
            setSelectedCarrierKey((prev) => {
              const exists = list.some((c) => c.carrier === prev || c.id === prev);
              return exists ? prev : list[0].carrier;
            });
          }
        }
      } catch (err) {
        console.error('Error calculating shipping fees in checkout:', err);
      } finally {
        setLoadingShipping(false);
      }
    }

    fetchShippingRates();
  }, [customer.province, customer.district, checkoutSubtotal]);

  // Selected carrier & dynamic shipping fee calculation
  const selectedCarrierObj =
    carriers.find((c) => c.carrier === selectedCarrierKey || c.id === selectedCarrierKey) || carriers[0];
  const dynamicShippingFee = selectedCarrierObj ? selectedCarrierObj.fee : 0;
  const finalTotalAmount = Math.max(0, checkoutSubtotal + dynamicShippingFee);

  // Address selectors logic
  const selectedProvinceData = vietnamProvinces.find((p) => p.name === customer.province) || vietnamProvinces[0];
  const availableDistricts = selectedProvinceData?.districts || [];
  const selectedDistrictData = availableDistricts.find((d) => d.name === customer.district) || availableDistricts[0];
  const availableWards = selectedDistrictData?.wards || [];

  const handleProvinceChange = (provinceName: string) => {
    const prov = vietnamProvinces.find((p) => p.name === provinceName);
    const firstDistrict = prov?.districts?.[0]?.name || '';
    const firstWard = prov?.districts?.[0]?.wards?.[0] || '';
    setCustomer((prev) => ({
      ...prev,
      province: provinceName,
      district: firstDistrict,
      ward: firstWard,
    }));
  };

  const handleDistrictChange = (districtName: string) => {
    const dist = availableDistricts.find((d) => d.name === districtName);
    const firstWard = dist?.wards?.[0] || '';
    setCustomer((prev) => ({
      ...prev,
      district: districtName,
      ward: firstWard,
    }));
  };

  const fullDisplayAddress = [
    customer.streetAddress,
    customer.ward,
    customer.district,
    customer.province,
  ]
    .filter(Boolean)
    .join(', ');

  const handleSubmitOrder = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!customer.name.trim()) {
      toast.error('Vui lòng nhập họ và tên nhận hàng');
      return;
    }
    if (!customer.phone.trim()) {
      toast.error('Vui lòng nhập số điện thoại');
      return;
    }
    if (!customer.streetAddress.trim()) {
      toast.error('Vui lòng nhập số nhà, tên đường cụ thể');
      return;
    }
    if (activeItems.length === 0) {
      toast.error('Không có sản phẩm nào để thanh toán!');
      return;
    }
    if (!paymentConfig.codEnabled && !paymentConfig.bankTransferEnabled) {
      toast.error('Cửa hàng hiện đang tạm đóng cổng thanh toán. Vui lòng liên hệ Chat với Shop!');
      return;
    }

    try {
      setSubmitting(true);

      const orderPayload = {
        customer: {
          name: customer.name.trim(),
          phone: customer.phone.trim(),
          email: customer.email.trim() || 'khachhang@shoptik.vn',
          address: fullDisplayAddress,
          province: customer.province,
          district: customer.district,
          ward: customer.ward,
        },
        items: activeItems.map((i) => ({
          productId: i.productId,
          name: i.name,
          price: getCartItemPrice(i),
          quantity: i.quantity,
          image: i.image,
          variant: i.variant,
        })),
        subtotal: checkoutSubtotal,
        shippingFee: dynamicShippingFee,
        discountAmount: 0,
        totalAmount: finalTotalAmount,
        paymentMethod,
        shippingProvider: selectedCarrierObj ? selectedCarrierObj.carrier : 'ghn',
        shippingCarrier: selectedCarrierObj ? selectedCarrierObj.name : 'Giao Hàng Nhanh (GHN)',
        notes: customer.notes.trim() || undefined,
      };

      const res = await apiFetch('/api/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(orderPayload),
      });

      const data = await res.json();

      if (data.success && data.data) {
        toast.success('Đặt hàng thành công!');

        // Dispatch Purchase event for 100% real tracking and Server-side CAPI
        if (typeof window !== 'undefined') {
          window.dispatchEvent(
            new CustomEvent('shoptik-track-event', {
              detail: {
                eventName: 'Purchase',
                customData: {
                  value: finalTotalAmount,
                  currency: 'VND',
                  order_id: data.data.orderCode || data.data._id,
                  num_items: activeItems.reduce((s, i) => s + i.quantity, 0),
                  content_ids: activeItems.map((i) => i.productId),
                  shipping_fee: dynamicShippingFee,
                },
                userData: {
                  email: customer.email.trim() || undefined,
                  phone: customer.phone.trim() || undefined,
                },
              },
            })
          );
        }

        // Save customer info locally for future visits without accumulating duplicate strings
        try {
          localStorage.setItem(
            'shoptik_profile',
            JSON.stringify({
              name: customer.name.trim(),
              phone: customer.phone.trim(),
              email: customer.email.trim() || 'khachhang@shoptik.vn',
              streetAddress: customer.streetAddress.trim(),
              province: customer.province,
              district: customer.district,
              ward: customer.ward,
              address: fullDisplayAddress,
            })
          );
          // Save order code for order tracking
          if (data.data.orderCode) {
            const stored = JSON.parse(localStorage.getItem('shoptik_order_codes') || '[]');
            const updated = [data.data.orderCode, ...stored.filter((c: string) => c !== data.data.orderCode)].slice(0, 10);
            localStorage.setItem('shoptik_order_codes', JSON.stringify(updated));
          }
        } catch (e) {
          console.error('Error saving profile or order code locally:', e);
        }

        if (paymentMethod === 'bank_transfer') {
          // Lưu danh sách sản phẩm chờ thanh toán vào sessionStorage
          try {
            sessionStorage.setItem('shoptik_pending_payment_items', JSON.stringify(activeItems));
          } catch (e) {}

          // KHÔNG xóa sản phẩm khỏi giỏ hàng ngay để nếu khách chưa chuyển khoản và quay lại mua tiếp, sản phẩm vẫn còn trong giỏ
          router.push(`/payment?orderId=${data.data._id}&code=${data.data.orderCode}`);
        } else {
          // Thanh toán COD -> Xóa sản phẩm vừa mua khỏi giỏ hàng ngay
          removeCheckedOutItems(activeItems);
          router.push(`/order-success?code=${data.data.orderCode}`);
        }
      } else {
        toast.error(data.message || 'Lỗi tạo đơn hàng');
      }
    } catch (err) {
      console.error('Error submitting order:', err);
      toast.error('Không thể gửi đơn hàng. Vui lòng thử lại.');
    } finally {
      setSubmitting(false);
    }
  };

  const shopName = theme?.pageTitles?.logoText || 'ShopTik Store';

  if (isInitialized && activeItems.length === 0) {
    return (
      <div className={styles.page}>
        <nav className={styles.topNav}>
          <button className={styles.backBtn} onClick={() => router.back()} aria-label="Quay lại">
            <FiChevronLeft size={22} />
          </button>
          <div className={styles.navTitle}>Thanh Toán Đơn Hàng</div>
          <div style={{ width: 32 }}></div>
        </nav>

        <div className={styles.emptyState}>
          <FiShoppingBag className={styles.emptyIcon} />
          <h3 className={styles.emptyTitle}>Chưa có sản phẩm thanh toán</h3>
          <p className={styles.emptyDesc}>Hãy chọn mua các sản phẩm chất lượng tại cửa hàng nhé!</p>
          <Link href="/" className={styles.emptyBtn}>
            Khám Phá Sản Phẩm Ngay
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.page}>
      {/* ===== FIXED TOP NAVIGATION ===== */}
      <nav className={styles.topNav}>
        <button className={styles.backBtn} onClick={() => router.back()} aria-label="Quay lại">
          <FiChevronLeft size={22} />
        </button>
        <div className={styles.navTitle}>Xác Nhận Đơn Hàng</div>
        <div style={{ width: 32 }}></div>
      </nav>

      <form className={styles.scrollArea} onSubmit={handleSubmitOrder}>
        {/* 1. SHIPPING ADDRESS CARD (MODERN ELEGANT TIKTOK SHOP DESIGN) */}
        <div className={styles.addressCard}>
          {/* Decorative Envelope Stripe */}
          <div className={styles.envelopeStripe} />

          <div className={styles.addressCardBody}>
            <div className={styles.addressHeader}>
              <div className={styles.addressHeaderLeft}>
                <div className={styles.pinIconWrap}>
                  <FiMapPin size={15} color="#ef4444" />
                </div>
                <span className={styles.addressTitle}>Địa Chỉ Nhận Hàng</span>
              </div>
              <button
                type="button"
                className={styles.editAddressBtn}
                onClick={() => setIsEditingAddress(!isEditingAddress)}
              >
                <FiEdit2 size={12} />
                <span>{isEditingAddress ? 'Thu gọn' : 'Thay đổi'}</span>
              </button>
            </div>

            {!isEditingAddress ? (
              <div className={styles.addressPreview} onClick={() => setIsEditingAddress(true)}>
                <div className={styles.contactRow}>
                  <span className={styles.customerName}>{customer.name || 'Chưa nhập họ tên'}</span>
                  <span className={styles.dotSeparator}>•</span>
                  <span className={styles.customerPhone}>{customer.phone || 'Chưa nhập SĐT'}</span>
                  <span className={styles.defaultBadge}>Mặc định</span>
                </div>
                <p className={styles.fullAddressText}>
                  {fullDisplayAddress || 'Số 10 Phạm Hùng, Phường Mai Dịch, Quận Cầu Giấy, Hà Nội'}
                </p>
              </div>
            ) : (
              <div className={styles.addressForm}>
                {/* Row 1: Name & Phone */}
                <div className={styles.gridTwo}>
                  <div className={styles.inputGroup}>
                    <label>Họ và tên *</label>
                    <input
                      type="text"
                      required
                      placeholder="VD: Lê Văn An"
                      className={styles.input}
                      value={customer.name}
                      onChange={(e) => setCustomer({ ...customer, name: e.target.value })}
                    />
                  </div>
                  <div className={styles.inputGroup}>
                    <label>Số điện thoại *</label>
                    <input
                      type="tel"
                      required
                      placeholder="VD: 0336625074"
                      className={styles.input}
                      value={customer.phone}
                      onChange={(e) => setCustomer({ ...customer, phone: e.target.value })}
                    />
                  </div>
                </div>

                {/* Row 2: Province / City (Full Width) */}
                <div className={styles.inputGroup}>
                  <label>Tỉnh / Thành phố *</label>
                  <select
                    className={`${styles.input} ${styles.selectInput}`}
                    value={customer.province}
                    onChange={(e) => handleProvinceChange(e.target.value)}
                  >
                    {vietnamProvinces.map((p) => (
                      <option key={p.name} value={p.name}>
                        {p.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Row 3: District & Ward (2 Columns) */}
                <div className={styles.gridTwo}>
                  <div className={styles.inputGroup}>
                    <label>Quận / Huyện *</label>
                    <select
                      className={`${styles.input} ${styles.selectInput}`}
                      value={customer.district}
                      onChange={(e) => handleDistrictChange(e.target.value)}
                    >
                      {availableDistricts.map((d) => (
                        <option key={d.name} value={d.name}>
                          {d.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className={styles.inputGroup}>
                    <label>Phường / Xã *</label>
                    <select
                      className={`${styles.input} ${styles.selectInput}`}
                      value={customer.ward}
                      onChange={(e) => setCustomer({ ...customer, ward: e.target.value })}
                    >
                      {availableWards.map((w) => (
                        <option key={w} value={w}>
                          {w}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Row 4: Street Address (Full Width) */}
                <div className={styles.inputGroup}>
                  <label>Số nhà, tên đường cụ thể *</label>
                  <input
                    type="text"
                    required
                    placeholder="VD: Số 10 Phạm Hùng, Tòa nhà Keangnam"
                    className={styles.input}
                    value={customer.streetAddress}
                    onChange={(e) => setCustomer({ ...customer, streetAddress: e.target.value })}
                  />
                </div>

                {/* Row 5: Email & Note */}
                <div className={styles.gridTwo}>
                  <div className={styles.inputGroup}>
                    <label>Email (Nhận hóa đơn điện tử)</label>
                    <input
                      type="email"
                      placeholder="vd: khachhang@gmail.com"
                      className={styles.input}
                      value={customer.email}
                      onChange={(e) => setCustomer({ ...customer, email: e.target.value })}
                    />
                    <span style={{ fontSize: '0.6875rem', color: 'var(--text-muted, #94a3b8)', marginTop: 2 }}>
                      Nhận thông báo xác nhận và tiến trình đơn hàng
                    </span>
                  </div>
                  <div className={styles.inputGroup}>
                    <label>Ghi chú (Tùy chọn)</label>
                    <input
                      type="text"
                      placeholder="VD: Gọi trước khi giao"
                      className={styles.input}
                      value={customer.notes}
                      onChange={(e) => setCustomer({ ...customer, notes: e.target.value })}
                    />
                  </div>
                </div>

                <button
                  type="button"
                  className={styles.confirmAddressBtn}
                  onClick={() => {
                    if (!customer.name || !customer.phone || !customer.streetAddress) {
                      toast.error('Vui lòng điền đầy đủ họ tên, SĐT và địa chỉ');
                      return;
                    }
                    setIsEditingAddress(false);
                    toast.success('Đã cập nhật địa chỉ giao hàng');
                  }}
                >
                  <FiCheck size={14} />
                  <span>Xác Nhận Địa Chỉ Này</span>
                </button>
              </div>
            )}
          </div>
        </div>

        {/* 2. ORDERED PRODUCTS CARD (ONLY ACTIVE ITEMS FOR THIS PURCHASE) */}
        <div className={styles.productCard}>
          <div className={styles.cardHeader}>
            <FiShoppingBag size={15} color="var(--primary, #3b82f6)" />
            <span>{shopName} ({activeItems.length} món)</span>
          </div>

          {activeItems.map((i, idx) => {
            const itemPrice = getCartItemPrice(i);
            const originalPrice = getCartItemOriginalPrice(i);
            const hasDiscount = originalPrice > itemPrice;

            return (
              <div key={idx} className={styles.orderItemRow}>
                <img
                  src={i.image || 'https://images.unsplash.com/photo-1581655353564-df123a1eb820?w=400'}
                  alt={i.name}
                  className={styles.orderItemImg}
                />
                <div className={styles.orderItemDetails}>
                  <span className={styles.orderItemName}>{i.name}</span>
                  {i.variant?.name && (
                    <span className={styles.orderItemVariant}>Phân loại: {i.variant.name}</span>
                  )}
                  <div className={styles.orderItemPriceRow}>
                    <div style={{ display: 'flex', alignItems: 'baseline', gap: 6 }}>
                      <span className={styles.orderItemPrice}>
                        {formatPrice(itemPrice * i.quantity)}
                      </span>
                      {hasDiscount && (
                        <span style={{ fontSize: 11, color: '#64748b', textDecoration: 'line-through' }}>
                          {formatPrice(originalPrice * i.quantity)}
                        </span>
                      )}
                    </div>
                    <span className={styles.orderItemQty}>x{i.quantity}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* 3. SHIPPING METHOD SELECTOR (ACTIVE CARRIERS WITH DYNAMIC FEES) */}
        <div className={styles.shippingCard}>
          <div className={styles.shippingHeaderWrap}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, fontWeight: 800, color: 'var(--text-main, #f8fafc)' }}>
              <FiTruck size={15} color="var(--primary, #3b82f6)" />
              <span>Phương Thức Vận Chuyển</span>
            </div>
            {isFreeShipping && (
              <span style={{ fontSize: 11, color: '#10b981', fontWeight: 700 }}>
                ✓ MIỄN PHÍ GIAO HÀNG
              </span>
            )}
          </div>

          {isFreeShipping && (
            <div className={styles.freeShipBanner}>
              <span>🎉 Đơn hàng trên {formatPrice(freeShippingThreshold)} được áp dụng Freeship 0đ toàn quốc!</span>
            </div>
          )}

          {loadingShipping && carriers.length === 0 ? (
            <div style={{ padding: '10px 0', fontSize: 12, color: 'var(--text-muted, #94a3b8)' }}>
              Đang tính phí vận chuyển theo địa chỉ...
            </div>
          ) : (
            <div className={styles.carrierList}>
              {carriers.map((c) => {
                const isSelected = (selectedCarrierObj?.carrier === c.carrier) || (selectedCarrierObj?.id === c.id);
                const tagStyle =
                  c.carrier === 'ghn'
                    ? styles.tagGHN
                    : c.carrier === 'ghtk'
                    ? styles.tagGHTK
                    : c.carrier === 'viettelpost'
                    ? styles.tagVTP
                    : styles.tagStandard;

                return (
                  <div
                    key={c.id || c.carrier}
                    className={`${styles.carrierItem} ${isSelected ? styles.carrierActive : ''}`}
                    onClick={() => setSelectedCarrierKey(c.carrier || c.id)}
                  >
                    <div className={styles.carrierLeft}>
                      <input
                        type="radio"
                        name="checkout_shipping_carrier"
                        className={styles.carrierRadio}
                        checked={isSelected}
                        onChange={() => setSelectedCarrierKey(c.carrier || c.id)}
                      />
                      <div className={styles.carrierInfo}>
                        <div className={styles.carrierHeaderRow}>
                          <span className={styles.carrierName}>{c.name}</span>
                          {c.tag && <span className={`${styles.carrierTag} ${tagStyle}`}>{c.tag}</span>}
                        </div>
                        <span className={styles.carrierEstimated}>
                          <FiTruck size={11} style={{ opacity: 0.7 }} />
                          {c.estimatedDays} • {c.description || 'Giao hàng tận nơi'}
                        </span>
                      </div>
                    </div>

                    <div className={styles.carrierFeeCol}>
                      <span className={`${styles.carrierFee} ${c.fee === 0 ? styles.carrierFeeFree : ''}`}>
                        {c.fee === 0 ? 'Miễn phí' : formatPrice(c.fee)}
                      </span>
                      {c.isFree && c.originalFee && c.originalFee > 0 && (
                        <span className={styles.carrierOriginalFee}>{formatPrice(c.originalFee)}</span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* 4. PAYMENT METHOD SELECTOR */}
        <div className={styles.paymentCard}>
          <div className={styles.cardHeader}>
            <FiCreditCard size={15} color="var(--primary, #3b82f6)" />
            <span>Phương Thức Thanh Toán</span>
          </div>

          <div className={styles.paymentList}>
            {paymentConfig.bankTransferEnabled && (
              <div
                className={`${styles.paymentOption} ${paymentMethod === 'bank_transfer' ? styles.paymentActive : ''}`}
                onClick={() => setPaymentMethod('bank_transfer')}
              >
                <input
                  type="radio"
                  name="payment"
                  checked={paymentMethod === 'bank_transfer'}
                  onChange={() => setPaymentMethod('bank_transfer')}
                />
                <div className={styles.paymentOptionInfo}>
                  <span className={styles.paymentOptionTitle}>
                    ⚡ Chuyển khoản VietQR (SePay Tự Động)
                  </span>
                  <span className={styles.paymentOptionDesc}>
                    Quét mã QR qua mọi ứng dụng ngân hàng, xác nhận trong 3 giây
                  </span>
                </div>
              </div>
            )}

            {paymentConfig.codEnabled && (
              <div
                className={`${styles.paymentOption} ${paymentMethod === 'cod' ? styles.paymentActive : ''}`}
                onClick={() => setPaymentMethod('cod')}
              >
                <input
                  type="radio"
                  name="payment"
                  checked={paymentMethod === 'cod'}
                  onChange={() => setPaymentMethod('cod')}
                />
                <div className={styles.paymentOptionInfo}>
                  <span className={styles.paymentOptionTitle}>
                    💵 Thanh toán khi nhận hàng (COD)
                  </span>
                  <span className={styles.paymentOptionDesc}>
                    Kiểm tra hàng và thanh toán tiền mặt cho shipper
                  </span>
                </div>
              </div>
            )}

            {!paymentConfig.bankTransferEnabled && !paymentConfig.codEnabled && (
              <div
                style={{
                  padding: '14px 16px',
                  background: 'rgba(245, 158, 11, 0.1)',
                  border: '1px solid rgba(245, 158, 11, 0.3)',
                  borderRadius: 10,
                  fontSize: 13,
                  color: '#f59e0b',
                  textAlign: 'center',
                  lineHeight: 1.5,
                }}
              >
                ⚠️ Cửa hàng đang tạm đóng cổng thanh toán tự động. Quý khách vui lòng bấm <strong>Chat với Shop</strong> để được nhân viên hỗ trợ đặt hàng nhanh!
              </div>
            )}
          </div>
        </div>

        {/* 5. BILL SUMMARY */}
        <div className={styles.billCard}>
          <div className={styles.billRow}>
            <span>Tổng tiền hàng</span>
            <span className={styles.billVal}>{formatPrice(checkoutSubtotal)}</span>
          </div>
          <div className={styles.billRow}>
            <span>Phí vận chuyển ({selectedCarrierObj?.shortName || 'Vận chuyển'})</span>
            <span
              className={styles.billVal}
              style={{
                color: dynamicShippingFee === 0 ? '#10b981' : 'var(--text-main, #fff)',
                fontWeight: dynamicShippingFee === 0 ? 700 : 600,
              }}
            >
              {dynamicShippingFee === 0 ? 'Miễn phí (0 ₫)' : formatPrice(dynamicShippingFee)}
            </span>
          </div>
        </div>
      </form>

      {/* ===== FIXED BOTTOM ACTION BAR ===== */}
      <div className={styles.bottomBar}>
        <div className={styles.totalGroup}>
          <span className={styles.totalLabel}>Tổng thanh toán</span>
          <span className={styles.totalAmount}>{formatPrice(finalTotalAmount)}</span>
        </div>

        <button
          type="button"
          className={styles.orderSubmitBtn}
          disabled={submitting}
          onClick={handleSubmitOrder}
        >
          {submitting ? 'Đang Xử Lý...' : 'Đặt Hàng Ngay'}
        </button>
      </div>
    </div>
  );
}