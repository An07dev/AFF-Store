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
} from 'react-icons/fi';
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

  useEffect(() => {
    async function loadCustomer() {
      try {
        setLoading(true);
        const res = await apiFetch(`/api/customers/${id}`);
        const data = await res.json();
        if (data.success && data.data) {
          setCustomer(data.data);
        } else {
          toast.error('Không tìm thấy thông tin khách hàng');
        }
      } catch (e) {
        toast.error('Lỗi tải dữ liệu máy chủ');
      } finally {
        setLoading(false);
      }
    }
    if (id) loadCustomer();
  }, [id]);

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

  return (
    <div className={styles.page}>
      {/* Header */}
      <div className={styles.header}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <Link href="/admin/customers" className={styles.actionBtn} title="Quay lại">
            <FiArrowLeft style={{ fontSize: '1.125rem' }} />
          </Link>
          <div>
            <h1 className={styles.title}>Hồ Sơ: {customer.name}</h1>
            <p className={styles.subtitle}>Chi tiết nhân khẩu học CRM và toàn bộ lịch sử giao dịch mua sắm</p>
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(280px, 1fr) 2fr', gap: 20, alignItems: 'start' }}>
        {/* Customer Profile Card */}
        <div className={styles.card} style={{ padding: 24 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 20 }}>
            <div
              style={{
                width: 64,
                height: 64,
                borderRadius: '50%',
                background: 'var(--primary, #3b82f6)',
                color: 'var(--primary-text, #fff)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 26,
                fontWeight: 800,
              }}
            >
              {customer.name?.charAt(0)?.toUpperCase()}
            </div>
            <div>
              <h2 style={{ fontSize: '1.25rem', color: 'var(--text-main, #fff)', margin: '0 0 4px 0' }}>
                {customer.name}
              </h2>
              <span className={isVip ? styles.tagVip : styles.tagMember}>
                {isVip ? '★ VIP Member' : 'Thành viên'}
              </span>
            </div>
          </div>

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
              <strong>{customer.phone}</strong>
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
              <FiCalendar style={{ color: 'var(--primary, #3b82f6)', fontSize: '1rem' }} />
              <span>Ngày tham gia: {customer.createdAt ? formatDate(customer.createdAt) : '-'}</span>
            </div>
          </div>
        </div>

        {/* Stats Summary Cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16 }}>
          <div className={styles.statCard}>
            <div className={styles.statIcon}>
              <FiShoppingBag />
            </div>
            <div>
              <div className={styles.statValue}>{customer.orders?.length || customer.orderCount || 0}</div>
              <div className={styles.statLabel}>Tổng số đơn hàng đã đặt</div>
            </div>
          </div>

          <div className={styles.statCard}>
            <div className={styles.statIcon} style={{ color: 'var(--accent, #10b981)', background: 'rgba(16, 185, 129, 0.12)' }}>
              <FiDollarSign />
            </div>
            <div>
              <div className={styles.statValue} style={{ color: 'var(--primary, #3b82f6)' }}>
                {formatPrice(customer.totalSpent || 0)}
              </div>
              <div className={styles.statLabel}>Tổng tiền chi tiêu tích lũy</div>
            </div>
          </div>
        </div>
      </div>

      {/* Purchase History Table (API 6.2) */}
      <div className={styles.card}>
        <div style={{ padding: '18px 20px', borderBottom: '1px solid var(--border-color, #232838)' }}>
          <h3 style={{ margin: 0, fontSize: '1.125rem', color: 'var(--text-main, #fff)', fontWeight: 700 }}>
            Lịch Sử Đơn Hàng Mua Sắm ({customer.orders?.length || 0})
          </h3>
        </div>

        <div className={styles.tableResponsive}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Mã đơn hàng</th>
                <th>Số lượng món</th>
                <th>Tổng thanh toán</th>
                <th>Thanh toán</th>
                <th>Trạng thái giao</th>
                <th>Thời gian đặt</th>
                <th style={{ textAlign: 'right' }}>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {!customer.orders || customer.orders.length === 0 ? (
                <tr>
                  <td colSpan={7} style={{ textAlign: 'center', color: 'var(--text-muted, #9ca3af)', padding: 36 }}>
                    Khách hàng này chưa thực hiện đơn hàng nào
                  </td>
                </tr>
              ) : (
                customer.orders.map((o: any) => (
                  <tr key={o._id}>
                    <td>
                      <strong style={{ color: 'var(--primary, #3b82f6)' }}>#{o.orderCode}</strong>
                    </td>
                    <td>{o.items?.length || 0} sản phẩm</td>
                    <td style={{ color: 'var(--primary, #3b82f6)', fontWeight: 700 }}>
                      {formatPrice(o.totalAmount)}
                    </td>
                    <td>
                      <span
                        style={{
                          fontSize: '0.75rem',
                          fontWeight: 700,
                          color: o.paymentStatus === 'paid' ? '#10b981' : '#f59e0b',
                        }}
                      >
                        {o.paymentStatus === 'paid' ? '● Đã thanh toán' : '○ Chưa thanh toán'}
                      </span>
                    </td>
                    <td>
                      <span
                        style={{
                          fontSize: '0.75rem',
                          fontWeight: 700,
                          padding: '3px 8px',
                          borderRadius: 6,
                          background: 'rgba(59, 130, 246, 0.12)',
                          color: 'var(--primary, #3b82f6)',
                        }}
                      >
                        {o.status}
                      </span>
                    </td>
                    <td style={{ color: 'var(--text-muted, #9ca3af)', fontSize: '0.8125rem' }}>
                      {formatDate(o.createdAt)}
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <Link href={`/admin/orders/${o._id}`} className={styles.actionBtn} title="Xem chi tiết đơn">
                        <FiEye /> Xem đơn
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
