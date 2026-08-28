'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  FiChevronLeft,
  FiUser,
  FiShoppingBag,
  FiTruck,
  FiCheckCircle,
  FiXCircle,
  FiClock,
  FiMapPin,
  FiMail,
  FiPhone,
  FiEdit2,
  FiLogOut,
  FiSearch,
  FiPackage,
  FiArrowRight,
  FiMessageSquare,
  FiRefreshCw,
  FiLock,
  FiX,
  FiCheck,
  FiHome,
} from 'react-icons/fi';
import { FcGoogle } from 'react-icons/fc';
import { FaFacebook } from 'react-icons/fa';
import toast from 'react-hot-toast';
import { useCustomerAuth } from '@/contexts/CustomerAuthContext';
import { useTheme } from '@/contexts/ThemeContext';
import { useCart } from '@/contexts/CartContext';
import { formatPrice, formatDate } from '@/lib/utils';
import { apiFetch } from '@/lib/api';
import styles from './page.module.css';

export default function ProfileAndOrdersPage() {
  const router = useRouter();
  const { user, logout, openAuthModal, loginWithSocial, isLoading: isAuthLoading } = useCustomerAuth();
  const { theme } = useTheme();
  const { addToCart } = useCart();

  // Tab State for Orders Filter
  const [activeTab, setActiveTab] = useState<'all' | 'pending' | 'shipping' | 'delivered' | 'cancelled'>('all');

  // Orders State
  const [orders, setOrders] = useState<any[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(false);

  // Quick Search State
  const [searchCode, setSearchCode] = useState('');

  // Edit Profile State
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editName, setEditName] = useState('');
  const [editPhone, setEditPhone] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);

  // Logout Confirm State
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);
  const [socialLoading, setSocialLoading] = useState<'google' | 'facebook' | null>(null);

  // Cancel Order Modal State
  const [cancelModalOrder, setCancelModalOrder] = useState<any | null>(null);
  const [cancelReason, setCancelReason] = useState('Đổi ý không muốn mua nữa');
  const [customReason, setCustomReason] = useState('');
  const [isCancelling, setIsCancelling] = useState(false);

  // Fetch Orders for Logged-In User
  const fetchUserOrders = async () => {
    if (!user) return;
    try {
      setLoadingOrders(true);
      const params = new URLSearchParams();
      if (user.phone) params.set('phone', user.phone);
      if (user.email) params.set('email', user.email);

      const res = await apiFetch(`/api/orders?${params.toString()}&limit=50`);
      const data = await res.json();
      if (data.success && Array.isArray(data.data)) {
        setOrders(data.data);
      }
    } catch (e) {
      console.error('Error fetching user orders:', e);
    } finally {
      setLoadingOrders(false);
    }
  };

  useEffect(() => {
    if (user) {
      setEditName(user.name || '');
      setEditPhone(user.phone || '');
      fetchUserOrders();
    }
  }, [user]);

  // Filtered Orders
  const filteredOrders = useMemo(() => {
    if (activeTab === 'all') return orders;
    if (activeTab === 'pending') return orders.filter((o) => o.status === 'pending' || o.status === 'confirmed');
    if (activeTab === 'shipping') return orders.filter((o) => o.status === 'shipping' || o.status === 'delivering');
    if (activeTab === 'delivered') return orders.filter((o) => o.status === 'delivered' || o.status === 'completed');
    if (activeTab === 'cancelled') return orders.filter((o) => o.status === 'cancelled' || o.status === 'returned');
    return orders;
  }, [orders, activeTab]);

  // Total Spent & Items Bought Count
  const totalSpent = useMemo(() => {
    return orders.reduce((sum, o) => (o.status !== 'cancelled' ? sum + (o.totalAmount || 0) : sum), 0);
  }, [orders]);

  const totalItems = useMemo(() => {
    return orders.reduce((sum, o) => {
      if (o.status === 'cancelled') return sum;
      const q = (o.items || []).reduce((acc: number, it: any) => acc + (it.quantity || 1), 0);
      return sum + q;
    }, 0);
  }, [orders]);

  // Handle Quick Search
  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const clean = searchCode.trim().toUpperCase();
    if (!clean) {
      toast.error('Vui lòng nhập mã đơn hàng cần theo dõi');
      return;
    }
    router.push(`/tracking?code=${encodeURIComponent(clean)}`);
  };

  // Handle Save Profile
  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editName.trim()) {
      toast.error('Họ tên không được để trống');
      return;
    }

    setIsUpdating(true);
    try {
      if (user?.id) {
        await apiFetch(`/api/customers/${user.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name: editName.trim(), phone: editPhone.trim() }),
        });
      }

      // Update local storage
      const updatedUser = { ...user, name: editName.trim(), phone: editPhone.trim() };
      localStorage.setItem('shoptik_user', JSON.stringify(updatedUser));
      toast.success('Cập nhật thông tin thành công!');
      setIsEditModalOpen(false);
      window.location.reload();
    } catch (err) {
      toast.error('Lỗi cập nhật');
    } finally {
      setIsUpdating(false);
    }
  };

  // Handle Cancel Order
  const handleCancelOrder = async () => {
    if (!cancelModalOrder) return;
    const finalReason = cancelReason === 'Khác' ? customReason.trim() || 'Lý do khác' : cancelReason;

    try {
      setIsCancelling(true);
      const res = await apiFetch(`/api/orders/${cancelModalOrder._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: 'cancelled',
          cancelReason: finalReason,
          cancelledBy: 'customer',
        }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success(`Đã hủy đơn hàng #${cancelModalOrder.orderCode} thành công!`);
        setCancelModalOrder(null);
        setCustomReason('');
        fetchUserOrders();
      } else {
        toast.error(data.message || 'Không thể hủy đơn hàng');
      }
    } catch (e: any) {
      toast.error('Lỗi khi gửi yêu cầu hủy đơn');
    } finally {
      setIsCancelling(false);
    }
  };

  // Handle Social Login in Guest mode
  const handleSocialQuickLogin = async (provider: 'google' | 'facebook') => {
    setSocialLoading(provider);
    await loginWithSocial(provider);
    setSocialLoading(null);
  };

  // Handle Reorder (add items to cart)
  const handleReorder = (order: any) => {
    if (!order.items || order.items.length === 0) return;
    order.items.forEach((item: any) => {
      addToCart(
        {
          _id: item.productId || item._id,
          name: item.name,
          price: item.price,
          images: item.image ? [item.image] : [],
        },
        item.quantity || 1,
        item.variant
      );
    });
    toast.success('Đã thêm sản phẩm vào giỏ hàng!');
    router.push('/cart');
  };

  // Initials for avatar
  const avatarInitials = user?.name
    ? user.name
        .split(' ')
        .filter(Boolean)
        .map((w) => w[0])
        .slice(-2)
        .join('')
        .toUpperCase()
    : 'U';

  const provider = user?.provider || 'local';

  return (
    <div className={styles.page}>
      {/* ===== TOP NAVIGATION ===== */}
      <nav className={styles.topNav}>
        <button className={styles.navBtn} onClick={() => router.back()} aria-label="Quay lại">
          <FiChevronLeft size={22} />
        </button>
        <div className={styles.navTitle}>Tài Khoản & Đơn Hàng Của Tôi</div>
        <Link href="/" className={styles.navBtn} aria-label="Trang chủ">
          <FiHome size={20} />
        </Link>
      </nav>

      <div className={styles.container}>
        {/* ===== GUEST STATE (NOT LOGGED IN) ===== */}
        {!isAuthLoading && !user && (
          <div className={styles.guestBox}>
            <div className={styles.guestLockIcon}>
              <FiLock />
            </div>
            <h2 className={styles.guestTitle}>Đăng Nhập Để Quản Lý Đơn Hàng</h2>
            <p className={styles.guestDesc}>
              Đăng nhập qua <strong>Google</strong> hoặc <strong>Facebook</strong> để theo dõi tiến độ giao hàng, lịch sử đơn và thông tin ưu đãi riêng của bạn.
            </p>

            <div className={styles.guestSocialBtns}>
              <button
                type="button"
                className={`${styles.socialBtn} ${styles.googleBtn}`}
                onClick={() => handleSocialQuickLogin('google')}
                disabled={socialLoading !== null}
              >
                <FcGoogle size={20} />
                <span>{socialLoading === 'google' ? 'Đang kết nối...' : 'Tiếp tục với Google'}</span>
              </button>

              <button
                type="button"
                className={`${styles.socialBtn} ${styles.facebookBtn}`}
                onClick={() => handleSocialQuickLogin('facebook')}
                disabled={socialLoading !== null}
              >
                <FaFacebook size={20} />
                <span>{socialLoading === 'facebook' ? 'Đang kết nối...' : 'Tiếp tục với Facebook'}</span>
              </button>

              <button
                type="button"
                onClick={() => openAuthModal()}
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'var(--text-muted, #94a3b8)',
                  textDecoration: 'underline',
                  fontSize: 12.5,
                  cursor: 'pointer',
                  marginTop: 6,
                }}
              >
                Đăng nhập bằng Email / SĐT khác
              </button>
            </div>
          </div>
        )}

        {/* ===== LOGGED IN USER PROFILE HERO CARD ===== */}
        {user && (
          <div className={styles.heroCard}>
            <div className={styles.profileHeader}>
              <div className={styles.avatarWrap}>
                <div className={styles.avatar}>
                  {user.avatar ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={user.avatar} alt={user.name} className={styles.avatarImg} />
                  ) : (
                    avatarInitials
                  )}
                </div>
                <div className={styles.providerBadgeIcon}>
                  {provider === 'google' && <FcGoogle size={14} />}
                  {provider === 'facebook' && <FaFacebook size={14} color="#1877f2" />}
                  {provider === 'local' && <FiUser size={13} color="var(--primary)" />}
                </div>
              </div>

              <div className={styles.userInfo}>
                <div className={styles.userNameRow}>
                  <h2 className={styles.userName}>{user.name}</h2>
                  {provider === 'google' && (
                    <span className={`${styles.providerTag} ${styles.providerTagGoogle}`}>
                      <FcGoogle size={12} /> Google
                    </span>
                  )}
                  {provider === 'facebook' && (
                    <span className={`${styles.providerTag} ${styles.providerTagFb}`}>
                      <FaFacebook size={12} /> Facebook
                    </span>
                  )}
                  {provider === 'local' && (
                    <span className={`${styles.providerTag} ${styles.providerTagLocal}`}>
                      Tài khoản Web
                    </span>
                  )}
                </div>

                <div className={styles.userMetaRow}>
                  {user.email && (
                    <div className={styles.userMetaItem}>
                      <FiMail size={13} color="var(--primary, #3b82f6)" />
                      <span>{user.email}</span>
                    </div>
                  )}
                  {user.phone && (
                    <div className={styles.userMetaItem}>
                      <FiPhone size={13} color="#10b981" />
                      <span>{user.phone}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className={styles.heroActions}>
              <button
                type="button"
                className={styles.editProfileBtn}
                onClick={() => setIsEditModalOpen(true)}
              >
                <FiEdit2 size={13} /> Chỉnh sửa thông tin
              </button>

              <button
                type="button"
                className={styles.logoutBtn}
                onClick={() => setIsLogoutModalOpen(true)}
              >
                <FiLogOut size={13} /> Đăng xuất
              </button>
            </div>

            {/* Quick Stats Bar */}
            <div className={styles.userStatsBar}>
              <div className={styles.statBox}>
                <div className={`${styles.statVal} ${styles.statValHighlight}`}>{orders.length}</div>
                <div className={styles.statLbl}>Tổng đơn hàng</div>
              </div>

              <div className={styles.statBox}>
                <div className={styles.statVal} style={{ color: '#10b981' }}>{totalItems} món</div>
                <div className={styles.statLbl}>Sản phẩm đã mua</div>
              </div>

              <div className={styles.statBox}>
                <div className={styles.statVal}>{formatPrice(totalSpent)}</div>
                <div className={styles.statLbl}>Tổng chi tiêu</div>
              </div>
            </div>
          </div>
        )}

        {/* ===== QUICK SEARCH TRACKING BOX ===== */}
        <div className={styles.searchCard}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13.5, fontWeight: 700, color: 'var(--text-main, #f8fafc)' }}>
            <FiSearch size={15} color="var(--primary, #3b82f6)" />
            <span>Tra Cứu Nhanh Hành Trình Đơn Hàng</span>
          </div>
          <form onSubmit={handleSearchSubmit} className={styles.searchForm}>
            <input
              type="text"
              className={styles.searchInput}
              placeholder="Nhập mã đơn (VD: ORD-17872849...) hoặc mã vận đơn..."
              value={searchCode}
              onChange={(e) => setSearchCode(e.target.value)}
            />
            <button type="submit" className={styles.searchSubmitBtn}>
              <FiSearch size={14} /> Tra cứu
            </button>
          </form>
        </div>

        {/* ===== ORDERS MANAGEMENT SECTION ===== */}
        {user && (
          <>
            <div className={styles.sectionTitle}>
              <FiPackage color="var(--primary, #3b82f6)" />
              <span>Danh Sách Đơn Hàng Của Bạn ({orders.length})</span>
            </div>

            {/* Status Filter Tabs */}
            <div className={styles.tabsCard}>
              <button
                type="button"
                className={`${styles.tabBtn} ${activeTab === 'all' ? styles.tabBtnActive : ''}`}
                onClick={() => setActiveTab('all')}
              >
                Tất cả ({orders.length})
              </button>
              <button
                type="button"
                className={`${styles.tabBtn} ${activeTab === 'pending' ? styles.tabBtnActive : ''}`}
                onClick={() => setActiveTab('pending')}
              >
                Chờ xử lý ({orders.filter((o) => o.status === 'pending' || o.status === 'confirmed').length})
              </button>
              <button
                type="button"
                className={`${styles.tabBtn} ${activeTab === 'shipping' ? styles.tabBtnActive : ''}`}
                onClick={() => setActiveTab('shipping')}
              >
                Đang giao ({orders.filter((o) => o.status === 'shipping' || o.status === 'delivering').length})
              </button>
              <button
                type="button"
                className={`${styles.tabBtn} ${activeTab === 'delivered' ? styles.tabBtnActive : ''}`}
                onClick={() => setActiveTab('delivered')}
              >
                Đã giao ({orders.filter((o) => o.status === 'delivered' || o.status === 'completed').length})
              </button>
              <button
                type="button"
                className={`${styles.tabBtn} ${activeTab === 'cancelled' ? styles.tabBtnActive : ''}`}
                onClick={() => setActiveTab('cancelled')}
              >
                Đã hủy ({orders.filter((o) => o.status === 'cancelled' || o.status === 'returned').length})
              </button>
            </div>

            {/* Orders List */}
            {loadingOrders ? (
              <div style={{ textAlign: 'center', padding: '40px 20px', color: 'var(--text-muted, #94a3b8)' }}>
                <FiRefreshCw className="spinning" size={24} style={{ marginBottom: 8 }} />
                <p>Đang tải danh sách đơn hàng...</p>
              </div>
            ) : filteredOrders.length === 0 ? (
              <div className={styles.emptyOrders}>
                <FiShoppingBag className={styles.emptyIcon} />
                <h3 className={styles.emptyTitle}>Chưa có đơn hàng nào trong mục này</h3>
                <p className={styles.emptyDesc}>
                  Hãy khám phá các sản phẩm hot đang có chương trình khuyến mãi và đặt hàng ngay!
                </p>
                <Link href="/" className={styles.shopNowBtn}>
                  <FiShoppingBag size={15} /> Mua sắm ngay
                </Link>
              </div>
            ) : (
              <div className={styles.ordersList}>
                {filteredOrders.map((order) => {
                  const isDelivered = order.status === 'delivered' || order.status === 'completed';
                  const isCancelled = order.status === 'cancelled' || order.status === 'returned';
                  const isShipping = order.status === 'shipping' || order.status === 'delivering';

                  let statusText = 'Chờ xác nhận';
                  let statusClass = styles.statusPending;
                  if (isDelivered) {
                    statusText = 'Giao hàng thành công';
                    statusClass = styles.statusDelivered;
                  } else if (isCancelled) {
                    statusText = 'Đã hủy đơn';
                    statusClass = styles.statusCancelled;
                  } else if (isShipping) {
                    statusText = 'Đang vận chuyển';
                    statusClass = styles.statusShipping;
                  }

                  return (
                    <div key={order._id || order.orderCode} className={styles.orderCard}>
                      {/* Order Header */}
                      <div className={styles.orderHeader}>
                        <div className={styles.orderCodeCol}>
                          <span className={styles.orderCode}>#{order.orderCode}</span>
                          <div className={styles.orderDate}>
                            <FiClock size={12} />
                            <span>{order.createdAt ? formatDate(order.createdAt) : '-'}</span>
                          </div>
                        </div>

                        <div className={`${styles.orderStatusBadge} ${statusClass}`}>
                          {isDelivered && <FiCheckCircle size={13} />}
                          {isCancelled && <FiXCircle size={13} />}
                          {isShipping && <FiTruck size={13} />}
                          {!isDelivered && !isCancelled && !isShipping && <FiClock size={13} />}
                          <span>{statusText}</span>
                        </div>
                      </div>

                      {/* Items List */}
                      <div className={styles.itemsList}>
                        {(order.items || []).map((item: any, idx: number) => (
                          <div key={idx} className={styles.itemRow}>
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                              src={item.image || 'https://images.unsplash.com/photo-1581655353564-df123a1eb820?w=100'}
                              alt={item.name}
                              className={styles.itemImg}
                            />
                            <div className={styles.itemDetails}>
                              <div className={styles.itemName}>{item.name}</div>
                              <div className={styles.itemMeta}>
                                {item.variant ? (
                                  <span style={{ marginRight: 8 }}>
                                    Phân loại: {typeof item.variant === 'object' ? Object.values(item.variant).join(' - ') : String(item.variant)}
                                  </span>
                                ) : null}
                                <span>Số lượng: x{item.quantity || 1}</span>
                              </div>
                            </div>
                            <div className={styles.itemPrice}>{formatPrice(item.price * (item.quantity || 1))}</div>
                          </div>
                        ))}
                      </div>

                      {/* Order Footer */}
                      <div className={styles.orderFooter}>
                        <div className={styles.orderTotalWrap}>
                          <span className={styles.orderTotalLabel}>
                            Tổng thanh toán ({order.items?.length || 1} sản phẩm):
                          </span>
                          <span className={styles.orderTotalVal}>{formatPrice(order.totalAmount || 0)}</span>
                        </div>

                        <div className={styles.orderActionBtns}>
                          {order.status === 'pending' && (
                            <button
                              type="button"
                              className={styles.cancelOrderBtn}
                              onClick={() => {
                                setCancelModalOrder(order);
                                setCancelReason('Đổi ý không muốn mua nữa');
                                setCustomReason('');
                              }}
                              title="Hủy đơn hàng đang chờ xử lý"
                            >
                              <FiXCircle size={13} /> Hủy đơn
                            </button>
                          )}

                          <Link
                            href={`/tracking?code=${encodeURIComponent(order.orderCode)}`}
                            className={styles.trackBtn}
                          >
                            <FiTruck size={14} /> Theo dõi
                          </Link>

                          <button
                            type="button"
                            className={styles.supportBtn}
                            onClick={() => handleReorder(order)}
                            title="Mua lại các sản phẩm trong đơn này"
                          >
                            <FiRefreshCw size={13} /> Mua lại
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </>
        )}
      </div>

      {/* ===== EDIT PROFILE MODAL ===== */}
      {isEditModalOpen && (
        <div className={styles.modalOverlay} onClick={() => setIsEditModalOpen(false)}>
          <div className={styles.modalCard} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h3 className={styles.modalTitle}>Chỉnh Sửa Thông Tin</h3>
              <button
                type="button"
                className={styles.modalCloseBtn}
                onClick={() => setIsEditModalOpen(false)}
              >
                <FiX size={18} />
              </button>
            </div>

            <form onSubmit={handleSaveProfile} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                <label style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-muted, #94a3b8)' }}>
                  Họ và tên *
                </label>
                <input
                  type="text"
                  required
                  className={styles.searchInput}
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                />
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                <label style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-muted, #94a3b8)' }}>
                  Số điện thoại nhận hàng
                </label>
                <input
                  type="tel"
                  className={styles.searchInput}
                  placeholder="0988123456"
                  value={editPhone}
                  onChange={(e) => setEditPhone(e.target.value)}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 8 }}>
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  style={{
                    padding: '9px 16px',
                    borderRadius: 8,
                    background: 'var(--bg-main, #090a0f)',
                    color: 'var(--text-muted, #94a3b8)',
                    border: '1px solid var(--border-color, #232838)',
                    cursor: 'pointer',
                    fontWeight: 600,
                  }}
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={isUpdating}
                  style={{
                    padding: '9px 18px',
                    borderRadius: 8,
                    background: 'var(--primary, #3b82f6)',
                    color: '#ffffff',
                    border: 'none',
                    cursor: 'pointer',
                    fontWeight: 700,
                  }}
                >
                  {isUpdating ? 'Đang lưu...' : 'Lưu Thay Đổi'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ===== LOGOUT CONFIRM MODAL ===== */}
      {isLogoutModalOpen && (
        <div className={styles.modalOverlay} onClick={() => setIsLogoutModalOpen(false)}>
          <div className={styles.modalCard} onClick={(e) => e.stopPropagation()} style={{ maxWidth: 360, textAlign: 'center' }}>
            <div style={{ width: 54, height: 54, borderRadius: '50%', background: 'rgba(239, 68, 68, 0.15)', color: '#ef4444', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px', fontSize: 24 }}>
              <FiLogOut />
            </div>
            <h3 style={{ fontSize: 16, fontWeight: 800, color: 'var(--text-main, #f8fafc)', margin: '0 0 6px' }}>
              Xác Nhận Đăng Xuất?
            </h3>
            <p style={{ fontSize: 13, color: 'var(--text-muted, #94a3b8)', margin: '0 0 18px', lineHeight: 1.4 }}>
              Bạn có chắc chắn muốn đăng xuất khỏi tài khoản <strong>"{user?.name}"</strong>?
            </p>

            <div style={{ display: 'flex', gap: 10 }}>
              <button
                type="button"
                onClick={() => setIsLogoutModalOpen(false)}
                style={{
                  flex: 1,
                  padding: '10px',
                  borderRadius: 8,
                  background: 'var(--bg-main, #090a0f)',
                  color: 'var(--text-muted, #94a3b8)',
                  border: '1px solid var(--border-color, #232838)',
                  cursor: 'pointer',
                  fontWeight: 600,
                  fontSize: 13,
                }}
              >
                Hủy bỏ
              </button>
              <button
                type="button"
                onClick={() => {
                  setIsLogoutModalOpen(false);
                  logout();
                  router.push('/');
                }}
                style={{
                  flex: 1,
                  padding: '10px',
                  borderRadius: 8,
                  background: '#ef4444',
                  color: '#ffffff',
                  border: 'none',
                  cursor: 'pointer',
                  fontWeight: 700,
                  fontSize: 13,
                }}
              >
                Đăng Xuất
              </button>
            </div>
          </div>
        </div>
      )}
      {/* ===== CANCEL ORDER CONFIRMATION MODAL ===== */}
      {cancelModalOrder && (
        <div className={styles.modalOverlay} onClick={() => !isCancelling && setCancelModalOrder(null)}>
          <div className={styles.modalCard} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <FiXCircle size={20} color="#ef4444" />
                <h3 className={styles.modalTitle} style={{ color: '#ef4444' }}>Xác Nhận Hủy Đơn Hàng</h3>
              </div>
              <button
                type="button"
                className={styles.modalCloseBtn}
                disabled={isCancelling}
                onClick={() => setCancelModalOrder(null)}
              >
                <FiX size={18} />
              </button>
            </div>

            <div style={{ background: 'var(--bg-main, #090a0f)', padding: '12px 14px', borderRadius: 10, border: '1px solid var(--border-color, #232838)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                <span style={{ fontSize: 12, color: 'var(--text-muted, #94a3b8)' }}>Mã đơn hàng:</span>
                <strong style={{ fontSize: 13, color: 'var(--primary, #3b82f6)', fontFamily: 'monospace' }}>
                  #{cancelModalOrder.orderCode}
                </strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ fontSize: 12, color: 'var(--text-muted, #94a3b8)' }}>Tổng tiền thanh toán:</span>
                <strong style={{ fontSize: 13, color: 'var(--text-main, #f8fafc)' }}>
                  {formatPrice(cancelModalOrder.totalAmount || 0)}
                </strong>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <label style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-muted, #94a3b8)' }}>
                Vui lòng chọn lý do hủy đơn:
              </label>
              {[
                'Đổi ý không muốn mua nữa',
                'Muốn thay đổi địa chỉ nhận hàng',
                'Muốn đổi mẫu / kích thước khác',
                'Tìm thấy sản phẩm giá tốt hơn',
                'Thời gian giao hàng dự kiến lâu',
                'Khác',
              ].map((reason) => (
                <label
                  key={reason}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8,
                    fontSize: 12.5,
                    color: cancelReason === reason ? 'var(--text-main, #fff)' : 'var(--text-muted, #94a3b8)',
                    cursor: 'pointer',
                    padding: '4px 0',
                  }}
                >
                  <input
                    type="radio"
                    name="cancelReason"
                    value={reason}
                    checked={cancelReason === reason}
                    onChange={(e) => setCancelReason(e.target.value)}
                  />
                  <span>{reason}</span>
                </label>
              ))}

              {cancelReason === 'Khác' && (
                <textarea
                  placeholder="Nhập lý do hủy đơn cụ thể..."
                  className={styles.searchInput}
                  style={{ minHeight: 60, marginTop: 4, resize: 'vertical' }}
                  value={customReason}
                  onChange={(e) => setCustomReason(e.target.value)}
                />
              )}
            </div>

            <div style={{ display: 'flex', gap: 10, marginTop: 8 }}>
              <button
                type="button"
                disabled={isCancelling}
                onClick={() => setCancelModalOrder(null)}
                style={{
                  flex: 1,
                  padding: '10px',
                  borderRadius: 8,
                  background: 'var(--bg-main, #090a0f)',
                  color: 'var(--text-muted, #94a3b8)',
                  border: '1px solid var(--border-color, #232838)',
                  cursor: isCancelling ? 'not-allowed' : 'pointer',
                  fontWeight: 600,
                  fontSize: 13,
                }}
              >
                Giữ lại đơn
              </button>
              <button
                type="button"
                disabled={isCancelling}
                onClick={handleCancelOrder}
                style={{
                  flex: 1,
                  padding: '10px',
                  borderRadius: 8,
                  background: '#ef4444',
                  color: '#ffffff',
                  border: 'none',
                  cursor: isCancelling ? 'not-allowed' : 'pointer',
                  fontWeight: 700,
                  fontSize: 13,
                  opacity: isCancelling ? 0.7 : 1,
                }}
              >
                {isCancelling ? 'Đang hủy...' : 'Xác Nhận Hủy'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
