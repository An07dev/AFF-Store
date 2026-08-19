'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { FiArrowLeft, FiCheck, FiTruck, FiUser, FiMapPin, FiPackage, FiX, FiDollarSign } from 'react-icons/fi';
import toast from 'react-hot-toast';
import { formatPrice, formatDate } from '@/lib/utils';
import AdminLoading from '@/components/admin/AdminLoading';
import { apiFetch } from '@/lib/api';
import styles from './page.module.css';

export default function OrderDetailPage() {
  const params = useParams();
  const id = params.id as string;

  const [order, setOrder] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  const fetchOrder = async () => {
    try {
      setLoading(true);
      const res = await apiFetch(`/api/orders/${id}`);
      const data = await res.json();
      if (data.success && data.data) {
        setOrder(data.data);
      } else {
        toast.error('Không tìm thấy đơn hàng');
      }
    } catch (e) {
      toast.error('Lỗi tải thông tin đơn hàng');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) fetchOrder();
  }, [id]);

  const updateOrderStatus = async (status: string, paymentStatus?: string) => {
    setUpdating(true);
    try {
      const payload: any = { status };
      if (paymentStatus) payload.paymentStatus = paymentStatus;

      const res = await apiFetch(`/api/orders/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (data.success) {
        toast.success(`Đã cập nhật trạng thái đơn thành ${status}`);
        fetchOrder();
      } else {
        toast.error(data.message || 'Lỗi cập nhật');
      }
    } catch (err) {
      toast.error('Lỗi kết nối máy chủ');
    } finally {
      setUpdating(false);
    }
  };

  const createShipping = async (provider: string) => {
    try {
      setUpdating(true);
      const res = await apiFetch('/api/shipping/create-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orderId: order._id,
          provider,
          orderData: {
            orderCode: order.orderCode,
            paymentMethod: order.paymentMethod,
            totalAmount: order.totalAmount,
            to_name: order.customer?.name,
            to_phone: order.customer?.phone,
            to_address: order.customer?.address,
            province: order.customer?.province,
            district: order.customer?.district,
            ward: order.customer?.ward,
            customer: order.customer,
            items: order.items,
            cod_amount: order.paymentStatus === 'paid' ? 0 : order.totalAmount,
            weight: 500,
          },
        }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success(`Đã đẩy đơn sang ${provider.toUpperCase()} thành công! Mã vận đơn: ${data.data.trackingCode}`);
        fetchOrder();
      } else {
        toast.error(data.message || 'Lỗi khi đẩy đơn sang hãng');
      }
    } catch (e) {
      toast.error('Lỗi tạo vận đơn');
    } finally {
      setUpdating(false);
    }
  };

  if (loading) return <AdminLoading text="Đang tải chi tiết đơn hàng..." />;
  if (!order) return <div className={styles.page}>Không tìm thấy đơn hàng</div>;

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <div className={styles.titleGroup}>
          <Link href="/admin/orders" className={styles.backBtn}>
            <FiArrowLeft />
          </Link>
          <h1 className={styles.title}>Đơn hàng #{order.orderCode}</h1>
          <span
            className={`${styles.badge} ${
              order.status === 'delivered'
                ? styles.badgeSuccess
                : order.status === 'cancelled'
                ? styles.badgeDanger
                : order.status === 'shipping'
                ? styles.badgeInfo
                : styles.badgePending
            }`}
          >
            {order.status === 'delivered'
              ? 'Đã giao thành công'
              : order.status === 'shipping'
              ? 'Đang giao hàng'
              : order.status === 'confirmed'
              ? 'Đã xác nhận'
              : order.status === 'cancelled'
              ? 'Đã hủy'
              : 'Chờ xác nhận'}
          </span>
        </div>

        <div className={styles.actions}>
          {order.status !== 'cancelled' && order.status !== 'delivered' && (
            <button
              className={styles.btnDanger}
              onClick={() => updateOrderStatus('cancelled')}
              disabled={updating}
            >
              <FiX /> Hủy đơn
            </button>
          )}

          {/* 1-Click Duyệt Đơn & Tự Động Đẩy Hãng Vận Chuyển Khách Đã Chọn */}
          {order.status === 'pending' && (
            <button
              type="button"
              className={styles.btnPrimary}
              style={{
                background:
                  (order.shippingProvider || '').includes('ghtk')
                    ? '#059669'
                    : '#ea580c',
              }}
              onClick={() => updateOrderStatus('confirmed')}
              disabled={updating}
            >
              <FiCheck /> Duyệt Đơn & Đẩy Sang {order.shippingCarrier || order.shippingProvider?.toUpperCase() || 'Hãng Vận Chuyển'}
            </button>
          )}

          {order.status === 'confirmed' && !order.trackingCode && (
            <div style={{ display: 'flex', gap: 6 }}>
              <button
                type="button"
                className={styles.btnPrimary}
                style={{ background: '#ea580c' }}
                onClick={() => createShipping('ghn')}
                disabled={updating}
              >
                <FiTruck /> Đẩy GHN
              </button>
              <button
                type="button"
                className={styles.btnPrimary}
                style={{ background: '#059669' }}
                onClick={() => createShipping('ghtk')}
                disabled={updating}
              >
                <FiTruck /> Đẩy GHTK
              </button>
            </div>
          )}

          {order.status === 'confirmed' && order.trackingCode && (
            <button
              className={styles.btnPrimary}
              onClick={() => updateOrderStatus('shipping')}
              disabled={updating}
            >
              <FiTruck /> Chuyển sang Đang giao
            </button>
          )}

          {order.status === 'shipping' && (
            <button
              className={styles.btnPrimary}
              style={{ background: '#10b981' }}
              onClick={() => updateOrderStatus('delivered', 'paid')}
              disabled={updating}
            >
              <FiCheck /> Hoàn thành đơn
            </button>
          )}
        </div>
      </div>

      <div className={styles.grid}>
        <div className={styles.mainCol}>
          <div className={styles.card}>
            <h3>
              <FiPackage className={styles.inlineIcon} /> Sản phẩm trong đơn ({order.items?.length || 0})
            </h3>
            <div className={styles.productList}>
              {order.items?.map((item: any, idx: number) => (
                <div key={idx} className={styles.productItem}>
                  <img
                    src={item.image || '/file.svg'}
                    alt={item.name}
                    className={styles.productImg}
                  />
                  <div className={styles.productInfo}>
                    <h4>{item.name}</h4>
                    {item.variant?.name && (
                      <p className={styles.textMuted}>Phân loại: {item.variant.name}</p>
                    )}
                  </div>
                  <div className={styles.productPrice}>
                    <p>
                      {formatPrice(item.price)} x {item.quantity}
                    </p>
                    <strong>{formatPrice(item.price * item.quantity)}</strong>
                  </div>
                </div>
              ))}
            </div>

            <div className={styles.summary}>
              <div className={styles.summaryRow}>
                <span>Tạm tính tiền hàng:</span>
                <span>{formatPrice(order.subtotal || order.totalAmount)}</span>
              </div>
              <div className={styles.summaryRow}>
                <span>Phí vận chuyển:</span>
                <span>{order.shippingFee === 0 ? 'Miễn phí' : formatPrice(order.shippingFee)}</span>
              </div>
              {order.discountAmount > 0 && (
                <div className={styles.summaryRow} style={{ color: '#10b981' }}>
                  <span>Giảm giá:</span>
                  <span>-{formatPrice(order.discountAmount)}</span>
                </div>
              )}
              <div className={`${styles.summaryRow} ${styles.totalRow}`}>
                <span>Tổng tiền cần thanh toán:</span>
                <span style={{ color: 'var(--primary, #3b82f6)' }}>{formatPrice(order.totalAmount)}</span>
              </div>
            </div>
          </div>

          {order.notes && (
            <div className={styles.card}>
              <h3>Ghi chú của khách</h3>
              <p style={{ color: '#f3f4f6', fontStyle: 'italic' }}>"{order.notes}"</p>
            </div>
          )}
        </div>

        <div className={styles.sideCol}>
          <div className={styles.card}>
            <h3>
              <FiUser className={styles.inlineIcon} /> Thông tin người nhận
            </h3>
            <p className={styles.infoText}>
              <strong>{order.customer?.name}</strong>
            </p>
            <p className={styles.infoText}>SĐT: {order.customer?.phone}</p>
            {order.customer?.email && <p className={styles.infoText}>Email: {order.customer.email}</p>}
          </div>

          <div className={styles.card}>
            <h3>
              <FiMapPin className={styles.inlineIcon} /> Địa chỉ giao hàng
            </h3>
            <p className={styles.infoText}>{order.customer?.address}</p>
          </div>

          <div className={styles.card}>
            <h3>
              <FiDollarSign className={styles.inlineIcon} /> Thanh toán
            </h3>
            <p className={styles.infoText}>
              Phương thức: <strong>{order.paymentMethod === 'bank_transfer' ? 'Chuyển khoản VietQR' : 'COD (Tiền mặt)'}</strong>
            </p>
            <p className={styles.infoText}>
              Trạng thái:{' '}
              <strong style={{ color: order.paymentStatus === 'paid' ? '#10b981' : '#f59e0b' }}>
                {order.paymentStatus === 'paid' ? 'ĐÃ THANH TOÁN' : 'CHƯA THANH TOÁN'}
              </strong>
            </p>
            {order.paymentStatus !== 'paid' && (
              <button
                type="button"
                className={styles.btnSecondary}
                style={{ marginTop: 8, fontSize: '0.8125rem' }}
                onClick={() => updateOrderStatus(order.status, 'paid')}
              >
                Xác nhận đã nhận tiền
              </button>
            )}
          </div>

          <div className={styles.card}>
            <h3>
              <FiTruck className={styles.inlineIcon} /> Vận chuyển & Giao hàng
            </h3>
            {order.trackingCode ? (
              <div>
                <p className={styles.infoText}>
                  Đơn vị: <strong>{order.shippingProvider?.toUpperCase()}</strong>
                </p>
                <p className={styles.infoText}>
                  Mã vận đơn: <strong style={{ color: 'var(--primary, #3b82f6)' }}>{order.trackingCode}</strong>
                </p>
              </div>
            ) : (
              <div>
                <p className={styles.textMuted} style={{ marginBottom: 12 }}>
                  Chưa đẩy sang hãng vận chuyển. Chọn hãng để đẩy đơn:
                </p>
                <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                  <button
                    type="button"
                    className={styles.btnSecondary}
                    onClick={() => createShipping('ghn')}
                  >
                    Giao Hàng Nhanh (GHN)
                  </button>
                  <button
                    type="button"
                    className={styles.btnSecondary}
                    onClick={() => createShipping('ghtk')}
                  >
                    GHTK
                  </button>
                  <button
                    type="button"
                    className={styles.btnSecondary}
                    onClick={() => createShipping('viettelpost')}
                  >
                    ViettelPost
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
