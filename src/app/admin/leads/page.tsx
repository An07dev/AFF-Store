'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  FiZap,
  FiSearch,
  FiRefreshCw,
  FiPhone,
  FiMail,
  FiCheckCircle,
  FiClock,
  FiXCircle,
  FiTrash2,
  FiExternalLink,
  FiDownload,
  FiEye,
  FiDollarSign,
  FiUsers,
  FiCheck,
  FiMessageSquare,
  FiInfo,
} from 'react-icons/fi';
import toast from 'react-hot-toast';
import { formatPrice, formatDate } from '@/lib/utils';
import { apiFetch } from '@/lib/api';
import styles from './page.module.css';

interface LeadItem {
  _id: string;
  orderCode: string;
  name: string;
  phone: string;
  email?: string;
  notes?: string;
  plan: string;
  amount: number;
  paymentStatus: 'pending' | 'paid' | 'failed' | 'cancelled';
  paymentMethod: string;
  source?: string;
  createdAt: string;
}

export default function LandingLeadsAdminPage() {
  const [leads, setLeads] = useState<LeadItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedPlan, setSelectedPlan] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [selectedLeadModal, setSelectedLeadModal] = useState<LeadItem | null>(null);

  const fetchLeads = async () => {
    setLoading(true);
    try {
      let url = `/api/landing-leads?limit=100`;
      if (selectedPlan !== 'all') url += `&plan=${encodeURIComponent(selectedPlan)}`;
      if (selectedStatus !== 'all') url += `&paymentStatus=${encodeURIComponent(selectedStatus)}`;
      if (search.trim()) url += `&q=${encodeURIComponent(search.trim())}`;

      const res = await apiFetch(url);
      const json = await res.json();
      if (json.success) {
        setLeads(json.data || []);
      } else {
        toast.error(json.message || 'Không thể tải danh sách leads');
      }
    } catch (e) {
      toast.error('Lỗi khi tải danh sách người mua gói');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeads();
  }, [selectedPlan, selectedStatus]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchLeads();
  };

  const handleStatusChange = async (leadId: string, nextStatus: 'pending' | 'paid' | 'cancelled') => {
    try {
      const res = await apiFetch(`/api/landing-leads/${leadId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ paymentStatus: nextStatus }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success(`Đã cập nhật trạng thái đơn thành ${nextStatus === 'paid' ? 'ĐÃ THANH TOÁN' : nextStatus}`);
        setLeads((prev) =>
          prev.map((l) => (l._id === leadId ? { ...l, paymentStatus: nextStatus } : l))
        );
        if (selectedLeadModal?._id === leadId) {
          setSelectedLeadModal((prev) => prev ? { ...prev, paymentStatus: nextStatus } : null);
        }
      } else {
        toast.error(data.message || 'Lỗi cập nhật');
      }
    } catch (e) {
      toast.error('Lỗi kết nối máy chủ');
    }
  };

  const handleDeleteLead = async (leadId: string, code: string) => {
    if (!window.confirm(`Bạn có chắc chắn muốn xóa đơn mua gói #${code}?`)) return;
    try {
      const res = await apiFetch(`/api/landing-leads/${leadId}`, {
        method: 'DELETE',
      });
      const data = await res.json();
      if (data.success) {
        toast.success(`Đã xóa đơn #${code}`);
        setLeads((prev) => prev.filter((l) => l._id !== leadId));
        if (selectedLeadModal?._id === leadId) setSelectedLeadModal(null);
      } else {
        toast.error(data.message || 'Lỗi xóa đơn');
      }
    } catch (e) {
      toast.error('Lỗi khi xóa đơn');
    }
  };

  // Export CSV
  const handleExportCSV = () => {
    if (leads.length === 0) {
      toast.error('Chưa có dữ liệu để xuất file');
      return;
    }
    const headers = ['Mã Đơn', 'Họ Tên', 'Số Điện Thoại', 'Email', 'Gói Mua', 'Số Tiền', 'Trạng Thái', 'Ghi Chú', 'Ngày Tạo'];
    const rows = leads.map((l) => [
      l.orderCode,
      l.name,
      l.phone,
      l.email || '',
      l.plan.toUpperCase(),
      l.amount,
      l.paymentStatus,
      `"${(l.notes || '').replace(/"/g, '""')}"`,
      formatDate(l.createdAt),
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `danh-sach-khach-mua-landing-${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success('Đã xuất file CSV thành công!');
  };

  // Stats Calculations
  const totalLeads = leads.length;
  const paidLeads = leads.filter((l) => l.paymentStatus === 'paid');
  const pendingLeads = leads.filter((l) => l.paymentStatus === 'pending');
  const totalRevenue = paidLeads.reduce((acc, l) => acc + (l.amount || 0), 0);
  const count399k = leads.filter((l) => l.plan === '399k').length;
  const count799k = leads.filter((l) => l.plan === '799k').length;

  return (
    <div className={styles.page}>
      {/* Header */}
      <div className={styles.header}>
        <div className={styles.titleArea}>
          <h1 className={styles.title}>
            <span>Khách Mua Gói Landing Page</span>
            <span className={styles.badge}>Bản Quyền Website</span>
          </h1>
          <p className={styles.subtitle}>
            Quản lý khách hàng đăng ký mua mã nguồn gói 399K & 799K từ Landing Page
          </p>
        </div>

        <div className={styles.headerActions}>
          <button type="button" className={styles.refreshBtn} onClick={fetchLeads} disabled={loading}>
            <FiRefreshCw className={loading ? styles.spin : ''} size={15} />
            <span>Làm mới</span>
          </button>

          <button type="button" className={styles.exportBtn} onClick={handleExportCSV}>
            <FiDownload size={15} />
            <span>Xuất Excel / CSV</span>
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className={styles.statsGrid}>
        <div className={styles.statCard}>
          <div className={styles.statIcon} style={{ background: 'rgba(99, 102, 241, 0.15)', color: '#818cf8' }}>
            <FiUsers />
          </div>
          <div className={styles.statInfo}>
            <div className={styles.statValue}>{totalLeads}</div>
            <div className={styles.statLabel}>Tổng khách đăng ký</div>
          </div>
        </div>

        <div className={styles.statCard}>
          <div className={styles.statIcon} style={{ background: 'rgba(16, 185, 129, 0.15)', color: '#10b981' }}>
            <FiDollarSign />
          </div>
          <div className={styles.statInfo}>
            <div className={styles.statValue}>{formatPrice(totalRevenue)}</div>
            <div className={styles.statLabel}>Doanh thu đã thu ({paidLeads.length} đơn)</div>
          </div>
        </div>

        <div className={styles.statCard}>
          <div className={styles.statIcon} style={{ background: 'rgba(238, 77, 45, 0.15)', color: '#ee4d2d' }}>
            <FiZap />
          </div>
          <div className={styles.statInfo}>
            <div className={styles.statValue}>{count399k}</div>
            <div className={styles.statLabel}>Gói 399K (Source Code)</div>
          </div>
        </div>

        <div className={styles.statCard}>
          <div className={styles.statIcon} style={{ background: 'rgba(168, 85, 247, 0.15)', color: '#c084fc' }}>
            <FiCheckCircle />
          </div>
          <div className={styles.statInfo}>
            <div className={styles.statValue}>{count799k}</div>
            <div className={styles.statLabel}>Gói 799K (Trọn Gói Cài Đặt)</div>
          </div>
        </div>
      </div>

      {/* Filter Bar */}
      <div className={styles.filterBar}>
        <form className={styles.searchBox} onSubmit={handleSearchSubmit}>
          <FiSearch size={16} color="#94a3b8" />
          <input
            type="text"
            placeholder="Tìm theo Mã đơn, Tên, Số điện thoại..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </form>

        <div className={styles.filterGroup}>
          <select
            className={styles.filterSelect}
            value={selectedPlan}
            onChange={(e) => setSelectedPlan(e.target.value)}
          >
            <option value="all">Tất cả gói</option>
            <option value="399k">Gói 399K (Source Code)</option>
            <option value="799k">Gói 799K (Cài Đặt Sẵn)</option>
          </select>

          <select
            className={styles.filterSelect}
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
          >
            <option value="all">Tất cả trạng thái</option>
            <option value="paid">Đã thanh toán (Paid)</option>
            <option value="pending">Chờ thanh toán (Pending)</option>
            <option value="cancelled">Đã hủy (Cancelled)</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className={styles.tableContainer}>
        {loading ? (
          <div className={styles.emptyState}>
            <FiRefreshCw className={styles.spin} size={28} />
            <p>Đang tải danh sách khách hàng...</p>
          </div>
        ) : leads.length === 0 ? (
          <div className={styles.emptyState}>
            <FiUsers className={styles.emptyIcon} />
            <p>Chưa có thông tin khách hàng đặt mua nào phù hợp.</p>
          </div>
        ) : (
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Mã Đơn</th>
                <th>Khách Hàng</th>
                <th>Gói Đăng Ký</th>
                <th>Số Tiền</th>
                <th>Trạng Thái</th>
                <th>Thời Gian</th>
                <th style={{ textAlign: 'right' }}>Hành Động</th>
              </tr>
            </thead>
            <tbody>
              {leads.map((lead) => {
                const isPaid = lead.paymentStatus === 'paid';
                const isPending = lead.paymentStatus === 'pending';
                const cleanPhone = (lead.phone || '').replace(/\D/g, '');

                return (
                  <tr key={lead._id}>
                    <td>
                      <span className={styles.orderCode}>{lead.orderCode}</span>
                    </td>
                    <td>
                      <div className={styles.customerName}>{lead.name}</div>
                      <div className={styles.customerContact}>
                        {lead.phone && (
                          <a
                            href={`https://zalo.me/${cleanPhone}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className={styles.contactLink}
                            title="Mở chat Zalo"
                          >
                            <FiPhone size={12} /> {lead.phone} (Zalo ↗)
                          </a>
                        )}
                        {lead.email && (
                          <a href={`mailto:${lead.email}`} className={styles.contactLink}>
                            <FiMail size={12} /> {lead.email}
                          </a>
                        )}
                      </div>
                    </td>
                    <td>
                      <span
                        className={`${styles.planTag} ${
                          lead.plan === '799k' ? styles.plan799 : styles.plan399
                        }`}
                      >
                        ⚡ GÓI {lead.plan.toUpperCase()}
                      </span>
                    </td>
                    <td>
                      <strong style={{ color: '#ffffff' }}>{formatPrice(lead.amount || (lead.plan === '799k' ? 799000 : 399000))}</strong>
                    </td>
                    <td>
                      {isPaid ? (
                        <span className={`${styles.statusTag} ${styles.statusPaid}`}>
                          <FiCheckCircle size={13} /> Đã Thanh Toán
                        </span>
                      ) : isPending ? (
                        <span className={`${styles.statusTag} ${styles.statusPending}`}>
                          <FiClock size={13} /> Chờ Chuyển Khoản
                        </span>
                      ) : (
                        <span className={`${styles.statusTag} ${styles.statusCancelled}`}>
                          <FiXCircle size={13} /> Đã Hủy
                        </span>
                      )}
                    </td>
                    <td style={{ color: '#94a3b8', fontSize: '0.8125rem' }}>
                      {formatDate(lead.createdAt)}
                    </td>
                    <td>
                      <div className={styles.actionCell} style={{ justifyContent: 'flex-end' }}>
                        {/* Detail Modal Button */}
                        <button
                          type="button"
                          className={styles.actionBtn}
                          title="Xem chi tiết đơn"
                          onClick={() => setSelectedLeadModal(lead)}
                        >
                          <FiEye size={15} />
                        </button>

                        {/* Quick Toggle Paid */}
                        {isPending ? (
                          <button
                            type="button"
                            className={`${styles.actionBtn} ${styles.actionBtnSuccess}`}
                            title="Xác nhận đã nhận tiền (VietQR)"
                            onClick={() => handleStatusChange(lead._id, 'paid')}
                          >
                            <FiCheck size={15} />
                          </button>
                        ) : (
                          <button
                            type="button"
                            className={styles.actionBtn}
                            title="Đổi lại chờ thanh toán"
                            onClick={() => handleStatusChange(lead._id, 'pending')}
                          >
                            <FiClock size={15} />
                          </button>
                        )}

                        {/* Delete Button */}
                        <button
                          type="button"
                          className={`${styles.actionBtn} ${styles.actionBtnDanger}`}
                          title="Xóa đơn này"
                          onClick={() => handleDeleteLead(lead._id, lead.orderCode)}
                        >
                          <FiTrash2 size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {/* Detail Modal */}
      {selectedLeadModal && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0, 0, 0, 0.75)',
            backdropFilter: 'blur(6px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 9999,
            padding: 20,
          }}
          onClick={() => setSelectedLeadModal(null)}
        >
          <div
            style={{
              background: '#13161f',
              border: '1px solid #232838',
              borderRadius: 16,
              maxWidth: 520,
              width: '100%',
              padding: 24,
              boxShadow: '0 20px 40px rgba(0,0,0,0.5)',
              display: 'flex',
              flexDirection: 'column',
              gap: 16,
              color: '#ffffff',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <span className={styles.orderCode}>{selectedLeadModal.orderCode}</span>
                <span style={{ fontSize: 13, color: '#94a3b8' }}>Chi tiết đơn mua gói</span>
              </div>
              <button
                type="button"
                onClick={() => setSelectedLeadModal(null)}
                style={{ background: 'transparent', border: 'none', color: '#94a3b8', cursor: 'pointer', fontSize: 18 }}
              >
                ✕
              </button>
            </div>

            <div style={{ background: 'rgba(255,255,255,0.03)', borderRadius: 12, padding: 16, display: 'flex', flexDirection: 'column', gap: 10 }}>
              <div>
                <span style={{ fontSize: 12, color: '#94a3b8' }}>Họ và tên khách:</span>
                <div style={{ fontSize: 16, fontWeight: 700 }}>{selectedLeadModal.name}</div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                <div>
                  <span style={{ fontSize: 12, color: '#94a3b8' }}>Số điện thoại / Zalo:</span>
                  <div style={{ fontWeight: 600 }}>{selectedLeadModal.phone}</div>
                </div>
                <div>
                  <span style={{ fontSize: 12, color: '#94a3b8' }}>Gói mua:</span>
                  <div style={{ fontWeight: 700, color: selectedLeadModal.plan === '799k' ? '#a5b4fc' : '#ff6b4a' }}>
                    GÓI {selectedLeadModal.plan.toUpperCase()} ({formatPrice(selectedLeadModal.amount)})
                  </div>
                </div>
              </div>
              {selectedLeadModal.email && (
                <div>
                  <span style={{ fontSize: 12, color: '#94a3b8' }}>Email nhận mã nguồn:</span>
                  <div style={{ color: '#38bdf8' }}>{selectedLeadModal.email}</div>
                </div>
              )}
              {selectedLeadModal.notes && (
                <div>
                  <span style={{ fontSize: 12, color: '#94a3b8' }}>Ghi chú của khách:</span>
                  <div style={{ background: 'rgba(0,0,0,0.2)', padding: '8px 12px', borderRadius: 8, fontSize: 13, marginTop: 4 }}>
                    {selectedLeadModal.notes}
                  </div>
                </div>
              )}
              <div>
                <span style={{ fontSize: 12, color: '#94a3b8' }}>Thời gian đăng ký:</span>
                <div style={{ fontSize: 13, color: '#cbd5e1' }}>{formatDate(selectedLeadModal.createdAt)}</div>
              </div>
            </div>

            {/* Modal Actions */}
            <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 8 }}>
              {selectedLeadModal.phone && (
                <a
                  href={`https://zalo.me/${selectedLeadModal.phone.replace(/\D/g, '')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    background: 'linear-gradient(135deg, #0284c7, #0369a1)',
                    color: '#fff',
                    padding: '10px 18px',
                    borderRadius: 8,
                    fontWeight: 700,
                    textDecoration: 'none',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 6,
                    fontSize: 13,
                  }}
                >
                  <FiMessageSquare /> Chat Zalo Ngay ↗
                </a>
              )}

              {selectedLeadModal.paymentStatus === 'pending' ? (
                <button
                  type="button"
                  style={{
                    background: 'linear-gradient(135deg, #10b981, #059669)',
                    color: '#fff',
                    border: 'none',
                    padding: '10px 18px',
                    borderRadius: 8,
                    fontWeight: 700,
                    cursor: 'pointer',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 6,
                    fontSize: 13,
                  }}
                  onClick={() => handleStatusChange(selectedLeadModal._id, 'paid')}
                >
                  <FiCheck /> Đã Nhận Tiền
                </button>
              ) : (
                <button
                  type="button"
                  style={{
                    background: 'rgba(255,255,255,0.08)',
                    color: '#cbd5e1',
                    border: '1px solid #334155',
                    padding: '10px 18px',
                    borderRadius: 8,
                    fontWeight: 600,
                    cursor: 'pointer',
                    fontSize: 13,
                  }}
                  onClick={() => handleStatusChange(selectedLeadModal._id, 'pending')}
                >
                  Đổi sang Chờ Chuyển Khoản
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
