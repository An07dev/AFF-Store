'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  FiZap,
  FiShoppingBag,
  FiTruck,
  FiCreditCard,
  FiBarChart2,
  FiMessageSquare,
  FiCheck,
  FiChevronDown,
  FiChevronUp,
  FiChevronRight,
  FiArrowRight,
  FiLayers,
  FiShield,
  FiStar,
  FiCheckCircle,
  FiExternalLink,
  FiSmartphone,
  FiPackage,
  FiClock,
  FiGift,
  FiAward,
  FiMail,
  FiMenu,
  FiX,
  FiZoomIn,
  FiChevronLeft,
} from 'react-icons/fi';
import { CoolMode } from '@/registry/magicui/cool-mode';
import { OrbitingCircles } from '@/registry/magicui/orbiting-circles';
import { AnimatedList } from '@/registry/magicui/animated-list';
import styles from './page.module.css';

interface ComparisonNotificationItem {
  name: string;
  description: string;
  time: string;
  icon: string;
  color: string;
  isPositive?: boolean;
}

const rawPainPoints: ComparisonNotificationItem[] = [
  {
    name: 'Bị trừ 12.5% phí sàn',
    description: 'Mất 48.000₫ trên đơn 400K, bào mòn sạch biên lợi nhuận',
    time: 'Vừa xong',
    icon: '💸',
    color: 'rgba(239, 68, 68, 0.25)',
    isPositive: false,
  },
  {
    name: 'Bị giam tiền hàng 10 ngày',
    description: 'Chôn vốn xoay vòng, đối soát phức tạp và chậm trễ',
    time: '2m ago',
    icon: '⏳',
    color: 'rgba(249, 115, 22, 0.25)',
    isPositive: false,
  },
  {
    name: 'Bị ẩn 100% SĐT khách',
    description: 'Sàn độc quyền data, không thể remarketing Zalo / Tele',
    time: '5m ago',
    icon: '🚫',
    color: 'rgba(239, 68, 68, 0.25)',
    isPositive: false,
  },
  {
    name: 'Nguy cơ bị khóa shop vô lý',
    description: 'Quét lỗi thuật toán bất chợt, đối thủ chơi xấu ép giá',
    time: '12m ago',
    icon: '⚠️',
    color: 'rgba(234, 179, 8, 0.25)',
    isPositive: false,
  },
  {
    name: 'Thất thoát 35% pixel iOS',
    description: 'Không thể gắn Meta CAPI chuẩn, giá thầu Ads đắt đỏ',
    time: '18m ago',
    icon: '📉',
    color: 'rgba(239, 68, 68, 0.25)',
    isPositive: false,
  },
  {
    name: 'Bị phạt vì trả lời chat trễ',
    description: 'Hạ điểm vận hành shop nếu không trực máy 24/7',
    time: '25m ago',
    icon: '🤖',
    color: 'rgba(249, 115, 22, 0.25)',
    isPositive: false,
  },
];

const rawShopTikBenefits: ComparisonNotificationItem[] = [
  {
    name: 'Khớp lệnh VietQR 1s',
    description: 'Tiền bắn thẳng vào tài khoản MBBank ngay khi khách quét',
    time: 'Vừa xong',
    icon: '⚡',
    color: 'rgba(16, 185, 129, 0.3)',
    isPositive: true,
  },
  {
    name: '0% Phí Sàn Trọn Đời',
    description: 'Giữ trọn 100% doanh thu, không mất thêm bất kỳ đồng phí nào',
    time: '1m ago',
    icon: '💰',
    color: 'rgba(16, 185, 129, 0.3)',
    isPositive: true,
  },
  {
    name: 'Sở hữu 100% Data Khách',
    description: 'Tự động lưu SĐT, Tên, Địa chỉ & Lịch sử mua vào Database',
    time: '4m ago',
    icon: '👥',
    color: 'rgba(99, 102, 241, 0.3)',
    isPositive: true,
  },
  {
    name: 'Đẩy đơn GHN / GHTK 1-Click',
    description: 'Tự động tính phí ship theo km, bưu tá tự đến lấy hàng',
    time: '8m ago',
    icon: '🚚',
    color: 'rgba(59, 130, 246, 0.3)',
    isPositive: true,
  },
  {
    name: 'Chuẩn Meta CAPI & TikTok Events',
    description: 'Đo lường sự kiện Purchase 100%, giảm 40% chi phí chạy Ads',
    time: '15m ago',
    icon: '🎯',
    color: 'rgba(168, 85, 247, 0.3)',
    isPositive: true,
  },
  {
    name: 'Tự động gửi Email & Zalo 24/7',
    description: 'Xác nhận đơn hàng tức thì, nâng cao uy tín và tỷ lệ nhận hàng',
    time: '22m ago',
    icon: '✉️',
    color: 'rgba(16, 185, 129, 0.3)',
    isPositive: true,
  },
];

const painPointsList = Array.from({ length: 6 }, () => rawPainPoints).flat();
const benefitsList = Array.from({ length: 6 }, () => rawShopTikBenefits).flat();

export default function LandingPage() {
  // Mobile Menu State
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // 399k Package Order Modal State
  const [isPackageModalOpen, setIsPackageModalOpen] = useState(false);
  const [orderName, setOrderName] = useState('');
  const [orderPhone, setOrderPhone] = useState('');
  const [orderEmail, setOrderEmail] = useState('');
  const [orderNotes, setOrderNotes] = useState('');
  const [orderCode, setOrderCode] = useState('');
  const [isOrderSubmitting, setIsOrderSubmitting] = useState(false);
  const [isOrderSubmitted, setIsOrderSubmitted] = useState(false);
  const [copiedField, setCopiedField] = useState<string | null>(null);

  // Testimonials Carousel State & Auto-Play Timer
  const [currentTestimonial, setCurrentTestimonial] = useState(0);
  const [isTestimonialHovered, setIsTestimonialHovered] = useState(false);

  const testimonials = [
    {
      avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&auto=format&fit=crop&q=80",
      name: "Nguyễn Thu Hằng",
      title: "CEO & Founder • Hằng Boutique Fashion",
      quote: "Từ ngày chuyển sang dùng tính năng quét mã VietQR tự động của ShopTik, bên mình tiết kiệm hẳn 2 nhân sự trực đối soát sao kê ngân hàng. Khách chuyển tiền xong là web tự báo thành công ngay trong 1 giây, tiền về thẳng tài khoản mà không mất một đồng phí sàn nào!"
    },
    {
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&auto=format&fit=crop&q=80",
      name: "Trần Hoàng Minh",
      title: "Founder • TechZone Phụ Kiện Cao Cấp",
      quote: "Quảng cáo Facebook và TikTok của shop mình từng bị rớt 30% đơn vì khách dùng iOS chặn cookie. Sau khi tích hợp Meta CAPI và TikTok Events API server-side của ShopTik, số liệu đo lường chuẩn đét 100%, giá thầu CPA giảm rõ rệt và ROI tăng vọt."
    },
    {
      avatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=300&auto=format&fit=crop&q=80",
      name: "Lê Phương Thảo",
      title: "Quản Lý Vận Hành • Thảo House Living Decor",
      quote: "Nút xuất đơn 1-Click sang GHN và GHTK cực kỳ tiện lợi. Đơn hàng khách chọn hãng nào là hệ thống tự gọi đúng hãng đó, shipper qua lấy hàng theo mã vận đơn in sẵn, khách có trang tra cứu lộ trình 5 bước cực kỳ chuyên nghiệp."
    },
  ];

  // Auto-scroll / Auto-advance testimonial every 4.5 seconds
  useEffect(() => {
    if (isTestimonialHovered) return;
    const timer = setInterval(() => {
      setCurrentTestimonial((prev) => (prev + 1) % testimonials.length);
    }, 4500);
    return () => clearInterval(timer);
  }, [isTestimonialHovered, testimonials.length]);

  // Lightbox / Image Preview State
  const [activePreviewIndex, setActivePreviewIndex] = useState<number | null>(null);

  const heroGallery = [
    {
      src: '/images/preview-admin-dashboard.png',
      title: '📊 Báo Cáo Kinh Doanh & Phân Tích Doanh Thu Admin',
      desc: 'Bảng điều khiển Admin theo dõi doanh thu thực nhận 7.358.000đ, biểu đồ tăng trưởng, phân bổ trạng thái đơn và danh sách đơn mới nhất.',
      tag: 'Báo Cáo & Doanh Thu',
      badge: '7.358K',
    },
    {
      src: '/images/preview-admin-theme.png',
      title: '🎨 Cấu Hình Giao Diện & 7 Bộ Multi-Themes Hệ Thống',
      desc: 'Tùy biến nhanh 7 theme (Shopee, TikTok Shop, Neon, Minimal...), thay đổi màu sắc, logo thương hiệu và xem trước Live Preview realtime.',
      tag: 'Đổi Giao Diện Realtime',
      badge: '7 Themes',
    },
    {
      src: '/images/preview-product.png',
      title: '👕 Chi Tiết Sản Phẩm & Phân Loại Biến Thể Size/Màu',
      desc: 'Giao diện sản phẩm chuẩn sàn TMĐT, đếm số người đang xem, lưu voucher của shop, chọn phân loại hàng và mua ngay không cần đăng nhập.',
      tag: 'Sản Phẩm & Phân Loại',
      badge: '229K',
    },
    {
      src: '/images/preview-mobile.png',
      title: '📱 Mobile App & Popup FOMO Thông Báo Đơn Hàng Live',
      desc: 'Tối ưu 100% trải nghiệm điện thoại thông minh, khung iPhone tinh tế, popup thông báo khách vừa mua hàng kích thích chốt đơn tức thì.',
      tag: 'Mobile App & FOMO',
      badge: 'Live',
    },
    {
      src: '/images/preview-feed.png',
      title: '🛍️ Danh Mục Gợi Ý Hôm Nay Chuẩn Sàn TMĐT',
      desc: 'Gợi ý sản phẩm thông minh, gắn nhãn Freeship XTRA, Yêu thích+, % giảm giá và bộ lọc danh mục hàng mượt mà.',
      tag: 'Gợi Ý Hôm Nay',
      badge: '-35%',
    },
    {
      src: '/images/preview-tracking.png',
      title: '🚚 Tra Cứu Vận Đơn 5 Bước & Cổng Thanh Toán VietQR',
      desc: 'Theo dõi tiến trình bưu tá GHN / GHTK 5 bước realtime, xuất mã VietQR SePay tự động khớp lệnh chỉ trong 1 giây.',
      tag: 'Tra Cứu Đơn Hàng',
      badge: '5 Bước',
    },
  ];

  const openPreview = (index: number) => {
    setActivePreviewIndex(index);
  };

  const closePreview = () => {
    setActivePreviewIndex(null);
  };

  const nextPreview = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    if (activePreviewIndex === null) return;
    setActivePreviewIndex((activePreviewIndex + 1) % heroGallery.length);
  };

  const prevPreview = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    if (activePreviewIndex === null) return;
    setActivePreviewIndex((activePreviewIndex - 1 + heroGallery.length) % heroGallery.length);
  };

  // Keyboard navigation for Lightbox Preview
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (activePreviewIndex !== null) {
        if (e.key === 'Escape') closePreview();
        if (e.key === 'ArrowRight') nextPreview();
        if (e.key === 'ArrowLeft') prevPreview();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activePreviewIndex]);

  // Lock body scroll when mobile drawer, modal, or image preview is open
  useEffect(() => {
    if (isMobileMenuOpen || isPackageModalOpen || activePreviewIndex !== null) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isMobileMenuOpen, isPackageModalOpen, activePreviewIndex]);

  const copyToClipboard = (text: string, fieldName: string) => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(text);
      setCopiedField(fieldName);
      setTimeout(() => setCopiedField(null), 2000);
    }
  };

  const handleOrderSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!orderName.trim() || !orderPhone.trim()) {
      alert('Vui lòng điền họ tên và số điện thoại / Zalo để nhận mã nguồn và tài liệu!');
      return;
    }

    setIsOrderSubmitting(true);
    try {
      const res = await fetch('/api/landing-leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: orderName.trim(),
          phone: orderPhone.trim(),
          email: orderEmail.trim(),
          notes: orderNotes.trim(),
        }),
      });
      const data = await res.json();
      if (data.orderCode) {
        setOrderCode(data.orderCode);
      } else {
        setOrderCode('ST399K_' + Math.floor(100000 + Math.random() * 900000));
      }
    } catch (err) {
      console.warn('Order submission offline fallback:', err);
      setOrderCode('ST399K_' + Math.floor(100000 + Math.random() * 900000));
    } finally {
      setIsOrderSubmitting(false);
      setIsOrderSubmitted(true);
    }
  };

  // Theme Showcase State
  const [activeThemeDemo, setActiveThemeDemo] = useState<'shopee' | 'tiktok' | 'dark' | 'light' | 'cyberpunk' | 'organic' | 'luxury'>('shopee');
  const [customPrimary, setCustomPrimary] = useState<string>('#ee4d2d');
  const [demoLayoutView, setDemoLayoutView] = useState<'grid' | 'list' | 'checkout'>('grid');
  const [demoBorderRadius, setDemoBorderRadius] = useState<number>(10);
  const [demoBgMode, setDemoBgMode] = useState<'default' | 'dark' | 'light'>('default');
  const [showFlashBadge, setShowFlashBadge] = useState<boolean>(true);
  const [showSoldProgress, setShowSoldProgress] = useState<boolean>(true);
  const [copiedToast, setCopiedToast] = useState<boolean>(false);
  const [copiedCouponToast, setCopiedCouponToast] = useState<boolean>(false);

  const handleCopyCoupon = () => {
    navigator.clipboard?.writeText('BIGMANMARKETING10');
    setCopiedCouponToast(true);
    setTimeout(() => setCopiedCouponToast(false), 2500);
  };

  // Interactive Feature Tab State
  const [activeFeatureTab, setActiveFeatureTab] = useState<'storefront' | 'admin' | 'automation'>('storefront');

  // FAQ Accordion State
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  const toggleFaq = (index: number) => {
    setOpenFaq(openFaq === index ? null : index);
  };

  const themePresets = {
    shopee: {
      name: 'Shopee Orange',
      primary: '#ee4d2d',
      bg: '#f8fafc',
      cardBg: '#ffffff',
      textColor: '#0f172a',
      badgeBg: '#fee2e2',
      badgeColor: '#ef4444',
      tag: 'Chuẩn Sàn TMĐT Shopee - Rực Rỡ & Kích Thích Mua Hàng',
      radius: 8,
    },
    tiktok: {
      name: 'TikTok Dark',
      primary: '#fe2c55',
      bg: '#121214',
      cardBg: '#1a1a1e',
      textColor: '#f8fafc',
      badgeBg: 'rgba(254, 44, 85, 0.2)',
      badgeColor: '#fe2c55',
      tag: 'Phong Cách TikTok Shop - Trẻ Trung, Cuốn Hút & Thời Thượng',
      radius: 8,
    },
    dark: {
      name: 'Sleek Dark Mode',
      primary: '#3b82f6',
      bg: '#090a0f',
      cardBg: '#13161f',
      textColor: '#f8fafc',
      badgeBg: 'rgba(59, 130, 246, 0.2)',
      badgeColor: '#60a5fa',
      tag: 'Giao Diện Xanh Than Sang Trọng - Đậm Chất Công Nghệ',
      radius: 12,
    },
    light: {
      name: 'Clean Light Mode',
      primary: '#2563eb',
      bg: '#f8fafc',
      cardBg: '#ffffff',
      textColor: '#0f172a',
      badgeBg: '#dbeafe',
      badgeColor: '#1d4ed8',
      tag: 'Trắng Sạch Tinh Tế - Thanh Lịch & Tối Ưu Đọc Nội Dung',
      radius: 8,
    },
    cyberpunk: {
      name: 'Neon Cyberpunk',
      primary: '#a855f7',
      bg: '#0a0614',
      cardBg: '#160d29',
      textColor: '#f8fafc',
      badgeBg: 'rgba(168, 85, 247, 0.25)',
      badgeColor: '#c084fc',
      tag: 'Tím Neon Tương Lai - Cá Tính & Đột Phá Độc Bản',
      radius: 14,
    },
    organic: {
      name: 'Eco Matcha',
      primary: '#10b981',
      bg: '#05140e',
      cardBg: '#0b241a',
      textColor: '#f8fafc',
      badgeBg: 'rgba(16, 185, 129, 0.25)',
      badgeColor: '#34d399',
      tag: 'Xanh Lá Tươi Mát - Chuẩn Sản Phẩm Organic & Health',
      radius: 16,
    },
    luxury: {
      name: 'Luxury Gold',
      primary: '#f59e0b',
      bg: '#0d0b07',
      cardBg: '#1c170f',
      textColor: '#f8fafc',
      badgeBg: 'rgba(245, 158, 11, 0.25)',
      badgeColor: '#fbbf24',
      tag: 'Vàng Kim Hoàng Gia - Đẳng Cấp Thượng Lưu',
      radius: 6,
    },
  };

  const handleSelectPreset = (key: keyof typeof themePresets) => {
    setActiveThemeDemo(key);
    setCustomPrimary(themePresets[key].primary);
    setDemoBorderRadius(themePresets[key].radius);
  };

  const baseTheme = themePresets[activeThemeDemo];
  const effectivePrimary = customPrimary;
  const effectiveBg =
    demoBgMode === 'dark'
      ? '#0d0f15'
      : demoBgMode === 'light'
        ? '#ffffff'
        : baseTheme.bg;
  const effectiveCardBg =
    demoBgMode === 'dark'
      ? '#161922'
      : demoBgMode === 'light'
        ? '#f1f5f9'
        : baseTheme.cardBg;
  const effectiveTextColor =
    demoBgMode === 'light' ? '#0f172a' : demoBgMode === 'dark' ? '#f8fafc' : baseTheme.textColor;

  const colorSwatches = [
    '#ee4d2d',
    '#fe2c55',
    '#3b82f6',
    '#10b981',
    '#8b5cf6',
    '#f59e0b',
    '#ec4899',
    '#06b6d4',
  ];

  const handleCopyCss = () => {
    const cssCode = `:root {\n  --primary: ${effectivePrimary};\n  --bg-main: ${effectiveBg};\n  --card-bg: ${effectiveCardBg};\n  --border-radius: ${demoBorderRadius}px;\n}`;
    navigator.clipboard?.writeText(cssCode);
    setCopiedToast(true);
    setTimeout(() => setCopiedToast(false), 2500);
  };

  return (
    <div className={styles.page}>
      {/* Background Ambient Glows */}
      <div className={styles.ambientGlowTop} />
      <div className={styles.ambientGlowCenter} />
      <div className={styles.ambientGlowBottom} />

      {/* ==========================================================================
         RAREBLOCKS CLARITY E-COMMERCE HEADER & HERO SECTION
         ========================================================================== */}
      <section className={styles.rareSection}>
        <header className={styles.rareHeader}>
          <div className={styles.rareHeaderContainer}>
            <div className={styles.rareHeaderInner}>
              <div className={styles.rareLogoWrap}>
                <Link href="/landing" className={styles.rareLogoLink} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div style={{ width: 32, height: 32, borderRadius: 8, background: 'linear-gradient(135deg, #6366f1, #4f46e5)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff' }}>
                    <FiShoppingBag size={18} />
                  </div>
                  <span style={{ fontWeight: 900, fontSize: 20, color: '#fff', letterSpacing: -0.5 }}>
                    ShopTik<span style={{ color: '#818cf8' }}>.</span>
                  </span>
                </Link>
              </div>

              <div className={styles.rareNavLinks}>
                <a href="#goi-ngoai-san" className={styles.rareNavLink} style={{ color: '#a5b4fc', fontWeight: 700 }}>⚡ Gói 399K</a>
                <a href="#so-sanh" className={styles.rareNavLink}>So Sánh</a>
                <a href="#features" className={styles.rareNavLink}>Tính Năng</a>
                <a href="#themes" className={styles.rareNavLink}>Theme</a>
                <a href="#hosting" className={styles.rareNavLink}>Hosting</a>
                <a href="#faq" className={styles.rareNavLink}>Hỏi Đáp</a>
              </div>

              <div className={styles.rareHeaderRight}>
                <CoolMode options={{ particle: "⚡" }}>
                  <button
                    type="button"
                    className={styles.rareBtnPrimary}
                    style={{
                      padding: '8px 18px',
                      fontSize: 13.5,
                      fontWeight: 800,
                      borderRadius: 9999,
                      background: 'linear-gradient(135deg, #6366f1, #4f46e5)',
                      color: '#ffffff',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 6,
                      border: 'none',
                      cursor: 'pointer',
                      boxShadow: '0 4px 14px rgba(99, 102, 241, 0.4)',
                    }}
                    onClick={() => setIsPackageModalOpen(true)}
                  >
                    <FiZap size={14} /> Mua Gói 399K
                  </button>
                </CoolMode>

                <button
                  type="button"
                  className={styles.rareMobileMenuBtn}
                  onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                  aria-label="Menu"
                >
                  <svg className={styles.rareIcon} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </header>

        {/* Mobile Navigation Drawer Overlay */}
        {isMobileMenuOpen && (
          <div className={styles.mobileDrawerOverlay} onClick={() => setIsMobileMenuOpen(false)}>
            <div className={styles.mobileMenuDrawer} onClick={(e) => e.stopPropagation()}>
              <div className={styles.drawerHeader}>
                <div className={styles.drawerLogo}>
                  <div style={{ width: 28, height: 28, borderRadius: 7, background: 'linear-gradient(135deg, #6366f1, #4f46e5)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff' }}>
                    <FiShoppingBag size={16} />
                  </div>
                  <span style={{ fontWeight: 800, fontSize: 18, color: '#fff' }}>
                    ShopTik<span style={{ color: '#818cf8' }}>.</span>
                  </span>
                </div>
                <button
                  type="button"
                  className={styles.drawerCloseBtn}
                  onClick={() => setIsMobileMenuOpen(false)}
                  aria-label="Đóng menu"
                >
                  <FiX size={20} />
                </button>
              </div>

              <div className={styles.drawerNavSection}>
                <div className={styles.drawerSectionLabel}>ĐIỀU HƯỚNG NHANH</div>
                <div className={styles.drawerNavList}>
                  <a href="#goi-ngoai-san" className={`${styles.drawerNavItem} ${styles.drawerNavItemHighlight}`} onClick={() => setIsMobileMenuOpen(false)}>
                    <div className={styles.drawerNavLeft}>
                      <span className={styles.drawerNavEmoji}>⚡</span>
                      <span className={styles.drawerNavText}>Gói Bán Hàng Ngoại Sàn (399K)</span>
                    </div>
                    <span className={styles.drawerHotBadge}>HOT</span>
                  </a>
                  <a href="#so-sanh" className={styles.drawerNavItem} onClick={() => setIsMobileMenuOpen(false)}>
                    <div className={styles.drawerNavLeft}>
                      <span className={styles.drawerNavEmoji}>⚖️</span>
                      <span className={styles.drawerNavText}>So Sánh: Trên Sàn vs Ngoại Sàn</span>
                    </div>
                    <FiChevronRight size={18} className={styles.drawerNavChevron} />
                  </a>
                  <a href="#features" className={styles.drawerNavItem} onClick={() => setIsMobileMenuOpen(false)}>
                    <div className={styles.drawerNavLeft}>
                      <span className={styles.drawerNavEmoji}>✨</span>
                      <span className={styles.drawerNavText}>6 Trụ Cột Đột Phá Khác Biệt</span>
                    </div>
                    <FiChevronRight size={18} className={styles.drawerNavChevron} />
                  </a>
                  <a href="#themes" className={styles.drawerNavItem} onClick={() => setIsMobileMenuOpen(false)}>
                    <div className={styles.drawerNavLeft}>
                      <span className={styles.drawerNavEmoji}>🎨</span>
                      <span className={styles.drawerNavText}>Thử Nghiệm Multi-Theme</span>
                    </div>
                    <FiChevronRight size={18} className={styles.drawerNavChevron} />
                  </a>
                  <a href="#hosting" className={styles.drawerNavItem} onClick={() => setIsMobileMenuOpen(false)}>
                    <div className={styles.drawerNavLeft}>
                      <span className={styles.drawerNavEmoji}>🌐</span>
                      <span className={styles.drawerNavText}>Cài Đặt Hosting 0đ Trọn Đời</span>
                    </div>
                    <FiChevronRight size={18} className={styles.drawerNavChevron} />
                  </a>
                  <a href="#faq" className={styles.drawerNavItem} onClick={() => setIsMobileMenuOpen(false)}>
                    <div className={styles.drawerNavLeft}>
                      <span className={styles.drawerNavEmoji}>❓</span>
                      <span className={styles.drawerNavText}>Câu Hỏi Thường Gặp (FAQ)</span>
                    </div>
                    <FiChevronRight size={18} className={styles.drawerNavChevron} />
                  </a>
                </div>
              </div>

              <div className={styles.drawerCtas}>
                <CoolMode options={{ particle: "⚡" }}>
                  <button
                    type="button"
                    className={styles.drawerPrimaryBtn}
                    onClick={() => {
                      setIsMobileMenuOpen(false);
                      setIsPackageModalOpen(true);
                    }}
                  >
                    <FiZap size={18} />
                    <span>Mua Gói 399K Ngay</span>
                  </button>
                </CoolMode>
                <Link
                  href="/"
                  className={styles.drawerSecondaryBtn}
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <FiShoppingBag size={17} />
                  <span>Trải Nghiệm Demo Cửa Hàng</span>
                </Link>
              </div>
            </div>
          </div>
        )}

        {/* Hero Section with Left Copy and Right 3D Isometric Showcase */}
        <div className={styles.rareHeroWrap}>
          <div className={styles.rareHeroContainer}>
            {/* Left Column: Headline, Copy, CTA Buttons & Trust Badges */}
            <div className={styles.rareHeroContent}>
              <div className={styles.rareBadgePill}>
                <FiZap style={{ color: '#818cf8' }} /> GIẢI PHÁP BÁN HÀNG NGOẠI SÀN 2026 • 0% PHÍ SÀN
              </div>

              <h1 className={styles.rareHeroTitle}>
                Nền Tảng Bán Hàng Ngoại Sàn <span className={styles.rareGradientText}>Đột Phá Lợi Nhuận</span> & Tự Động Hóa 100%
              </h1>
              <p className={styles.rareHeroDesc}>
                Không còn nỗi lo bị trừ <strong>10% - 15% phí sàn</strong>, bị giam tiền hàng hay rủi ro khóa shop vô lý.
                Sở hữu ngay hệ thống bán hàng độc lập: <strong>VietQR tự động 1s</strong>, <strong>vận chuyển GHN/GHTK 1-Click</strong> và <strong>đo lường Meta/TikTok CAPI chuẩn 100%</strong>.
              </p>

              <div className={styles.rareHeroCtas}>
                <CoolMode options={{ particle: "🔥" }}>
                  <button
                    type="button"
                    className={styles.rareBtnPrimary}
                    onClick={(e) => {
                      e.preventDefault();
                      setIsPackageModalOpen(true);
                    }}
                  >
                    <FiZap size={18} /> Đăng Ký Gói 399K Ngay
                  </button>
                </CoolMode>

                <CoolMode options={{ particle: "✨" }}>
                  <Link
                    href="/"
                    className={styles.rareBtnSecondary}
                  >
                    <FiShoppingBag size={18} /> Trải Nghiệm Demo Cửa Hàng
                  </Link>
                </CoolMode>
              </div>

              <div className={styles.rareTrustBadges}>
                <div className={styles.rareTrustItem}>
                  <FiCheckCircle className={styles.rareTrustIcon} size={15} />
                  <span>0% Phí Sàn Trọn Đời</span>
                </div>
                <div className={styles.rareTrustItem}>
                  <FiCheckCircle className={styles.rareTrustIcon} size={15} />
                  <span>Sở Hữu 100% Data Khách</span>
                </div>
                <div className={styles.rareTrustItem}>
                  <FiCheckCircle className={styles.rareTrustIcon} size={15} />
                  <span>Tiền Về TK Ngân Hàng 1s</span>
                </div>
                <div className={styles.rareTrustItem}>
                  <FiCheckCircle className={styles.rareTrustIcon} size={15} />
                  <span>Up Hosting Là Chạy Ngay</span>
                </div>
              </div>
            </div>

            {/* Right Column: 3D Isometric Real Store Multi-Image Showcase */}
            <div className={styles.rareIsoShowcase}>
              <div className={styles.rareIsoStage}>
                {/* Floating Badges */}
                <div className={styles.rareFloatingBadge1}>
                  <FiZap /> VietQR Khớp Lệnh 1s
                </div>
                <div className={styles.rareFloatingBadge2}>
                  <FiTruck /> GHN / GHTK 1-Click
                </div>
                <div className={styles.rareFloatingBadge3}>
                  <FiBarChart2 /> Meta & TikTok CAPI
                </div>

                {/* 3D 6-Card Large Grid */}
                <div className={styles.rareIsoGrid}>
                  {/* Card 1: Admin Dashboard Báo Cáo Doanh Thu (Ảnh mới 1) */}
                  <div
                    className={`${styles.rareIsoCard} ${styles.rareIsoCard1}`}
                    onClick={() => openPreview(0)}
                    title="Bấm để xem ảnh lớn"
                  >
                    <div className={styles.rareIsoZoomHint}>
                      <FiZoomIn size={12} /> Phóng to
                    </div>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src="/images/preview-admin-dashboard.png"
                      alt="Dashboard Quản trị Báo Cáo Doanh Thu"
                      className={styles.rareIsoImg}
                    />
                    <div className={styles.rareIsoCardFooter}>
                      <span className={styles.rareIsoCardTag}>📊 Báo Cáo & Doanh Thu</span>
                      <span style={{ color: '#10b981' }}>7.358K</span>
                    </div>
                  </div>

                  {/* Card 2: Admin Cấu Hình Theme & Live View (Ảnh mới 2) */}
                  <div
                    className={`${styles.rareIsoCard} ${styles.rareIsoCard2}`}
                    onClick={() => openPreview(1)}
                    title="Bấm để xem ảnh lớn"
                  >
                    <div className={styles.rareIsoZoomHint}>
                      <FiZoomIn size={12} /> Phóng to
                    </div>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src="/images/preview-admin-theme.png"
                      alt="Cấu Hình Theme & Live Preview"
                      className={styles.rareIsoImg}
                    />
                    <div className={styles.rareIsoCardFooter}>
                      <span className={styles.rareIsoCardTag}>🎨 Đổi Giao Diện Realtime</span>
                      <span style={{ color: '#818cf8' }}>7 Themes</span>
                    </div>
                  </div>

                  {/* Card 3: Chi Tiết Sản Phẩm & Biến Thể (Ảnh 5) */}
                  <div
                    className={`${styles.rareIsoCard} ${styles.rareIsoCard3}`}
                    onClick={() => openPreview(2)}
                    title="Bấm để xem ảnh lớn"
                  >
                    <div className={styles.rareIsoZoomHint}>
                      <FiZoomIn size={12} /> Phóng to
                    </div>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src="/images/preview-product.png"
                      alt="Chi tiết sản phẩm & biến thể size màu"
                      className={styles.rareIsoImg}
                    />
                    <div className={styles.rareIsoCardFooter}>
                      <span className={styles.rareIsoCardTag}>👕 Sản Phẩm & Phân Loại</span>
                      <span style={{ color: '#f59e0b' }}>229K</span>
                    </div>
                  </div>

                  {/* Card 4: Mobile App iPhone & Popup FOMO (Ảnh 2) */}
                  <div
                    className={`${styles.rareIsoCard} ${styles.rareIsoCard4}`}
                    onClick={() => openPreview(3)}
                    title="Bấm để xem ảnh lớn"
                  >
                    <div className={styles.rareIsoZoomHint}>
                      <FiZoomIn size={12} /> Phóng to
                    </div>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src="/images/preview-mobile.png"
                      alt="Mobile App & FOMO live"
                      className={styles.rareIsoImg}
                    />
                    <div className={styles.rareIsoCardFooter}>
                      <span className={styles.rareIsoCardTag}>📱 Mobile App & FOMO</span>
                      <span style={{ color: '#ef4444' }}>Live</span>
                    </div>
                  </div>

                  {/* Card 5: Gợi Ý Hôm Nay (Ảnh 4) */}
                  <div
                    className={`${styles.rareIsoCard} ${styles.rareIsoCard5}`}
                    onClick={() => openPreview(4)}
                    title="Bấm để xem ảnh lớn"
                  >
                    <div className={styles.rareIsoZoomHint}>
                      <FiZoomIn size={12} /> Phóng to
                    </div>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src="/images/preview-feed.png"
                      alt="Gợi ý sản phẩm chuẩn sàn TMĐT"
                      className={styles.rareIsoImg}
                    />
                    <div className={styles.rareIsoCardFooter}>
                      <span className={styles.rareIsoCardTag}>🛍️ Gợi Ý Hôm Nay</span>
                      <span style={{ color: '#ec4899' }}>-35%</span>
                    </div>
                  </div>

                  {/* Card 6: Tra Cứu Vận Đơn 5 Bước (Ảnh 3) */}
                  <div
                    className={`${styles.rareIsoCard} ${styles.rareIsoCard6}`}
                    onClick={() => openPreview(5)}
                    title="Bấm để xem ảnh lớn"
                  >
                    <div className={styles.rareIsoZoomHint}>
                      <FiZoomIn size={12} /> Phóng to
                    </div>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src="/images/preview-tracking.png"
                      alt="Tra cứu vận đơn 5 bước & VietQR"
                      className={styles.rareIsoImg}
                    />
                    <div className={styles.rareIsoCardFooter}>
                      <span className={styles.rareIsoCardTag}>🚚 Tra Cứu Đơn Hàng</span>
                      <span style={{ color: '#60a5fa' }}>5 Bước</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ==========================================================================
         70% CENTERED BODY CONTENT WRAPPER
         ========================================================================== */}
      <div className={styles.content70Wrapper}>
        {/* ==========================================================================
           3. MAGIC UI ORBITING CIRCLES / ECOSYSTEM & PARTNERS SECTION
           ========================================================================== */}
        <section className={styles.orbitSection}>
          <div className={styles.floatLogoContainer}>
            <div className={styles.floatLogoHeader}>
              <div className={styles.floatLogoBadge}>
                <FiZap /> HỆ SINH THÁI TÍCH HỢP
              </div>
              <h2 className={styles.floatLogoTitle}>
                Công Nghệ & Đối Tác Vận Hành Hàng Đầu
              </h2>
              <p className={styles.floatLogoDesc}>
                Hạ tầng Next.js 16 kết hợp cổng thanh toán VietQR tự động 1s, đối tác vận chuyển toàn quốc và API đo lường Ads chuẩn 100%.
              </p>
            </div>

            {/* Orbiting Circles Container */}
            <div className={styles.orbitContainer}>
              {/* Center Core */}
              <div className={styles.orbitCenterCore}>
                <div className={styles.orbitCenterIcon}>
                  <FiShoppingBag size={36} />
                </div>
                <span className={styles.orbitCenterText}>ShopTik Core</span>
                <span className={styles.orbitCenterSub}>Next.js 16</span>
              </div>

              {/* Inner Orbit (Radius 180px) */}
              <OrbitingCircles iconSize={82} radius={180} duration={28} speed={1}>
                {/* 1. GHN */}
                <div className={styles.orbitBadge} title="Giao Hàng Nhanh (GHN)">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src="/images/logo-ghn.png" alt="GHN" className={styles.orbitImg} />
                </div>
                {/* 2. GHTK */}
                <div className={styles.orbitBadge} title="Giao Hàng Tiết Kiệm (GHTK)">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src="/images/logo-ghtk.png" alt="GHTK" className={styles.orbitImg} />
                </div>
                {/* 3. Viettel Post */}
                <div className={styles.orbitBadge} title="Viettel Post">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src="/images/logo-viettelpost.svg" alt="Viettel Post" className={styles.orbitImg} />
                </div>
                {/* 4. SePay VietQR */}
                <div className={styles.orbitBadge} title="SePay VietQR Napas247">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src="/images/logo-sepay.png" alt="SePay VietQR" className={styles.orbitImg} />
                </div>
              </OrbitingCircles>

              {/* Outer Orbit (Radius 310px - Reverse) */}
              <OrbitingCircles iconSize={92} radius={310} duration={38} speed={1} reverse>
                {/* 5. Gmail */}
                <div className={styles.orbitBadge} title="Gmail SMTP Email">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src="/images/logo-gmail.png" alt="Gmail" className={styles.orbitImg} />
                </div>
                {/* 6. Hostinger */}
                <div className={styles.orbitBadge} title="Hostinger Cloud (Auto Deploy)">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src="/images/logo-hostinger.png" alt="Hostinger" className={styles.orbitImg} />
                </div>
                {/* 7. Meta Conversions API */}
                <div className={styles.orbitBadge} title="Meta Conversions API">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src="/images/logo-meta.png" alt="Meta Conversions API" className={styles.orbitImg} />
                </div>
                {/* 8. TikTok Events API */}
                <div className={styles.orbitBadge} title="TikTok Events API">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src="/images/logo-tiktok.svg" alt="TikTok Events API" className={styles.orbitImg} />
                </div>
              </OrbitingCircles>
            </div>
          </div>
        </section>

        {/* ==========================================================================
         ★ BẢNG GIÁ GÓI BÁN HÀNG NGOẠI SÀN (FLOATUI PRICING CARDS)
         ========================================================================== */}
        <section id="goi-ngoai-san" className={styles.floatPricingSection}>
          {/* Glow ambient background from FloatUI */}
          <div className={styles.floatPricingGlow}></div>

          <div className={styles.floatPricingContainer}>
            {/* Section Header */}
            <div className={styles.floatPricingHeader}>
              <div className={styles.floatPricingTag}>
                ⚡ BẢNG GIÁ ĐẦU TƯ 1 LẦN • SỞ HỮU TRỌN ĐỜI
              </div>
              <h2 className={styles.floatPricingTitle}>
                Chi Phí Siêu Tiết Kiệm, Tối Ưu Lợi Nhuận
              </h2>
              <p className={styles.floatPricingDesc}>
                Loại bỏ hoàn toàn nỗi lo bị trừ 10% - 15% phí sàn mỗi tháng. Sở hữu nền tảng bán hàng độc lập, tự động hóa 100% với mức giá ưu đãi nhất.
              </p>
            </div>

            {/* Pricing Cards Grid */}
            <div className={styles.floatPricingGrid}>
              {/* Plan 1: Gói 399K Best Seller */}
              <div className={`${styles.floatPlanCard} ${styles.floatPlanCardPopular}`}>
                <div className={styles.floatPlanTopBanner}>
                  🔥 GÓI BÁN HÀNG NGOẠI SÀN SIÊU CẤP • BEST SELLER
                </div>
                <div className={styles.floatPlanCardHead}>
                  <span className={styles.floatPlanName}>
                    Gói Bán Hàng Ngoại Sàn Toàn Diện
                  </span>
                  <div className={styles.floatPlanPriceWrap}>
                    <span className={styles.floatPlanPrice}>399.000₫</span>
                    <span className={styles.floatPlanPeriod}>/ sở hữu trọn đời</span>
                  </div>
                  <p className={styles.floatPlanDesc}>
                    Trọn bộ mã nguồn Next.js 16 + React 19, tích hợp VietQR, vận chuyển GHN/GHTK và Meta/TikTok CAPI chuẩn 100%.
                  </p>
                  <CoolMode options={{ particle: "🔥" }}>
                    <button
                      type="button"
                      className={`${styles.floatPlanBtn} ${styles.floatPlanBtnPopular}`}
                      onClick={() => setIsPackageModalOpen(true)}
                    >
                      <FiZap size={16} /> ĐĂNG KÝ GÓI 399K NGAY
                    </button>
                  </CoolMode>
                </div>

                <ul className={styles.floatPlanFeatureList}>
                  <li className={styles.floatPlanFeatureItem}>
                    <svg className={styles.floatPlanCheckSvg} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"></path>
                    </svg>
                    <span>Full source code Next.js 16 + React 19 chuẩn SEO TMĐT</span>
                  </li>
                  <li className={styles.floatPlanFeatureItem}>
                    <svg className={styles.floatPlanCheckSvg} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"></path>
                    </svg>
                    <span>Tự động hóa thanh toán VietQR SePay khớp lệnh 1s</span>
                  </li>
                  <li className={styles.floatPlanFeatureItem}>
                    <svg className={styles.floatPlanCheckSvg} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"></path>
                    </svg>
                    <span>Tích hợp trực tiếp API vận chuyển GHN / GHTK / Viettel Post</span>
                  </li>
                  <li className={styles.floatPlanFeatureItem}>
                    <svg className={styles.floatPlanCheckSvg} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"></path>
                    </svg>
                    <span>Đo lường kép Meta Conversions API & TikTok Events API</span>
                  </li>
                  <li className={styles.floatPlanFeatureItem}>
                    <svg className={styles.floatPlanCheckSvg} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"></path>
                    </svg>
                    <span>Bộ 7 Theme tùy biến giao diện trực quan 1-Click</span>
                  </li>
                  <li className={styles.floatPlanFeatureItem}>
                    <svg className={styles.floatPlanCheckSvg} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"></path>
                    </svg>
                    <span>Video bài giảng hướng dẫn cài đặt hosting & chạy Ads chi tiết</span>
                  </li>
                  <li className={styles.floatPlanFeatureItem}>
                    <svg className={styles.floatPlanCheckSvg} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"></path>
                    </svg>
                    <span>Hỗ trợ kỹ thuật 1:1 qua Ultraviewer / Zalo khi gặp khó khăn</span>
                  </li>
                </ul>
              </div>

              {/* Plan 2: Gói Setup A-Z */}
              <div className={styles.floatPlanCard}>
                <div className={styles.floatPlanCardHead}>
                  <span className={styles.floatPlanName}>
                    Gói Setup & Cài Đặt Trọn Gói A - Z
                  </span>
                  <div className={styles.floatPlanPriceWrap}>
                    <span className={styles.floatPlanPrice} style={{ color: '#a5b4fc' }}>799.000₫</span>
                    <span className={styles.floatPlanPeriod}>/ bàn giao hoàn thiện</span>
                  </div>
                  <p className={styles.floatPlanDesc}>
                    Dành cho chủ shop bận rộn: Đội ngũ kỹ thuật hỗ trợ cài đặt toàn bộ từ tên miền, hosting, VietQR đến nạp 20 sản phẩm mẫu.
                  </p>
                  <CoolMode options={{ particle: "⚡" }}>
                    <button
                      type="button"
                      className={styles.floatPlanBtn}
                      onClick={() => setIsPackageModalOpen(true)}
                    >
                      <FiCheck size={16} /> ĐẶT DỊCH VỤ SETUP A-Z
                    </button>
                  </CoolMode>
                </div>

                <ul className={styles.floatPlanFeatureList}>
                  <li className={styles.floatPlanFeatureItem}>
                    <svg className={styles.floatPlanCheckSvg} style={{ color: '#818cf8' }} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"></path>
                    </svg>
                    <span>Bao gồm toàn bộ quyền lợi của Gói 399K</span>
                  </li>
                  <li className={styles.floatPlanFeatureItem}>
                    <svg className={styles.floatPlanCheckSvg} style={{ color: '#818cf8' }} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"></path>
                    </svg>
                    <span>Cài đặt sẵn tên miền riêng & chứng chỉ SSL HTTPS</span>
                  </li>
                  <li className={styles.floatPlanFeatureItem}>
                    <svg className={styles.floatPlanCheckSvg} style={{ color: '#818cf8' }} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"></path>
                    </svg>
                    <span>Thiết lập Hosting 0đ hoạt động 100% không lo lỗi code</span>
                  </li>
                  <li className={styles.floatPlanFeatureItem}>
                    <svg className={styles.floatPlanCheckSvg} style={{ color: '#818cf8' }} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"></path>
                    </svg>
                    <span>Cấu hình tài khoản ngân hàng VietQR & Bưu tá GHN/GHTK</span>
                  </li>
                  <li className={styles.floatPlanFeatureItem}>
                    <svg className={styles.floatPlanCheckSvg} style={{ color: '#818cf8' }} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"></path>
                    </svg>
                    <span>Hỗ trợ đăng tải sẵn 20 sản phẩm mẫu ban đầu</span>
                  </li>
                  <li className={styles.floatPlanFeatureItem}>
                    <svg className={styles.floatPlanCheckSvg} style={{ color: '#818cf8' }} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"></path>
                    </svg>
                    <span>Gắn Pixel Meta CAPI & TikTok Ads ID lên website</span>
                  </li>
                  <li className={styles.floatPlanFeatureItem}>
                    <svg className={styles.floatPlanCheckSvg} style={{ color: '#818cf8' }} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"></path>
                    </svg>
                    <span>Bàn giao chìa khóa trao tay - Chỉ việc chạy Ads bán hàng</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* ==========================================================================
         BẢNG SO SÁNH: BÁN TRÊN SÀN (SHOPEE/TIKTOK) VS BÁN NGOẠI SÀN (SHOPTIK)
         ========================================================================== */}
        {/* ==========================================================================
         BẢNG SO SÁNH: BÁN TRÊN SÀN (SHOPEE/TIKTOK) VS BÁN NGOẠI SÀN (SHOPTIK)
         ========================================================================== */}
        <section id="so-sanh" className={styles.comparisonSection}>
          {/* Ambient Lighting Glow */}
          <div className={styles.compAmbientGlow} />

          <div className={styles.container}>
            {/* Prominent High-Impact Header */}
            <div className={styles.compHeaderBlock}>
              <div className={styles.compBadge}>
                <FiZap /> ĐỐI CHIẾU HIỆU QUẢ & LỢI NHUẬN 2026
              </div>
              <h2 className={styles.compMainTitle}>
                Bán Hàng Trên Sàn <span className={styles.compTitleVs}>VS</span> <span className={styles.compTitleGradient}>Bán Ngoại Sàn Độc Lập</span>
              </h2>
              <p className={styles.compSubtitle}>
                Loại bỏ hoàn toàn nỗi lo bị giam tiền hàng, mất 10% - 15% phí sàn và nguy cơ bị khóa shop vô lý. Giữ trọn 100% doanh thu và làm chủ toàn bộ tệp dữ liệu khách hàng với hệ thống tự động hóa ShopTik.
              </p>

              <div className={styles.compHighlightsRow}>
                <span className={`${styles.compHighlightChip} ${styles.compChipPositive}`}>
                  💸 0% Phí Sàn Trọn Đời
                </span>
                <span className={`${styles.compHighlightChip} ${styles.compChipPositive}`}>
                  ⚡ Khớp Lệnh VietQR 1s
                </span>
                <span className={`${styles.compHighlightChip} ${styles.compChipPositive}`}>
                  👥 Sở Hữu 100% Data Khách
                </span>
                <span className={`${styles.compHighlightChip} ${styles.compChipPositive}`}>
                  🎯 Chuẩn Meta & TikTok CAPI
                </span>
              </div>
            </div>

            {/* Magic UI AnimatedList Dual Comparison Showcase */}
            <div className={styles.animatedCompGrid}>
              {/* Column 1: Nỗi đau trên sàn */}
              <div className={`${styles.animatedCompCol} ${styles.compColNegative}`}>
                <div className={styles.compColHeader}>
                  <h3 className={styles.compColTitle}>
                    <span style={{ color: '#ef4444' }}>❌</span> Bán Trên Sàn TMĐT
                  </h3>
                  <span className={styles.compColBadgeNeg}>Shopee / TikTok Shop</span>
                </div>

                <div className={styles.animatedListContainer}>
                  <AnimatedList delay={1600}>
                    {painPointsList.map((item, idx) => (
                      <div
                        key={`neg-${idx}`}
                        className={`${styles.animatedCard} ${styles.animatedCardNeg}`}
                      >
                        <div className={styles.animatedCardInner}>
                          <div
                            className={styles.animatedIconBox}
                            style={{ backgroundColor: item.color }}
                          >
                            <span>{item.icon}</span>
                          </div>
                          <div className={styles.animatedCardContent}>
                            <div className={styles.animatedCardHeader}>
                              <span>{item.name}</span>
                              <span style={{ opacity: 0.4 }}>•</span>
                              <span className={styles.animatedTime}>{item.time}</span>
                            </div>
                            <p className={styles.animatedCardDesc}>{item.description}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </AnimatedList>
                  <div className={styles.animatedFadeOverlay} />
                </div>
              </div>

              {/* Column 2: Giải pháp ngoại sàn ShopTik */}
              <div className={`${styles.animatedCompCol} ${styles.compColPositive}`}>
                <div className={styles.compColHeader}>
                  <h3 className={styles.compColTitle}>
                    <span style={{ color: '#10b981' }}>✅</span> Bán Ngoại Sàn Toàn Diện
                  </h3>
                  <span className={styles.compColBadgePos}>ShopTik Core 399K</span>
                </div>

                <div className={styles.animatedListContainer}>
                  <AnimatedList delay={1600}>
                    {benefitsList.map((item, idx) => (
                      <div
                        key={`pos-${idx}`}
                        className={`${styles.animatedCard} ${styles.animatedCardPos}`}
                      >
                        <div className={styles.animatedCardInner}>
                          <div
                            className={styles.animatedIconBox}
                            style={{ backgroundColor: item.color }}
                          >
                            <span>{item.icon}</span>
                          </div>
                          <div className={styles.animatedCardContent}>
                            <div className={styles.animatedCardHeader}>
                              <span style={{ color: '#a7f3d0' }}>{item.name}</span>
                              <span style={{ opacity: 0.4 }}>•</span>
                              <span className={styles.animatedTime}>{item.time}</span>
                            </div>
                            <p className={styles.animatedCardDesc}>{item.description}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </AnimatedList>
                  <div className={styles.animatedFadeOverlay} />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ==========================================================================
         4. CRUIP-STYLE CORE PILLARS & FEATURES GRID (6 PILLARS)
         ========================================================================== */}
        <section id="features" className={styles.cruipFeaturesSection}>
          <div className={styles.container}>
            <div className={styles.cruipSectionHeader}>
              <div className={styles.cruipBadgeTag}>
                <FiZap /> VŨ KHÍ TĂNG TRƯỞNG DOANH SỐ
              </div>
              <h2 className={styles.cruipSectionTitle}>
                6 Trụ Cột Đột Phá Khác Biệt Hoàn Toàn
              </h2>
              <p className={styles.cruipSectionSubtitle}>
                Mọi tính năng được nghiên cứu và thiết kế tối ưu hóa hành vi mua hàng, loại bỏ 100% rào cản thanh toán và thất thoát dữ liệu quảng cáo.
              </p>
            </div>

            <div className={styles.cruipFeaturesGrid}>
              {/* Pillar 1: Multi-Theme */}
              <div className={styles.cruipCard}>
                <div className={styles.cruipCardTop}>
                  <div className={`${styles.cruipIconBox} ${styles.iconPurple}`}>
                    <FiLayers />
                  </div>
                  <span className={styles.cruipPillBadge}>7 Bộ Themes</span>
                </div>
                <h3 className={styles.cruipCardTitle}>Giao Diện Multi-Theme Đa Dạng</h3>
                <p className={styles.cruipCardDesc}>
                  Biến hóa phong cách giao diện ngay lập tức với hệ thống CSS Variables toàn diện: Cam Shopee rực rỡ, Đen TikTok thời thượng hoặc Sleek Dark Mode sang trọng.
                </p>
                <ul className={styles.cruipChecklist}>
                  <li className={styles.cruipCheckItem}>
                    <FiCheckCircle className={styles.cruipCheckIcon} size={15} />
                    <span>Chuyển đổi 1-Click không cần build lại code</span>
                  </li>
                  <li className={styles.cruipCheckItem}>
                    <FiCheckCircle className={styles.cruipCheckIcon} size={15} />
                    <span>Đồng bộ từ Storefront đến Admin quản trị</span>
                  </li>
                  <li className={styles.cruipCheckItem}>
                    <FiCheckCircle className={styles.cruipCheckIcon} size={15} />
                    <span>Tùy biến mã màu HEX theo từng thương hiệu</span>
                  </li>
                </ul>
              </div>

              {/* Pillar 2: VietQR SePay */}
              <div className={styles.cruipCard}>
                <div className={styles.cruipCardTop}>
                  <div className={`${styles.cruipIconBox} ${styles.iconGreen}`}>
                    <FiCreditCard />
                  </div>
                  <span className={styles.cruipPillBadge}>Webhook 1s</span>
                </div>
                <h3 className={styles.cruipCardTitle}>Thanh Toán VietQR Tự Động 100%</h3>
                <p className={styles.cruipCardDesc}>
                  Tự sinh mã QR ngân hàng kèm số tiền và mã đơn. Khách hàng quét mã qua app ngân hàng $\rightarrow$ Hệ thống tự động xác nhận đơn đã thanh toán trong 1 giây qua Webhook SePay!
                </p>
                <ul className={styles.cruipChecklist}>
                  <li className={styles.cruipCheckItem}>
                    <FiCheckCircle className={styles.cruipCheckIcon} size={15} />
                    <span>Khách không cần chụp màn hình gửi hóa đơn</span>
                  </li>
                  <li className={styles.cruipCheckItem}>
                    <FiCheckCircle className={styles.cruipCheckIcon} size={15} />
                    <span>Tiền về thẳng tài khoản ngân hàng của bạn tức thì</span>
                  </li>
                  <li className={styles.cruipCheckItem}>
                    <FiCheckCircle className={styles.cruipCheckIcon} size={15} />
                    <span>Hỗ trợ MBBank, VCB, Techcombank, TPBank, MSB...</span>
                  </li>
                </ul>
              </div>

              {/* Pillar 3: Multi-Carrier Logistics */}
              <div className={styles.cruipCard}>
                <div className={styles.cruipCardTop}>
                  <div className={`${styles.cruipIconBox} ${styles.iconBlue}`}>
                    <FiTruck />
                  </div>
                  <span className={styles.cruipPillBadge}>GHN • GHTK • Viettel</span>
                </div>
                <h3 className={styles.cruipCardTitle}>Vận Chuyển Đa Hãng 1-Chạm</h3>
                <p className={styles.cruipCardDesc}>
                  Tích hợp trực tiếp API Giao Hàng Nhanh (GHN), Giao Hàng Tiết Kiệm (GHTK) và Viettel Post. Tính cước chuẩn xác theo vị trí địa lý và xuất vận đơn chỉ với 1 cú click.
                </p>
                <ul className={styles.cruipChecklist}>
                  <li className={styles.cruipCheckItem}>
                    <FiCheckCircle className={styles.cruipCheckIcon} size={15} />
                    <span>Tự động phân luồng đúng hãng khách hàng chọn</span>
                  </li>
                  <li className={styles.cruipCheckItem}>
                    <FiCheckCircle className={styles.cruipCheckIcon} size={15} />
                    <span>Trang tra cứu vận đơn lộ trình 5 bước (`/tracking`)</span>
                  </li>
                  <li className={styles.cruipCheckItem}>
                    <FiCheckCircle className={styles.cruipCheckIcon} size={15} />
                    <span>Hủy đơn 2 chiều đồng bộ trực tiếp với bưu tá</span>
                  </li>
                </ul>
              </div>

              {/* Pillar 4: Meta CAPI & TikTok Events API */}
              <div className={styles.cruipCard}>
                <div className={styles.cruipCardTop}>
                  <div className={`${styles.cruipIconBox} ${styles.iconOrange}`}>
                    <FiBarChart2 />
                  </div>
                  <span className={styles.cruipPillBadge}>Server-Side 100%</span>
                </div>
                <h3 className={styles.cruipCardTitle}>Đo Lường Kép Meta CAPI & TikTok API</h3>
                <p className={styles.cruipCardDesc}>
                  Gửi trực tiếp sự kiện mua hàng từ Server đến Meta Graph API & TikTok Business API. Khử trùng lặp 100% bằng `event_id`, bỏ qua rào cản AdBlock và iOS 14.5+.
                </p>
                <ul className={styles.cruipChecklist}>
                  <li className={styles.cruipCheckItem}>
                    <FiCheckCircle className={styles.cruipCheckIcon} size={15} />
                    <span>Băm bảo mật SHA-256 (Email, SĐT, IP, User Agent)</span>
                  </li>
                  <li className={styles.cruipCheckItem}>
                    <FiCheckCircle className={styles.cruipCheckIcon} size={15} />
                    <span>Tối ưu giá thầu quảng cáo CPA và ROI chiến dịch</span>
                  </li>
                  <li className={styles.cruipCheckItem}>
                    <FiCheckCircle className={styles.cruipCheckIcon} size={15} />
                    <span>Báo cáo phễu chuyển đổi thời gian thực</span>
                  </li>
                </ul>
              </div>

              {/* Pillar 5: Realtime Chat & AI Bot */}
              <div className={styles.cruipCard}>
                <div className={styles.cruipCardTop}>
                  <div className={`${styles.cruipIconBox} ${styles.iconAmber}`}>
                    <FiMessageSquare />
                  </div>
                  <span className={styles.cruipPillBadge}>Chatbot 24/7</span>
                </div>
                <h3 className={styles.cruipCardTitle}>CSKH Realtime Socket.IO & Chatbot</h3>
                <p className={styles.cruipCardDesc}>
                  Hệ thống trò chuyện trực tuyến tức thì giữa khách hàng và tư vấn viên, kết hợp AI Chatbot tự động tư vấn sản phẩm, giải đáp thắc mắc và tra cứu đơn 24/7.
                </p>
                <ul className={styles.cruipChecklist}>
                  <li className={styles.cruipCheckItem}>
                    <FiCheckCircle className={styles.cruipCheckIcon} size={15} />
                    <span>Máy chủ Socket.IO độc lập độ trễ siêu thấp</span>
                  </li>
                  <li className={styles.cruipCheckItem}>
                    <FiCheckCircle className={styles.cruipCheckIcon} size={15} />
                    <span>Tự động trả lời câu hỏi thường gặp khi admin offline</span>
                  </li>
                  <li className={styles.cruipCheckItem}>
                    <FiCheckCircle className={styles.cruipCheckIcon} size={15} />
                    <span>Đính kèm sản phẩm và thông tin đơn hàng trong chat</span>
                  </li>
                </ul>
              </div>

              {/* Pillar 6: Automated Email System */}
              <div className={styles.cruipCard}>
                <div className={styles.cruipCardTop}>
                  <div className={`${styles.cruipIconBox} ${styles.iconCyan}`}>
                    <FiMail />
                  </div>
                  <span className={styles.cruipPillBadge}>Gmail SMTP</span>
                </div>
                <h3 className={styles.cruipCardTitle}>Gửi Email Thông Báo Tự Động 100%</h3>
                <p className={styles.cruipCardDesc}>
                  Tự động gửi email xác nhận kèm hóa đơn chi tiết ngay khi khách đặt hàng thành công, đồng thời phát cảnh báo có đơn mới tức thì về hòm thư của chủ shop qua Gmail SMTP.
                </p>
                <ul className={styles.cruipChecklist}>
                  <li className={styles.cruipCheckItem}>
                    <FiCheckCircle className={styles.cruipCheckIcon} size={15} />
                    <span>Hóa đơn điện tử đầy đủ sản phẩm, ảnh, giá và phí ship</span>
                  </li>
                  <li className={styles.cruipCheckItem}>
                    <FiCheckCircle className={styles.cruipCheckIcon} size={15} />
                    <span>Thông báo Realtime cho Admin khi phát sinh đơn hàng</span>
                  </li>
                  <li className={styles.cruipCheckItem}>
                    <FiCheckCircle className={styles.cruipCheckIcon} size={15} />
                    <span>Template HTML cao cấp, responsive trên Mobile & Desktop</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* ==========================================================================
         5. INTERACTIVE THEME PREVIEW SHOWCASE
         ========================================================================== */}
        <section id="themes" className={styles.themeShowcaseSection}>
          {/* Ambient Lighting Glow */}
          <div className={styles.themeAmbientGlow} />

          <div className={styles.container}>
            {/* Prominent High-Impact Header */}
            <div className={styles.themeHeaderBlock}>
              <div className={styles.themeBadgeTop}>
                <FiLayers /> BỘ SƯU TẬP 7 THEMES ĐỘC BẢN • TÙY BIẾN 1-CLICK
              </div>
              <h2 className={styles.themeMainTitle}>
                Trải Nghiệm Đổi Giao Diện <span className={styles.themeTitleGradient}>Trực Tiếp 1-Click</span>
              </h2>
              <p className={styles.themeSubtitle}>
                Bấm vào từng chủ đề dưới đây để chiêm ngưỡng website tự động thay đổi toàn bộ màu sắc chủ đạo, nút bấm, bo góc và phong cách hiển thị tức thì theo chuẩn hệ thống CSS Variables cao cấp.
              </p>

              <div className={styles.themeHighlightsRow}>
                <span className={`${styles.themeHighlightChip} ${styles.themeChipActive}`}>
                  🎨 7 Bộ Theme Có Sẵn
                </span>
                <span className={`${styles.themeHighlightChip} ${styles.themeChipActive}`}>
                  ⚡ Thay Đổi Không Cần Build Code
                </span>
                <span className={`${styles.themeHighlightChip} ${styles.themeChipActive}`}>
                  🎯 Chuẩn CSS Variables 100%
                </span>
                <span className={`${styles.themeHighlightChip} ${styles.themeChipActive}`}>
                  📱 Tương Thích Mobile & Desktop
                </span>
              </div>
            </div>

            {/* 1. SEVEN THEME PRESET TABS */}
            <div className={styles.themeSelectorTabs}>
              {(Object.keys(themePresets) as Array<keyof typeof themePresets>).map((key) => {
                const preset = themePresets[key];
                const isSelected = activeThemeDemo === key;
                return (
                  <button
                    key={key}
                    type="button"
                    className={`${styles.themeTabBtn} ${isSelected ? styles.themeTabActive : ''}`}
                    onClick={() => handleSelectPreset(key)}
                    style={isSelected ? { borderColor: preset.primary } : {}}
                  >
                    <span
                      style={{
                        width: 10,
                        height: 10,
                        borderRadius: '50%',
                        backgroundColor: preset.primary,
                        display: 'inline-block',
                      }}
                    />
                    {preset.name}
                  </button>
                );
              })}
            </div>

            {/* 2. ADVANCED INTERACTIVE CONTROL PANEL */}
            <div className={styles.themeControlPanel}>
              {/* Control Row 1: Primary Color */}
              <div className={styles.controlRow}>
                <span className={styles.controlLabel}>🎨 Màu Chủ Đạo:</span>
                <div className={styles.controlGroup}>
                  {colorSwatches.map((color) => (
                    <button
                      key={color}
                      type="button"
                      className={`${styles.colorPickerDot} ${customPrimary.toLowerCase() === color.toLowerCase() ? styles.colorPickerDotActive : ''}`}
                      style={{ backgroundColor: color }}
                      onClick={() => setCustomPrimary(color)}
                      title={color}
                    />
                  ))}
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginLeft: 8 }}>
                    <input
                      type="color"
                      value={customPrimary}
                      onChange={(e) => setCustomPrimary(e.target.value)}
                      style={{ width: 30, height: 30, padding: 0, border: 'none', borderRadius: 6, cursor: 'pointer', background: 'none' }}
                      title="Chọn mã màu HEX tùy ý"
                    />
                    <span style={{ fontSize: 12, fontFamily: 'monospace', color: '#94a3b8', background: 'rgba(255,255,255,0.06)', padding: '4px 8px', borderRadius: 6 }}>
                      {customPrimary}
                    </span>
                  </div>
                </div>
              </div>

              {/* Control Row 2: Layout View Mode */}
              <div className={styles.controlRow}>
                <span className={styles.controlLabel}>🔲 Chế Độ Xem:</span>
                <div className={styles.controlGroup}>
                  <button
                    type="button"
                    className={`${styles.controlBtnSmall} ${demoLayoutView === 'grid' ? styles.controlBtnSmallActive : ''}`}
                    onClick={() => setDemoLayoutView('grid')}
                  >
                    ▦ Lưới Sản Phẩm (Grid 3 Cột)
                  </button>
                  <button
                    type="button"
                    className={`${styles.controlBtnSmall} ${demoLayoutView === 'list' ? styles.controlBtnSmallActive : ''}`}
                    onClick={() => setDemoLayoutView('list')}
                  >
                    ☰ Danh Sách Ngang (List Card)
                  </button>
                  <button
                    type="button"
                    className={`${styles.controlBtnSmall} ${demoLayoutView === 'checkout' ? styles.controlBtnSmallActive : ''}`}
                    onClick={() => setDemoLayoutView('checkout')}
                  >
                    💳 Mini Checkout & VietQR
                  </button>
                </div>
              </div>

              {/* Control Row 3: Border Radius & Background Mode */}
              <div className={styles.controlRow}>
                <span className={styles.controlLabel}>📐 Bo Góc Nút / Thẻ:</span>
                <div className={styles.controlGroup}>
                  {[4, 8, 14, 24].map((radius) => (
                    <button
                      key={radius}
                      type="button"
                      className={`${styles.controlBtnSmall} ${demoBorderRadius === radius ? styles.controlBtnSmallActive : ''}`}
                      onClick={() => setDemoBorderRadius(radius)}
                    >
                      {radius === 4 ? 'Vuông (4px)' : radius === 8 ? 'Chuẩn (8px)' : radius === 14 ? 'Mềm Mại (14px)' : 'Pill Tròn (24px)'}
                    </button>
                  ))}
                </div>
              </div>

              {/* Control Row 4: Background Mode & FOMO Toggles */}
              <div className={styles.controlRow}>
                <span className={styles.controlLabel}>⚙️ Nền & Hiệu Ứng:</span>
                <div className={styles.controlGroup}>
                  <button
                    type="button"
                    className={`${styles.controlBtnSmall} ${demoBgMode === 'default' ? styles.controlBtnSmallActive : ''}`}
                    onClick={() => setDemoBgMode('default')}
                  >
                    Mặc Định Theo Theme
                  </button>
                  <button
                    type="button"
                    className={`${styles.controlBtnSmall} ${demoBgMode === 'dark' ? styles.controlBtnSmallActive : ''}`}
                    onClick={() => setDemoBgMode('dark')}
                  >
                    🌙 Ép Nền Tối (Dark)
                  </button>
                  <button
                    type="button"
                    className={`${styles.controlBtnSmall} ${demoBgMode === 'light' ? styles.controlBtnSmallActive : ''}`}
                    onClick={() => setDemoBgMode('light')}
                  >
                    ☀️ Ép Nền Sáng (Light)
                  </button>

                  <button
                    type="button"
                    className={`${styles.toggleSwitchBtn} ${showFlashBadge ? styles.toggleSwitchBtnActive : ''}`}
                    onClick={() => setShowFlashBadge(!showFlashBadge)}
                  >
                    {showFlashBadge ? '✓ Hiện Tag Giảm Giá' : '✕ Ẩn Tag Giảm Giá'}
                  </button>
                  <button
                    type="button"
                    className={`${styles.toggleSwitchBtn} ${showSoldProgress ? styles.toggleSwitchBtnActive : ''}`}
                    onClick={() => setShowSoldProgress(!showSoldProgress)}
                  >
                    {showSoldProgress ? '✓ Hiện Thanh Cháy Hàng' : '✕ Ẩn Thanh Cháy Hàng'}
                  </button>
                </div>

                {/* Action Buttons: Copy CSS & Admin Settings Link */}
                <div style={{ marginLeft: 'auto', display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                </div>
              </div>
            </div>

            {/* 3. DYNAMIC INTERACTIVE PREVIEW MOCKUP */}
            <div
              className={styles.themePreviewCard}
              style={{
                backgroundColor: effectiveBg,
                color: effectiveTextColor,
                borderRadius: Math.max(demoBorderRadius, 14),
              }}
            >
              {/* Mockup Header Bar */}
              <div className={styles.themeMockupHeader}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div
                    style={{
                      width: 32,
                      height: 32,
                      borderRadius: Math.min(demoBorderRadius, 10),
                      background: effectivePrimary,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: '#fff',
                      fontWeight: 900,
                      fontSize: 14,
                      boxShadow: `0 4px 12px ${effectivePrimary}40`,
                    }}
                  >
                    ST
                  </div>
                  <div>
                    <div style={{ fontWeight: 800, fontSize: 15, lineHeight: 1.2 }}>ShopTik Storefront</div>
                    <div style={{ fontSize: 11, opacity: 0.7 }}>Theme: {baseTheme.name} • Primary: {effectivePrimary}</div>
                  </div>
                </div>

                <span
                  style={{
                    background: `${effectivePrimary}22`,
                    color: effectivePrimary,
                    border: `1px solid ${effectivePrimary}55`,
                    padding: '5px 14px',
                    borderRadius: demoBorderRadius,
                    fontSize: 12,
                    fontWeight: 800,
                  }}
                >
                  {baseTheme.tag}
                </span>
              </div>

              {/* Dynamic Content View Based on demoLayoutView */}
              {demoLayoutView === 'grid' && (
                <div className={styles.themeMockupBody}>
                  {/* Product 1 */}
                  <div
                    className={styles.mockupProductCard}
                    style={{
                      backgroundColor: effectiveCardBg,
                      borderRadius: demoBorderRadius,
                      position: 'relative',
                    }}
                  >
                    {showFlashBadge && (
                      <div
                        style={{
                          position: 'absolute',
                          top: 10,
                          right: 10,
                          background: effectivePrimary,
                          color: '#fff',
                          fontSize: 11,
                          fontWeight: 800,
                          padding: '3px 8px',
                          borderRadius: Math.min(demoBorderRadius, 6),
                          zIndex: 2,
                        }}
                      >
                        -35% FLASH SALE
                      </div>
                    )}
                    <img
                      src="https://images.unsplash.com/photo-1586363104862-3a5e2ab60d99?w=600&auto=format&fit=crop&q=80"
                      alt="Polo"
                      className={styles.mockupThumb}
                      style={{ borderRadius: Math.min(demoBorderRadius, 8) }}
                    />
                    <div style={{ fontWeight: 700, fontSize: 14 }}>Áo Polo Nam Phối Cổ Dệt Bo Cotton</div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ color: effectivePrimary, fontWeight: 900, fontSize: 16 }}>229.000₫</span>
                      <span style={{ fontSize: 12, textDecoration: 'line-through', opacity: 0.6 }}>350.000₫</span>
                    </div>
                    {showSoldProgress && (
                      <div style={{ margin: '4px 0' }}>
                        <div style={{ height: 6, background: 'rgba(128,128,128,0.2)', borderRadius: 3, overflow: 'hidden' }}>
                          <div style={{ width: '82%', height: '100%', background: effectivePrimary, borderRadius: 3 }} />
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10.5, opacity: 0.7, marginTop: 4 }}>
                          <span>🔥 Đã bán 82</span>
                          <span style={{ color: effectivePrimary, fontWeight: 700 }}>Cháy hàng 82%</span>
                        </div>
                      </div>
                    )}
                    <button
                      type="button"
                      style={{
                        backgroundColor: effectivePrimary,
                        color: '#ffffff',
                        border: 'none',
                        borderRadius: demoBorderRadius,
                        padding: '10px 16px',
                        fontWeight: 800,
                        fontSize: 13,
                        cursor: 'pointer',
                        width: '100%',
                        boxShadow: `0 4px 14px ${effectivePrimary}40`,
                        transition: 'all 0.2s',
                      }}
                    >
                      🛒 Mua Ngay
                    </button>
                  </div>

                  {/* Product 2 */}
                  <div
                    className={styles.mockupProductCard}
                    style={{
                      backgroundColor: effectiveCardBg,
                      borderRadius: demoBorderRadius,
                      position: 'relative',
                    }}
                  >
                    {showFlashBadge && (
                      <div
                        style={{
                          position: 'absolute',
                          top: 10,
                          right: 10,
                          background: effectivePrimary,
                          color: '#fff',
                          fontSize: 11,
                          fontWeight: 800,
                          padding: '3px 8px',
                          borderRadius: Math.min(demoBorderRadius, 6),
                          zIndex: 2,
                        }}
                      >
                        -39% DEAL HOT
                      </div>
                    )}
                    <img
                      src="https://images.unsplash.com/photo-1583863788434-e58a36330cf0?w=600&auto=format&fit=crop&q=80"
                      alt="Charger"
                      className={styles.mockupThumb}
                      style={{ borderRadius: Math.min(demoBorderRadius, 8) }}
                    />
                    <div style={{ fontWeight: 700, fontSize: 14 }}>Củ Sạc Nhanh GaN 65W 3 Cổng PD</div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ color: effectivePrimary, fontWeight: 900, fontSize: 16 }}>299.000₫</span>
                      <span style={{ fontSize: 12, textDecoration: 'line-through', opacity: 0.6 }}>490.000₫</span>
                    </div>
                    {showSoldProgress && (
                      <div style={{ margin: '4px 0' }}>
                        <div style={{ height: 6, background: 'rgba(128,128,128,0.2)', borderRadius: 3, overflow: 'hidden' }}>
                          <div style={{ width: '65%', height: '100%', background: effectivePrimary, borderRadius: 3 }} />
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10.5, opacity: 0.7, marginTop: 4 }}>
                          <span>🔥 Đã bán 130</span>
                          <span style={{ color: effectivePrimary, fontWeight: 700 }}>Cháy hàng 65%</span>
                        </div>
                      </div>
                    )}
                    <button
                      type="button"
                      style={{
                        backgroundColor: effectivePrimary,
                        color: '#ffffff',
                        border: 'none',
                        borderRadius: demoBorderRadius,
                        padding: '10px 16px',
                        fontWeight: 800,
                        fontSize: 13,
                        cursor: 'pointer',
                        width: '100%',
                        boxShadow: `0 4px 14px ${effectivePrimary}40`,
                        transition: 'all 0.2s',
                      }}
                    >
                      🛒 Mua Ngay
                    </button>
                  </div>

                  {/* Product 3 */}
                  <div
                    className={styles.mockupProductCard}
                    style={{
                      backgroundColor: effectiveCardBg,
                      borderRadius: demoBorderRadius,
                      position: 'relative',
                    }}
                  >
                    {showFlashBadge && (
                      <div
                        style={{
                          position: 'absolute',
                          top: 10,
                          right: 10,
                          background: effectivePrimary,
                          color: '#fff',
                          fontSize: 11,
                          fontWeight: 800,
                          padding: '3px 8px',
                          borderRadius: Math.min(demoBorderRadius, 6),
                          zIndex: 2,
                        }}
                      >
                        -35% BÁN CHẠY
                      </div>
                    )}
                    <img
                      src="https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=600&auto=format&fit=crop&q=80"
                      alt="Earphones"
                      className={styles.mockupThumb}
                      style={{ borderRadius: Math.min(demoBorderRadius, 8) }}
                    />
                    <div style={{ fontWeight: 700, fontSize: 14 }}>Tai Nghe Bluetooth TWS Chống Ồn ANC</div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ color: effectivePrimary, fontWeight: 900, fontSize: 16 }}>420.000₫</span>
                      <span style={{ fontSize: 12, textDecoration: 'line-through', opacity: 0.6 }}>650.000₫</span>
                    </div>
                    {showSoldProgress && (
                      <div style={{ margin: '4px 0' }}>
                        <div style={{ height: 6, background: 'rgba(128,128,128,0.2)', borderRadius: 3, overflow: 'hidden' }}>
                          <div style={{ width: '92%', height: '100%', background: effectivePrimary, borderRadius: 3 }} />
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10.5, opacity: 0.7, marginTop: 4 }}>
                          <span>🔥 Đã bán 240</span>
                          <span style={{ color: effectivePrimary, fontWeight: 700 }}>Cháy hàng 92%</span>
                        </div>
                      </div>
                    )}
                    <button
                      type="button"
                      style={{
                        backgroundColor: effectivePrimary,
                        color: '#ffffff',
                        border: 'none',
                        borderRadius: demoBorderRadius,
                        padding: '10px 16px',
                        fontWeight: 800,
                        fontSize: 13,
                        cursor: 'pointer',
                        width: '100%',
                        boxShadow: `0 4px 14px ${effectivePrimary}40`,
                        transition: 'all 0.2s',
                      }}
                    >
                      🛒 Mua Ngay
                    </button>
                  </div>
                </div>
              )}

              {/* List View Mode */}
              {demoLayoutView === 'list' && (
                <div className={styles.mockupListView}>
                  {/* List Item 1 */}
                  <div
                    className={styles.mockupListCard}
                    style={{
                      backgroundColor: effectiveCardBg,
                      borderRadius: demoBorderRadius,
                    }}
                  >
                    <img
                      src="https://images.unsplash.com/photo-1586363104862-3a5e2ab60d99?w=400&auto=format&fit=crop&q=80"
                      alt="Polo"
                      className={styles.mockupListThumb}
                      style={{ borderRadius: Math.min(demoBorderRadius, 8) }}
                    />
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 800, fontSize: 15, marginBottom: 4 }}>Áo Polo Nam Phối Cổ Dệt Bo Cotton</div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
                        <span style={{ color: effectivePrimary, fontWeight: 900, fontSize: 17 }}>229.000₫</span>
                        <span style={{ fontSize: 12, textDecoration: 'line-through', opacity: 0.6 }}>350.000₫</span>
                        {showFlashBadge && (
                          <span style={{ background: `${effectivePrimary}22`, color: effectivePrimary, padding: '2px 6px', borderRadius: 4, fontSize: 11, fontWeight: 800 }}>
                            -35%
                          </span>
                        )}
                      </div>
                      <div style={{ fontSize: 12, opacity: 0.7 }}>⭐ 5.0 (240 đánh giá) • Đã bán 82</div>
                    </div>
                    <button
                      type="button"
                      style={{
                        backgroundColor: effectivePrimary,
                        color: '#ffffff',
                        border: 'none',
                        borderRadius: demoBorderRadius,
                        padding: '10px 20px',
                        fontWeight: 800,
                        fontSize: 13,
                        cursor: 'pointer',
                        boxShadow: `0 4px 14px ${effectivePrimary}40`,
                      }}
                    >
                      Mua Ngay
                    </button>
                  </div>

                  {/* List Item 2 */}
                  <div
                    className={styles.mockupListCard}
                    style={{
                      backgroundColor: effectiveCardBg,
                      borderRadius: demoBorderRadius,
                    }}
                  >
                    <img
                      src="https://images.unsplash.com/photo-1583863788434-e58a36330cf0?w=400&auto=format&fit=crop&q=80"
                      alt="Charger"
                      className={styles.mockupListThumb}
                      style={{ borderRadius: Math.min(demoBorderRadius, 8) }}
                    />
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 800, fontSize: 15, marginBottom: 4 }}>Củ Sạc Nhanh GaN 65W 3 Cổng PD</div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
                        <span style={{ color: effectivePrimary, fontWeight: 900, fontSize: 17 }}>299.000₫</span>
                        <span style={{ fontSize: 12, textDecoration: 'line-through', opacity: 0.6 }}>490.000₫</span>
                        {showFlashBadge && (
                          <span style={{ background: `${effectivePrimary}22`, color: effectivePrimary, padding: '2px 6px', borderRadius: 4, fontSize: 11, fontWeight: 800 }}>
                            -39%
                          </span>
                        )}
                      </div>
                      <div style={{ fontSize: 12, opacity: 0.7 }}>⭐ 4.9 (180 đánh giá) • Đã bán 130</div>
                    </div>
                    <button
                      type="button"
                      style={{
                        backgroundColor: effectivePrimary,
                        color: '#ffffff',
                        border: 'none',
                        borderRadius: demoBorderRadius,
                        padding: '10px 20px',
                        fontWeight: 800,
                        fontSize: 13,
                        cursor: 'pointer',
                        boxShadow: `0 4px 14px ${effectivePrimary}40`,
                      }}
                    >
                      Mua Ngay
                    </button>
                  </div>
                </div>
              )}

              {/* Mini Checkout & VietQR View Mode */}
              {demoLayoutView === 'checkout' && (
                <div style={{ padding: 24, display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 20 }}>
                  {/* Checkout Column 1: Order Summary & Carrier */}
                  <div style={{ background: effectiveCardBg, borderRadius: demoBorderRadius, padding: 20, border: '1px solid rgba(255,255,255,0.06)' }}>
                    <div style={{ fontWeight: 800, fontSize: 15, marginBottom: 12 }}>📦 Tóm Tắt Đơn Hàng & Vận Chuyển</div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, marginBottom: 8 }}>
                      <span>Áo Polo Nam x 1</span>
                      <span style={{ fontWeight: 700 }}>229.000₫</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, marginBottom: 14 }}>
                      <span>Phí Vận Chuyển (GHTK Nhanh)</span>
                      <span style={{ color: '#10b981', fontWeight: 700 }}>Miễn phí (Freeship)</span>
                    </div>
                    <div style={{ height: 1, background: 'rgba(128,128,128,0.2)', margin: '10px 0' }} />
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 16, fontWeight: 900 }}>
                      <span>Tổng Thanh Toán:</span>
                      <span style={{ color: effectivePrimary }}>229.000₫</span>
                    </div>
                  </div>

                  {/* Checkout Column 2: VietQR Payment Automation Box */}
                  <div style={{ background: effectiveCardBg, borderRadius: demoBorderRadius, padding: 20, border: `1px solid ${effectivePrimary}55`, textAlign: 'center' }}>
                    <div style={{ fontWeight: 800, fontSize: 14, color: effectivePrimary, marginBottom: 8 }}>
                      💳 Thanh Toán VietQR Tự Động 100%
                    </div>
                    <div style={{ background: '#fff', padding: 12, borderRadius: 10, display: 'inline-block', marginBottom: 10 }}>
                      {/* Simulated QR Code */}
                      <div style={{ width: 110, height: 110, background: '#000', borderRadius: 6, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: 11, fontWeight: 800, textAlign: 'center', padding: 8 }}>
                        [MÃ VIETQR NAPAS247]
                      </div>
                    </div>
                    <div style={{ fontSize: 12, opacity: 0.8 }}>
                      Cú pháp: <strong style={{ color: effectivePrimary }}>ST88921</strong>
                    </div>
                    <div style={{ background: 'rgba(16, 185, 129, 0.15)', color: '#10b981', padding: '6px 12px', borderRadius: 8, fontSize: 12, fontWeight: 800, marginTop: 8 }}>
                      ✓ Khớp lệnh tự động qua SePay trong 1s
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </section>

        {/* ==========================================================================
         6. METRICS & IMPACT STATS
         ========================================================================== */}
        <section id="metrics" className={styles.statsSection}>
          <div className={styles.container}>
            <div className={styles.statsGrid}>
              <div className={styles.statItem}>
                <div className={styles.statNumber}>+300%</div>
                <div className={styles.statLabel}>Tăng Tỷ Lệ Chuyển Đổi</div>
                <div className={styles.statDesc}>Nhờ luồng Checkout mượt mà & FOMO</div>
              </div>
              <div className={styles.statItem}>
                <div className={styles.statNumber}>&lt; 1s</div>
                <div className={styles.statLabel}>Khớp Lệnh Thanh Toán</div>
                <div className={styles.statDesc}>Xử lý tự động 100% qua SePay Webhook</div>
              </div>
              <div className={styles.statItem}>
                <div className={styles.statNumber}>100%</div>
                <div className={styles.statLabel}>Độ Chính Xác Pixel</div>
                <div className={styles.statDesc}>Bảo toàn dữ liệu qua Meta & TikTok CAPI</div>
              </div>
              <div className={styles.statItem}>
                <div className={styles.statNumber}>99.9%</div>
                <div className={styles.statLabel}>Uptime Ổn Định</div>
                <div className={styles.statDesc}>Next.js 15 & MongoDB Atlas Cloud</div>
              </div>
            </div>
          </div>
        </section>

        {/* ==========================================================================
         HOSTINGER HOSTING & AUTO DEPLOYMENT SECTION
         ========================================================================== */}
        <section id="hosting" className={styles.hostingSection}>
          {/* Ambient Lighting Glow */}
          <div className={styles.hostingAmbientGlow} />

          <div className={styles.container}>
            {/* Prominent High-Impact Header */}
            <div className={styles.hostingHeaderBlock}>
              <div className={styles.hostingBadgeTop}>
                <FiZap /> ĐỐI TÁC HẠ TẦNG CHÍNH THỨC • HOSTINGER CLOUD
              </div>
              <h2 className={styles.hostingMainTitle}>
                Giải Pháp Hosting Hostinger <span className={styles.hostingTitleGradient}>Tối Ưu Vận Hành Cho ShopTik</span>
              </h2>
              <p className={styles.hostingSubtitle}>
                Khởi chạy website bán hàng chuẩn SEO hoàn tất chỉ trong 5 phút. Tự động Deploy 1-Click bằng file ZIP hoặc Git, tặng kèm 1 Tên Miền Quốc Tế (.com) Miễn Phí và Giảm Thêm 10% trọn đời khi đăng ký qua đối tác độc quyền.
              </p>

              <div className={styles.hostingHighlightsRow}>
                <span className={`${styles.hostingHighlightChip} ${styles.hostingChipActive}`}>
                  🌐 Tặng 1 Tên Miền (.com) 0đ
                </span>
                <span className={`${styles.hostingHighlightChip} ${styles.hostingChipActive}`}>
                  ⚡ Tự Động Deploy 1-Click (Kéo File ZIP)
                </span>
                <span className={`${styles.hostingHighlightChip} ${styles.hostingChipActive}`}>
                  🛡️ Miễn Phí SSL HTTPS Trọn Đời
                </span>
                <span className={`${styles.hostingHighlightChip} ${styles.hostingChipActive}`}>
                  🏷️ Giảm Thêm 10% Mã: BIGMANMARKETING10
                </span>
              </div>
            </div>

            {/* Hosting Main Promo Banner */}
            <div className={styles.hostingBanner}>
              <div className={styles.hostingBannerInner}>
                <div style={{ maxWidth: 640 }}>
                  <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'rgba(168, 85, 247, 0.2)', color: '#d8b4fe', padding: '4px 12px', borderRadius: 20, fontSize: 12, fontWeight: 800, marginBottom: 12 }}>
                    🎁 ƯU ĐÃI ĐẶC QUYỀN ĐỐI TÁC
                  </div>
                  <h3 style={{ fontSize: 26, fontWeight: 900, color: '#fff', marginBottom: 10, lineHeight: 1.3 }}>
                    Tặng 1 Tên Miền Miễn Phí + Giảm Thêm 10% Hosting
                  </h3>
                  <p style={{ fontSize: 14, color: '#cbd5e1', lineHeight: 1.6, margin: 0 }}>
                    Hosting Hostinger hỗ trợ kéo thả <strong>nguyên file ZIP</strong> hoặc kết nối <strong>Link Git</strong> là tự động Deploy và Setup website hoạt động ngay lập tức, không cần cấu hình dòng lệnh server phức tạp!
                  </p>

                  <div className={styles.hostingCouponBox}>
                    <span style={{ fontSize: 13, color: '#94a3b8' }}>Mã giảm giá độc quyền:</span>
                    <span className={styles.couponCodeText}>BIGMANMARKETING10</span>
                    <button
                      type="button"
                      className={styles.btnCopyCoupon}
                      onClick={handleCopyCoupon}
                    >
                      {copiedCouponToast ? '✓ Đã Copy!' : '📋 Sao Chép Mã'}
                    </button>
                  </div>
                </div>

                <div>
                  <a
                    href="https://hostinger.com/BIGMANMARKETING10"
                    target="_blank"
                    rel="noopener noreferrer"
                    className={styles.btnHostingerPrimary}
                  >
                    <span>🚀 Đăng Ký Hosting Ưu Đãi Ngay</span>
                    <FiExternalLink />
                  </a>
                  <div style={{ textAlign: 'center', fontSize: 12, color: '#94a3b8', marginTop: 8 }}>
                    ✓ Đảm bảo hoàn tiền trong 30 ngày nếu không hài lòng
                  </div>
                </div>
              </div>
            </div>

            {/* 4 Feature Cards */}
            <div className={styles.hostingFeaturesGrid}>
              <div className={styles.hostingFeatureCard}>
                <div style={{ fontSize: 28, marginBottom: 12 }}>⚡</div>
                <h4 style={{ fontSize: 16, fontWeight: 800, color: '#fff', marginBottom: 8 }}>Auto Setup 1-Click (ZIP & Git)</h4>
                <p style={{ fontSize: 13, color: '#94a3b8', lineHeight: 1.5, margin: 0 }}>
                  Chỉ cần upload nguyên file ZIP mã nguồn hoặc dán Link Git Repository, hệ thống hPanel tự động nạp dependencies và khởi chạy.
                </p>
              </div>

              <div className={styles.hostingFeatureCard}>
                <div style={{ fontSize: 28, marginBottom: 12 }}>🎁</div>
                <h4 style={{ fontSize: 16, fontWeight: 800, color: '#fff', marginBottom: 8 }}>Tặng 1 Tên Miền Quốc Tế</h4>
                <p style={{ fontSize: 13, color: '#94a3b8', lineHeight: 1.5, margin: 0 }}>
                  Miễn phí 100% tên miền (.com, .net, .org...) năm đầu tiên, tiết kiệm ngay hàng trăm nghìn đồng chi phí khởi tạo.
                </p>
              </div>

              <div className={styles.hostingFeatureCard}>
                <div style={{ fontSize: 28, marginBottom: 12 }}>💸</div>
                <h4 style={{ fontSize: 16, fontWeight: 800, color: '#fff', marginBottom: 8 }}>Giảm Thêm 10% Trực Tiếp</h4>
                <p style={{ fontSize: 13, color: '#94a3b8', lineHeight: 1.5, margin: 0 }}>
                  Nhập mã <strong>BIGMANMARKETING10</strong> tại bước thanh toán để được giảm thêm 10% chồng lên mọi khuyến mãi.
                </p>
              </div>

              <div className={styles.hostingFeatureCard}>
                <div style={{ fontSize: 28, marginBottom: 12 }}>🔒</div>
                <h4 style={{ fontSize: 16, fontWeight: 800, color: '#fff', marginBottom: 8 }}>SSL & Tốc Độ LiteSpeed</h4>
                <p style={{ fontSize: 13, color: '#94a3b8', lineHeight: 1.5, margin: 0 }}>
                  Hạ tầng Cloud siêu tốc, chứng chỉ SSL miễn phí trọn đời, tải trang dưới 0.5 giây giúp tối ưu điểm SEO và giá thầu Ads.
                </p>
              </div>
            </div>

            {/* 3 Step Deployment Guide */}
            <div style={{ marginTop: 50 }}>
              <h3 style={{ fontSize: 22, fontWeight: 900, color: '#fff', textAlign: 'center', marginBottom: 30 }}>
                Hướng Dẫn 3 Bước Mua Hosting & Triển Khai Website Giá Rẻ Nhất
              </h3>

              <div className={styles.stepGuideGrid}>
                <div className={styles.stepGuideCard}>
                  <div className={styles.stepNumberBadge}>1</div>
                  <h4 style={{ fontSize: 16, fontWeight: 800, color: '#fff', marginBottom: 8 }}>Truy Cập Link & Chọn Gói</h4>
                  <p style={{ fontSize: 13.5, color: '#94a3b8', lineHeight: 1.6, margin: 0 }}>
                    Truy cập 👉 <a href="https://hostinger.com/BIGMANMARKETING10" target="_blank" rel="noopener noreferrer" style={{ color: '#a855f7', fontWeight: 700 }}>hostinger.com/BIGMANMARKETING10</a> và chọn gói <strong>Premium</strong> hoặc <strong>Business Web Hosting</strong> (khuyên dùng gói 12/24 tháng để nhận tên miền miễn phí).
                  </p>
                </div>

                <div className={styles.stepGuideCard}>
                  <div className={styles.stepNumberBadge}>2</div>
                  <h4 style={{ fontSize: 16, fontWeight: 800, color: '#fff', marginBottom: 8 }}>Áp Mã BIGMANMARKETING10</h4>
                  <p style={{ fontSize: 13.5, color: '#94a3b8', lineHeight: 1.6, margin: 0 }}>
                    Tại trang thanh toán, bấm vào ô <em>"Have a coupon code?"</em> và nhập <strong>BIGMANMARKETING10</strong> để giảm thêm 10%. Sau đó tiến hành thanh toán và nhận tên miền miễn phí.
                  </p>
                </div>

                <div className={styles.stepGuideCard}>
                  <div className={styles.stepNumberBadge}>3</div>
                  <h4 style={{ fontSize: 16, fontWeight: 800, color: '#fff', marginBottom: 8 }}>Upload ZIP / Git & Chạy Web</h4>
                  <p style={{ fontSize: 13.5, color: '#94a3b8', lineHeight: 1.6, margin: 0 }}>
                    Vào <strong>hPanel</strong> ➔ Chọn File Manager (hoặc mục Node.js/Git) ➔ Kéo thả file ZIP mã nguồn ShopTik ➔ Nhập biến môi trường <code>MONGODB_URI</code> ➔ Bấm Khởi chạy là website hoạt động ngay!
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ==========================================================================
         7. INTERACTIVE CAROUSEL TESTIMONIALS (KHÁCH HÀNG & CHỦ SHOP ĐÁNH GIÁ)
         ========================================================================== */}
        <section
          className={styles.carouselTestimonialSection}
          onMouseEnter={() => setIsTestimonialHovered(true)}
          onMouseLeave={() => setIsTestimonialHovered(false)}
        >
          <div className={styles.container}>
            <div className={styles.carouselTestimonialWrapper}>
              <span className={styles.carouselTestimonialTag}>
                KHÁCH HÀNG & CHỦ SHOP ĐÁNH GIÁ
              </span>
              <h2 className={styles.sectionTitle} style={{ marginBottom: 32 }}>
                Được Tin Dùng Bởi Các Nhà Bán Hàng
              </h2>

              {/* Testimonials List */}
              <div>
                {testimonials.map((item, idx) => (
                  currentTestimonial === idx ? (
                    <div key={idx} className={styles.carouselTestimonialCard}>
                      <div className={styles.carouselQuoteIcon}>“</div>
                      <blockquote>
                        <p className={styles.carouselQuoteText}>
                          "{item.quote}"
                        </p>
                      </blockquote>
                      <div className={styles.carouselAuthorBox}>
                        <img
                          src={item.avatar}
                          alt={item.name}
                          className={styles.carouselAvatar}
                        />
                        <div>
                          <span className={styles.carouselAuthorName}>{item.name}</span>
                          <span className={styles.carouselAuthorRole}>{item.title}</span>
                        </div>
                      </div>
                    </div>
                  ) : null
                ))}
              </div>

              {/* Pagination Dots */}
              <ul className={styles.carouselDotsList}>
                {testimonials.map((_, idx) => (
                  <li key={idx}>
                    <button
                      type="button"
                      aria-label={`Xem đánh giá ${idx + 1}`}
                      className={`${styles.carouselDotBtn} ${currentTestimonial === idx ? styles.carouselDotBtnActive : ''}`}
                      onClick={() => setCurrentTestimonial(idx)}
                    />
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>

        {/* ==========================================================================
         8. INTERACTIVE FAQ ACCORDION
         ========================================================================== */}
        <section id="faq" className={styles.faqSection}>
          <div className={styles.container}>
            <div className={styles.sectionTitleBlock}>
              <span className={styles.sectionTag}>GIẢI ĐÁP THẮC MẮC</span>
              <h2 className={styles.sectionTitle}>Câu Hỏi Thường Gặp</h2>
            </div>

            <div className={styles.faqList}>
              <div className={styles.faqItem}>
                <button
                  type="button"
                  className={styles.faqQuestion}
                  onClick={() => toggleFaq(0)}
                >
                  <span>1. Hệ thống có yêu cầu khách hàng phải tạo tài khoản/đăng nhập khi mua hàng không?</span>
                  {openFaq === 0 ? <FiChevronUp /> : <FiChevronDown />}
                </button>
                {openFaq === 0 && (
                  <div className={styles.faqAnswer}>
                    Không! ShopTik áp dụng triết lý <strong>Quick Checkout 1-Chạm</strong>. Khách hàng chỉ cần nhập Tên, SĐT và Địa chỉ nhận hàng là có thể đặt hàng ngay mà không bị gián đoạn bởi form đăng ký rườm rà. Hệ thống vẫn tự động lưu trữ và tích lũy lịch sử đơn hàng vào CRM dựa trên số điện thoại của khách.
                  </div>
                )}
              </div>

              <div className={styles.faqItem}>
                <button
                  type="button"
                  className={styles.faqQuestion}
                  onClick={() => toggleFaq(1)}
                >
                  <span>2. Tiền thanh toán VietQR sẽ về tài khoản ngân hàng nào?</span>
                  {openFaq === 1 ? <FiChevronUp /> : <FiChevronDown />}
                </button>
                {openFaq === 1 && (
                  <div className={styles.faqAnswer}>
                    Tiền chuyển khoản của khách hàng sẽ <strong>vào trực tiếp 100% tài khoản ngân hàng cá nhân hoặc doanh nghiệp của bạn</strong> (MBBank, Vietcombank, Techcombank, MSB, ACB...). Nền tảng không giữ tiền hay đóng vai trò trung gian thu hộ, đảm bảo dòng tiền của bạn luôn chủ động và an toàn tuyệt đối.
                  </div>
                )}
              </div>

              <div className={styles.faqItem}>
                <button
                  type="button"
                  className={styles.faqQuestion}
                  onClick={() => toggleFaq(2)}
                >
                  <span>3. Làm thế nào để cấu hình các hãng vận chuyển GHN, GHTK, Viettel Post?</span>
                  {openFaq === 2 ? <FiChevronUp /> : <FiChevronDown />}
                </button>
                {openFaq === 2 && (
                  <div className={styles.faqAnswer}>
                    Rất đơn giản! Bạn chỉ cần vào trang quản trị <code>/admin/shipping</code>, nhập Token API và Shop ID do hãng vận chuyển cấp rồi bấm Lưu cấu hình. Website đã có sẵn nút "Kiểm Tra Kết Nối" để bạn xác thực trực tiếp trước khi vận hành thực tế.
                  </div>
                )}
              </div>

              <div className={styles.faqItem}>
                <button
                  type="button"
                  className={styles.faqQuestion}
                  onClick={() => toggleFaq(3)}
                >
                  <span>4. Hệ thống có hỗ trợ tùy chỉnh logo, tên thương hiệu và màu sắc riêng không?</span>
                  {openFaq === 3 ? <FiChevronUp /> : <FiChevronDown />}
                </button>
                {openFaq === 3 && (
                  <div className={styles.faqAnswer}>
                    Có! Bạn có thể tùy chỉnh toàn diện: Tải lên Logo riêng, đổi tên shop, thay đổi màu chủ đạo (Primary Color), màu nền (Background), màu Header, màu Button và chọn các bộ theme Shopee, TikTok, Dark, Light bất cứ lúc nào trong mục <code>/admin/settings</code>.
                  </div>
                )}
              </div>

              <div className={styles.faqItem}>
                <button
                  type="button"
                  className={styles.faqQuestion}
                  onClick={() => toggleFaq(4)}
                >
                  <span>5. Tính năng gửi email thông báo hoạt động thế nào và có mất phí không?</span>
                  {openFaq === 4 ? <FiChevronUp /> : <FiChevronDown />}
                </button>
                {openFaq === 4 && (
                  <div className={styles.faqAnswer}>
                    Hệ thống sử dụng giao thức <strong>Gmail SMTP / Nodemailer hoàn toàn miễn phí</strong>. Khi khách đặt hàng thành công hoặc thanh toán, website sẽ tự động gửi email xác nhận kèm hóa đơn chi tiết về hòm thư của khách, đồng thời gửi email thông báo cho chủ shop. Bạn có thể dễ dàng cấu hình tài khoản Gmail và Mật khẩu ứng dụng trong mục <code>/admin/settings</code>.
                  </div>
                )}
              </div>

              <div className={styles.faqItem}>
                <button
                  type="button"
                  className={styles.faqQuestion}
                  onClick={() => toggleFaq(5)}
                >
                  <span>6. Tôi nên dùng gói Hosting nào để chạy web và có tự động cài đặt được không?</span>
                  {openFaq === 5 ? <FiChevronUp /> : <FiChevronDown />}
                </button>
                {openFaq === 5 && (
                  <div className={styles.faqAnswer}>
                    Chúng tôi khuyến nghị sử dụng <strong>Hostinger Web Hosting</strong> thông qua liên kết đối tác <a href="https://hostinger.com/BIGMANMARKETING10" target="_blank" rel="noopener noreferrer" style={{ color: '#a855f7', fontWeight: 700 }}>hostinger.com/BIGMANMARKETING10</a>. Bạn sẽ được <strong>tặng 1 tên miền quốc tế miễn phí</strong> và <strong>giảm thêm 10%</strong> khi nhập mã <code>BIGMANMARKETING10</code>. Điểm vượt trội là bạn chỉ cần tải lên nguyên file ZIP mã nguồn hoặc dán link Git là hệ thống tự động build và chạy website ngay lập tức!
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* ==========================================================================
         9. FINAL CTA BANNER
         ========================================================================== */}
        <section className={styles.container}>
          <div className={styles.ctaBanner}>
            <h2 className={styles.ctaBannerTitle}>Sẵn Sàng Bùng Nổ Doanh Số Cùng ShopTik?</h2>
            <p className={styles.ctaBannerDesc}>
              Cắt giảm 100% phí sàn 10-15%, sở hữu toàn bộ data khách hàng và tự động hóa hệ thống bán hàng độc lập ngay hôm nay!
            </p>
            <div style={{ display: 'flex', justifyContent: 'center', gap: 14, flexWrap: 'wrap' }}>
              <CoolMode options={{ particle: "🔥" }}>
                <button
                  type="button"
                  className={`${styles.btnPrimary} ${styles.btnHeroPrimary} ${styles.btnGradientShopee}`}
                  onClick={() => setIsPackageModalOpen(true)}
                >
                  <FiZap size={18} /> Đăng Ký Gói Ngoại Sàn 399K
                </button>
              </CoolMode>
              <CoolMode options={{ particle: "✨" }}>
                <Link href="/" className={`${styles.btnSecondary} ${styles.btnHeroSecondary}`}>
                  <FiShoppingBag size={18} /> Xem Cửa Hàng Live
                </Link>
              </CoolMode>
              <CoolMode options={{ particle: "⚡" }}>
                <Link href="/admin" className={`${styles.btnSecondary} ${styles.btnHeroSecondary}`}>
                  <FiZap size={18} /> Trang Quản Trị
                </Link>
              </CoolMode>
            </div>
          </div>
        </section>

        {/* ==========================================================================
         10. FOOTER
         ========================================================================== */}
        <footer className={styles.footer}>
          <div className={styles.container}>
            <div className={styles.footerGrid}>
              <div>
                <Link href="/landing" className={styles.logo}>
                  <div className={styles.logoIcon}>
                    <FiShoppingBag size={20} />
                  </div>
                  <span>ShopTik<span style={{ color: '#ee4d2d' }}>.</span></span>
                </Link>
                <p className={styles.footerBrandDesc}>
                  Nền tảng E-Commerce thế hệ mới: Tối ưu chuyển đổi, đa giao diện thông minh, vận chuyển đa hãng và thanh toán VietQR tự động.
                </p>
              </div>

              <div>
                <h4 className={styles.footerColTitle}>Khách Hàng</h4>
                <ul className={styles.footerColLinks}>
                  <li><Link href="/" className={styles.footerLink}>Trang Chủ Mua Sắm</Link></li>
                  <li><Link href="/?tab=products" className={styles.footerLink}>Tất Cả Sản Phẩm</Link></li>
                  <li><Link href="/?tab=categories" className={styles.footerLink}>Danh Mục Hàng</Link></li>
                  <li><Link href="/tracking" className={styles.footerLink}>Tra Cứu Đơn Hàng</Link></li>
                  <li><Link href="/cart" className={styles.footerLink}>Giỏ Hàng</Link></li>
                </ul>
              </div>

              <div>
                <h4 className={styles.footerColTitle}>Quản Trị Shop</h4>
                <ul className={styles.footerColLinks}>
                  <li><Link href="/admin" className={styles.footerLink}>Tổng Quan Báo Cáo</Link></li>
                  <li><Link href="/admin/orders" className={styles.footerLink}>Quản Lý Đơn Hàng</Link></li>
                  <li><Link href="/admin/products" className={styles.footerLink}>Quản Lý Sản Phẩm</Link></li>
                  <li><Link href="/admin/marketing/flash-sale" className={styles.footerLink}>Flash Sale & FOMO</Link></li>
                  <li><Link href="/admin/settings" className={styles.footerLink}>Cài Đặt Giao Diện Theme</Link></li>
                </ul>
              </div>

              <div>
                <h4 className={styles.footerColTitle}>Hỗ Trợ & Tích Hợp</h4>
                <ul className={styles.footerColLinks}>
                  <li><Link href="/chat" className={styles.footerLink}>Trò Chuyện Trực Tuyến</Link></li>
                  <li><Link href="/admin/shipping" className={styles.footerLink}>Cấu Hình GHN / GHTK</Link></li>
                  <li><Link href="/admin/payment" className={styles.footerLink}>Cấu Hình VietQR SePay</Link></li>
                  <li><Link href="/admin/marketing" className={styles.footerLink}>Facebook & TikTok CAPI</Link></li>
                </ul>
              </div>
            </div>

            <div className={styles.footerBottom}>
              <div>© {new Date().getFullYear()} ShopTik E-Commerce Platform. All rights reserved.</div>
              <div style={{ display: 'flex', gap: 20 }}>
                <span>Bảo Mật 100%</span>
                <span>•</span>
                <span>Tốc Độ Cao</span>
                <span>•</span>
                <span>Tự Động Hóa</span>
              </div>
            </div>
          </div>
        </footer>
      </div>

      {/* ==========================================================================
         11. MODAL ĐĂNG KÝ GÓI BÁN HÀNG NGOẠI SÀN 399.000₫
         ========================================================================== */}
      {isPackageModalOpen && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            width: '100vw',
            height: '100vh',
            background: 'rgba(0, 0, 0, 0.88)',
            backdropFilter: 'blur(16px)',
            WebkitBackdropFilter: 'blur(16px)',
            zIndex: 9999999,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 16,
            boxSizing: 'border-box',
          }}
          onClick={() => setIsPackageModalOpen(false)}
        >
          <div
            style={{
              width: '100%',
              maxWidth: 520,
              maxHeight: '92vh',
              overflowY: 'auto',
              WebkitOverflowScrolling: 'touch',
              background: 'linear-gradient(180deg, #131620 0%, #0d0f15 100%)',
              border: '1px solid rgba(238, 77, 45, 0.45)',
              borderRadius: 24,
              boxShadow: '0 30px 80px rgba(0, 0, 0, 0.95), 0 0 50px rgba(238, 77, 45, 0.25)',
              display: 'flex',
              flexDirection: 'column',
              position: 'relative',
              zIndex: 10000000,
              boxSizing: 'border-box',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div
              style={{
                padding: '20px 24px',
                background: 'linear-gradient(135deg, rgba(238, 77, 45, 0.15) 0%, rgba(59, 130, 246, 0.08) 100%)',
                borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: 12,
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div
                  style={{
                    width: 44,
                    height: 44,
                    borderRadius: 12,
                    background: 'linear-gradient(135deg, #ee4d2d, #f97316)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: 22,
                    boxShadow: '0 6px 16px rgba(238, 77, 45, 0.4)',
                    flexShrink: 0,
                  }}
                >
                  🚀
                </div>
                <div>
                  <h3 style={{ fontSize: 17, fontWeight: 900, color: '#ffffff', margin: 0, lineHeight: 1.3 }}>
                    Đăng Ký Gói Bán Hàng Ngoại Sàn
                  </h3>
                  <div style={{ fontSize: 12.5, color: '#f97316', fontWeight: 700, marginTop: 2 }}>
                    ⚡ Ưu Đãi Trọn Gói: <span style={{ color: '#fff' }}>399.000₫</span> (Tiết Kiệm 85%)
                  </div>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsPackageModalOpen(false)}
                style={{
                  width: 34,
                  height: 34,
                  borderRadius: '50%',
                  background: 'rgba(255, 255, 255, 0.08)',
                  border: '1px solid rgba(255, 255, 255, 0.15)',
                  color: '#cbd5e1',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  fontSize: 16,
                  transition: 'all 0.2s ease',
                  flexShrink: 0,
                }}
                aria-label="Đóng"
              >
                ✕
              </button>
            </div>

            {/* Modal Body */}
            <div style={{ padding: '22px 24px', display: 'flex', flexDirection: 'column', gap: 16 }}>
              {isOrderSubmitted ? (
                <div style={{ textAlign: 'center', padding: '10px 4px' }}>
                  <div
                    style={{
                      width: 64,
                      height: 64,
                      borderRadius: '50%',
                      background: 'rgba(16, 185, 129, 0.15)',
                      border: '2px solid #10b981',
                      color: '#10b981',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      margin: '0 auto 14px',
                      fontSize: 32,
                    }}
                  >
                    ✓
                  </div>
                  <h4 style={{ fontSize: 20, fontWeight: 900, color: '#fff', marginBottom: 6 }}>
                    Đăng Ký Nhận Gói 399K Thành Công!
                  </h4>
                  <p style={{ fontSize: 13.5, color: '#94a3b8', lineHeight: 1.5, marginBottom: 16 }}>
                    Cảm ơn <strong>{orderName}</strong> ({orderPhone})! Thông tin đã được ghi nhận. Mã đơn: <strong style={{ color: '#f97316' }}>{orderCode}</strong>
                  </p>

                  {/* Dynamic VietQR Preview */}
                  <div
                    style={{
                      background: '#ffffff',
                      borderRadius: 16,
                      padding: 14,
                      width: 'fit-content',
                      margin: '0 auto 16px',
                      boxShadow: '0 12px 30px rgba(0,0,0,0.6)',
                    }}
                  >
                    <img
                      src={`https://img.vietqr.io/image/MB-0973475484-compact2.png?amount=399000&addInfo=GOI399K%20${encodeURIComponent(orderPhone)}&accountName=SHOPTIK%20STORE`}
                      alt="VietQR Chuyển Khoản 399K"
                      style={{ width: 230, height: 'auto', display: 'block', borderRadius: 10 }}
                      onError={(e) => {
                        (e.currentTarget as HTMLElement).style.display = 'none';
                      }}
                    />
                  </div>

                  <div
                    style={{
                      background: 'rgba(238, 77, 45, 0.08)',
                      border: '1px solid rgba(238, 77, 45, 0.3)',
                      borderRadius: 14,
                      padding: '14px 16px',
                      fontSize: 13,
                      color: '#cbd5e1',
                      textAlign: 'left',
                      lineHeight: 1.6,
                      marginBottom: 16,
                    }}
                  >
                    <div style={{ fontWeight: 800, color: '#f97316', marginBottom: 6, display: 'flex', alignItems: 'center', gap: 6 }}>
                      💳 Thông Tin Chuyển Khoản Nhận Mã Nguồn:
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '4px 0' }}>
                      <span>• Ngân hàng: <strong>MBBank (Quân Đội)</strong></span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '4px 0' }}>
                      <span>• Số tài khoản: <strong style={{ color: '#fff', fontSize: 14 }}>0973475484</strong></span>
                      <button
                        type="button"
                        onClick={() => copyToClipboard('0973475484', 'stk')}
                        style={{
                          background: 'rgba(238, 77, 45, 0.2)',
                          border: '1px solid rgba(238, 77, 45, 0.4)',
                          color: '#f97316',
                          fontSize: 11.5,
                          fontWeight: 700,
                          padding: '3px 10px',
                          borderRadius: 6,
                          cursor: 'pointer',
                        }}
                      >
                        {copiedField === 'stk' ? '✓ Đã chép' : 'Sao chép'}
                      </button>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '4px 0' }}>
                      <span>• Số tiền: <strong style={{ color: '#ee4d2d', fontSize: 14 }}>399.000₫</strong></span>
                      <button
                        type="button"
                        onClick={() => copyToClipboard('399000', 'money')}
                        style={{
                          background: 'rgba(238, 77, 45, 0.2)',
                          border: '1px solid rgba(238, 77, 45, 0.4)',
                          color: '#f97316',
                          fontSize: 11.5,
                          fontWeight: 700,
                          padding: '3px 10px',
                          borderRadius: 6,
                          cursor: 'pointer',
                        }}
                      >
                        {copiedField === 'money' ? '✓ Đã chép' : 'Sao chép'}
                      </button>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '4px 0' }}>
                      <span>• Nội dung: <strong style={{ color: '#fff', fontSize: 14 }}>GOI399K {orderPhone}</strong></span>
                      <button
                        type="button"
                        onClick={() => copyToClipboard(`GOI399K ${orderPhone}`, 'memo')}
                        style={{
                          background: 'rgba(238, 77, 45, 0.2)',
                          border: '1px solid rgba(238, 77, 45, 0.4)',
                          color: '#f97316',
                          fontSize: 11.5,
                          fontWeight: 700,
                          padding: '3px 10px',
                          borderRadius: 6,
                          cursor: 'pointer',
                        }}
                      >
                        {copiedField === 'memo' ? '✓ Đã chép' : 'Sao chép'}
                      </button>
                    </div>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                    <a
                      href="https://zalo.me/0973475484"
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{
                        textDecoration: 'none',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: 8,
                        padding: '14px 20px',
                        background: 'linear-gradient(135deg, #0068ff, #0084ff)',
                        color: '#fff',
                        borderRadius: 12,
                        fontWeight: 800,
                        fontSize: 15,
                        boxShadow: '0 6px 20px rgba(0, 104, 255, 0.4)',
                      }}
                    >
                      💬 Nhắn Tin Zalo Nhận Source Code Ngay
                    </a>
                    <button
                      type="button"
                      onClick={() => {
                        setIsPackageModalOpen(false);
                        setIsOrderSubmitted(false);
                      }}
                      style={{
                        background: 'rgba(255,255,255,0.06)',
                        border: '1px solid rgba(255,255,255,0.12)',
                        color: '#94a3b8',
                        padding: '12px',
                        borderRadius: 12,
                        cursor: 'pointer',
                        fontSize: 13.5,
                        fontWeight: 700,
                      }}
                    >
                      Đóng Cửa Sổ
                    </button>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleOrderSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                  {/* Order Summary Bar */}
                  <div
                    style={{
                      background: 'linear-gradient(135deg, rgba(238, 77, 45, 0.12) 0%, rgba(255, 255, 255, 0.03) 100%)',
                      border: '1px solid rgba(238, 77, 45, 0.35)',
                      borderRadius: 16,
                      padding: '16px 18px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      gap: 12,
                    }}
                  >
                    <div>
                      <div style={{ fontSize: 14.5, fontWeight: 800, color: '#ffffff', marginBottom: 4 }}>
                        Gói Bán Hàng Ngoại Sàn Tự Động 100%
                      </div>
                      <div style={{ fontSize: 12, color: '#10b981', display: 'flex', alignItems: 'center', gap: 6 }}>
                        <FiCheckCircle size={14} /> Full Code Next.js + Hướng Dẫn Ads + Tự Động Hóa
                      </div>
                    </div>
                    <div style={{ textAlign: 'right', flexShrink: 0 }}>
                      <div style={{ fontSize: 22, fontWeight: 900, color: '#ee4d2d', letterSpacing: '-0.5px' }}>
                        399.000₫
                      </div>
                      <div style={{ fontSize: 11.5, textDecoration: 'line-through', color: '#64748b' }}>
                        2.490.000₫
                      </div>
                    </div>
                  </div>

                  {/* Input 1: Name */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                    <label style={{ fontSize: 13, fontWeight: 700, color: '#e2e8f0', display: 'flex', alignItems: 'center', gap: 6 }}>
                      <span>👤 Họ và Tên của bạn</span> <span style={{ color: '#ee4d2d' }}>*</span>
                    </label>
                    <input
                      type="text"
                      placeholder="VD: Nguyễn Văn Nam"
                      value={orderName}
                      onChange={(e) => setOrderName(e.target.value)}
                      required
                      style={{
                        width: '100%',
                        boxSizing: 'border-box',
                        background: 'rgba(255, 255, 255, 0.06)',
                        border: '1.5px solid rgba(255, 255, 255, 0.15)',
                        borderRadius: 12,
                        padding: '13px 16px',
                        color: '#ffffff',
                        fontSize: 14,
                        outline: 'none',
                      }}
                    />
                  </div>

                  {/* Input 2: Phone */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                    <label style={{ fontSize: 13, fontWeight: 700, color: '#e2e8f0', display: 'flex', alignItems: 'center', gap: 6 }}>
                      <span>📱 Số điện thoại / Zalo để nhận mã nguồn</span> <span style={{ color: '#ee4d2d' }}>*</span>
                    </label>
                    <input
                      type="tel"
                      placeholder="VD: 0987654321"
                      value={orderPhone}
                      onChange={(e) => setOrderPhone(e.target.value)}
                      required
                      style={{
                        width: '100%',
                        boxSizing: 'border-box',
                        background: 'rgba(255, 255, 255, 0.06)',
                        border: '1.5px solid rgba(255, 255, 255, 0.15)',
                        borderRadius: 12,
                        padding: '13px 16px',
                        color: '#ffffff',
                        fontSize: 14,
                        outline: 'none',
                      }}
                    />
                  </div>

                  {/* Input 3: Email */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                    <label style={{ fontSize: 13, fontWeight: 700, color: '#e2e8f0', display: 'flex', alignItems: 'center', gap: 6 }}>
                      <span>📧 Email nhận file ZIP mã nguồn</span> <span style={{ fontSize: 11, color: '#10b981', fontWeight: 600 }}>(Khuyên dùng)</span>
                    </label>
                    <input
                      type="email"
                      placeholder="VD: nguyenvannam@gmail.com"
                      value={orderEmail}
                      onChange={(e) => setOrderEmail(e.target.value)}
                      style={{
                        width: '100%',
                        boxSizing: 'border-box',
                        background: 'rgba(255, 255, 255, 0.06)',
                        border: '1.5px solid rgba(255, 255, 255, 0.15)',
                        borderRadius: 12,
                        padding: '13px 16px',
                        color: '#ffffff',
                        fontSize: 14,
                        outline: 'none',
                      }}
                    />
                  </div>

                  {/* Input 4: Notes */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                    <label style={{ fontSize: 13, fontWeight: 700, color: '#cbd5e1', display: 'flex', alignItems: 'center', gap: 6 }}>
                      <span>📝 Ghi chú hoặc yêu cầu hỗ trợ</span> <span style={{ fontSize: 11, color: '#94a3b8' }}>(Tùy chọn)</span>
                    </label>
                    <input
                      type="text"
                      placeholder="VD: Hỗ trợ cài đặt giúp mình qua Ultraviewer..."
                      value={orderNotes}
                      onChange={(e) => setOrderNotes(e.target.value)}
                      style={{
                        width: '100%',
                        boxSizing: 'border-box',
                        background: 'rgba(255, 255, 255, 0.06)',
                        border: '1.5px solid rgba(255, 255, 255, 0.15)',
                        borderRadius: 12,
                        padding: '13px 16px',
                        color: '#ffffff',
                        fontSize: 14,
                        outline: 'none',
                      }}
                    />
                  </div>

                  {/* Trust Banner */}
                  <div
                    style={{
                      background: 'rgba(16, 185, 129, 0.08)',
                      border: '1px solid rgba(16, 185, 129, 0.25)',
                      borderRadius: 12,
                      padding: '12px 14px',
                      fontSize: 12,
                      color: '#a7f3d0',
                      lineHeight: 1.5,
                      display: 'flex',
                      alignItems: 'center',
                      gap: 8,
                    }}
                  >
                    <span>🔒</span>
                    <span>Cam kết bảo mật thông tin 100%. Hỗ trợ kỹ thuật 1:1 qua Ultraviewer / Zalo nếu gặp khó khăn khi cài đặt.</span>
                  </div>

                  {/* Submit Button */}
                  <CoolMode options={{ particle: "🎉" }} className="w-full" style={{ width: '100%' } as React.CSSProperties}>
                    <button
                      type="submit"
                      disabled={isOrderSubmitting}
                      style={{
                        width: '100%',
                        padding: '16px 20px',
                        background: 'linear-gradient(135deg, #ee4d2d 0%, #ff5722 50%, #f97316 100%)',
                        color: '#ffffff',
                        border: 'none',
                        borderRadius: 14,
                        fontSize: 16,
                        fontWeight: 900,
                        cursor: isOrderSubmitting ? 'not-allowed' : 'pointer',
                        boxShadow: '0 8px 25px rgba(238, 77, 45, 0.5)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: 10,
                        letterSpacing: '0.2px',
                        transition: 'all 0.2s ease',
                      }}
                    >
                      <FiZap size={18} />
                      {isOrderSubmitting ? 'ĐANG XỬ LÝ ĐĂNG KÝ...' : 'XÁC NHẬN ĐĂNG KÝ GÓI 399.000₫'}
                    </button>
                  </CoolMode>
                </form>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ==========================================================================
         12. MOBILE STICKY FLOATING ACTION BAR
         ========================================================================== */}
      <div className={styles.mobileBottomBar}>
        <div className={styles.mobileBottomBarInfo}>
          <span className={styles.mobileBottomBarTitle}>🔥 Gói Ngoại Sàn 0% Phí</span>
          <span className={styles.mobileBottomBarPrice}>399.000₫</span>
        </div>
        <CoolMode options={{ particle: "⚡" }}>
          <button
            type="button"
            className={styles.mobileBottomBarBtn}
            onClick={() => setIsPackageModalOpen(true)}
          >
            <FiZap /> Mua Gói 399K
          </button>
        </CoolMode>
      </div>

      {/* ==========================================================================
         13. LIGHTBOX / FULLSCREEN IMAGE PREVIEW MODAL
         ========================================================================== */}
      {activePreviewIndex !== null && (
        <div className={styles.lightboxOverlay} onClick={closePreview}>
          {/* Lightbox Header */}
          <div className={styles.lightboxHeader} onClick={(e) => e.stopPropagation()}>
            <div className={styles.lightboxTitleWrap}>
              <span className={styles.lightboxCounter}>
                HÌNH ẢNH {activePreviewIndex + 1} / {heroGallery.length} • (DÙNG PHÍM MŨI TÊN ⬅️ ➡️ ĐỂ CHUYỂN)
              </span>
              <h3 className={styles.lightboxTitle}>
                {heroGallery[activePreviewIndex].title}
              </h3>
            </div>
            <button
              type="button"
              className={styles.lightboxCloseBtn}
              onClick={closePreview}
              title="Đóng (ESC)"
              aria-label="Đóng"
            >
              ✕
            </button>
          </div>

          {/* Lightbox Main Image Body with Left / Right Navigation */}
          <div className={styles.lightboxBody} onClick={closePreview}>
            <button
              type="button"
              className={`${styles.lightboxNavBtn} ${styles.lightboxNavPrev}`}
              onClick={prevPreview}
              title="Ảnh trước (Mũi tên trái)"
              aria-label="Ảnh trước"
            >
              <FiChevronLeft />
            </button>

            <div className={styles.lightboxImgWrap} onClick={(e) => e.stopPropagation()}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={heroGallery[activePreviewIndex].src}
                alt={heroGallery[activePreviewIndex].title}
                className={styles.lightboxImg}
              />
            </div>

            <button
              type="button"
              className={`${styles.lightboxNavBtn} ${styles.lightboxNavNext}`}
              onClick={nextPreview}
              title="Ảnh tiếp theo (Mũi tên phải)"
              aria-label="Ảnh tiếp theo"
            >
              <FiChevronRight />
            </button>
          </div>

          {/* Lightbox Footer with Description & Thumbnails */}
          <div className={styles.lightboxFooter} onClick={(e) => e.stopPropagation()}>
            <p className={styles.lightboxDesc}>
              {heroGallery[activePreviewIndex].desc}
            </p>

            <div className={styles.lightboxThumbnails}>
              {heroGallery.map((item, idx) => (
                <button
                  key={item.src}
                  type="button"
                  className={`${styles.lightboxThumb} ${activePreviewIndex === idx ? styles.lightboxThumbActive : ''}`}
                  onClick={() => setActivePreviewIndex(idx)}
                  title={item.title}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={item.src} alt={item.title} />
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
