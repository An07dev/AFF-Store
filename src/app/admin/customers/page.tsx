'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  FiSearch,
  FiUser,
  FiEye,
  FiPlus,
  FiEdit2,
  FiTrash2,
  FiRotateCcw,
  FiUsers,
  FiAward,
  FiDollarSign,
  FiX,
  FiCheck,
  FiPhone,
  FiMail,
  FiMapPin,
} from 'react-icons/fi';
import toast from 'react-hot-toast';
import { formatPrice, formatDate } from '@/lib/utils';
import Skeleton from '@/components/common/Skeleton';
import DeleteConfirmModal from '@/components/admin/DeleteConfirmModal';
import { apiFetch } from '@/lib/api';
import styles from './page.module.css';

export default function CustomersPage() {
  const [customers, setCustomers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCustomers, setTotalCustomers] = useState(0);
  const [isResetting, setIsResetting] = useState(false);

  // Modal State (Add / Edit)
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<any | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    address: '',
    province: '',
    district: '',
    ward: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Delete State
  const [deleteTarget, setDeleteTarget] = useState<{ id: string; name: string } | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Fetch Customers (API 6.1)
  const fetchCustomers = async (overrides?: { page?: number; search?: string }) => {
    const curPage = overrides?.page !== undefined ? overrides.page : page;
    const curSearch = overrides?.search !== undefined ? overrides.search : search;

    try {
      setLoading(true);
      let url = `/api/customers?page=${curPage}&limit=10`;
      if (curSearch) url += `&search=${encodeURIComponent(curSearch)}`;

      const res = await apiFetch(url);
      const data = await res.json();
      if (data.success) {
        setCustomers(data.data || []);
        if (data.pagination) {
          setTotalPages(data.pagination.totalPages || 1);
          setTotalCustomers(data.pagination.total || 0);
        }
      }
    } catch (err) {
      toast.error('Lỗi tải danh sách khách hàng');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, [page, search]);

  // Reset Filters
  const handleResetFilters = async () => {
    setIsResetting(true);
    setSearch('');
    setPage(1);

    await fetchCustomers({ page: 1, search: '' });

    setIsResetting(false);
    toast.success('Đã làm mới danh sách khách hàng!');
  };

  // Open Add Modal (API 6.3 POST)
  const handleOpenAdd = () => {
    setEditingCustomer(null);
    setFormData({
      name: '',
      phone: '',
      email: '',
      address: '',
      province: '',
      district: '',
      ward: '',
    });
    setIsModalOpen(true);
  };

  // Open Edit Modal (API 6.3 PUT)
  const handleOpenEdit = (c: any) => {
    setEditingCustomer(c);
    setFormData({
      name: c.name || '',
      phone: c.phone || '',
      email: c.email || '',
      address: c.address || '',
      province: c.province || '',
      district: c.district || '',
      ward: c.ward || '',
    });
    setIsModalOpen(true);
  };

  // Submit Form (Create / Update)
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.phone.trim()) {
      toast.error('Vui lòng nhập họ tên và số điện thoại');
      return;
    }

    setIsSubmitting(true);
    try {
      const url = editingCustomer ? `/api/customers/${editingCustomer._id}` : '/api/customers';
      const method = editingCustomer ? 'PUT' : 'POST';

      const res = await apiFetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      const data = await res.json();
      if (data.success) {
        toast.success(editingCustomer ? 'Cập nhật khách hàng thành công!' : 'Thêm khách hàng mới thành công!');
        setIsModalOpen(false);
        fetchCustomers();
      } else {
        toast.error(data.message || 'Lỗi xử lý khách hàng');
      }
    } catch (err) {
      toast.error('Lỗi kết nối máy chủ');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Delete Customer (API 6.3 DELETE)
  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;
    setIsDeleting(true);
    try {
      const res = await apiFetch(`/api/customers/${deleteTarget.id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        toast.success(`Đã xóa khách hàng "${deleteTarget.name}" thành công!`);
        setDeleteTarget(null);
        fetchCustomers();
      } else {
        toast.error(data.message || 'Lỗi xóa khách hàng');
      }
    } catch (err) {
      toast.error('Lỗi kết nối máy chủ');
    } finally {
      setIsDeleting(false);
    }
  };

  // Compute CRM Stats
  const vipCount = customers.filter((c) => (c.totalSpent || 0) >= 2000000).length;
  const totalRevenue = customers.reduce((sum, c) => sum + (c.totalSpent || 0), 0);

  return (
    <div className={styles.page}>
      {/* Header */}
      <div className={styles.header}>
        <div className={styles.titleArea}>
          <h1 className={styles.title}>Quản Lý Khách Hàng (CRM)</h1>
          <p className={styles.subtitle}>
            Kiểm soát thông tin người mua, theo dõi chi tiêu và lịch sử đơn hàng
          </p>
        </div>

        <button className={styles.addBtn} onClick={handleOpenAdd}>
          <FiPlus /> Thêm khách hàng mới
        </button>
      </div>

      {/* Stats Row */}
      <div className={styles.statsRow}>
        <div className={styles.statCard}>
          <div className={styles.statIcon}>
            <FiUsers />
          </div>
          <div>
            <div className={styles.statValue}>{totalCustomers}</div>
            <div className={styles.statLabel}>Tổng số khách hàng</div>
          </div>
        </div>

        <div className={styles.statCard}>
          <div className={styles.statIcon} style={{ color: '#f59e0b', background: 'rgba(245, 158, 11, 0.12)' }}>
            <FiAward />
          </div>
          <div>
            <div className={styles.statValue}>{vipCount}</div>
            <div className={styles.statLabel}>Khách hàng VIP (≥ 2tr)</div>
          </div>
        </div>

        <div className={styles.statCard}>
          <div className={styles.statIcon} style={{ color: 'var(--accent, #10b981)', background: 'rgba(16, 185, 129, 0.12)' }}>
            <FiDollarSign />
          </div>
          <div>
            <div className={styles.statValue}>{formatPrice(totalRevenue)}</div>
            <div className={styles.statLabel}>Doanh thu từ khách hàng</div>
          </div>
        </div>
      </div>

      {/* Main Customers Table Card */}
      <div className={styles.card}>
        <div className={styles.filters}>
          <div className={styles.searchBox}>
            <FiSearch className={styles.searchIcon} />
            <input
              type="text"
              placeholder="Tìm theo tên khách, số điện thoại, email..."
              className={styles.searchInput}
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
            />
          </div>

          <button
            type="button"
            className={styles.btnReset}
            onClick={handleResetFilters}
            disabled={isResetting}
            title="Đặt lại bộ lọc & Tải lại"
          >
            <FiRotateCcw className={isResetting ? styles.spinning : ''} />
            <span>{isResetting ? 'Đang làm mới...' : 'Đặt lại bộ lọc'}</span>
          </button>
        </div>

        {/* Customers Table with Skeleton */}
        {loading ? (
          <div style={{ padding: 16 }}>
            <Skeleton type="table-row" count={6} />
          </div>
        ) : (
          <div className={styles.tableResponsive}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Khách hàng</th>
                  <th>Liên hệ</th>
                  <th>Địa chỉ nhận hàng</th>
                  <th>Số đơn hàng</th>
                  <th>Tổng chi tiêu</th>
                  <th>Hạng CRM</th>
                  <th style={{ textAlign: 'right' }}>Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {customers.length === 0 ? (
                  <tr>
                    <td colSpan={7} style={{ textAlign: 'center', color: 'var(--text-muted, #9ca3af)', padding: 40 }}>
                      Không tìm thấy khách hàng nào phù hợp
                    </td>
                  </tr>
                ) : (
                  customers.map((c) => {
                    const isVip = (c.totalSpent || 0) >= 2000000;
                    return (
                      <tr key={c._id}>
                        <td>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                            <div className={styles.customerAvatar}>
                              {c.name?.charAt(0)?.toUpperCase() || 'U'}
                            </div>
                            <div>
                              <div className={styles.customerName}>{c.name}</div>
                              <div className={styles.textMuted}>
                                Tham gia: {c.createdAt ? formatDate(c.createdAt) : '-'}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td>
                          <strong style={{ color: 'var(--text-main, #ffffff)' }}>{c.phone}</strong>
                          {c.email && <div className={styles.textMuted}>{c.email}</div>}
                        </td>
                        <td style={{ maxWidth: 220, color: 'var(--text-muted, #94a3b8)', fontSize: '0.8125rem' }}>
                          {c.address || '-'}
                        </td>
                        <td>
                          <strong style={{ color: 'var(--text-main, #ffffff)' }}>{c.orderCount || 0}</strong> đơn
                        </td>
                        <td className={styles.bold} style={{ color: 'var(--primary, #3b82f6)' }}>
                          {formatPrice(c.totalSpent || 0)}
                        </td>
                        <td>
                          <span className={isVip ? styles.tagVip : styles.tagMember}>
                            {isVip ? '★ VIP Member' : 'Thành viên'}
                          </span>
                        </td>
                        <td>
                          <div className={styles.actions}>
                            <Link
                              href={`/admin/customers/${c._id}`}
                              className={styles.actionBtn}
                              title="Xem hồ sơ & Lịch sử mua hàng"
                            >
                              <FiEye />
                            </Link>

                            <button
                              type="button"
                              className={styles.actionBtn}
                              onClick={() => handleOpenEdit(c)}
                              title="Chỉnh sửa thông tin"
                            >
                              <FiEdit2 />
                            </button>

                            <button
                              type="button"
                              className={`${styles.actionBtn} ${styles.dangerBtn}`}
                              onClick={() => setDeleteTarget({ id: c._id, name: c.name })}
                              title="Xóa khách hàng"
                            >
                              <FiTrash2 />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination Bar */}
        {totalPages > 1 && (
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 20px', borderTop: '1px solid var(--border-color, #232838)', flexWrap: 'wrap', gap: 12 }}>
            <span style={{ fontSize: '0.875rem', color: 'var(--text-muted, #9ca3af)' }}>
              Trang <strong>{page}</strong> / <strong>{totalPages}</strong> (Hiển thị {customers.length} trên tổng số {totalCustomers} khách hàng)
            </span>
            <div style={{ display: 'flex', gap: 8 }}>
              <button
                disabled={page <= 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                style={{
                  padding: '6px 14px',
                  borderRadius: 'var(--radius-sm, 6px)',
                  background: 'var(--bg-main, #090a0f)',
                  color: 'var(--text-main, #fff)',
                  border: '1px solid var(--border-color, #232838)',
                  cursor: page <= 1 ? 'not-allowed' : 'pointer',
                  opacity: page <= 1 ? 0.4 : 1,
                  fontWeight: 600,
                }}
              >
                ← Trước
              </button>

              {Array.from({ length: totalPages }, (_, i) => i + 1).map((pNum) => (
                <button
                  key={pNum}
                  onClick={() => setPage(pNum)}
                  style={{
                    padding: '6px 12px',
                    borderRadius: 'var(--radius-sm, 6px)',
                    background: page === pNum ? 'var(--primary, #3b82f6)' : 'var(--bg-main, #090a0f)',
                    color: page === pNum ? 'var(--primary-text, #fff)' : 'var(--text-main, #fff)',
                    border: '1px solid var(--border-color, #232838)',
                    fontWeight: 700,
                    cursor: 'pointer',
                  }}
                >
                  {pNum}
                </button>
              ))}

              <button
                disabled={page >= totalPages}
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                style={{
                  padding: '6px 14px',
                  borderRadius: 'var(--radius-sm, 6px)',
                  background: 'var(--bg-main, #090a0f)',
                  color: 'var(--text-main, #fff)',
                  border: '1px solid var(--border-color, #232838)',
                  cursor: page >= totalPages ? 'not-allowed' : 'pointer',
                  opacity: page >= totalPages ? 0.4 : 1,
                  fontWeight: 600,
                }}
              >
                Sau →
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Modal Thêm / Chỉnh Sửa Khách Hàng (API 6.3) */}
      {isModalOpen && (
        <div className={styles.modalOverlay} onClick={() => setIsModalOpen(false)}>
          <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h3 className={styles.modalTitle}>
                {editingCustomer ? 'Chỉnh Sửa Thông Tin Khách Hàng' : 'Thêm Khách Hàng Mới'}
              </h3>
              <button className={styles.closeBtn} onClick={() => setIsModalOpen(false)} title="Đóng">
                <FiX />
              </button>
            </div>

            <form onSubmit={handleSubmit}>
              <div className={styles.modalBody}>
                <div className={styles.formGroup}>
                  <label className={styles.label}>Họ và tên khách hàng *</label>
                  <input
                    type="text"
                    required
                    className={styles.input}
                    placeholder="VD: Nguyễn Văn An"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  />
                </div>

                <div className={styles.formGroup}>
                  <label className={styles.label}>Số điện thoại *</label>
                  <input
                    type="tel"
                    required
                    className={styles.input}
                    placeholder="VD: 0987123456"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  />
                </div>

                <div className={styles.formGroup}>
                  <label className={styles.label}>Địa chỉ Email</label>
                  <input
                    type="email"
                    className={styles.input}
                    placeholder="VD: nguyenvanan@gmail.com"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  />
                </div>

                <div className={styles.formGroup}>
                  <label className={styles.label}>Địa chỉ giao hàng</label>
                  <textarea
                    className={styles.textarea}
                    placeholder="VD: Số 15 Lê Văn Lương, Trung Hòa, Cầu Giấy, Hà Nội"
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  />
                </div>
              </div>

              <div className={styles.modalFooter}>
                <button
                  type="button"
                  className={styles.cancelBtn}
                  onClick={() => setIsModalOpen(false)}
                  disabled={isSubmitting}
                >
                  Hủy bỏ
                </button>
                <button type="submit" className={styles.saveBtn} disabled={isSubmitting}>
                  <FiCheck /> {isSubmitting ? 'Đang lưu...' : editingCustomer ? 'Lưu Cập Nhật' : 'Tạo Khách Hàng'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Xác Nhận Xóa Khách Hàng (API 6.3) */}
      <DeleteConfirmModal
        isOpen={!!deleteTarget}
        title="Xác Nhận Xóa Khách Hàng"
        message="Hành động này sẽ xóa hồ sơ khách hàng khỏi hệ thống CRM."
        itemTitle={deleteTarget?.name}
        isDeleting={isDeleting}
        onConfirm={handleConfirmDelete}
        onClose={() => setDeleteTarget(null)}
      />
    </div>
  );
}
