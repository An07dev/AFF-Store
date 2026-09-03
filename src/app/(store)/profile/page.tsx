'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  FiChevronLeft,
  FiUser,
  FiShoppingBag,
  FiTruck,
  FiCheckCircle,
  FiRotateCcw,
  FiMapPin,
  FiShield,
  FiHelpCircle,
  FiChevronRight,
  FiMail,
  FiPhone,
  FiEdit2,
  FiCheck,
  FiSave,
} from 'react-icons/fi';
import toast from 'react-hot-toast';
import { useTheme } from '@/contexts/ThemeContext';
import { formatPrice, formatDate } from '@/lib/utils';
import { apiFetch } from '@/lib/api';
import styles from './page.module.css';

interface CustomerProfile {
  name: string;
  phone: string;
  email: string;
  address: string;
}

export default function ProfilePage() {
  const router = useRouter();

  const [profile, setProfile] = useState<CustomerProfile>({
    name: 'Khách hàng',
    phone: '0988888888',
    email: 'khachhang@shopbig.vn',
    address: 'Số 10 Phạm Hùng, Cầu Giấy, Hà Nội',
  });

  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState<CustomerProfile>(profile);
  const [orders, setOrders] = useState<any[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(false);

  // 1. Load profile from localStorage or fallback API (no token required)
  useEffect(() => {
    try {
      const saved = localStorage.getItem('shopbig_profile');
      if (saved) {
        const parsed = JSON.parse(saved);
        setProfile(parsed);
        setEditForm(parsed);
      } else {
        // Fetch from /api/auth/me (no token required)
        apiFetch('/api/auth/me')
          .then((r) => r.json())
          .then((data) => {
            if (data.success && data.data) {
              const p = {
                name: data.data.name || 'Khách hàng',
                phone: data.data.phone || '0988888888',
                email: data.data.email || 'khachhang@shopbig.vn',
                address: data.data.address || 'Số 10 Phạm Hùng, Cầu Giấy, Hà Nội',
              };
              setProfile(p);
              setEditForm(p);
            }
          })
          .catch((e) => console.error('Error loading default profile:', e));
      }
    } catch (e) {
      console.error('Error loading profile:', e);
    }
  }, []);

  // 2. Fetch orders without requiring token
  useEffect(() => {
    async function loadRecentOrders() {
      try {
        setLoadingOrders(true);
        const url = profile.phone ? `/api/orders?phone=${encodeURIComponent(profile.phone)}&limit=5` : '/api/orders?limit=5';
        const res = await apiFetch(url);
        const data = await res.json();
        if (data.success && Array.isArray(data.data)) {
          setOrders(data.data);
        }
      } catch (err) {
        console.error('Error loading orders:', err);
      } finally {
        setLoadingOrders(false);
      }
    }

    loadRecentOrders();
  }, [profile.phone]);

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    setProfile(editForm);
    localStorage.setItem('shopbig_profile', JSON.stringify(editForm));
    setIsEditing(false);
    toast.success('Đã cập nhật thông tin cá nhân!');
  };

  const avatarInitials = profile.name
    ? profile.name
        .split(' ')
        .filter(Boolean)
        .map((w) => w[0])
        .slice(-2)
        .join('')
        .toUpperCase()
    : 'KH';

  return (
    <div className={styles.page}>
      {/* ===== FIXED TOP NAVIGATION ===== */}
      <nav className={styles.topNav}>
        <button className={styles.navBtn} onClick={() => router.back()} aria-label="Quay lại">
          <FiChevronLeft size={22} />
        </button>
        <div className={styles.navTitle}>Tài khoản của tôi</div>
        <button
          className={styles.navBtn}
          onClick={() => setIsEditing(!isEditing)}
          aria-label="Chỉnh sửa thông tin"
          title="Chỉnh sửa thông tin"
        >
          <FiEdit2 size={18} />
        </button>
      </nav>

      {/* ===== SCROLLABLE CONTENT AREA ===== */}
      <div className={styles.scrollArea}>
        {/* 1. HERO USER CARD */}
        <div className={styles.heroCard}>
          <div className={styles.avatarWrap}>
            <div className={styles.avatar}>{avatarInitials}</div>
            <span className={styles.vipBadge}>VIP</span>
          </div>

          <div className={styles.userInfo}>
            <h2 className={styles.userName}>
              <span>{profile.name}</span>
              <span className={styles.roleBadge}>Thành viên</span>
            </h2>
            <div className={styles.userMeta}>
              <FiPhone size={12} />
              <span className={styles.userPhone}>{profile.phone}</span>
            </div>
            <div className={styles.userMeta}>
              <FiMail size={12} />
              <span>{profile.email}</span>
            </div>
          </div>
        </div>

        {/* Profile Edit Inline Form */}
        {isEditing && (
          <form className={styles.menuCard} onSubmit={handleSaveProfile} style={{ gap: 12 }}>
            <h3 style={{ fontSize: 13, fontWeight: 700, margin: '0 0 4px', color: '#f8fafc' }}>
              Chỉnh Sửa Thông Tin
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
              <label style={{ fontSize: 11, color: '#94a3b8' }}>Họ và tên</label>
              <input
                type="text"
                required
                className={styles.input}
                style={{
                  background: '#090a0f',
                  border: '1px solid #232838',
                  color: '#fff',
                  padding: '8px 12px',
                  borderRadius: 6,
                  fontSize: 12,
                }}
                value={editForm.name}
                onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
              />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
              <label style={{ fontSize: 11, color: '#94a3b8' }}>Số điện thoại</label>
              <input
                type="tel"
                required
                className={styles.input}
                style={{
                  background: '#090a0f',
                  border: '1px solid #232838',
                  color: '#fff',
                  padding: '8px 12px',
                  borderRadius: 6,
                  fontSize: 12,
                }}
                value={editForm.phone}
                onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
              />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
              <label style={{ fontSize: 11, color: '#94a3b8' }}>Email</label>
              <input
                type="email"
                className={styles.input}
                style={{
                  background: '#090a0f',
                  border: '1px solid #232838',
                  color: '#fff',
                  padding: '8px 12px',
                  borderRadius: 6,
                  fontSize: 12,
                }}
                value={editForm.email}
                onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
              />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
              <label style={{ fontSize: 11, color: '#94a3b8' }}>Địa chỉ giao hàng</label>
              <input
                type="text"
                className={styles.input}
                style={{
                  background: '#090a0f',
                  border: '1px solid #232838',
                  color: '#fff',
                  padding: '8px 12px',
                  borderRadius: 6,
                  fontSize: 12,
                }}
                value={editForm.address}
                onChange={(e) => setEditForm({ ...editForm, address: e.target.value })}
              />
            </div>
            <div style={{ display: 'flex', gap: 8, marginTop: 4 }}>
              <button
                type="submit"
                style={{
                  flex: 1,
                  background: 'var(--primary, #3b82f6)',
                  color: '#fff',
                  border: 'none',
                  borderRadius: 6,
                  padding: '8px 12px',
                  fontSize: 12,
                  fontWeight: 700,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 6,
                }}
              >
                <FiSave size={13} /> Lưu Thông Tin
              </button>
              <button
                type="button"
                onClick={() => setIsEditing(false)}
                style={{
                  background: '#1a1e2b',
                  color: '#94a3b8',
                  border: '1px solid #232838',
                  borderRadius: 6,
                  padding: '8px 14px',
                  fontSize: 12,
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                Hủy
              </button>
            </div>
          </form>
        )}

        {/* 2. ORDERS TRACKER (TIKTOK SHOP STYLE) */}
        <div className={styles.ordersCard}>
          <div className={styles.cardHeader}>
            <span>Đơn Hàng Của Tôi</span>
            <span
              className={styles.viewAllLink}
              onClick={() => toast('Đang hiển thị các đơn hàng gần nhất', { icon: '📦' })}
            >
              <span>{orders.length} đơn</span>
              <FiChevronRight size={12} />
            </span>
          </div>

          <div className={styles.orderStatusGrid}>
            <div
              className={styles.statusItem}
              onClick={() => toast('Không có đơn hàng nào chờ thanh toán', { icon: 'ℹ️' })}
            >
              <div className={styles.statusIconWrap}>
                <FiShoppingBag />
              </div>
              <span>Chờ xác nhận</span>
            </div>

            <div
              className={styles.statusItem}
              onClick={() => toast('Đơn hàng của bạn đang được đóng gói chuẩn bị giao', { icon: '🚚' })}
            >
              <div className={styles.statusIconWrap}>
                <FiTruck />
              </div>
              <span>Đang giao</span>
            </div>

            <div
              className={styles.statusItem}
              onClick={() => toast('Danh sách đơn hàng đã hoàn tất', { icon: '✅' })}
            >
              <div className={styles.statusIconWrap}>
                <FiCheckCircle />
              </div>
              <span>Đã giao</span>
            </div>

            <div
              className={styles.statusItem}
              onClick={() => toast('Hỗ trợ hoàn trả trong 7 ngày miễn phí', { icon: '🔄' })}
            >
              <div className={styles.statusIconWrap}>
                <FiRotateCcw />
              </div>
              <span>Đổi trả</span>
            </div>
          </div>
        </div>

        {/* 3. RECENT ORDERS LIST */}
        {orders.length > 0 && (
          <div className={styles.ordersCard}>
            <div className={styles.cardHeader}>
              <span>Lịch Sử Đơn Hàng Gần Đây</span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 6 }}>
              {orders.map((o) => (
                <div
                  key={o._id || o.orderCode}
                  style={{
                    background: '#090a0f',
                    border: '1px solid #232838',
                    borderRadius: 8,
                    padding: '10px 12px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 6,
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontWeight: 800, fontSize: 12, color: 'var(--primary, #3b82f6)' }}>
                      #{o.orderCode}
                    </span>
                    <span
                      style={{
                        fontSize: 10,
                        fontWeight: 700,
                        padding: '2px 6px',
                        borderRadius: 4,
                        background: o.status === 'completed' ? 'rgba(16,185,129,0.15)' : 'rgba(59,130,246,0.15)',
                        color: o.status === 'completed' ? '#10b981' : '#3b82f6',
                      }}
                    >
                      {o.status === 'pending'
                        ? 'Chờ xử lý'
                        : o.status === 'shipping'
                        ? 'Đang giao'
                        : o.status === 'completed'
                        ? 'Hoàn tất'
                        : o.status}
                    </span>
                  </div>
                  <div style={{ fontSize: 11, color: '#94a3b8' }}>
                    {o.items?.length || 1} sản phẩm • Tổng tiền:{' '}
                    <strong style={{ color: '#f8fafc' }}>{formatPrice(o.totalAmount)}</strong>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 4. ACCOUNT FEATURES MENU */}
        <div className={styles.menuCard}>
          <div
            className={styles.menuItem}
            onClick={() => setIsEditing(true)}
          >
            <div className={styles.menuLeft}>
              <FiMapPin className={styles.menuIcon} />
              <span>Sổ Địa Chỉ & Thông Tin Nhận Hàng</span>
            </div>
            <FiChevronRight size={14} color="#64748b" />
          </div>

          <div
            className={styles.menuItem}
            onClick={() => toast('Hệ thống hoạt động trực tiếp không cần mật khẩu', { icon: '🔒' })}
          >
            <div className={styles.menuLeft}>
              <FiShield className={styles.menuIcon} />
              <span>Bảo Mật & Quyền Riêng Tư</span>
            </div>
            <FiChevronRight size={14} color="#64748b" />
          </div>

          <div
            className={styles.menuItem}
            onClick={() => toast('Tổng đài hỗ trợ 24/7: 1900 6868', { icon: '💬' })}
          >
            <div className={styles.menuLeft}>
              <FiHelpCircle className={styles.menuIcon} />
              <span>Trung Tâm Hỗ Trợ & CSKH</span>
            </div>
            <FiChevronRight size={14} color="#64748b" />
          </div>
        </div>
      </div>
    </div>
  );
}
