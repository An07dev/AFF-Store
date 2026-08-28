'use client';

import React, { useState, useEffect, useCallback } from 'react';
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
  FiClock,
  FiLock,
  FiUnlock,
  FiPackage,
  FiAlertTriangle,
  FiFilter,
} from 'react-icons/fi';
import { FcGoogle } from 'react-icons/fc';
import { FaFacebook } from 'react-icons/fa';
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
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'locked'>('all');
  const [providerFilter, setProviderFilter] = useState<'all' | 'google' | 'facebook' | 'local'>('all');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCustomers, setTotalCustomers] = useState(0);
  const [lockedCount, setLockedCount] = useState(0);
  const [isResetting, setIsResetting] = useState(false);

  // Modal State (Add / Edit Account)
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<any | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    provider: 'local',
    notes: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Lock / Unlock Modal State
  const [lockTarget, setLockTarget] = useState<{ id: string; name: string; isLocked: boolean; reason: string } | null>(null);
  const [lockReasonInput, setLockReasonInput] = useState('');
  const [isLockSubmitting, setIsLockSubmitting] = useState(false);

  // Delete State
  const [deleteTarget, setDeleteTarget] = useState<{ id: string; name: string } | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Fetch Customers (Only login-based accounts)
  const fetchCustomers = useCallback(async (overrides?: { page?: number; search?: string; status?: string; provider?: string }) => {
    const curPage = overrides?.page !== undefined ? overrides.page : page;
    const curSearch = overrides?.search !== undefined ? overrides.search : search;
    const curStatus = overrides?.status !== undefined ? overrides.status : statusFilter;
    const curProvider = overrides?.provider !== undefined ? overrides.provider : providerFilter;

    try {
      setLoading(true);
      let url = `/api/customers?page=${curPage}&limit=10`;
      if (curSearch) url += `&search=${encodeURIComponent(curSearch)}`;
      if (curStatus && curStatus !== 'all') url += `&status=${curStatus}`;
      if (curProvider && curProvider !== 'all') url += `&provider=${curProvider}`;

      const res = await apiFetch(url);
      const data = await res.json();
      if (data.success) {
        setCustomers(data.data || []);
        if (data.stats) {
          setTotalCustomers(data.stats.totalCustomers || 0);
          setLockedCount(data.stats.lockedCustomers || 0);
        }
        if (data.pagination) {
          setTotalPages(data.pagination.totalPages || 1);
        }
      }
    } catch (err) {
      toast.error('Lỗi tải danh sách tài khoản khách hàng');
    } finally {
      setLoading(false);
    }
  }, [page, search, statusFilter, providerFilter]);

  useEffect(() => {
    fetchCustomers();
  }, [fetchCustomers]);

  // Reset Filters
  const handleResetFilters = async () => {
    setIsResetting(true);
    setSearch('');
    setStatusFilter('all');
    setProviderFilter('all');
    setPage(1);

    await fetchCustomers({ page: 1, search: '', status: 'all', provider: 'all' });

    setIsResetting(false);
    toast.success('Đã làm mới danh sách tài khoản khách hàng!');
  };

  // Open Add Modal
  const handleOpenAdd = () => {
    setEditingCustomer(null);
    setFormData({
      name: '',
      phone: '',
      email: '',
      provider: 'local',
      notes: '',
    });
    setIsModalOpen(true);
  };

  // Open Edit Modal
  const handleOpenEdit = (c: any) => {
    setEditingCustomer(c);
    setFormData({
      name: c.name || '',
      phone: c.phone || '',
      email: c.email || '',
      provider: c.provider || 'local',
      notes: c.notes || '',
    });
    setIsModalOpen(true);
  };

  // Submit Form (Create / Update Account)
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      toast.error('Vui lòng nhập họ tên tài khoản');
      return;
    }
    if (!formData.email.trim() && !formData.phone.trim()) {
      toast.error('Vui lòng cung cấp Email hoặc Số điện thoại đăng nhập');
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
        toast.success(editingCustomer ? 'Cập nhật tài khoản thành công!' : 'Thêm tài khoản mới thành công!');
        setIsModalOpen(false);
        fetchCustomers();
      } else {
        toast.error(data.message || 'Lỗi xử lý tài khoản');
      }
    } catch (err) {
      toast.error('Lỗi kết nối máy chủ');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Open Lock / Unlock Modal
  const handleOpenLockModal = (c: any) => {
    setLockTarget({
      id: c._id,
      name: c.name,
      isLocked: Boolean(c.isLocked),
      reason: c.lockReason || '',
    });
    setLockReasonInput(c.lockReason || (c.isLocked ? '' : 'Vi phạm chính sách đặt hàng / spam'));
  };

  // Confirm Lock / Unlock
  const handleConfirmToggleLock = async () => {
    if (!lockTarget) return;
    setIsLockSubmitting(true);
    try {
      const res = await apiFetch(`/api/customers/${lockTarget.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          isLocked: !lockTarget.isLocked,
          lockReason: !lockTarget.isLocked ? lockReasonInput : '',
        }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success(!lockTarget.isLocked ? `Đã khóa tài khoản "${lockTarget.name}"!` : `Đã mở khóa tài khoản "${lockTarget.name}"!`);
        setLockTarget(null);
        fetchCustomers();
      } else {
        toast.error(data.message || 'Lỗi xử lý');
      }
    } catch (err) {
      toast.error('Lỗi kết nối máy chủ');
    } finally {
      setIsLockSubmitting(false);
    }
  };

  // Delete Customer Account
  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;
    setIsDeleting(true);
    try {
      const res = await apiFetch(`/api/customers/${deleteTarget.id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        toast.success(`Đã xóa tài khoản "${deleteTarget.name}" thành công!`);
        setDeleteTarget(null);
        fetchCustomers();
      } else {
        toast.error(data.message || 'Lỗi xóa tài khoản');
      }
    } catch (err) {
      toast.error('Lỗi kết nối máy chủ');
    } finally {
      setIsDeleting(false);
    }
  };

  // Compute CRM Stats
  const vipCount = customers.filter((c) => (c.totalSpent || 0) >= 2000000).length;
  const totalItemsSold = customers.reduce((sum, c) => sum + (c.totalItemsBought || 0), 0);

  return (
    <div className={styles.page}>
      {/* Header */}
      <div className={styles.header}>
        <div className={styles.titleArea}>
          <h1 className={styles.title}>Quản Lý Tài Khoản Khách Hàng (CRM)</h1>
          <p className={styles.subtitle}>
            Quản trị người dùng theo thông tin đăng nhập (Google, Facebook, Số điện thoại/Email), trạng thái khóa và lịch sử mua sắm
          </p>
        </div>

        <button className={styles.addBtn} onClick={handleOpenAdd}>
          <FiPlus /> Thêm tài khoản mới
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
            <div className={styles.statLabel}>Tổng tài khoản khách</div>
          </div>
        </div>

        <div className={styles.statCard}>
          <div className={styles.statIcon} style={{ color: '#10b981', background: 'rgba(16, 185, 129, 0.12)' }}>
            <FiPackage />
          </div>
          <div>
            <div className={styles.statValue}>{totalItemsSold}</div>
            <div className={styles.statLabel}>Sản phẩm đã mua (Trang hiện tại)</div>
          </div>
        </div>

        <div className={styles.statCard}>
          <div className={styles.statIcon} style={{ color: '#ef4444', background: 'rgba(239, 68, 68, 0.12)' }}>
            <FiLock />
          </div>
          <div>
            <div className={styles.statValue}>{lockedCount}</div>
            <div className={styles.statLabel}>Tài khoản bị khóa</div>
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
      </div>

      {/* Main Customers Table Card */}
      <div className={styles.card}>
        {/* Filters */}
        <div className={styles.filters}>
          <div className={styles.searchBox}>
            <FiSearch className={styles.searchIcon} />
            <input
              type="text"
              placeholder="Tìm theo tên tài khoản, email Google/FB, số điện thoại..."
              className={styles.searchInput}
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
            />
          </div>

          {/* Status Filter */}
          <div style={{ display: 'flex', gap: 6 }}>
            <button
              type="button"
              className={`${styles.filterBtn || styles.btnReset} ${statusFilter === 'all' ? styles.filterActive : ''}`}
              style={statusFilter === 'all' ? { background: 'var(--primary, #3b82f6)', color: '#fff' } : {}}
              onClick={() => {
                setStatusFilter('all');
                setPage(1);
              }}
            >
              Tất cả
            </button>
            <button
              type="button"
              className={`${styles.filterBtn || styles.btnReset} ${statusFilter === 'active' ? styles.filterActive : ''}`}
              style={statusFilter === 'active' ? { background: 'rgba(16, 185, 129, 0.2)', color: '#10b981', borderColor: '#10b981' } : {}}
              onClick={() => {
                setStatusFilter('active');
                setPage(1);
              }}
            >
              🟢 Hoạt động
            </button>
            <button
              type="button"
              className={`${styles.filterBtn || styles.btnReset} ${statusFilter === 'locked' ? styles.filterActive : ''}`}
              style={statusFilter === 'locked' ? { background: 'rgba(239, 68, 68, 0.2)', color: '#ef4444', borderColor: '#ef4444' } : {}}
              onClick={() => {
                setStatusFilter('locked');
                setPage(1);
              }}
            >
              🔴 Đã khóa
            </button>
          </div>

          {/* Provider Filter */}
          <select
            value={providerFilter}
            onChange={(e) => {
              setProviderFilter(e.target.value as any);
              setPage(1);
            }}
            className={styles.searchInput}
            style={{ width: 'auto', padding: '9px 12px' }}
          >
            <option value="all">Tất cả nguồn đăng nhập</option>
            <option value="google">🌐 Google Account</option>
            <option value="facebook">🔵 Facebook Account</option>
            <option value="local">📱 Email / SĐT Web</option>
          </select>

          <button
            type="button"
            className={styles.btnReset}
            onClick={handleResetFilters}
            disabled={isResetting}
            title="Đặt lại bộ lọc & Tải lại"
          >
            <FiRotateCcw className={isResetting ? styles.spinning : ''} />
            <span>{isResetting ? 'Đang làm mới...' : 'Đặt lại'}</span>
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
                  <th>Tài khoản & Nguồn</th>
                  <th>Email đăng nhập</th>
                  <th>Số điện thoại</th>
                  <th>Đăng nhập gần nhất</th>
                  <th>Số đơn</th>
                  <th style={{ color: '#10b981' }}>📦 Số SP đã mua</th>
                  <th>Tổng chi tiêu</th>
                  <th>Trạng thái</th>
                  <th style={{ textAlign: 'right' }}>Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {customers.length === 0 ? (
                  <tr>
                    <td colSpan={9} style={{ textAlign: 'center', color: 'var(--text-muted, #9ca3af)', padding: 40 }}>
                      Không tìm thấy tài khoản khách hàng nào phù hợp
                    </td>
                  </tr>
                ) : (
                  customers.map((c) => {
                    const isLocked = Boolean(c.isLocked);
                    const provider = c.provider || 'local';

                    return (
                      <tr key={c._id} style={isLocked ? { opacity: 0.75, background: 'rgba(239, 68, 68, 0.04)' } : {}}>
                        <td>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                            <div className={styles.customerAvatar} style={isLocked ? { border: '2px solid #ef4444' } : {}}>
                              {c.avatar ? (
                                // eslint-disable-next-line @next/next/no-img-element
                                <img src={c.avatar} alt={c.name} style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }} />
                              ) : (
                                c.name?.charAt(0)?.toUpperCase() || 'U'
                              )}
                            </div>
                            <div>
                              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                                <span className={styles.customerName}>{c.name}</span>
                                {provider === 'google' && (
                                  <span title="Đăng nhập qua Google" style={{ display: 'inline-flex', alignItems: 'center' }}>
                                    <FcGoogle size={14} />
                                  </span>
                                )}
                                {provider === 'facebook' && (
                                  <span title="Đăng nhập qua Facebook" style={{ display: 'inline-flex', alignItems: 'center' }}>
                                    <FaFacebook size={13} color="#1877f2" />
                                  </span>
                                )}
                              </div>
                              <div className={styles.textMuted}>
                                Đăng ký: {c.createdAt ? formatDate(c.createdAt) : '-'}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td>
                          {c.email ? (
                            <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'var(--text-main, #ffffff)', fontSize: '0.85rem' }}>
                              <FiMail style={{ color: 'var(--primary, #3b82f6)', flexShrink: 0 }} />
                              <span>{c.email}</span>
                            </div>
                          ) : (
                            <span style={{ color: 'var(--text-dim, #64748b)' }}>-</span>
                          )}
                        </td>
                        <td>
                          {c.phone ? (
                            <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'var(--text-main, #ffffff)', fontSize: '0.85rem' }}>
                              <FiPhone style={{ color: '#10b981', flexShrink: 0 }} />
                              <strong>{c.phone}</strong>
                            </div>
                          ) : (
                            <span style={{ color: 'var(--text-dim, #64748b)' }}>-</span>
                          )}
                        </td>
                        <td style={{ fontSize: '0.8125rem', color: 'var(--text-muted, #94a3b8)' }}>
                          {c.lastLoginAt ? (
                            <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                              <FiClock size={12} color="#10b981" />
                              <span>{formatDate(c.lastLoginAt)}</span>
                            </div>
                          ) : c.lastOrderAt ? (
                            <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                              <FiClock size={12} color="#f59e0b" />
                              <span>{formatDate(c.lastOrderAt)}</span>
                            </div>
                          ) : (
                            'Chưa hoạt động'
                          )}
                        </td>
                        <td>
                          <strong style={{ color: 'var(--text-main, #ffffff)' }}>{c.orderCount || 0}</strong> đơn
                        </td>
                        <td>
                          <span style={{
                            background: 'rgba(16, 185, 129, 0.12)',
                            color: '#10b981',
                            padding: '4px 10px',
                            borderRadius: 8,
                            fontWeight: 800,
                            fontSize: 13,
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: 5,
                          }}>
                            <FiPackage size={13} />
                            <strong>{c.totalItemsBought || 0}</strong> món
                          </span>
                        </td>
                        <td className={styles.bold} style={{ color: 'var(--primary, #3b82f6)' }}>
                          {formatPrice(c.totalSpent || 0)}
                        </td>
                        <td>
                          {isLocked ? (
                            <span
                              style={{
                                background: 'rgba(239, 68, 68, 0.15)',
                                color: '#ef4444',
                                border: '1px solid rgba(239, 68, 68, 0.3)',
                                padding: '3px 9px',
                                borderRadius: 9999,
                                fontSize: 11.5,
                                fontWeight: 800,
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: 4,
                              }}
                              title={c.lockReason ? `Lý do: ${c.lockReason}` : 'Tài khoản đã bị khóa'}
                            >
                              <FiLock size={12} /> Đã khóa
                            </span>
                          ) : (
                            <span
                              style={{
                                background: 'rgba(16, 185, 129, 0.15)',
                                color: '#10b981',
                                padding: '3px 9px',
                                borderRadius: 9999,
                                fontSize: 11.5,
                                fontWeight: 700,
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: 4,
                              }}
                            >
                              <FiCheck size={12} /> Hoạt động
                            </span>
                          )}
                        </td>
                        <td>
                          <div className={styles.actions}>
                            {/* View Profile */}
                            <Link
                              href={`/admin/customers/${c._id}`}
                              className={styles.actionBtn}
                              title="Xem hồ sơ & Lịch sử sản phẩm đã mua"
                            >
                              <FiEye />
                            </Link>

                            {/* Lock / Unlock Toggle Button */}
                            <button
                              type="button"
                              className={`${styles.actionBtn} ${isLocked ? styles.dangerBtn : ''}`}
                              onClick={() => handleOpenLockModal(c)}
                              title={isLocked ? 'Mở khóa tài khoản' : 'Khóa tài khoản này'}
                              style={isLocked ? { color: '#10b981' } : { color: '#f59e0b' }}
                            >
                              {isLocked ? <FiUnlock /> : <FiLock />}
                            </button>

                            {/* Edit */}
                            <button
                              type="button"
                              className={styles.actionBtn}
                              onClick={() => handleOpenEdit(c)}
                              title="Chỉnh sửa thông tin tài khoản"
                            >
                              <FiEdit2 />
                            </button>

                            {/* Delete */}
                            <button
                              type="button"
                              className={`${styles.actionBtn} ${styles.dangerBtn}`}
                              onClick={() => setDeleteTarget({ id: c._id, name: c.name })}
                              title="Xóa tài khoản"
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

        {/* Pagination */}
        {totalPages > 1 && (
          <div className={styles.pagination}>
            <button
              disabled={page <= 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              className={styles.pageBtn}
            >
              Trang trước
            </button>
            <span className={styles.pageInfo}>
              Trang {page} / {totalPages}
            </span>
            <button
              disabled={page >= totalPages}
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              className={styles.pageBtn}
            >
              Trang sau
            </button>
          </div>
        )}
      </div>

      {/* Lock / Unlock Confirmation Modal */}
      {lockTarget && (
        <div className={styles.modalOverlay} onClick={() => setLockTarget(null)}>
          <div className={styles.modal} onClick={(e) => e.stopPropagation()} style={{ maxWidth: 440 }}>
            <div className={styles.modalHeader}>
              <h2 className={styles.modalTitle} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                {lockTarget.isLocked ? <FiUnlock color="#10b981" /> : <FiLock color="#ef4444" />}
                <span>{lockTarget.isLocked ? 'Mở Khóa Tài Khoản' : 'Khóa Tài Khoản Khách Hàng'}</span>
              </h2>
              <button
                type="button"
                className={styles.closeBtn}
                onClick={() => setLockTarget(null)}
              >
                <FiX />
              </button>
            </div>

            <div style={{ padding: '16px 20px' }}>
              <p style={{ fontSize: 13.5, color: 'var(--text-main, #fff)', lineHeight: 1.5, marginBottom: 14 }}>
                Bạn có chắc chắn muốn {lockTarget.isLocked ? 'mở khóa' : 'khóa'} tài khoản của khách hàng <strong>"{lockTarget.name}"</strong>?
              </p>

              {!lockTarget.isLocked && (
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

              {lockTarget.isLocked && lockTarget.reason && (
                <div style={{ background: 'rgba(239, 68, 68, 0.1)', padding: 10, borderRadius: 8, fontSize: 12.5, color: '#ef4444', marginBottom: 14 }}>
                  Lý do đã khóa trước đó: <em>"{lockTarget.reason}"</em>
                </div>
              )}

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
                <button
                  type="button"
                  className={styles.formBtnCancel}
                  onClick={() => setLockTarget(null)}
                  disabled={isLockSubmitting}
                >
                  Hủy bỏ
                </button>
                <button
                  type="button"
                  onClick={handleConfirmToggleLock}
                  disabled={isLockSubmitting}
                  style={{
                    padding: '9px 18px',
                    borderRadius: 8,
                    fontWeight: 700,
                    fontSize: 13.5,
                    border: 'none',
                    cursor: 'pointer',
                    background: lockTarget.isLocked ? '#10b981' : '#ef4444',
                    color: '#fff',
                  }}
                >
                  {isLockSubmitting
                    ? 'Đang xử lý...'
                    : lockTarget.isLocked
                    ? 'Xác Nhận Mở Khóa'
                    : 'Xác Nhận Khóa Tài Khoản'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add / Edit Customer Login Account Modal */}
      {isModalOpen && (
        <div className={styles.modalOverlay} onClick={() => setIsModalOpen(false)}>
          <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h2 className={styles.modalTitle}>
                {editingCustomer ? 'Chỉnh Sửa Tài Khoản Khách Hàng' : 'Thêm Tài Khoản Mới'}
              </h2>
              <button
                type="button"
                className={styles.closeBtn}
                onClick={() => setIsModalOpen(false)}
              >
                <FiX />
              </button>
            </div>

            <form onSubmit={handleSubmit} className={styles.modalForm}>
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Họ và tên hiển thị *</label>
                <input
                  type="text"
                  required
                  placeholder="Ví dụ: Nguyễn Văn A"
                  className={styles.formInput}
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </div>

              <div className={styles.formRow}>
                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>Email đăng nhập</label>
                  <input
                    type="email"
                    placeholder="user@gmail.com"
                    className={styles.formInput}
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  />
                </div>

                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>Số điện thoại đăng nhập</label>
                  <input
                    type="tel"
                    placeholder="0988123456"
                    className={styles.formInput}
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  />
                </div>
              </div>

              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Nguồn đăng nhập / Nhà cung cấp</label>
                <select
                  className={styles.formInput}
                  value={formData.provider}
                  onChange={(e) => setFormData({ ...formData, provider: e.target.value })}
                >
                  <option value="local">📱 Tài khoản thông thường (Email / SĐT)</option>
                  <option value="google">🌐 Google Account</option>
                  <option value="facebook">🔵 Facebook Account</option>
                </select>
              </div>

              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Ghi chú nội bộ</label>
                <input
                  type="text"
                  placeholder="Ghi chú về khách hàng (tuỳ chọn)..."
                  className={styles.formInput}
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                />
              </div>

              <div className={styles.modalFooter}>
                <button
                  type="button"
                  className={styles.formBtnCancel}
                  onClick={() => setIsModalOpen(false)}
                  disabled={isSubmitting}
                >
                  Hủy bỏ
                </button>
                <button
                  type="submit"
                  className={styles.formBtnSubmit}
                  disabled={isSubmitting}
                >
                  {isSubmitting ? 'Đang lưu...' : editingCustomer ? 'Cập nhật' : 'Thêm mới'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <DeleteConfirmModal
        isOpen={Boolean(deleteTarget)}
        title="Xóa Tài Khoản"
        message={`Bạn có chắc chắn muốn xóa tài khoản "${deleteTarget?.name}"? Dữ liệu tài khoản sẽ bị gỡ bỏ.`}
        isDeleting={isDeleting}
        onConfirm={handleConfirmDelete}
        onClose={() => setDeleteTarget(null)}
      />
    </div>
  );
}
