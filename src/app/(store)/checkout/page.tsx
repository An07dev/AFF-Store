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
  carrier: string;
  name: string;
  fee: number;
  estimatedDays: string;
  description: string;
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

  // Shipping carriers state (GHN, GHTK, Viettel Post)
  const [carriers, setCarriers] = useState<CarrierOption[]>([
    {
      carrier: 'ghtk',
      name: 'Giao Hàng Tiết Kiệm (GHTK)',
      fee: 20000,
      estimatedDays: '1-2 ngày',
      description: 'Tiết kiệm, độ phủ sóng toàn quốc',
    },
    {
      carrier: 'ghn',
      name: 'Giao Nhanh (GHN)',
      fee: 22000,
      estimatedDays: '1 ngày',
      description: 'Hỏa tốc nội thành, giao nhanh',
    },
    {
      carrier: 'viettelpost',
      name: 'Viettel Post Tiêu Chuẩn',
      fee: 21000,
      estimatedDays: '1-2 ngày',
      description: 'Mạng lưới an toàn, bảo đảm',
    },
  ]);
  const [selectedCarrier, setSelectedCarrier] = useState<string>('ghtk');
  const [loadingShipping, setLoadingShipping] = useState(false);

  const [paymentMethod, setPaymentMethod] = useState<'bank_transfer' | 'cod'>('bank_transfer');
  const [submitting, setSubmitting] = useState(false);

  // Derived subtotal for this purchase
  const checkoutSubtotal = activeItems.reduce((acc, item) => {
    return acc + getCartItemPrice(item) * item.quantity;
  }, 0);

  // Fetch dynamic carrier rates from POST /api/shipping/calculate
  useEffect(() => {
    async function calculateShippingRates() {
      try {
        setLoadingShipping(true);
        const weight = activeItems.reduce((acc, i) => acc + (i.quantity * 250), 500);
        const res = await apiFetch('/api/shipping/calculate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            province: customer.province || 'Hà Nội',
            district: customer.district || 'Quận Cầu Giấy',
            weight: weight || 500,
            orderValue: checkoutSubtotal || 450000,
          }),
        });
        const data = await res.json();

        if (data.success && data.data) {
          const list: CarrierOption[] = [];
          if (data.data.ghtk) {
            list.push({
              carrier: 'ghtk',
              name: data.data.ghtk.serviceName || 'Giao Hàng Tiết Kiệm (GHTK)',
              fee: Number(data.data.ghtk.fee) || 20000,
              estimatedDays: data.data.ghtk.estimatedTime || '1-2 ngày',
              description: 'Tiết kiệm, độ phủ sóng toàn quốc',
            });
          }
          if (data.data.ghn) {
            list.push({
              carrier: 'ghn',
              name: data.data.ghn.serviceName || 'Giao Nhanh (GHN)',
              fee: Number(data.data.ghn.fee) || 22000,
              estimatedDays: data.data.ghn.estimatedTime || '1 ngày',
              description: 'Hỏa tốc nội thành, giao nhanh',
            });
          }
          if (data.data.viettelpost) {
            list.push({
              carrier: 'viettelpost',
              name: data.data.viettelpost.serviceName || 'Viettel Post Tiêu Chuẩn',
              fee: Number(data.data.viettelpost.fee) || 21000,
              estimatedDays: data.data.viettelpost.estimatedTime || '1-2 ngày',
              description: 'Mạng lưới an toàn, bảo đảm',
            });
          }

          if (list.length > 0) {
            setCarriers(list);
            if (!list.some((c) => c.carrier === selectedCarrier)) {
              setSelectedCarrier(list[0].carrier);
            }
          }
        }
      } catch (err) {
        console.error('Error fetching shipping rates:', err);
      } finally {
        setLoadingShipping(false);
      }
    }

    calculateShippingRates();
  }, [customer.province, customer.district, checkoutSubtotal, activeItems.length]);

  const currentCarrierObj = carriers.find((c) => c.carrier === selectedCarrier) || carriers[0];
  const dynamicShippingFee = currentCarrierObj ? currentCarrierObj.fee : 20000;
  const finalTotalAmount = checkoutSubtotal + dynamicShippingFee;

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
        shippingProvider: selectedCarrier || 'ghn',
        shippingCarrier: currentCarrierObj?.name || 'Giao Hàng Nhanh (GHN)',
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

        {/* 3. SHIPPING CARRIER SELECTOR (API 8.1 SO SÁNH 3 HÃNG) */}
        <div className={styles.shippingCard}>
          <div className={styles.cardHeader}>
            <FiTruck size={15} color="var(--primary, #3b82f6)" />
            <span>Phương Thức Vận Chuyển</span>
            {loadingShipping && (
              <span style={{ fontSize: 11, color: 'var(--primary, #3b82f6)', marginLeft: 'auto' }}>
                Đang tính cước...
              </span>
            )}
          </div>

          <div className={styles.carrierList}>
            {carriers.map((c) => {
              const isSelected = selectedCarrier === c.carrier;
              return (
                <div
                  key={c.carrier}
                  className={`${styles.carrierItem} ${isSelected ? styles.carrierActive : ''}`}
                  onClick={() => setSelectedCarrier(c.carrier)}
                >
                  <div className={styles.carrierLeft}>
                    <input
                      type="radio"
                      className={styles.carrierRadio}
                      checked={isSelected}
                      onChange={() => setSelectedCarrier(c.carrier)}
                    />
                    <div className={styles.carrierInfo}>
                      <span className={styles.carrierName}>{c.name}</span>
                      <span className={styles.carrierEstimated}>Dự kiến giao: {c.estimatedDays}</span>
                    </div>
                  </div>
                  <span className={styles.carrierFee}>
                    {formatPrice(c.fee)}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* 4. PAYMENT METHOD SELECTOR */}
        <div className={styles.paymentCard}>
          <div className={styles.cardHeader}>
            <FiCreditCard size={15} color="var(--primary, #3b82f6)" />
            <span>Phương Thức Thanh Toán</span>
          </div>

          <div className={styles.paymentList}>
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
          </div>
        </div>

        {/* 5. BILL SUMMARY */}
        <div className={styles.billCard}>
          <div className={styles.billRow}>
            <span>Tổng tiền hàng</span>
            <span className={styles.billVal}>{formatPrice(checkoutSubtotal)}</span>
          </div>
          <div className={styles.billRow}>
            <span>Phí vận chuyển ({currentCarrierObj?.name})</span>
            <span className={styles.billVal}>
              {formatPrice(dynamicShippingFee)}
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