'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import {
  FiArrowLeft,
  FiUser,
  FiPhone,
  FiMail,
  FiMapPin,
  FiShoppingBag,
  FiDollarSign,
  FiCalendar,
  FiEye,
  FiAward,
  FiPackage,
  FiLock,
  FiUnlock,
  FiCheck,
  FiX,
  FiClock,
} from 'react-icons/fi';
import { FcGoogle } from 'react-icons/fc';
import { FaFacebook } from 'react-icons/fa';
import toast from 'react-hot-toast';
import { formatPrice, formatDate } from '@/lib/utils';
import Skeleton from '@/components/common/Skeleton';
import { apiFetch } from '@/lib/api';
import styles from '../page.module.css';

export default function CustomerDetailPage() {
  const params = useParams();
  const id = params.id as string;

  const [customer, setCustomer] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'products' | 'orders'>('products');

  // Lock / Unlock State
  const [isLockModalOpen, setIsLockModalOpen] = useState(false);
  const [lockReasonInput, setLockReasonInput] = useState('');
  const [isLockSubmitting, setIsLockSubmitting] = useState(false);

  const loadCustomer = async () => {
    try {
      setLoading(true);
      const res = await apiFetch(`/api/customers/${id}`);
      const data = await res.json();
      if (data.success && data.data) {
        setCustomer(data.data);
        setLockReasonInput(data.data.lockReason || 'Vi phạm chính sách đặt hàng / bom hàng');
      } else {
        toast.error('Không tìm thấy thông tin khách hàng');
      }
    } catch (e) {
      toast.error('Lỗi tải dữ liệu máy chủ');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) loadCustomer();
  }, [id]);

  const handleToggleLock = async () => {
    if (!customer) return;
    setIsLockSubmitting(true);
    try {
      const res = await apiFetch(`/api/customers/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          isLocked: !customer.isLocked,
          lockReason: !customer.isLocked ? lockReasonInput : '',
        }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success(!customer.isLocked ? 'Đã khóa tài khoản khách hàng!' : 'Đã mở khóa tài khoản thành công!');
        setIsLockModalOpen(false);
        loadCustomer();
      } else {
        toast.error(data.message || 'Lỗi xử lý');
      }
    } catch (err) {
      toast.error('Lỗi kết nối máy chủ');
    } finally {
      setIsLockSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className={styles.page}>
        <div style={{ display: 'flex', gap: 16 }}>
          <Skeleton type="rect" height={220} width="35%" />
          <Skeleton type="rect" height={220} width="65%" />
        </div>
        <Skeleton type="table-row" count={5} />
      </div>
    );
  }

  if (!customer) {
    return (
      <div className={styles.page}>
        <div className={styles.card} style={{ padding: 40, textAlign: 'center' }}>
          <p style={{ color: 'var(--text-muted, #9ca3af)', marginBottom: 16 }}>
            Không tìm thấy thông tin khách hàng yêu cầu
          </p>
          <Link href="/admin/customers" className={styles.addBtn} style={{ display: 'inline-flex' }}>
            <FiArrowLeft /> Quay lại danh sách
          </Link>
        </div>
      </div>
    );
  }

  const isVip = (customer.totalSpent || 0) >= 2000000;
  const isLocked = Boolean(customer.isLocked);
  const provider = customer.provider || 'local';
  const purchasedProducts = customer.purchasedProducts || [];
  const orders = customer.orders || [];

  return (
    <div className={styles.page}>
      {/* Header */}
      <div className={styles.header}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <Link href="/admin/customers" className={styles.actionBtn} title="Quay lại">
            <FiArrowLeft style={{ fontSize: '1.125rem' }} />
          </Link>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <h1 className={styles.title}>Hồ Sơ: {customer.name}</h1>
              {provider === 'google' && (
                <span title="Đăng nhập qua Google" style={{ display: 'inline-flex', alignItems: 'center' }}>
                  <FcGoogle size={18} />
                </span>
              )}
              {provider === 'facebook' && (
                <span title="Đăng nhập qua Facebook" style={{ display: 'inline-flex', alignItems: 'center' }}>
                  <FaFacebook size={18} color="#1877f2" />
                </span>
              )}
            </div>
            <p className={styles.subtitle}>Chi tiết nhân khẩu học CRM, số lượng sản phẩm đã mua và lịch sử giao dịch</p>
          </div>
        </div>

        {/* Action Button: Lock / Unlock */}
        <button
          type="button"
          onClick={() => setIsLockModalOpen(true)}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 8,
            padding: '9px 16px',
            borderRadius: 8,
            fontWeight: 700,
            fontSize: 13.5,
            cursor: 'pointer',
            border: isLocked ? '1px solid #10b981' : '1px solid #ef4444',
            background: isLocked ? 'rgba(16, 185, 129, 0.15)' : 'rgba(239, 68, 68, 0.15)',
            color: isLocked ? '#10b981' : '#ef4444',
          }}
        >
          {isLocked ? <FiUnlock size={16} /> : <FiLock size={16} />}
          <span>{isLocked ? 'Mở Khóa Tài Khoản' : 'Khóa Tài Khoản'}</span>
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(280px, 1fr) 2fr', gap: 20, alignItems: 'start' }}>
        {/* Left Column: Customer Profile Card */}
        <div className={styles.card} style={{ padding: 24 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 20 }}>
            <div
              style={{
                width: 64,
                height: 64,
                borderRadius: '50%',
                background: isLocked ? '#ef4444' : 'var(--primary, #3b82f6)',
                color: 'var(--primary-text, #fff)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 26,
                fontWeight: 800,
                overflow: 'hidden',
                flexShrink: 0,
              }}
            >
              {customer.avatar ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={customer.avatar} alt={customer.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              ) : (
                customer.name?.charAt(0)?.toUpperCase()
              )}
            </div>
            <div>
              <h2 style={{ fontSize: '1.25rem', color: 'var(--text-main, #fff)', margin: '0 0 4px 0' }}>
                {customer.name}
              </h2>
              <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
                <span className={isVip ? styles.tagVip : styles.tagMember}>
                  {isVip ? '★ VIP Member' : 'Thành viên'}
                </span>
                {isLocked ? (
                  <span style={{ background: 'rgba(239, 68, 68, 0.15)', color: '#ef4444', border: '1px solid rgba(239, 68, 68, 0.3)', padding: '2px 8px', borderRadius: 9999, fontSize: 11, fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: 3 }}>
                    <FiLock size={10} /> Đã khóa
                  </span>
                ) : (
                  <span style={{ background: 'rgba(16, 185, 129, 0.15)', color: '#10b981', padding: '2px 8px', borderRadius: 9999, fontSize: 11, fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: 3 }}>
                    <FiCheck size={10} /> Hoạt động
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Locked Reason Callout if Locked */}
          {isLocked && customer.lockReason && (
            <div style={{ background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.3)', borderRadius: 10, padding: '10px 12px', fontSize: 12.5, color: '#ef4444', marginBottom: 16 }}>
              <strong>Lý do khóa:</strong> {customer.lockReason}
            </div>
          )}

          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: 14,
              borderTop: '1px solid var(--border-color, #232838)',
              paddingTop: 18,
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, color: 'var(--text-main, #fff)', fontSize: '0.875rem' }}>
              <FiPhone style={{ color: 'var(--primary, #3b82f6)', fontSize: '1rem' }} />
              <strong>{customer.phone || 'Chưa cập nhật SĐT'}</strong>
            </div>

            {customer.email && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, color: 'var(--text-main, #fff)', fontSize: '0.875rem' }}>
                <FiMail style={{ color: 'var(--primary, #3b82f6)', fontSize: '1rem' }} />
                <span>{customer.email}</span>
              </div>
            )}

            <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12, color: 'var(--text-muted, #94a3b8)', fontSize: '0.875rem', lineHeight: 1.4 }}>
              <FiMapPin style={{ color: 'var(--primary, #3b82f6)', fontSize: '1rem', marginTop: 2 }} />
              <span>{customer.address || 'Chưa có thông tin địa chỉ'}</span>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 12, color: 'var(--text-dim, #64748b)', fontSize: '0.8125rem' }}>
              <FiCalendar style={{ color: 'var(--text-dim, #64748b)', fontSize: '0.9rem' }} />
              <span>Tham gia: {customer.createdAt ? formatDate(customer.createdAt) : '-'}</span>
            </div>

            {customer.lastLoginAt && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, color: 'var(--text-dim, #64748b)', fontSize: '0.8125rem' }}>
                <FiClock style={{ color: 'var(--text-dim, #64748b)', fontSize: '0.9rem' }} />
                <span>Đăng nhập gần nhất: {formatDate(customer.lastLoginAt)}</span>
              </div>
            )}
          </div>

          {/* CRM Quick Stats Card */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: 12,
              marginTop: 22,
              paddingTop: 18,
              borderTop: '1px solid var(--border-color, #232838)',
            }}
          >
            <div style={{ background: 'var(--bg-main, #090a0f)', padding: 14, borderRadius: 10, textAlign: 'center', border: '1px solid var(--border-color, #232838)' }}>
              <div style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-main, #fff)' }}>
                {customer.orderCount || orders.length || 0}
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted, #94a3b8)', marginTop: 2 }}>Tổng đơn hàng</div>
            </div>

            <div style={{ background: 'rgba(16, 185, 129, 0.08)', padding: 14, borderRadius: 10, textAlign: 'center', border: '1px solid rgba(16, 185, 129, 0.2)' }}>
              <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#10b981' }}>
                {customer.totalItemsBought || 0}
              </div>
              <div style={{ fontSize: '0.75rem', color: '#10b981', marginTop: 2 }}>📦 Món đã mua</div>
            </div>

            <div style={{ gridColumn: '1 / -1', background: 'var(--bg-main, #090a0f)', padding: 14, borderRadius: 10, textAlign: 'center', border: '1px solid var(--border-color, #232838)' }}>
              <div style={{ fontSize: '1.35rem', fontWeight: 800, color: 'var(--primary, #3b82f6)' }}>
                {formatPrice(customer.totalSpent || 0)}
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted, #94a3b8)', marginTop: 2 }}>Tổng doanh thu tích lũy</div>
            </div>
          </div>
        </div>

        {/* Right Column: Tab View (Purchased Products vs Orders) */}
        <div className={styles.card}>
          {/* Tab Navigation */}
          <div style={{ display: 'flex', borderBottom: '1px solid var(--border-color, #232838)', padding: '0 16px', background: 'var(--bg-main, #090a0f)' }}>
            <button
              type="button"
              onClick={() => setActiveTab('products')}
              style={{
                padding: '14px 20px',
                fontWeight: 700,
                fontSize: 14,
                cursor: 'pointer',
                background: 'none',
                border: 'none',
                borderBottom: activeTab === 'products' ? '2px solid var(--primary, #3b82f6)' : '2px solid transparent',
                color: activeTab === 'products' ? 'var(--primary, #3b82f6)' : 'var(--text-muted, #94a3b8)',
                display: 'flex',
                alignItems: 'center',
                gap: 8,
              }}
            >
              <FiPackage size={16} />
              <span>Sản Phẩm Đã Mua ({purchasedProducts.length})</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('orders')}
              style={{
                padding: '14px 20px',
                fontWeight: 700,
                fontSize: 14,
                cursor: 'pointer',
                background: 'none',
                border: 'none',
                borderBottom: activeTab === 'orders' ? '2px solid var(--primary, #3b82f6)' : '2px solid transparent',
                color: activeTab === 'orders' ? 'var(--primary, #3b82f6)' : 'var(--text-muted, #94a3b8)',
                display: 'flex',
                alignItems: 'center',
                gap: 8,
              }}
            >
              <FiShoppingBag size={16} />
              <span>Lịch Sử Đơn Hàng ({orders.length})</span>
            </button>
          </div>

          {/* Content: Purchased Products Tab */}
          {activeTab === 'products' && (
            <div style={{ padding: 16 }}>
              {purchasedProducts.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '40px 20px', color: 'var(--text-muted, #94a3b8)' }}>
                  <FiPackage size={36} style={{ marginBottom: 10, opacity: 0.5 }} />
                  <p>Khách hàng này chưa mua sản phẩm nào.</p>
                </div>
              ) : (
                <div className={styles.tableResponsive}>
                  <table className={styles.table}>
                    <thead>
                      <tr>
                        <th>Sản phẩm</th>
                        <th>Phân loại / Biến thể</th>
                        <th>Tổng số lượng</th>
                        <th>Đơn giá</th>
                        <th>Mua gần nhất</th>
                      </tr>
                    </thead>
                    <tbody>
                      {purchasedProducts.map((prod: any, idx: number) => (
                        <tr key={idx}>
                          <td>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                              {/* eslint-disable-next-line @next/next/no-img-element */}
                              <img
                                src={prod.image || 'https://images.unsplash.com/photo-1581655353564-df123a1eb820?w=100'}
                                alt={prod.name}
                                style={{ width: 44, height: 44, borderRadius: 8, objectFit: 'cover', flexShrink: 0 }}
                              />
                              <div>
                                <strong style={{ color: 'var(--text-main, #fff)', fontSize: 13.5 }}>{prod.name}</strong>
                                <div style={{ fontSize: 11.5, color: 'var(--text-muted, #94a3b8)' }}>
                                  Đã mua trong {prod.ordersCount || 1} đơn hàng
                                </div>
                              </div>
                            </div>
                          </td>
                          <td style={{ fontSize: 12.5, color: 'var(--text-muted, #94a3b8)' }}>
                            {prod.variants && prod.variants.length > 0 ? (
                              prod.variants.map((v: any, vIdx: number) => (
                                <span key={vIdx} style={{ background: 'rgba(255,255,255,0.06)', padding: '2px 6px', borderRadius: 4, marginRight: 4, display: 'inline-block', marginBottom: 2 }}>
                                  {typeof v === 'object' ? Object.values(v).join(' - ') : String(v)}
                                </span>
                              ))
                            ) : (
                              'Mặc định'
                            )}
                          </td>
                          <td>
                            <span style={{ background: 'rgba(16, 185, 129, 0.15)', color: '#10b981', padding: '3px 9px', borderRadius: 6, fontWeight: 800, fontSize: 13 }}>
                              {prod.totalQuantity} món
                            </span>
                          </td>
                          <td style={{ fontWeight: 700, color: 'var(--primary, #3b82f6)' }}>
                            {formatPrice(prod.price || 0)}
                          </td>
                          <td style={{ fontSize: 12, color: 'var(--text-muted, #94a3b8)' }}>
                            {prod.lastPurchasedAt ? formatDate(prod.lastPurchasedAt) : '-'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* Content: Orders Tab */}
          {activeTab === 'orders' && (
            <div style={{ padding: 16 }}>
              {orders.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '40px 20px', color: 'var(--text-muted, #94a3b8)' }}>
                  <FiShoppingBag size={36} style={{ marginBottom: 10, opacity: 0.5 }} />
                  <p>Chưa có lịch sử đơn hàng nào.</p>
                </div>
              ) : (
                <div className={styles.tableResponsive}>
                  <table className={styles.table}>
                    <thead>
                      <tr>
                        <th>Mã đơn hàng</th>
                        <th>Ngày đặt</th>
                        <th>Số lượng món</th>
                        <th>Tổng thanh toán</th>
                        <th>Phương thức</th>
                        <th>Trạng thái</th>
                        <th style={{ textAlign: 'right' }}>Xem</th>
                      </tr>
                    </thead>
                    <tbody>
                      {orders.map((o: any) => {
                        const itemsCount = (o.items || []).reduce((acc: number, item: any) => acc + (item.quantity || 1), 0);
                        return (
                          <tr key={o._id}>
                            <td>
                              <strong style={{ color: 'var(--primary, #3b82f6)', fontFamily: 'monospace' }}>
                                #{o.orderCode}
                              </strong>
                            </td>
                            <td style={{ fontSize: 12.5, color: 'var(--text-muted, #94a3b8)' }}>
                              {o.createdAt ? formatDate(o.createdAt) : '-'}
                            </td>
                            <td>
                              <strong>{itemsCount}</strong> món
                            </td>
                            <td style={{ fontWeight: 700, color: 'var(--text-main, #fff)' }}>
                              {formatPrice(o.totalAmount || 0)}
                            </td>
                            <td style={{ fontSize: 12, textTransform: 'uppercase' }}>
                              {o.paymentMethod || 'COD'}
                            </td>
                            <td>
                              <span style={{
                                padding: '3px 8px',
                                borderRadius: 6,
                                fontSize: 11.5,
                                fontWeight: 700,
                                background: o.status === 'delivered' ? 'rgba(16, 185, 129, 0.15)' : o.status === 'cancelled' ? 'rgba(239, 68, 68, 0.15)' : 'rgba(59, 130, 246, 0.15)',
                                color: o.status === 'delivered' ? '#10b981' : o.status === 'cancelled' ? '#ef4444' : '#3b82f6',
                              }}>
                                {o.status === 'delivered' ? 'Đã giao' : o.status === 'cancelled' ? 'Đã hủy' : o.status === 'shipping' ? 'Đang giao' : 'Chờ xử lý'}
                              </span>
                            </td>
                            <td style={{ textAlign: 'right' }}>
                              <Link
                                href={`/admin/orders/${o._id}`}
                                className={styles.actionBtn}
                                title="Xem chi tiết đơn hàng"
                              >
                                <FiEye />
                              </Link>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Lock / Unlock Modal */}
      {isLockModalOpen && (
        <div className={styles.modalOverlay} onClick={() => setIsLockModalOpen(false)}>
          <div className={styles.modal} onClick={(e) => e.stopPropagation()} style={{ maxWidth: 440 }}>
            <div className={styles.modalHeader}>
              <h2 className={styles.modalTitle} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                {customer.isLocked ? <FiUnlock color="#10b981" /> : <FiLock color="#ef4444" />}
                <span>{customer.isLocked ? 'Mở Khóa Tài Khoản' : 'Khóa Tài Khoản Khách Hàng'}</span>
              </h2>
              <button
                type="button"
                className={styles.closeBtn}
                onClick={() => setIsLockModalOpen(false)}
              >
                <FiX />
              </button>
            </div>

            <div style={{ padding: '16px 20px' }}>
              <p style={{ fontSize: 13.5, color: 'var(--text-main, #fff)', lineHeight: 1.5, marginBottom: 14 }}>
                Bạn có chắc chắn muốn {customer.isLocked ? 'mở khóa' : 'khóa'} tài khoản của khách hàng <strong>"{customer.name}"</strong>?
              </p>

              {!customer.isLocked && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginBottom: 16 }}>
                  <label style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-muted, #94a3b8)' }}>
                    Lý do khóa tài khoản:
                  </label>
                  <textarea
                    rows={3}
                    className={styles.formInput}
                    placeholder="Ví dụ: Bom hàng nhiều lần, spam, vi phạm chính sách..."
                    value={lockReasonInput}
                    onChange={(e) => setLockReasonInput(e.target.value)}
                    style={{ resize: 'vertical' }}
                  />
                </div>
              )}

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
                <button
                  type="button"
                  className={styles.formBtnCancel}
                  onClick={() => setIsLockModalOpen(false)}
                  disabled={isLockSubmitting}
                >
                  Hủy bỏ
                </button>
                <button
                  type="button"
                  onClick={handleToggleLock}
                  disabled={isLockSubmitting}
                  style={{
                    padding: '9px 18px',
                    borderRadius: 8,
                    fontWeight: 700,
                    fontSize: 13.5,
                    border: 'none',
                    cursor: 'pointer',
                    background: customer.isLocked ? '#10b981' : '#ef4444',
                    color: '#fff',
                  }}
                >
                  {isLockSubmitting
                    ? 'Đang xử lý...'
                    : customer.isLocked
                    ? 'Xác Nhận Mở Khóa'
                    : 'Xác Nhận Khóa Tài Khoản'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
