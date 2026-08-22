'use client';

import React, { useState, useEffect } from 'react';
import {
  FiGift,
  FiPlus,
  FiSearch,
  FiCheckCircle,
  FiClock,
  FiEdit2,
  FiTrash2,
  FiCopy,
  FiX,
  FiEye,
  FiAlertCircle,
} from 'react-icons/fi';
import toast from 'react-hot-toast';
import { apiFetch } from '@/lib/api';
import styles from './page.module.css';

interface IVoucher {
  _id: string;
  code: string;
  name: string;
  description?: string;
  discountType: 'fixed' | 'percent';
  discountValue: number;
  maxDiscountAmount: number;
  minOrderValue: number;
  totalUsageLimit: number;
  usedCount: number;
  limitPerCustomer: number;
  startDate: string;
  endDate: string;
  isActive: boolean;
  isPublic: boolean;
  applicableType: 'all' | 'category' | 'specific_products';
  createdAt: string;
}

export default function AdminVouchersPage() {
  const [vouchers, setVouchers] = useState<IVoucher[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive' | 'expired'>('all');
  const [stats, setStats] = useState({ total: 0, active: 0, totalUsed: 0 });

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingVoucher, setEditingVoucher] = useState<IVoucher | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    code: '',
    name: '',
    description: '',
    discountType: 'fixed' as 'fixed' | 'percent',
    discountValue: 20000,
    maxDiscountAmount: 0,
    minOrderValue: 100000,
    totalUsageLimit: 100,
    limitPerCustomer: 1,
    startDate: new Date().toISOString().split('T')[0],
    endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    isActive: true,
    isPublic: true,
    applicableType: 'all' as 'all' | 'category' | 'specific_products',
  });

  const fetchVouchers = async () => {
    try {
      setLoading(true);
      const res = await apiFetch(`/api/admin/vouchers?search=${encodeURIComponent(searchQuery)}&status=${statusFilter}`);
      const data = await res.json();
      if (data.success && Array.isArray(data.data)) {
        setVouchers(data.data);
        if (data.stats) setStats(data.stats);
      }
    } catch (e) {
      console.error('Error loading vouchers:', e);
      toast.error('Lỗi tải danh sách mã giảm giá');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVouchers();
  }, [statusFilter]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchVouchers();
  };

  const handleOpenCreateModal = () => {
    setEditingVoucher(null);
    setFormData({
      code: '',
      name: '',
      description: '',
      discountType: 'fixed',
      discountValue: 20000,
      maxDiscountAmount: 0,
      minOrderValue: 100000,
      totalUsageLimit: 100,
      limitPerCustomer: 1,
      startDate: new Date().toISOString().split('T')[0],
      endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      isActive: true,
      isPublic: true,
      applicableType: 'all',
    });
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (v: IVoucher) => {
    setEditingVoucher(v);
    setFormData({
      code: v.code,
      name: v.name,
      description: v.description || '',
      discountType: v.discountType,
      discountValue: v.discountValue,
      maxDiscountAmount: v.maxDiscountAmount || 0,
      minOrderValue: v.minOrderValue || 0,
      totalUsageLimit: v.totalUsageLimit || 0,
      limitPerCustomer: v.limitPerCustomer || 1,
      startDate: v.startDate ? new Date(v.startDate).toISOString().split('T')[0] : '',
      endDate: v.endDate ? new Date(v.endDate).toISOString().split('T')[0] : '',
      isActive: v.isActive,
      isPublic: v.isPublic,
      applicableType: v.applicableType || 'all',
    });
    setIsModalOpen(true);
  };

  const handleSaveVoucher = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.code.trim() || !formData.name.trim()) {
      toast.error('Vui lòng điền đầy đủ Mã Code và Tên Voucher!');
      return;
    }

    try {
      setSubmitting(true);
      const url = editingVoucher
        ? `/api/admin/vouchers/${editingVoucher._id}`
        : '/api/admin/vouchers';
      const method = editingVoucher ? 'PUT' : 'POST';

      const res = await apiFetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      const data = await res.json();

      if (data.success) {
        toast.success(editingVoucher ? 'Cập nhật Voucher thành công!' : 'Tạo mới Voucher thành công!');
        setIsModalOpen(false);
        fetchVouchers();
      } else {
        toast.error(data.message || 'Lỗi lưu voucher');
      }
    } catch (e: any) {
      toast.error(e.message || 'Lỗi xử lý yêu cầu');
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggleStatus = async (v: IVoucher) => {
    try {
      const res = await apiFetch(`/api/admin/vouchers/${v._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: !v.isActive }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success(v.isActive ? `Đã tạm khóa mã "${v.code}"` : `Đã kích hoạt mã "${v.code}"`);
        setVouchers((prev) =>
          prev.map((item) => (item._id === v._id ? { ...item, isActive: !v.isActive } : item))
        );
      }
    } catch (e) {
      toast.error('Lỗi thay đổi trạng thái voucher');
    }
  };

  const handleDeleteVoucher = async (id: string, code: string) => {
    if (!confirm(`Bạn có chắc chắn muốn xóa mã Voucher "${code}" không?`)) return;
    try {
      const res = await apiFetch(`/api/admin/vouchers/${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        toast.success(`Đã xóa mã "${code}"!`);
        setVouchers((prev) => prev.filter((item) => item._id !== id));
      } else {
        toast.error(data.message || 'Lỗi xóa voucher');
      }
    } catch (e) {
      toast.error('Lỗi khi xóa voucher');
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success(`Đã sao chép mã "${text}"! 📋`);
  };

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('vi-VN').format(val);
  };

  return (
    <div className={styles.container}>
      {/* Header */}
      <div className={styles.header}>
        <div className={styles.headerLeft}>
          <h1 className={styles.pageTitle}>
            <FiGift style={{ color: 'var(--admin-accent, #f97316)' }} />
            <span>Quản Lý Mã Giảm Giá & Voucher</span>
          </h1>
          <p className={styles.pageDesc}>
            Tạo và cấu hình các chương trình Voucher kích cầu mua sắm (Shopee Style) không cần đăng nhập.
          </p>
        </div>

        <button type="button" className={styles.createBtn} onClick={handleOpenCreateModal}>
          <FiPlus size={16} />
          <span>Tạo Mã Mới</span>
        </button>
      </div>

      {/* Stats Overview */}
      <div className={styles.statsRow}>
        <div className={styles.statCard}>
          <div className={styles.statIcon}>
            <FiGift />
          </div>
          <div className={styles.statInfo}>
            <span className={styles.statLabel}>Tổng số Voucher</span>
            <span className={styles.statValue}>{stats.total}</span>
          </div>
        </div>

        <div className={styles.statCard}>
          <div className={styles.statIcon} style={{ color: '#22c55e', background: 'rgba(34, 197, 94, 0.12)' }}>
            <FiCheckCircle />
          </div>
          <div className={styles.statInfo}>
            <span className={styles.statLabel}>Đang hoạt động</span>
            <span className={styles.statValue}>{stats.active}</span>
          </div>
        </div>

        <div className={styles.statCard}>
          <div className={styles.statIcon} style={{ color: '#3b82f6', background: 'rgba(59, 130, 246, 0.12)' }}>
            <FiClock />
          </div>
          <div className={styles.statInfo}>
            <span className={styles.statLabel}>Lượt đã sử dụng</span>
            <span className={styles.statValue}>{stats.totalUsed}</span>
          </div>
        </div>
      </div>

      {/* Filter & Search */}
      <div className={styles.filterBar}>
        <form onSubmit={handleSearch} className={styles.searchBox}>
          <FiSearch className={styles.searchIcon} />
          <input
            type="text"
            placeholder="Tìm theo mã hoặc tên voucher..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className={styles.searchInput}
          />
        </form>

        <div className={styles.tabFilters}>
          <button
            type="button"
            className={`${styles.tabFilterBtn} ${statusFilter === 'all' ? styles.tabFilterActive : ''}`}
            onClick={() => setStatusFilter('all')}
          >
            Tất cả
          </button>
          <button
            type="button"
            className={`${styles.tabFilterBtn} ${statusFilter === 'active' ? styles.tabFilterActive : ''}`}
            onClick={() => setStatusFilter('active')}
          >
            Đang chạy
          </button>
          <button
            type="button"
            className={`${styles.tabFilterBtn} ${statusFilter === 'inactive' ? styles.tabFilterActive : ''}`}
            onClick={() => setStatusFilter('inactive')}
          >
            Tạm dừng
          </button>
          <button
            type="button"
            className={`${styles.tabFilterBtn} ${statusFilter === 'expired' ? styles.tabFilterActive : ''}`}
            onClick={() => setStatusFilter('expired')}
          >
            Hết hạn
          </button>
        </div>
      </div>

      {/* Vouchers Grid */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '60px 0', color: 'var(--admin-text-muted, #94a3b8)' }}>
          Đang tải danh sách mã giảm giá...
        </div>
      ) : vouchers.length === 0 ? (
        <div className={styles.emptyState}>
          <FiGift size={40} style={{ marginBottom: 12, opacity: 0.5 }} />
          <h3>Chưa có mã giảm giá nào</h3>
          <p style={{ fontSize: 13, marginTop: 4 }}>
            Bấm <strong>"+ Tạo Mã Mới"</strong> để phát hành chương trình khuyến mãi đầu tiên!
          </p>
        </div>
      ) : (
        <div className={styles.voucherGrid}>
          {vouchers.map((v) => {
            const isExpired = new Date(v.endDate) < new Date();
            const usagePercent =
              v.totalUsageLimit > 0 ? Math.min(100, Math.round((v.usedCount / v.totalUsageLimit) * 100)) : 0;

            return (
              <div key={v._id} className={styles.voucherAdminCard}>
                {/* Top Bar */}
                <div className={styles.cardTop}>
                  <div
                    className={styles.codeBadge}
                    onClick={() => copyToClipboard(v.code)}
                    title="Bấm để sao chép mã"
                    style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 }}
                  >
                    <span>{v.code}</span>
                    <FiCopy size={12} />
                  </div>

                  <div className={styles.statusBadges}>
                    {isExpired ? (
                      <span className={`${styles.statusBadge} ${styles.statusExpired}`}>Hết hạn</span>
                    ) : v.isActive ? (
                      <span className={`${styles.statusBadge} ${styles.statusActive}`}>Đang chạy</span>
                    ) : (
                      <span className={`${styles.statusBadge} ${styles.statusInactive}`}>Tạm khóa</span>
                    )}

                    {v.isPublic && (
                      <span
                        className={styles.statusBadge}
                        style={{ background: 'rgba(59, 130, 246, 0.15)', color: '#3b82f6' }}
                        title="Hiển thị ngoài trang chủ"
                      >
                        Công khai
                      </span>
                    )}
                  </div>
                </div>

                {/* Main Content */}
                <div className={styles.cardMain}>
                  <div className={styles.voucherName}>{v.name}</div>
                  {v.description && <div className={styles.voucherDesc}>{v.description}</div>}

                  <div className={styles.detailsList}>
                    <div className={styles.detailRow}>
                      <span>Mức giảm:</span>
                      <span className={styles.detailVal} style={{ color: 'var(--admin-accent, #f97316)' }}>
                        {v.discountType === 'percent'
                          ? `Giảm ${v.discountValue}%${v.maxDiscountAmount ? ` (Tối đa ${formatCurrency(v.maxDiscountAmount)}đ)` : ''}`
                          : `Giảm ${formatCurrency(v.discountValue)}đ`}
                      </span>
                    </div>

                    <div className={styles.detailRow}>
                      <span>Đơn tối thiểu:</span>
                      <span className={styles.detailVal}>
                        {v.minOrderValue > 0 ? `${formatCurrency(v.minOrderValue)}đ` : 'Không giới hạn (0đ)'}
                      </span>
                    </div>

                    <div className={styles.detailRow}>
                      <span>Thời hạn:</span>
                      <span className={styles.detailVal}>
                        {new Date(v.startDate).toLocaleDateString('vi-VN')} - {new Date(v.endDate).toLocaleDateString('vi-VN')}
                      </span>
                    </div>

                    <div className={styles.detailRow}>
                      <span>Lượt dùng/SĐT:</span>
                      <span className={styles.detailVal}>{v.limitPerCustomer || 1} lần</span>
                    </div>

                    {/* Usage Progress */}
                    <div className={styles.usageProgress}>
                      <div className={styles.detailRow} style={{ marginBottom: 2 }}>
                        <span>Lượt đã dùng:</span>
                        <span className={styles.detailVal}>
                          {v.usedCount} / {v.totalUsageLimit > 0 ? v.totalUsageLimit : '∞'} ({usagePercent}%)
                        </span>
                      </div>
                      {v.totalUsageLimit > 0 && (
                        <div className={styles.usageBar}>
                          <div className={styles.usageFill} style={{ width: `${usagePercent}%` }} />
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Bottom Actions */}
                <div className={styles.cardActions}>
                  <label className={styles.toggleSwitch}>
                    <input
                      type="checkbox"
                      checked={v.isActive}
                      onChange={() => handleToggleStatus(v)}
                    />
                    <span>{v.isActive ? 'Kích hoạt' : 'Tắt'}</span>
                  </label>

                  <div className={styles.actionBtns}>
                    <button
                      type="button"
                      className={styles.editBtn}
                      onClick={() => handleOpenEditModal(v)}
                    >
                      <FiEdit2 size={12} />
                      <span>Sửa</span>
                    </button>
                    <button
                      type="button"
                      className={styles.deleteBtn}
                      onClick={() => handleDeleteVoucher(v._id, v.code)}
                    >
                      <FiTrash2 size={12} />
                      <span>Xóa</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ===== CREATE / EDIT VOUCHER MODAL ===== */}
      {isModalOpen && (
        <div className={styles.modalOverlay} onClick={() => setIsModalOpen(false)}>
          <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <div className={styles.modalTitle}>
                {editingVoucher ? `Sửa Mã Giảm Giá: ${editingVoucher.code}` : 'Tạo Mã Giảm Giá Mới'}
              </div>
              <button type="button" className={styles.modalClose} onClick={() => setIsModalOpen(false)}>
                <FiX />
              </button>
            </div>

            <form onSubmit={handleSaveVoucher}>
              <div className={styles.modalBody}>
                <div className={styles.formGrid}>
                  {/* Code */}
                  <div className={styles.formGroup}>
                    <label className={styles.formLabel}>Mã Voucher (Code) *</label>
                    <input
                      type="text"
                      required
                      placeholder="VD: FREESHIP30K, GIAM50K"
                      value={formData.code}
                      onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase().trim() })}
                      className={styles.formInput}
                    />
                  </div>

                  {/* Name */}
                  <div className={styles.formGroup}>
                    <label className={styles.formLabel}>Tên Hiển Thị *</label>
                    <input
                      type="text"
                      required
                      placeholder="VD: Giảm 30K cho đơn từ 200K"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className={styles.formInput}
                    />
                  </div>

                  {/* Description */}
                  <div className={styles.formGroupFull}>
                    <label className={styles.formLabel}>Mô tả phụ</label>
                    <input
                      type="text"
                      placeholder="VD: Áp dụng cho mọi sản phẩm thời trang"
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      className={styles.formInput}
                    />
                  </div>

                  {/* Discount Type */}
                  <div className={styles.formGroup}>
                    <label className={styles.formLabel}>Loại Giảm Giá</label>
                    <select
                      value={formData.discountType}
                      onChange={(e) => setFormData({ ...formData, discountType: e.target.value as any })}
                      className={`${styles.formInput} ${styles.selectInput}`}
                    >
                      <option value="fixed">Số tiền cố định (VNĐ)</option>
                      <option value="percent">Phần trăm (%)</option>
                    </select>
                  </div>

                  {/* Discount Value */}
                  <div className={styles.formGroup}>
                    <label className={styles.formLabel}>
                      {formData.discountType === 'percent' ? 'Mức giảm (%) *' : 'Số tiền giảm (VNĐ) *'}
                    </label>
                    <input
                      type="number"
                      required
                      min={1}
                      max={formData.discountType === 'percent' ? 100 : 10000000}
                      value={formData.discountValue}
                      onChange={(e) => setFormData({ ...formData, discountValue: Number(e.target.value) })}
                      className={styles.formInput}
                    />
                  </div>

                  {/* Max Discount if Percent */}
                  {formData.discountType === 'percent' && (
                    <div className={styles.formGroup}>
                      <label className={styles.formLabel}>Giảm tối đa (VNĐ, 0 = Không giới hạn)</label>
                      <input
                        type="number"
                        min={0}
                        step={1000}
                        value={formData.maxDiscountAmount}
                        onChange={(e) => setFormData({ ...formData, maxDiscountAmount: Number(e.target.value) })}
                        className={styles.formInput}
                      />
                    </div>
                  )}

                  {/* Min Order Value */}
                  <div className={styles.formGroup}>
                    <label className={styles.formLabel}>Đơn hàng tối thiểu (VNĐ)</label>
                    <input
                      type="number"
                      min={0}
                      step={5000}
                      value={formData.minOrderValue}
                      onChange={(e) => setFormData({ ...formData, minOrderValue: Number(e.target.value) })}
                      className={styles.formInput}
                    />
                  </div>

                  {/* Total Usage Limit */}
                  <div className={styles.formGroup}>
                    <label className={styles.formLabel}>Tổng số lượt phát hành (0 = Vô hạn)</label>
                    <input
                      type="number"
                      min={0}
                      value={formData.totalUsageLimit}
                      onChange={(e) => setFormData({ ...formData, totalUsageLimit: Number(e.target.value) })}
                      className={styles.formInput}
                    />
                  </div>

                  {/* Limit Per Customer */}
                  <div className={styles.formGroup}>
                    <label className={styles.formLabel}>Lượt dùng tối đa/SĐT (Chống gian lận)</label>
                    <input
                      type="number"
                      min={1}
                      value={formData.limitPerCustomer}
                      onChange={(e) => setFormData({ ...formData, limitPerCustomer: Number(e.target.value) })}
                      className={styles.formInput}
                    />
                  </div>

                  {/* Start Date */}
                  <div className={styles.formGroup}>
                    <label className={styles.formLabel}>Ngày bắt đầu</label>
                    <input
                      type="date"
                      required
                      value={formData.startDate}
                      onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                      className={styles.formInput}
                    />
                  </div>

                  {/* End Date */}
                  <div className={styles.formGroup}>
                    <label className={styles.formLabel}>Ngày kết thúc (HSD) *</label>
                    <input
                      type="date"
                      required
                      value={formData.endDate}
                      onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                      className={styles.formInput}
                    />
                  </div>

                  {/* Public Switch */}
                  <div className={styles.formGroupFull}>
                    <div className={styles.switchRow}>
                      <div>
                        <div className={styles.switchLabelTitle}>Hiển thị công khai ngoài Storefront</div>
                        <div className={styles.switchLabelDesc}>
                          Khách hàng có thể nhìn thấy và bấm [LƯU MÃ] ngoài trang chủ & trang sản phẩm
                        </div>
                      </div>
                      <input
                        type="checkbox"
                        checked={formData.isPublic}
                        onChange={(e) => setFormData({ ...formData, isPublic: e.target.checked })}
                      />
                    </div>
                  </div>

                  {/* Active Switch */}
                  <div className={styles.formGroupFull}>
                    <div className={styles.switchRow}>
                      <div>
                        <div className={styles.switchLabelTitle}>Kích hoạt mã Voucher này</div>
                        <div className={styles.switchLabelDesc}>
                          Bật để khách hàng có thể áp dụng mã khi thanh toán
                        </div>
                      </div>
                      <input
                        type="checkbox"
                        checked={formData.isActive}
                        onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className={styles.modalFooter}>
                <button
                  type="button"
                  className={styles.modalCancelBtn}
                  onClick={() => setIsModalOpen(false)}
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className={styles.modalSaveBtn}
                >
                  {submitting ? 'Đang Lưu...' : editingVoucher ? 'Lưu Thay Đổi' : 'Tạo Voucher'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
