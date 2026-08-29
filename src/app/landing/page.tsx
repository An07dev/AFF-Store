'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  FiZap,
  FiShoppingBag,
  FiTruck,
  FiBarChart2,
  FiCheck,
  FiChevronDown,
  FiChevronUp,
  FiChevronRight,
  FiCheckCircle,
  FiExternalLink,
  FiX,
  FiZoomIn,
  FiChevronLeft,
  FiShield,
} from 'react-icons/fi';
import { CoolMode } from '@/registry/magicui/cool-mode';
import { OrbitingCircles } from '@/registry/magicui/orbiting-circles';
import dynamic from 'next/dynamic';
import { AnimatedList } from '@/registry/magicui/animated-list';
import ImageCarouselHeroDemo from '@/components/ui/demo';
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
    name: 'Mất 10 - 15% Phí Sàn',
    description: 'Bào mòn biên lợi nhuận trên từng đơn hàng',
    time: 'Vừa xong',
    icon: '💸',
    color: 'rgba(239, 68, 68, 0.25)',
    isPositive: false,
  },
  {
    name: 'Giam Tiền Hàng 7 - 14 Ngày',
    description: 'Chôn vốn xoay vòng, đối soát chậm trễ',
    time: '2m ago',
    icon: '⏳',
    color: 'rgba(249, 115, 22, 0.25)',
    isPositive: false,
  },
  {
    name: 'Ẩn 100% SĐT Khách',
    description: 'Sàn độc quyền data, không thể remarketing',
    time: '5m ago',
    icon: '🚫',
    color: 'rgba(239, 68, 68, 0.25)',
    isPositive: false,
  },
  {
    name: 'Nguy Cơ Khóa Shop',
    description: 'Phụ thuộc thuật toán quét lỗi bất chợt',
    time: '12m ago',
    icon: '⚠️',
    color: 'rgba(234, 179, 8, 0.25)',
    isPositive: false,
  },
  {
    name: 'Thất Thoát Dữ Liệu Ads',
    description: 'Không có Meta CAPI, chi phí CPA đắt đỏ',
    time: '18m ago',
    icon: '📉',
    color: 'rgba(239, 68, 68, 0.25)',
    isPositive: false,
  },
  {
    name: 'Phạt Phản Hồi Chậm',
    description: 'Hạ điểm vận hành nếu không trực chat 24/7',
    time: '25m ago',
    icon: '🤖',
    color: 'rgba(249, 115, 22, 0.25)',
    isPositive: false,
  },
];

const rawShopTikBenefits: ComparisonNotificationItem[] = [
  {
    name: 'Khớp Lệnh VietQR 1s',
    description: 'Tiền về thẳng tài khoản ngân hàng tức thì',
    time: 'Vừa xong',
    icon: '⚡',
    color: 'rgba(16, 185, 129, 0.3)',
    isPositive: true,
  },
  {
    name: '0% Phí Sàn Trọn Đời',
    description: 'Giữ trọn 100% doanh thu & lợi nhuận',
    time: '1m ago',
    icon: '💰',
    color: 'rgba(16, 185, 129, 0.3)',
    isPositive: true,
  },
  {
    name: 'Sở Hữu 100% Data Khách',
    description: 'Lưu tự động SĐT, Tên, Địa chỉ vào Database riêng',
    time: '4m ago',
    icon: '👥',
    color: 'rgba(99, 102, 241, 0.3)',
    isPositive: true,
  },
  {
    name: 'Đẩy Đơn GHN / GHTK 1-Chạm',
    description: 'Tự tính phí ship, bưu tá tự đến lấy hàng',
    time: '8m ago',
    icon: '🚚',
    color: 'rgba(59, 130, 246, 0.3)',
    isPositive: true,
  },
  {
    name: 'Chuẩn Meta & TikTok CAPI',
    description: 'Đo lường 100% chuyển đổi, tối ưu chi phí Ads',
    time: '15m ago',
    icon: '🎯',
    color: 'rgba(168, 85, 247, 0.3)',
    isPositive: true,
  },
  {
    name: 'Tự Động Gửi Email 24/7',
    description: 'Xác nhận đơn và thông báo vận đơn tức thì',
    time: '22m ago',
    icon: '✉️',
    color: 'rgba(16, 185, 129, 0.3)',
    isPositive: true,
  },
];

const painPointsList = Array.from({ length: 6 }, () => rawPainPoints).flat();
const benefitsList = Array.from({ length: 6 }, () => rawShopTikBenefits).flat();

const planDetails = {
  '399k': {
    name: 'Gói Bán Hàng Ngoại Sàn (Tự Cài Đặt)',
    shortName: 'Gói Tự Cài 399K',
    priceNumber: 399000,
    priceStr: '399.000₫',
    originalPriceStr: '2.490.000₫',
    memoPrefix: 'GOI399K',
    badge: 'Full Source Code + Hướng Dẫn A-Z',
  },
  '799k': {
    name: 'Gói Setup & Cài Đặt Trọn Gói A - Z',
    shortName: 'Gói Setup A-Z 799K',
    priceNumber: 799000,
    priceStr: '799.000₫',
    originalPriceStr: '3.500.000₫',
    memoPrefix: 'GOI799K',
    badge: 'Bàn Giao Chìa Khóa Trao Tay (Cài Sẵn A-Z)',
  },
};

export default function LandingPage() {
  // Mobile Menu State
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Package Order Modal State
  const [isPackageModalOpen, setIsPackageModalOpen] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<'399k' | '799k'>('399k');
  const [orderName, setOrderName] = useState('');
  const [orderPhone, setOrderPhone] = useState('');
  const [orderEmail, setOrderEmail] = useState('');
  const [orderNotes, setOrderNotes] = useState('');
  const [orderCode, setOrderCode] = useState('');
  const [isOrderSubmitting, setIsOrderSubmitting] = useState(false);
  const [isOrderSubmitted, setIsOrderSubmitted] = useState(false);
  const [copiedField, setCopiedField] = useState<string | null>(null);

  const openOrderModal = (plan: '399k' | '799k' = '399k') => {
    setSelectedPlan(plan);
    setIsOrderSubmitted(false);
    setIsPackageModalOpen(true);
  };

  // Testimonials Carousel State & Auto-Play Timer
  const [currentTestimonial, setCurrentTestimonial] = useState(0);
  const [isTestimonialHovered, setIsTestimonialHovered] = useState(false);

  const testimonials = [
    {
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&auto=format&fit=crop&q=80',
      name: 'Nguyễn Thu Hằng',
      title: 'Founder • Hằng Boutique',
      quote: 'Tính năng VietQR tự động giúp shop tiết kiệm nhân sự đối soát. Khách quét mã xong là web báo thành công ngay trong 1s, tiền về thẳng tài khoản mà không mất 1 đồng phí sàn nào.',
    },
    {
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&auto=format&fit=crop&q=80',
      name: 'Trần Hoàng Minh',
      title: 'Founder • TechZone Phụ Kiện',
      quote: 'Tích hợp Meta CAPI & TikTok Events API server-side giúp số liệu đo lường chuẩn xác 100%, khắc phục hoàn toàn tình trạng rớt đơn trên iOS, giảm mạnh chi phí CPA.',
    },
    {
      avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=300&auto=format&fit=crop&q=80',
      name: 'Lê Phương Thảo',
      title: 'Quản Lý • Thảo House',
      quote: 'Xuất đơn 1-Click sang GHN và GHTK cực kỳ nhanh. Shipper tự qua lấy hàng theo mã vận đơn in sẵn, khách có trang tra cứu lộ trình 5 bước rất chuyên nghiệp.',
    },
  ];

  // Auto-scroll testimonial every 4.5 seconds
  useEffect(() => {
    if (isTestimonialHovered) return;
    const timer = setInterval(() => {
      setCurrentTestimonial((prev) => (prev + 1) % testimonials.length);
    }, 4500);
    return () => clearInterval(timer);
  }, [isTestimonialHovered, testimonials.length]);

  // Lightbox / Image Preview State
  const [activePreviewIndex, setActivePreviewIndex] = useState<number | null>(null);
  const [previewGalleryType, setPreviewGalleryType] = useState<'hero' | 'admin'>('hero');

  const heroGallery = [
    {
      src: '/images/hero-feed.png',
      title: 'Danh Mục & Gợi Ý Hôm Nay',
      desc: 'Trang chủ chuẩn TMĐT với luồng gợi ý sản phẩm thông minh, nhãn Freeship XTRA, flash sale và bộ lọc danh mục mượt mà.',
      tag: 'Gợi Ý Sản Phẩm',
      badge: '-35%',
    },
    {
      src: '/images/hero-product.png',
      title: 'Chi Tiết Sản Phẩm & Biến Thể Size/Màu',
      desc: 'Giao diện chuẩn sàn TMĐT: chọn phân loại hàng, bảng giá khuyến mãi, voucher giảm giá và mua ngay 1-chạm.',
      tag: 'Sản Phẩm & Phân Loại',
      badge: '229K',
    },
    {
      src: '/images/hero-cart.png',
      title: 'Giỏ Hàng Chuẩn TMĐT & Tóm Tắt Đơn Hàng',
      desc: 'Quản lý số lượng, chọn xóa sản phẩm linh hoạt, tóm tắt tổng thanh toán và tiến hành đặt hàng nhanh chóng.',
      tag: 'Giỏ Hàng Chuẩn',
      badge: '7 Món',
    },
    {
      src: '/images/hero-checkout.png',
      title: 'Xác Nhận Đơn Hàng & Flash Sale Countdown',
      desc: 'Form chốt đơn tối ưu tỷ lệ chuyển đổi: địa chỉ giao hàng, danh sách món hàng và đồng hồ đếm ngược FOMO 15 phút.',
      tag: 'Quick Checkout',
      badge: '14:58',
    },
    {
      src: '/images/hero-chat.png',
      title: 'AI Trợ Lý CSKH 24/7 & Tư Vấn Chốt Đơn',
      desc: 'Trợ lý AI tự động tư vấn chọn size, kiểm tra tình trạng đơn hàng, giải đáp chính sách và gửi link mua hàng 1-chạm.',
      tag: 'AI CSKH 24/7',
      badge: 'AI Live',
    },
    {
      src: '/images/preview-tracking.png',
      title: 'Tra Cứu Vận Đơn & Cổng VietQR',
      desc: 'Theo dõi tiến trình bưu tá GHN/GHTK 5 bước và cổng thanh toán VietQR tự động khớp lệnh 1s.',
      tag: 'Tra Cứu & VietQR',
      badge: '5 Bước',
    },
  ];

  const adminGallery = [
    {
      src: '/images/preview-admin-dashboard-v2.png',
      title: 'Tổng Quan Báo Cáo Kinh Doanh & Doanh Thu Realtime',
      desc: 'Báo cáo doanh thu trực quan theo ngày/tháng, thống kê đơn hàng, top sản phẩm bán chạy và tỷ lệ chuyển đổi realtime.',
      tag: 'Báo Cáo Realtime',
      badge: 'Doanh Thu Live',
    },
    {
      src: '/images/preview-admin-chat-v2.png',
      title: 'Tin Nhắn CSKH & AI Trợ Lý Tự Động Chốt Đơn 24/7',
      desc: 'Hộp thư trực tiếp với khách mua hàng, trợ lý AI thông minh tự động tư vấn size, gửi link sản phẩm và chốt đơn 24/7.',
      tag: 'AI Trợ Lý CSKH',
      badge: 'Realtime Chat',
    },
    {
      src: '/images/preview-admin-products-v2.png',
      title: 'Quản Lý Kho Hàng & Danh Sách 19+ Sản Phẩm Mẫu',
      desc: 'Quản lý toàn diện biến thể màu sắc, kích cỡ, bảng giá, tồn kho và các thiết lập khuyến mãi flash sale.',
      tag: 'Kho Hàng & Biến Thể',
      badge: 'Multi-Variants',
    },
    {
      src: '/images/preview-admin-orders-v2.png',
      title: 'Quản Lý Đơn Hàng, Khách Hàng & Trạng Thái VietQR',
      desc: 'Theo dõi chi tiết đơn hàng, khách hàng, tự động cập nhật trạng thái thanh toán VietQR qua SePay và xuất vận đơn.',
      tag: 'Quản Lý Đơn Hàng',
      badge: 'Khớp Lệnh 1s',
    },
    {
      src: '/images/preview-admin-shipping-v2.png',
      title: 'Quản Lý Vận Chuyển & Đẩy Đơn GHN / GHTK / Viettel Post',
      desc: 'Kết nối API trực tiếp với các đơn vị vận chuyển hàng đầu, tự động tính phí ship, in tem vận đơn và đẩy đơn 1-chạm.',
      tag: 'Vận Chuyển Đa Hãng',
      badge: 'GHN / GHTK / VTP',
    },
    {
      src: '/images/preview-admin-vietqr-v2.png',
      title: 'Cổng Thanh Toán VietQR & SePay Webhook Tự Động',
      desc: 'Cấu hình tài khoản ngân hàng nhận tiền trực tiếp 100%, sinh mã QR Napas247 động theo đơn và khớp lệnh 1 giây.',
      tag: 'Cổng VietQR SePay',
      badge: '0% Phí Sàn',
    },
    {
      src: '/images/preview-admin-theme-v2.png',
      title: 'Cấu Hình Giao Diện & Bộ 7 Multi-Themes Live Preview',
      desc: 'Tùy chỉnh màu sắc chủ đạo, font chữ, logo thương hiệu và linh hoạt chuyển đổi giữa 7 bộ giao diện Shopee / TikTok / Dark.',
      tag: 'Đa Giao Diện Multi-Theme',
      badge: '7 Themes',
    },
    {
      src: '/images/preview-admin-marketing-v2.png',
      title: 'Báo Cáo Phễu Chuyển Đổi & Đo Lường Meta CAPI / TikTok Ads',
      desc: 'Tích hợp Server-Side Meta Conversions API & TikTok Events API, bảo toàn 100% dữ liệu quảng cáo chống rớt đơn trên iOS.',
      tag: 'Meta & TikTok CAPI',
      badge: '100% Tracking',
    },
  ];

  const currentGalleryList = previewGalleryType === 'admin' ? adminGallery : heroGallery;

  const openPreview = (index: number, type: 'hero' | 'admin' = 'hero') => {
    setPreviewGalleryType(type);
    setActivePreviewIndex(index);
  };

  const closePreview = () => {
    setActivePreviewIndex(null);
  };

  const nextPreview = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    if (activePreviewIndex === null) return;
    setActivePreviewIndex((activePreviewIndex + 1) % currentGalleryList.length);
  };

  const prevPreview = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    if (activePreviewIndex === null) return;
    setActivePreviewIndex((activePreviewIndex - 1 + currentGalleryList.length) % currentGalleryList.length);
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

  // Set body background to dark base on landing page
  useEffect(() => {
    const origBodyBg = document.body.style.backgroundColor;
    const origDocBg = document.documentElement.style.backgroundColor;
    document.body.style.backgroundColor = '#080a12';
    document.documentElement.style.backgroundColor = '#080a12';
    return () => {
      document.body.style.backgroundColor = origBodyBg;
      document.documentElement.style.backgroundColor = origDocBg;
    };
  }, []);

  // Lock body scroll when modal is open
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
    const prefix = selectedPlan === '799k' ? 'ST799K_' : 'ST399K_';
    try {
      const res = await fetch('/api/landing-leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: orderName.trim(),
          phone: orderPhone.trim(),
          email: orderEmail.trim(),
          notes: `[Gói: ${selectedPlan.toUpperCase()}] ${orderNotes.trim()}`,
          plan: selectedPlan,
        }),
      });
      const data = await res.json();
      if (data.orderCode) {
        setOrderCode(data.orderCode);
      } else {
        setOrderCode(prefix + Math.floor(100000 + Math.random() * 900000));
      }
    } catch (err) {
      console.warn('Order submission offline fallback:', err);
      setOrderCode(prefix + Math.floor(100000 + Math.random() * 900000));
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
  const [copiedCouponToast, setCopiedCouponToast] = useState<boolean>(false);

  const handleCopyCoupon = () => {
    navigator.clipboard?.writeText('BIGMANMARKETING10');
    setCopiedCouponToast(true);
    setTimeout(() => setCopiedCouponToast(false), 2500);
  };

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
      tag: 'Chuẩn Sàn TMĐT • Rực Rỡ & Nổi Bật',
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
      tag: 'Phong Cách TikTok • Trẻ Trung & Cuốn Hút',
      radius: 8,
    },
    dark: {
      name: 'Sleek Dark',
      primary: '#3b82f6',
      bg: '#090a0f',
      cardBg: '#13161f',
      textColor: '#f8fafc',
      badgeBg: 'rgba(59, 130, 246, 0.2)',
      badgeColor: '#60a5fa',
      tag: 'Xanh Than Hiện Đại • Đậm Chất Công Nghệ',
      radius: 12,
    },
    light: {
      name: 'Clean Light',
      primary: '#2563eb',
      bg: '#f8fafc',
      cardBg: '#ffffff',
      textColor: '#0f172a',
      badgeBg: '#dbeafe',
      badgeColor: '#1d4ed8',
      tag: 'Trắng Tinh Tế • Thanh Lịch & Tối Ưu Đọc',
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
      tag: 'Tím Neon • Cá Tính & Đột Phá Độc Bản',
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
      tag: 'Xanh Lá Tươi Mát • Chuẩn Organic & Health',
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
      tag: 'Vàng Hoàng Gia • Đẳng Cấp & Sang Trọng',
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

  const currentPlanInfo = planDetails[selectedPlan];

  return (
    <div className={styles.page}>

      {/* ==========================================================================
         HEADER & HERO SECTION
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
                <a href="#so-sanh" className={styles.rareNavLink}>So Sánh</a>
                <a href="#themes" className={styles.rareNavLink}>Theme</a>
                <a href="#orbit" className={styles.rareNavLink}>Hệ Sinh Thái</a>
                <a href="#danh-gia" className={styles.rareNavLink}>Đánh Giá</a>
                <a href="#goi-ngoai-san" className={styles.rareNavLink} style={{ color: '#a5b4fc', fontWeight: 700 }}>⚡ Gói 399K</a>
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
                    onClick={() => openOrderModal('399k')}
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
                  <a href="#so-sanh" className={styles.drawerNavItem} onClick={() => setIsMobileMenuOpen(false)}>
                    <div className={styles.drawerNavLeft}>
                      <span className={styles.drawerNavEmoji}>⚖️</span>
                      <span className={styles.drawerNavText}>So Sánh Sàn vs Ngoại Sàn</span>
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
                  <a href="#orbit" className={styles.drawerNavItem} onClick={() => setIsMobileMenuOpen(false)}>
                    <div className={styles.drawerNavLeft}>
                      <span className={styles.drawerNavEmoji}>🌐</span>
                      <span className={styles.drawerNavText}>Hệ Sinh Thái & Hiệu Năng</span>
                    </div>
                    <FiChevronRight size={18} className={styles.drawerNavChevron} />
                  </a>
                  <a href="#danh-gia" className={styles.drawerNavItem} onClick={() => setIsMobileMenuOpen(false)}>
                    <div className={styles.drawerNavLeft}>
                      <span className={styles.drawerNavEmoji}>⭐</span>
                      <span className={styles.drawerNavText}>Đánh Giá Khách Hàng</span>
                    </div>
                    <FiChevronRight size={18} className={styles.drawerNavChevron} />
                  </a>
                  <a href="#goi-ngoai-san" className={`${styles.drawerNavItem} ${styles.drawerNavItemHighlight}`} onClick={() => setIsMobileMenuOpen(false)}>
                    <div className={styles.drawerNavLeft}>
                      <span className={styles.drawerNavEmoji}>⚡</span>
                      <span className={styles.drawerNavText}>Bảng Giá Gói 399K & 799K</span>
                    </div>
                    <span className={styles.drawerHotBadge}>HOT</span>
                  </a>
                  <a href="#hosting" className={styles.drawerNavItem} onClick={() => setIsMobileMenuOpen(false)}>
                    <div className={styles.drawerNavLeft}>
                      <span className={styles.drawerNavEmoji}>🚀</span>
                      <span className={styles.drawerNavText}>Hosting Ưu Đãi</span>
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
                      openOrderModal('399k');
                    }}
                  >
                    <FiZap size={18} />
                    <span>Mua Gói 399K Ngay</span>
                  </button>
                </CoolMode>
                <Link
                  href="/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className={styles.drawerSecondaryBtn}
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <FiShoppingBag size={17} />
                  <span>Trải Nghiệm Demo ↗</span>
                </Link>
              </div>
            </div>
          </div>
        )}

        {/* Hero Section */}
        <div className={styles.rareHeroWrap}>
          <div className={styles.rareHeroContainer}>
            {/* Left Column */}
            <div className={styles.rareHeroContent}>
              <div className={styles.rareBadgePill}>
                <FiZap style={{ color: '#818cf8' }} /> BÁN HÀNG NGOẠI SÀN • 0% PHÍ SÀN
              </div>

              <h1 className={styles.rareHeroTitle}>
                Nền Tảng Bán Hàng Ngoại Sàn <span className={styles.rareGradientText}>Tự Động Hóa 100%</span>
              </h1>
              <p className={styles.rareHeroDesc}>
                Giải pháp bán hàng độc lập: Giữ trọn 100% doanh thu, <strong>VietQR tự động 1s</strong>, <strong>đẩy đơn GHN/GHTK 1-chạm</strong> và <strong>đo lường Meta/TikTok CAPI chuẩn xác</strong>.
              </p>

              <div className={styles.rareHeroCtas}>
                <CoolMode options={{ particle: "🔥" }}>
                  <button
                    type="button"
                    className={styles.rareBtnPrimary}
                    onClick={(e) => {
                      e.preventDefault();
                      openOrderModal('399k');
                    }}
                  >
                    <FiZap size={18} /> Đăng Ký Gói 399K
                  </button>
                </CoolMode>

                <CoolMode options={{ particle: "✨" }}>
                  <Link
                    href="/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className={styles.rareBtnSecondary}
                  >
                    <FiShoppingBag size={18} /> Trải Nghiệm Demo ↗
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
                  <span>Cài Hosting Chạy Ngay</span>
                </div>
              </div>
            </div>

            {/* Right Column: 3D Isometric Showcase */}
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

                {/* 3D 6-Card Grid */}
                <div className={styles.rareIsoGrid}>
                  {heroGallery.map((item, idx) => (
                    <div
                      key={item.src}
                      className={`${styles.rareIsoCard} ${styles[`rareIsoCard${idx + 1}` as keyof typeof styles]}`}
                      onClick={() => openPreview(idx, 'hero')}
                      title="Bấm để xem ảnh lớn"
                    >
                      <div className={styles.rareIsoZoomHint}>
                        <FiZoomIn size={12} /> Phóng to
                      </div>
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={item.src}
                        alt={item.title}
                        className={styles.rareIsoImg}
                      />
                      <div className={styles.rareIsoCardFooter}>
                        <span className={styles.rareIsoCardTag}>{item.tag}</span>
                        <span style={{ color: idx === 0 ? '#10b981' : idx === 1 ? '#818cf8' : idx === 2 ? '#f59e0b' : idx === 3 ? '#ef4444' : idx === 4 ? '#ec4899' : '#60a5fa' }}>
                          {item.badge}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* AI Image Generator Carousel Hero Showcase */}
      <ImageCarouselHeroDemo
        onCardClick={(index) => openPreview(index, 'admin')}
        onCtaClick={() => openOrderModal('399k')}
      />

      {/* ==========================================================================
         BODY CONTENT (CRO AIDA/PAS CONVERSION FLOW)
         ========================================================================== */}
      <div className={styles.content70Wrapper}>
        {/* ==========================================================================
           SECTION 1: BẢNG SO SÁNH: SÀN TMĐT VS BÁN NGOẠI SÀN (ĐÁNH TRÚNG NỖI ĐAU)
           ========================================================================== */}
        <section id="so-sanh" className={styles.comparisonSection}>
            <div className={styles.container}>
              <div className={styles.compHeaderBlock}>
                <h2 className={styles.compMainTitle}>
                  Bán Trên Sàn <span className={styles.compTitleVs}>VS</span> <span className={styles.compTitleGradient}>Bán Ngoại Sàn ShopTik</span>
                </h2>
              </div>

              <div className={styles.animatedCompGrid}>
                {/* Column 1 */}
                <div className={`${styles.animatedCompCol} ${styles.compColNegative}`}>
                  <div className={styles.compColHeader}>
                    <h3 className={styles.compColTitle}>
                      <span style={{ color: '#ef4444' }}>❌</span> Bán Trên Sàn TMĐT
                    </h3>
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

                {/* Column 2 */}
                <div className={`${styles.animatedCompCol} ${styles.compColPositive}`}>
                  <div className={styles.compColHeader}>
                    <h3 className={styles.compColTitle}>
                      <span style={{ color: '#10b981' }}>✅</span> Bán Ngoại Sàn ShopTik
                    </h3>
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
           SECTION 2: TRẢI NGHIỆM MULTI-THEME TRỰC TIẾP (GIÁ TRỊ & TÍNH NĂNG)
           ========================================================================== */}
        <section id="themes" className={styles.themeShowcaseSection}>
          <div className={styles.themeAmbientGlow} />

          <div className={styles.container}>
            <div className={styles.themeHeaderBlock}>
              <h2 className={styles.themeMainTitle}>
                Trải Nghiệm Multi-Theme <span className={styles.themeTitleGradient}>Trực Tiếp 1-Click</span>
              </h2>
            </div>

            {/* Theme Preset Tabs */}
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

            {/* Control Panel */}
            <div className={styles.themeControlPanel}>
              {/* Row 1: Primary Color */}
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
                    <span style={{ fontSize: 12, color: '#94a3b8', background: 'rgba(255,255,255,0.06)', padding: '4px 8px', borderRadius: 6 }}>
                      {customPrimary}
                    </span>
                  </div>
                </div>
              </div>

              {/* Row 2: Layout View Mode */}
              <div className={styles.controlRow}>
                <span className={styles.controlLabel}>🔲 Chế Độ Xem:</span>
                <div className={styles.controlGroup}>
                  <button
                    type="button"
                    className={`${styles.controlBtnSmall} ${demoLayoutView === 'grid' ? styles.controlBtnSmallActive : ''}`}
                    onClick={() => setDemoLayoutView('grid')}
                  >
                    ▦ Lưới Sản Phẩm
                  </button>
                  <button
                    type="button"
                    className={`${styles.controlBtnSmall} ${demoLayoutView === 'list' ? styles.controlBtnSmallActive : ''}`}
                    onClick={() => setDemoLayoutView('list')}
                  >
                    ☰ Danh Sách Ngang
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

              {/* Row 3: Border Radius */}
              <div className={styles.controlRow}>
                <span className={styles.controlLabel}>📐 Bo Góc Thẻ:</span>
                <div className={styles.controlGroup}>
                  {[4, 8, 14, 24].map((radius) => (
                    <button
                      key={radius}
                      type="button"
                      className={`${styles.controlBtnSmall} ${demoBorderRadius === radius ? styles.controlBtnSmallActive : ''}`}
                      onClick={() => setDemoBorderRadius(radius)}
                    >
                      {radius === 4 ? '4px' : radius === 8 ? '8px' : radius === 14 ? '14px' : '24px (Pill)'}
                    </button>
                  ))}
                </div>
              </div>

              {/* Row 4: Background & Toggles */}
              <div className={styles.controlRow}>
                <span className={styles.controlLabel}>⚙️ Nền & Hiệu Ứng:</span>
                <div className={styles.controlGroup}>
                  <button
                    type="button"
                    className={`${styles.controlBtnSmall} ${demoBgMode === 'default' ? styles.controlBtnSmallActive : ''}`}
                    onClick={() => setDemoBgMode('default')}
                  >
                    Mặc Định
                  </button>
                  <button
                    type="button"
                    className={`${styles.controlBtnSmall} ${demoBgMode === 'dark' ? styles.controlBtnSmallActive : ''}`}
                    onClick={() => setDemoBgMode('dark')}
                  >
                    🌙 Nền Tối
                  </button>
                  <button
                    type="button"
                    className={`${styles.controlBtnSmall} ${demoBgMode === 'light' ? styles.controlBtnSmallActive : ''}`}
                    onClick={() => setDemoBgMode('light')}
                  >
                    ☀️ Nền Sáng
                  </button>

                  <button
                    type="button"
                    className={`${styles.toggleSwitchBtn} ${showFlashBadge ? styles.toggleSwitchBtnActive : ''}`}
                    onClick={() => setShowFlashBadge(!showFlashBadge)}
                  >
                    {showFlashBadge ? '✓ Tag Giảm Giá' : '✕ Ẩn Tag'}
                  </button>
                  <button
                    type="button"
                    className={`${styles.toggleSwitchBtn} ${showSoldProgress ? styles.toggleSwitchBtnActive : ''}`}
                    onClick={() => setShowSoldProgress(!showSoldProgress)}
                  >
                    {showSoldProgress ? '✓ Thanh Đã Bán' : '✕ Ẩn Thanh Đã Bán'}
                  </button>
                </div>
              </div>
            </div>

            {/* Dynamic Preview Mockup */}
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
                    <div style={{ fontSize: 11, opacity: 0.7 }}>Theme: {baseTheme.name}</div>
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

              {/* Dynamic Content View */}
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
                        -35% SALE
                      </div>
                    )}
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src="https://images.unsplash.com/photo-1586363104862-3a5e2ab60d99?w=600&auto=format&fit=crop&q=80"
                      alt="Polo"
                      className={styles.mockupThumb}
                      style={{ borderRadius: Math.min(demoBorderRadius, 8) }}
                    />
                    <div style={{ fontWeight: 700, fontSize: 14 }}>Áo Polo Nam Cotton Cao Cấp</div>
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
                          <span style={{ color: effectivePrimary, fontWeight: 700 }}>82%</span>
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
                        -39% DEAL
                      </div>
                    )}
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src="https://images.unsplash.com/photo-1583863788434-e58a36330cf0?w=600&auto=format&fit=crop&q=80"
                      alt="Charger"
                      className={styles.mockupThumb}
                      style={{ borderRadius: Math.min(demoBorderRadius, 8) }}
                    />
                    <div style={{ fontWeight: 700, fontSize: 14 }}>Củ Sạc GaN 65W 3 Cổng PD</div>
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
                          <span style={{ color: effectivePrimary, fontWeight: 700 }}>65%</span>
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
                        -35% HOT
                      </div>
                    )}
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src="https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=600&auto=format&fit=crop&q=80"
                      alt="Earphones"
                      className={styles.mockupThumb}
                      style={{ borderRadius: Math.min(demoBorderRadius, 8) }}
                    />
                    <div style={{ fontWeight: 700, fontSize: 14 }}>Tai Nghe Bluetooth Chống Ồn ANC</div>
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
                          <span style={{ color: effectivePrimary, fontWeight: 700 }}>92%</span>
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
                  <div
                    className={styles.mockupListCard}
                    style={{
                      backgroundColor: effectiveCardBg,
                      borderRadius: demoBorderRadius,
                    }}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src="https://images.unsplash.com/photo-1586363104862-3a5e2ab60d99?w=400&auto=format&fit=crop&q=80"
                      alt="Polo"
                      className={styles.mockupListThumb}
                      style={{ borderRadius: Math.min(demoBorderRadius, 8) }}
                    />
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 800, fontSize: 15, marginBottom: 4 }}>Áo Polo Nam Cotton Cao Cấp</div>
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

                  <div
                    className={styles.mockupListCard}
                    style={{
                      backgroundColor: effectiveCardBg,
                      borderRadius: demoBorderRadius,
                    }}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src="https://images.unsplash.com/photo-1583863788434-e58a36330cf0?w=400&auto=format&fit=crop&q=80"
                      alt="Charger"
                      className={styles.mockupListThumb}
                      style={{ borderRadius: Math.min(demoBorderRadius, 8) }}
                    />
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 800, fontSize: 15, marginBottom: 4 }}>Củ Sạc GaN 65W 3 Cổng PD</div>
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

              {/* Mini Checkout & VietQR Mode */}
              {demoLayoutView === 'checkout' && (
                <div style={{ padding: 24, display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 20 }}>
                  <div style={{ background: effectiveCardBg, borderRadius: demoBorderRadius, padding: 20, border: '1px solid rgba(255,255,255,0.06)' }}>
                    <div style={{ fontWeight: 800, fontSize: 15, marginBottom: 12 }}>📦 Tóm Tắt Đơn Hàng</div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, marginBottom: 8 }}>
                      <span>Áo Polo Nam x 1</span>
                      <span style={{ fontWeight: 700 }}>229.000₫</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, marginBottom: 14 }}>
                      <span>Phí Vận Chuyển (GHTK)</span>
                      <span style={{ color: '#10b981', fontWeight: 700 }}>Miễn phí</span>
                    </div>
                    <div style={{ height: 1, background: 'rgba(128,128,128,0.2)', margin: '10px 0' }} />
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 16, fontWeight: 900 }}>
                      <span>Tổng Thanh Toán:</span>
                      <span style={{ color: effectivePrimary }}>229.000₫</span>
                    </div>
                  </div>

                  <div style={{ background: effectiveCardBg, borderRadius: demoBorderRadius, padding: 20, border: `1px solid ${effectivePrimary}55`, textAlign: 'center' }}>
                    <div style={{ fontWeight: 800, fontSize: 14, color: effectivePrimary, marginBottom: 8 }}>
                      💳 Thanh Toán VietQR Tự Động 1s
                    </div>
                    <div style={{ background: '#fff', padding: 12, borderRadius: 10, display: 'inline-block', marginBottom: 10 }}>
                      <div style={{ width: 110, height: 110, background: '#000', borderRadius: 6, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: 11, fontWeight: 800, textAlign: 'center', padding: 8 }}>
                        [VIETQR NAPAS247]
                      </div>
                    </div>
                    <div style={{ fontSize: 12, opacity: 0.8 }}>
                      Cú pháp: <strong style={{ color: effectivePrimary }}>ST88921</strong>
                    </div>
                    <div style={{ background: 'rgba(16, 185, 129, 0.15)', color: '#10b981', padding: '6px 12px', borderRadius: 8, fontSize: 12, fontWeight: 800, marginTop: 8 }}>
                      ✓ Khớp lệnh tự động qua SePay 1s
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </section>

        {/* ==========================================================================
           SECTION 3: HỆ SINH THÁI ĐỐI TÁC & THỐNG KÊ HIỆU NĂNG (UY TÍN KỸ THUẬT)
           ========================================================================== */}
        <section id="orbit" className={styles.orbitSection}>
          <div className={styles.floatLogoContainer}>
            <div className={styles.floatLogoHeader}>
              <h2 className={styles.floatLogoTitle}>
                Hệ Sinh Thái Đối Tác & Công Nghệ Hàng Đầu
              </h2>
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
                <div className={styles.orbitBadge} title="Giao Hàng Nhanh (GHN)">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src="/images/logo-ghn.png" alt="GHN" className={styles.orbitImg} />
                </div>
                <div className={styles.orbitBadge} title="Giao Hàng Tiết Kiệm (GHTK)">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src="/images/logo-ghtk.png" alt="GHTK" className={styles.orbitImg} />
                </div>
                <div className={styles.orbitBadge} title="Viettel Post">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src="/images/logo-viettelpost.svg" alt="Viettel Post" className={styles.orbitImg} />
                </div>
                <div className={styles.orbitBadge} title="SePay VietQR Napas247">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src="/images/logo-sepay.png" alt="SePay VietQR" className={styles.orbitImg} />
                </div>
              </OrbitingCircles>

              {/* Outer Orbit (Radius 310px - Reverse) */}
              <OrbitingCircles iconSize={92} radius={310} duration={38} speed={1} reverse>
                <div className={styles.orbitBadge} title="Gmail SMTP Email">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src="/images/logo-gmail.png" alt="Gmail" className={styles.orbitImg} />
                </div>
                <div className={styles.orbitBadge} title="Hostinger Cloud">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src="/images/logo-hostinger.png" alt="Hostinger" className={styles.orbitImg} />
                </div>
                <div className={styles.orbitBadge} title="Meta Conversions API">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src="/images/logo-meta.png" alt="Meta Conversions API" className={styles.orbitImg} />
                </div>
                <div className={styles.orbitBadge} title="TikTok Events API">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src="/images/logo-tiktok.svg" alt="TikTok Events API" className={styles.orbitImg} />
                </div>
              </OrbitingCircles>
            </div>
          </div>
        </section>

        {/* METRICS & IMPACT STATS */}
        <section id="metrics" className={styles.statsSection}>
          <div className={styles.container}>
            <div className={styles.statsGrid}>
              <div className={styles.statItem}>
                <div className={styles.statNumber}>+300%</div>
                <div className={styles.statLabel}>Tăng Tỷ Lệ Chuyển Đổi</div>
                <div className={styles.statDesc}>Nhờ Quick Checkout 1-chạm & FOMO</div>
              </div>
              <div className={styles.statItem}>
                <div className={styles.statNumber}>&lt; 1s</div>
                <div className={styles.statLabel}>Khớp Lệnh VietQR</div>
                <div className={styles.statDesc}>Xử lý tự động 100% qua SePay</div>
              </div>
              <div className={styles.statItem}>
                <div className={styles.statNumber}>100%</div>
                <div className={styles.statLabel}>Độ Chính Xác Pixel</div>
                <div className={styles.statDesc}>Bảo toàn dữ liệu qua Meta & TikTok CAPI</div>
              </div>
              <div className={styles.statItem}>
                <div className={styles.statNumber}>99.9%</div>
                <div className={styles.statLabel}>Uptime Ổn Định</div>
                <div className={styles.statDesc}>Next.js 16 & MongoDB Cloud</div>
              </div>
            </div>
          </div>
        </section>

        {/* ==========================================================================
           SECTION 4: ĐÁNH GIÁ KHÁCH HÀNG (SOCIAL PROOF & RATING 5 SAO)
           ========================================================================== */}
        <section
          id="danh-gia"
          className={styles.carouselTestimonialSection}
          onMouseEnter={() => setIsTestimonialHovered(true)}
          onMouseLeave={() => setIsTestimonialHovered(false)}
        >
          <div className={styles.container}>
            <div className={styles.carouselTestimonialWrapper}>
              <h2 className={styles.sectionTitle} style={{ marginBottom: 28 }}>
                Được Tin Dùng Bởi Hơn 500+ Chủ Shop & Doanh Nghiệp
              </h2>

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
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={item.avatar}
                          alt={item.name}
                          className={styles.carouselAvatar}
                        />
                        <div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                            <span className={styles.carouselAuthorName}>{item.name}</span>
                            <span style={{ fontSize: 11, background: 'rgba(16, 185, 129, 0.15)', color: '#10b981', padding: '2px 8px', borderRadius: 9999, fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: 3 }}>
                              <FiCheckCircle size={11} /> Đã xác minh mua hàng
                            </span>
                          </div>
                          <span className={styles.carouselAuthorRole}>{item.title}</span>
                          <div style={{ color: '#fbbf24', fontSize: 13, marginTop: 4, letterSpacing: 2 }}>
                            ★★★★★
                          </div>
                        </div>
                      </div>
                    </div>
                  ) : null
                ))}
              </div>

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
           SECTION 5: BẢNG GIÁ GÓI BÁN HÀNG NGOẠI SÀN 399K & 799K
           ========================================================================== */}
        <section id="goi-ngoai-san" className={styles.floatPricingSection}>
          <div className={styles.floatPricingGlow}></div>

          <div className={styles.floatPricingContainer}>
            <div className={styles.floatPricingHeader}>
              <h2 className={styles.floatPricingTitle}>
                Bảng Giá Sở Hữu Trọn Đời
              </h2>
            </div>

            {/* Commitment Badge */}
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 28 }}>
              <div style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 8,
                background: 'rgba(99, 102, 241, 0.12)',
                border: '1px solid rgba(99, 102, 241, 0.3)',
                padding: '8px 18px',
                borderRadius: 9999,
                color: '#c7d2fe',
                fontSize: 13,
                fontWeight: 700,
              }}>
                <FiShield style={{ color: '#818cf8' }} size={16} />
                <span>🛡️ Hỗ trợ Ultraviewer cài đặt thành công 100% • Bảo hành trọn đời</span>
              </div>
            </div>

            <div className={styles.floatPricingGrid}>
              {/* Plan 1: Gói 399K */}
              <div className={`${styles.floatPlanCard} ${styles.floatPlanCardPopular}`}>
                <div className={styles.floatPlanTopBanner}>
                  🔥 BEST SELLER • SỞ HỮU TRỌN ĐỜI
                </div>
                <div className={styles.floatPlanCardHead}>
                  <span className={styles.floatPlanName}>
                    Gói Bán Hàng Ngoại Sàn
                  </span>
                  <div className={styles.floatPlanPriceWrap}>
                    <span className={styles.floatPlanPrice}>399.000₫</span>
                    <span className={styles.floatPlanPeriod}>/ trọn đời</span>
                  </div>
                  <CoolMode options={{ particle: "🔥" }}>
                    <button
                      type="button"
                      className={`${styles.floatPlanBtn} ${styles.floatPlanBtnPopular}`}
                      onClick={() => openOrderModal('399k')}
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
                    <span>Full source code Next.js 16 + React 19</span>
                  </li>
                  <li className={styles.floatPlanFeatureItem}>
                    <svg className={styles.floatPlanCheckSvg} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"></path>
                    </svg>
                    <span>Thanh toán VietQR SePay tự động 1s</span>
                  </li>
                  <li className={styles.floatPlanFeatureItem}>
                    <svg className={styles.floatPlanCheckSvg} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"></path>
                    </svg>
                    <span>Tích hợp bưu tá GHN / GHTK / Viettel Post</span>
                  </li>
                  <li className={styles.floatPlanFeatureItem}>
                    <svg className={styles.floatPlanCheckSvg} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"></path>
                    </svg>
                    <span>Đo lường kép Meta CAPI & TikTok Events</span>
                  </li>
                  <li className={styles.floatPlanFeatureItem}>
                    <svg className={styles.floatPlanCheckSvg} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"></path>
                    </svg>
                    <span>Bộ 7 giao diện tùy biến màu sắc 1-Click</span>
                  </li>
                  <li className={styles.floatPlanFeatureItem}>
                    <svg className={styles.floatPlanCheckSvg} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"></path>
                    </svg>
                    <span>Video hướng dẫn cài đặt & vận hành A-Z</span>
                  </li>
                  <li className={styles.floatPlanFeatureItem}>
                    <svg className={styles.floatPlanCheckSvg} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"></path>
                    </svg>
                    <span>Hỗ trợ kỹ thuật 1:1 qua Ultraviewer / Zalo</span>
                  </li>
                </ul>
              </div>

              {/* Plan 2: Gói Setup A-Z */}
              <div className={styles.floatPlanCard}>
                <div className={styles.floatPlanCardHead}>
                  <span className={styles.floatPlanName}>
                    Gói Setup Trọn Gói A - Z
                  </span>
                  <div className={styles.floatPlanPriceWrap}>
                    <span className={styles.floatPlanPrice} style={{ color: '#a5b4fc' }}>799.000₫</span>
                    <span className={styles.floatPlanPeriod}>/ bàn giao</span>
                  </div>
                  <CoolMode options={{ particle: "⚡" }}>
                    <button
                      type="button"
                      className={styles.floatPlanBtn}
                      onClick={() => openOrderModal('799k')}
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
                    <span>Toàn bộ quyền lợi của Gói 399K</span>
                  </li>
                  <li className={styles.floatPlanFeatureItem}>
                    <svg className={styles.floatPlanCheckSvg} style={{ color: '#818cf8' }} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"></path>
                    </svg>
                    <span>Cài đặt tên miền riêng & SSL HTTPS</span>
                  </li>
                  <li className={styles.floatPlanFeatureItem}>
                    <svg className={styles.floatPlanCheckSvg} style={{ color: '#818cf8' }} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"></path>
                    </svg>
                    <span>Thiết lập Hosting hoàn chỉnh 100%</span>
                  </li>
                  <li className={styles.floatPlanFeatureItem}>
                    <svg className={styles.floatPlanCheckSvg} style={{ color: '#818cf8' }} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"></path>
                    </svg>
                    <span>Cấu hình VietQR & API bưu tá GHN / GHTK</span>
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
                    <span>Gắn Pixel Meta CAPI & TikTok Ads ID</span>
                  </li>
                  <li className={styles.floatPlanFeatureItem}>
                    <svg className={styles.floatPlanCheckSvg} style={{ color: '#818cf8' }} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"></path>
                    </svg>
                    <span>Bàn giao chìa khóa trao tay - Bán hàng ngay</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* ==========================================================================
           SECTION 6: HOSTINGER HOSTING SECTION
           ========================================================================== */}
        <section id="hosting" className={styles.hostingSection}>
          <div className={styles.hostingAmbientGlow} />

          <div className={styles.container}>
            <div className={styles.hostingHeaderBlock}>
              <h2 className={styles.hostingMainTitle}>
                Giải Pháp Hosting Cho <span className={styles.hostingTitleGradient}>ShopTik</span>
              </h2>
            </div>

            {/* Hosting Banner */}
            <div className={styles.hostingBanner}>
              <div className={styles.hostingBannerInner}>
                <div style={{ maxWidth: 640 }}>
                  <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'rgba(168, 85, 247, 0.2)', color: '#d8b4fe', padding: '4px 12px', borderRadius: 20, fontSize: 12, fontWeight: 800, marginBottom: 12 }}>
                    🎁 ƯU ĐÃI ĐỐI TÁC ĐỘC QUYỀN
                  </div>
                  <h3 style={{ fontSize: 24, fontWeight: 900, color: '#fff', marginBottom: 10, lineHeight: 1.3 }}>
                    Tặng Tên Miền Miễn Phí + Giảm Thêm 10% Hosting
                  </h3>

                  <div className={styles.hostingCouponBox}>
                    <span style={{ fontSize: 13, color: '#94a3b8' }}>Mã giảm giá:</span>
                    <span className={styles.couponCodeText}>BIGMANMARKETING10</span>
                    <button
                      type="button"
                      className={styles.btnCopyCoupon}
                      onClick={handleCopyCoupon}
                    >
                      {copiedCouponToast ? '✓ Đã Copy!' : '📋 Sao Chép'}
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
                    <span>🚀 Đăng Ký Hosting Ưu Đãi</span>
                    <FiExternalLink />
                  </a>
                  <div style={{ textAlign: 'center', fontSize: 12, color: '#94a3b8', marginTop: 8 }}>
                    ✓ Đảm bảo hoàn tiền trong 30 ngày
                  </div>
                </div>
              </div>
            </div>

            {/* 4 Feature Cards */}
            <div className={styles.hostingFeaturesGrid}>
              <div className={styles.hostingFeatureCard}>
                <div style={{ fontSize: 28, marginBottom: 12 }}>⚡</div>
                <h4 style={{ fontSize: 16, fontWeight: 800, color: '#fff', marginBottom: 8 }}>Auto Setup 1-Click</h4>
                <p style={{ fontSize: 13, color: '#94a3b8', lineHeight: 1.5, margin: 0 }}>
                  Upload file ZIP hoặc link Git, hệ thống hPanel tự động nạp dependencies và chạy web.
                </p>
              </div>

              <div className={styles.hostingFeatureCard}>
                <div style={{ fontSize: 28, marginBottom: 12 }}>🎁</div>
                <h4 style={{ fontSize: 16, fontWeight: 800, color: '#fff', marginBottom: 8 }}>Miễn Phí 1 Tên Miền</h4>
                <p style={{ fontSize: 13, color: '#94a3b8', lineHeight: 1.5, margin: 0 }}>
                  Tặng 100% tên miền quốc tế (.com, .net...) năm đầu tiên khi đăng ký gói hosting.
                </p>
              </div>

              <div className={styles.hostingFeatureCard}>
                <div style={{ fontSize: 28, marginBottom: 12 }}>💸</div>
                <h4 style={{ fontSize: 16, fontWeight: 800, color: '#fff', marginBottom: 8 }}>Giảm Thêm 10%</h4>
                <p style={{ fontSize: 13, color: '#94a3b8', lineHeight: 1.5, margin: 0 }}>
                  Nhập mã <strong>BIGMANMARKETING10</strong> tại bước thanh toán để giảm thêm 10%.
                </p>
              </div>

              <div className={styles.hostingFeatureCard}>
                <div style={{ fontSize: 28, marginBottom: 12 }}>🔒</div>
                <h4 style={{ fontSize: 16, fontWeight: 800, color: '#fff', marginBottom: 8 }}>SSL & LiteSpeed</h4>
                <p style={{ fontSize: 13, color: '#94a3b8', lineHeight: 1.5, margin: 0 }}>
                  Hạ tầng Cloud siêu tốc, chứng chỉ SSL miễn phí trọn đời, tải trang dưới 0.5s tối ưu SEO & Ads.
                </p>
              </div>
            </div>

            {/* 3 Step Deployment Guide */}
            <div style={{ marginTop: 40 }}>
              <h3 style={{ fontSize: 20, fontWeight: 900, color: '#fff', textAlign: 'center', marginBottom: 24 }}>
                3 Bước Triển Khai Website Đơn Giản
              </h3>

              <div className={styles.stepGuideGrid}>
                <div className={styles.stepGuideCard}>
                  <div className={styles.stepNumberBadge}>1</div>
                  <h4 style={{ fontSize: 15, fontWeight: 800, color: '#fff', marginBottom: 6 }}>Chọn Gói Hosting</h4>
                  <p style={{ fontSize: 13, color: '#94a3b8', lineHeight: 1.5, margin: 0 }}>
                    Truy cập 👉 <a href="https://hostinger.com/BIGMANMARKETING10" target="_blank" rel="noopener noreferrer" style={{ color: '#a855f7', fontWeight: 700 }}>hostinger.com/BIGMANMARKETING10</a> và chọn gói Premium hoặc Business (12-24 tháng).
                  </p>
                </div>

                <div className={styles.stepGuideCard}>
                  <div className={styles.stepNumberBadge}>2</div>
                  <h4 style={{ fontSize: 15, fontWeight: 800, color: '#fff', marginBottom: 6 }}>Nhập Mã Giảm Giá</h4>
                  <p style={{ fontSize: 13, color: '#94a3b8', lineHeight: 1.5, margin: 0 }}>
                    Tại trang thanh toán, nhập mã <strong>BIGMANMARKETING10</strong> để giảm thêm 10% và nhận tên miền miễn phí.
                  </p>
                </div>

                <div className={styles.stepGuideCard}>
                  <div className={styles.stepNumberBadge}>3</div>
                  <h4 style={{ fontSize: 15, fontWeight: 800, color: '#fff', marginBottom: 6 }}>Upload & Khởi Chạy</h4>
                  <p style={{ fontSize: 13, color: '#94a3b8', lineHeight: 1.5, margin: 0 }}>
                    Upload file ZIP mã nguồn lên hPanel, điền thông tin MongoDB và website hoạt động ngay lập tức!
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ==========================================================================
           SECTION 7: FAQ ACCORDION
           ========================================================================== */}
        <section id="faq" className={styles.faqSection}>
          <div className={styles.container}>
            <div className={styles.sectionTitleBlock}>
              <span className={styles.sectionTag}>GIẢI ĐÁP</span>
              <h2 className={styles.sectionTitle}>Câu Hỏi Thường Gặp</h2>
            </div>

            <div className={styles.faqList}>
              <div className={styles.faqItem}>
                <button
                  type="button"
                  className={styles.faqQuestion}
                  onClick={() => toggleFaq(0)}
                >
                  <span>1. Mua hàng có bắt buộc phải tạo tài khoản không?</span>
                  {openFaq === 0 ? <FiChevronUp /> : <FiChevronDown />}
                </button>
                {openFaq === 0 && (
                  <div className={styles.faqAnswer}>
                    Không! ShopTik áp dụng cơ chế <strong>Quick Checkout 1-Chạm</strong>. Khách chỉ cần nhập Tên, SĐT và Địa chỉ là có thể đặt hàng ngay mà không bị gián đoạn.
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
                    Tiền chuyển khoản vào trực tiếp 100% <strong>tài khoản ngân hàng của bạn</strong> (MBBank, Vietcombank, Techcombank...). Nền tảng không thu phí trung gian hay giữ tiền.
                  </div>
                )}
              </div>

              <div className={styles.faqItem}>
                <button
                  type="button"
                  className={styles.faqQuestion}
                  onClick={() => toggleFaq(2)}
                >
                  <span>3. Cấu hình vận chuyển GHN, GHTK, Viettel Post thế nào?</span>
                  {openFaq === 2 ? <FiChevronUp /> : <FiChevronDown />}
                </button>
                {openFaq === 2 && (
                  <div className={styles.faqAnswer}>
                    Bạn chỉ cần vào trang quản trị <code>/admin/shipping</code>, nhập Token API từ nhà vận chuyển và bấm Lưu. Có sẵn nút kiểm tra kết nối realtime.
                  </div>
                )}
              </div>

              <div className={styles.faqItem}>
                <button
                  type="button"
                  className={styles.faqQuestion}
                  onClick={() => toggleFaq(3)}
                >
                  <span>4. Có thể tùy chỉnh Logo, thương hiệu và màu sắc không?</span>
                  {openFaq === 3 ? <FiChevronUp /> : <FiChevronDown />}
                </button>
                {openFaq === 3 && (
                  <div className={styles.faqAnswer}>
                    Có! Bạn có thể tải lên Logo riêng, đổi tên shop, thay đổi màu chủ đạo (Primary Color) và chọn 7 bộ theme có sẵn trong <code>/admin/settings</code>.
                  </div>
                )}
              </div>

              <div className={styles.faqItem}>
                <button
                  type="button"
                  className={styles.faqQuestion}
                  onClick={() => toggleFaq(4)}
                >
                  <span>5. Tính năng gửi email thông báo có mất phí không?</span>
                  {openFaq === 4 ? <FiChevronUp /> : <FiChevronDown />}
                </button>
                {openFaq === 4 && (
                  <div className={styles.faqAnswer}>
                    Hoàn toàn miễn phí! Hệ thống sử dụng <strong>Gmail SMTP</strong> để tự động gửi email xác nhận cho khách và thông báo đơn mới cho chủ shop 24/7.
                  </div>
                )}
              </div>

              <div className={styles.faqItem}>
                <button
                  type="button"
                  className={styles.faqQuestion}
                  onClick={() => toggleFaq(5)}
                >
                  <span>6. Gói hosting nào phù hợp nhất để chạy ShopTik?</span>
                  {openFaq === 5 ? <FiChevronUp /> : <FiChevronDown />}
                </button>
                {openFaq === 5 && (
                  <div className={styles.faqAnswer}>
                    Chúng tôi khuyến nghị sử dụng <strong>Hostinger Web Hosting</strong> qua link <a href="https://hostinger.com/BIGMANMARKETING10" target="_blank" rel="noopener noreferrer" style={{ color: '#a855f7', fontWeight: 700 }}>hostinger.com/BIGMANMARKETING10</a> để được tặng tên miền miễn phí và giảm thêm 10%.
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* ==========================================================================
           SECTION 8: FINAL CTA BANNER & FOOTER
           ========================================================================== */}
        <section className={styles.container}>
          <div className={styles.ctaBanner}>
            <h2 className={styles.ctaBannerTitle}>Sẵn Sàng Bùng Nổ Doanh Số Cùng ShopTik?</h2>
            <p className={styles.ctaBannerDesc}>
              Cắt giảm 100% phí sàn, sở hữu toàn bộ data khách hàng và tự động hóa hệ thống bán hàng ngay hôm nay!
            </p>
            <div style={{ display: 'flex', justifyContent: 'center', gap: 14, flexWrap: 'wrap' }}>
              <CoolMode options={{ particle: "🔥" }}>
                <button
                  type="button"
                  className={`${styles.btnPrimary} ${styles.btnHeroPrimary} ${styles.btnGradientShopee}`}
                  onClick={() => openOrderModal('399k')}
                >
                  <FiZap size={18} /> Đăng Ký Gói Ngoại Sàn 399K
                </button>
              </CoolMode>
              <CoolMode options={{ particle: "✨" }}>
                <Link href="/" target="_blank" rel="noopener noreferrer" className={`${styles.btnSecondary} ${styles.btnHeroSecondary}`}>
                  <FiShoppingBag size={18} /> Xem Cửa Hàng Live ↗
                </Link>
              </CoolMode>
              <CoolMode options={{ particle: "⚡" }}>
                <Link href="/admin" target="_blank" rel="noopener noreferrer" className={`${styles.btnSecondary} ${styles.btnHeroSecondary}`}>
                  <FiZap size={18} /> Trang Quản Trị ↗
                </Link>
              </CoolMode>
            </div>
          </div>
        </section>

        {/* ==========================================================================
           FOOTER
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
                  Nền tảng E-Commerce tối ưu chuyển đổi, đa giao diện thông minh, vận chuyển đa hãng và thanh toán VietQR tự động.
                </p>
              </div>

              <div>
                <h4 className={styles.footerColTitle}>Khách Hàng</h4>
                <ul className={styles.footerColLinks}>
                  <li><Link href="/" target="_blank" rel="noopener noreferrer" className={styles.footerLink}>Trang Chủ Mua Sắm ↗</Link></li>
                  <li><Link href="/?tab=products" target="_blank" rel="noopener noreferrer" className={styles.footerLink}>Tất Cả Sản Phẩm ↗</Link></li>
                  <li><Link href="/?tab=categories" target="_blank" rel="noopener noreferrer" className={styles.footerLink}>Danh Mục Hàng ↗</Link></li>
                  <li><Link href="/tracking" target="_blank" rel="noopener noreferrer" className={styles.footerLink}>Tra Cứu Đơn Hàng ↗</Link></li>
                  <li><Link href="/cart" target="_blank" rel="noopener noreferrer" className={styles.footerLink}>Giỏ Hàng ↗</Link></li>
                </ul>
              </div>

              <div>
                <h4 className={styles.footerColTitle}>Quản Trị Shop</h4>
                <ul className={styles.footerColLinks}>
                  <li><Link href="/admin" target="_blank" rel="noopener noreferrer" className={styles.footerLink}>Tổng Quan Báo Cáo ↗</Link></li>
                  <li><Link href="/admin/orders" target="_blank" rel="noopener noreferrer" className={styles.footerLink}>Quản Lý Đơn Hàng ↗</Link></li>
                  <li><Link href="/admin/products" target="_blank" rel="noopener noreferrer" className={styles.footerLink}>Quản Lý Sản Phẩm ↗</Link></li>
                  <li><Link href="/admin/marketing/flash-sale" target="_blank" rel="noopener noreferrer" className={styles.footerLink}>Flash Sale & FOMO ↗</Link></li>
                  <li><Link href="/admin/settings" target="_blank" rel="noopener noreferrer" className={styles.footerLink}>Cài Đặt Giao Diện Theme ↗</Link></li>
                </ul>
              </div>

              <div>
                <h4 className={styles.footerColTitle}>Hỗ Trợ & Tích Hợp</h4>
                <ul className={styles.footerColLinks}>
                  <li><Link href="/chat" target="_blank" rel="noopener noreferrer" className={styles.footerLink}>Trò Chuyện Trực Tuyến ↗</Link></li>
                  <li><Link href="/admin/shipping" target="_blank" rel="noopener noreferrer" className={styles.footerLink}>Cấu Hình GHN / GHTK ↗</Link></li>
                  <li><Link href="/admin/payment" target="_blank" rel="noopener noreferrer" className={styles.footerLink}>Cấu Hình VietQR SePay ↗</Link></li>
                  <li><Link href="/admin/marketing" target="_blank" rel="noopener noreferrer" className={styles.footerLink}>Facebook & TikTok CAPI ↗</Link></li>
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
         MODAL ĐĂNG KÝ GÓI (ĐỒNG BỘ 399K & 799K)
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
              maxWidth: 510,
              maxHeight: '92vh',
              overflowY: 'auto',
              WebkitOverflowScrolling: 'touch',
              background: 'linear-gradient(180deg, #131620 0%, #0d0f15 100%)',
              border: selectedPlan === '799k' ? '1px solid rgba(99, 102, 241, 0.45)' : '1px solid rgba(238, 77, 45, 0.45)',
              borderRadius: 24,
              boxShadow: selectedPlan === '799k' ? '0 30px 80px rgba(0, 0, 0, 0.95), 0 0 50px rgba(99, 102, 241, 0.25)' : '0 30px 80px rgba(0, 0, 0, 0.95), 0 0 50px rgba(238, 77, 45, 0.25)',
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
                padding: '18px 22px',
                background: selectedPlan === '799k'
                  ? 'linear-gradient(135deg, rgba(99, 102, 241, 0.15) 0%, rgba(59, 130, 246, 0.08) 100%)'
                  : 'linear-gradient(135deg, rgba(238, 77, 45, 0.15) 0%, rgba(249, 115, 22, 0.08) 100%)',
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
                    width: 42,
                    height: 42,
                    borderRadius: 12,
                    background: selectedPlan === '799k'
                      ? 'linear-gradient(135deg, #6366f1, #4f46e5)'
                      : 'linear-gradient(135deg, #ee4d2d, #f97316)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: 20,
                    boxShadow: selectedPlan === '799k' ? '0 6px 16px rgba(99, 102, 241, 0.4)' : '0 6px 16px rgba(238, 77, 45, 0.4)',
                    flexShrink: 0,
                  }}
                >
                  {selectedPlan === '799k' ? '✨' : '🚀'}
                </div>
                <div>
                  <h3 style={{ fontSize: 16, fontWeight: 900, color: '#ffffff', margin: 0, lineHeight: 1.3 }}>
                    {currentPlanInfo.name}
                  </h3>
                  <div style={{ fontSize: 12, color: selectedPlan === '799k' ? '#a5b4fc' : '#f97316', fontWeight: 700, marginTop: 2 }}>
                    ⚡ Ưu Đãi: <span style={{ color: '#fff' }}>{currentPlanInfo.priceStr}</span> (Gốc {currentPlanInfo.originalPriceStr})
                  </div>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsPackageModalOpen(false)}
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: '50%',
                  background: 'rgba(255, 255, 255, 0.08)',
                  border: '1px solid rgba(255, 255, 255, 0.15)',
                  color: '#cbd5e1',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  fontSize: 15,
                  flexShrink: 0,
                }}
                aria-label="Đóng"
              >
                ✕
              </button>
            </div>

            {/* Modal Body */}
            <div style={{ padding: '20px 22px', display: 'flex', flexDirection: 'column', gap: 14 }}>
              {/* Quick Plan Switcher */}
              {!isOrderSubmitted && (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, background: 'rgba(255, 255, 255, 0.04)', padding: 4, borderRadius: 12, border: '1px solid rgba(255,255,255,0.08)' }}>
                  <button
                    type="button"
                    onClick={() => setSelectedPlan('399k')}
                    style={{
                      padding: '8px 12px',
                      borderRadius: 8,
                      border: 'none',
                      cursor: 'pointer',
                      fontSize: 12.5,
                      fontWeight: 800,
                      background: selectedPlan === '399k' ? 'linear-gradient(135deg, #ee4d2d, #f97316)' : 'transparent',
                      color: selectedPlan === '399k' ? '#fff' : '#94a3b8',
                      boxShadow: selectedPlan === '399k' ? '0 4px 12px rgba(238, 77, 45, 0.3)' : 'none',
                      transition: 'all 0.2s ease',
                    }}
                  >
                    ⚡ Gói Tự Cài 399K
                  </button>
                  <button
                    type="button"
                    onClick={() => setSelectedPlan('799k')}
                    style={{
                      padding: '8px 12px',
                      borderRadius: 8,
                      border: 'none',
                      cursor: 'pointer',
                      fontSize: 12.5,
                      fontWeight: 800,
                      background: selectedPlan === '799k' ? 'linear-gradient(135deg, #6366f1, #4f46e5)' : 'transparent',
                      color: selectedPlan === '799k' ? '#fff' : '#94a3b8',
                      boxShadow: selectedPlan === '799k' ? '0 4px 12px rgba(99, 102, 241, 0.3)' : 'none',
                      transition: 'all 0.2s ease',
                    }}
                  >
                    ✨ Gói Setup A-Z 799K
                  </button>
                </div>
              )}

              {isOrderSubmitted ? (
                <div style={{ textAlign: 'center', padding: '8px 0' }}>
                  <div
                    style={{
                      width: 56,
                      height: 56,
                      borderRadius: '50%',
                      background: 'rgba(16, 185, 129, 0.15)',
                      border: '2px solid #10b981',
                      color: '#10b981',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      margin: '0 auto 12px',
                      fontSize: 28,
                    }}
                  >
                    ✓
                  </div>
                  <h4 style={{ fontSize: 19, fontWeight: 900, color: '#fff', marginBottom: 4 }}>
                    Đăng Ký {currentPlanInfo.shortName} Thành Công!
                  </h4>
                  <p style={{ fontSize: 13, color: '#94a3b8', lineHeight: 1.5, marginBottom: 14 }}>
                    Mã đơn: <strong style={{ color: selectedPlan === '799k' ? '#818cf8' : '#f97316' }}>{orderCode}</strong>
                  </p>

                  {/* Dynamic VietQR Preview */}
                  <div
                    style={{
                      background: '#ffffff',
                      borderRadius: 14,
                      padding: 12,
                      width: 'fit-content',
                      margin: '0 auto 14px',
                      boxShadow: '0 12px 30px rgba(0,0,0,0.6)',
                    }}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={`https://img.vietqr.io/image/MB-0973475484-compact2.png?amount=${currentPlanInfo.priceNumber}&addInfo=${currentPlanInfo.memoPrefix}%20${encodeURIComponent(orderPhone)}&accountName=SHOPTIK%20STORE`}
                      alt={`VietQR Chuyển Khoản ${currentPlanInfo.priceStr}`}
                      style={{ width: 220, height: 'auto', display: 'block', borderRadius: 8 }}
                      onError={(e) => {
                        (e.currentTarget as HTMLElement).style.display = 'none';
                      }}
                    />
                  </div>

                  <div
                    style={{
                      background: selectedPlan === '799k' ? 'rgba(99, 102, 241, 0.08)' : 'rgba(238, 77, 45, 0.08)',
                      border: selectedPlan === '799k' ? '1px solid rgba(99, 102, 241, 0.3)' : '1px solid rgba(238, 77, 45, 0.3)',
                      borderRadius: 12,
                      padding: '12px 14px',
                      fontSize: 12.5,
                      color: '#cbd5e1',
                      textAlign: 'left',
                      lineHeight: 1.6,
                      marginBottom: 14,
                    }}
                  >
                    <div style={{ fontWeight: 800, color: selectedPlan === '799k' ? '#a5b4fc' : '#f97316', marginBottom: 4 }}>
                      💳 Thông Tin Chuyển Khoản:
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '3px 0' }}>
                      <span>• Ngân hàng: <strong>MBBank (Quân Đội)</strong></span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '3px 0' }}>
                      <span>• STK: <strong style={{ color: '#fff' }}>0973475484</strong></span>
                      <button
                        type="button"
                        onClick={() => copyToClipboard('0973475484', 'stk')}
                        style={{
                          background: selectedPlan === '799k' ? 'rgba(99, 102, 241, 0.2)' : 'rgba(238, 77, 45, 0.2)',
                          border: selectedPlan === '799k' ? '1px solid rgba(99, 102, 241, 0.4)' : '1px solid rgba(238, 77, 45, 0.4)',
                          color: selectedPlan === '799k' ? '#a5b4fc' : '#f97316',
                          fontSize: 11,
                          fontWeight: 700,
                          padding: '2px 8px',
                          borderRadius: 6,
                          cursor: 'pointer',
                        }}
                      >
                        {copiedField === 'stk' ? '✓ Đã chép' : 'Sao chép'}
                      </button>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '3px 0' }}>
                      <span>• Số tiền: <strong style={{ color: selectedPlan === '799k' ? '#818cf8' : '#ee4d2d' }}>{currentPlanInfo.priceStr}</strong></span>
                      <button
                        type="button"
                        onClick={() => copyToClipboard(String(currentPlanInfo.priceNumber), 'money')}
                        style={{
                          background: selectedPlan === '799k' ? 'rgba(99, 102, 241, 0.2)' : 'rgba(238, 77, 45, 0.2)',
                          border: selectedPlan === '799k' ? '1px solid rgba(99, 102, 241, 0.4)' : '1px solid rgba(238, 77, 45, 0.4)',
                          color: selectedPlan === '799k' ? '#a5b4fc' : '#f97316',
                          fontSize: 11,
                          fontWeight: 700,
                          padding: '2px 8px',
                          borderRadius: 6,
                          cursor: 'pointer',
                        }}
                      >
                        {copiedField === 'money' ? '✓ Đã chép' : 'Sao chép'}
                      </button>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '3px 0' }}>
                      <span>• Nội dung: <strong style={{ color: '#fff' }}>{currentPlanInfo.memoPrefix} {orderPhone}</strong></span>
                      <button
                        type="button"
                        onClick={() => copyToClipboard(`${currentPlanInfo.memoPrefix} ${orderPhone}`, 'memo')}
                        style={{
                          background: selectedPlan === '799k' ? 'rgba(99, 102, 241, 0.2)' : 'rgba(238, 77, 45, 0.2)',
                          border: selectedPlan === '799k' ? '1px solid rgba(99, 102, 241, 0.4)' : '1px solid rgba(238, 77, 45, 0.4)',
                          color: selectedPlan === '799k' ? '#a5b4fc' : '#f97316',
                          fontSize: 11,
                          fontWeight: 700,
                          padding: '2px 8px',
                          borderRadius: 6,
                          cursor: 'pointer',
                        }}
                      >
                        {copiedField === 'memo' ? '✓ Đã chép' : 'Sao chép'}
                      </button>
                    </div>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
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
                        padding: '12px 18px',
                        background: 'linear-gradient(135deg, #0068ff, #0084ff)',
                        color: '#fff',
                        borderRadius: 12,
                        fontWeight: 800,
                        fontSize: 14,
                      }}
                    >
                      💬 Nhắn Zalo Nhận Bàn Giao Ngay
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
                        padding: '10px',
                        borderRadius: 12,
                        cursor: 'pointer',
                        fontSize: 13,
                        fontWeight: 700,
                      }}
                    >
                      Đóng Cửa Sổ
                    </button>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleOrderSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                  {/* Order Summary */}
                  <div
                    style={{
                      background: selectedPlan === '799k'
                        ? 'linear-gradient(135deg, rgba(99, 102, 241, 0.12) 0%, rgba(255, 255, 255, 0.03) 100%)'
                        : 'linear-gradient(135deg, rgba(238, 77, 45, 0.12) 0%, rgba(255, 255, 255, 0.03) 100%)',
                      border: selectedPlan === '799k' ? '1px solid rgba(99, 102, 241, 0.35)' : '1px solid rgba(238, 77, 45, 0.35)',
                      borderRadius: 14,
                      padding: '14px 16px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      gap: 12,
                    }}
                  >
                    <div>
                      <div style={{ fontSize: 14, fontWeight: 800, color: '#ffffff', marginBottom: 2 }}>
                        {currentPlanInfo.name}
                      </div>
                      <div style={{ fontSize: 11.5, color: '#10b981', display: 'flex', alignItems: 'center', gap: 4 }}>
                        <FiCheckCircle size={13} /> {currentPlanInfo.badge}
                      </div>
                    </div>
                    <div style={{ textAlign: 'right', flexShrink: 0 }}>
                      <div style={{ fontSize: 20, fontWeight: 900, color: selectedPlan === '799k' ? '#818cf8' : '#ee4d2d' }}>
                        {currentPlanInfo.priceStr}
                      </div>
                      <div style={{ fontSize: 11, textDecoration: 'line-through', color: '#64748b' }}>
                        {currentPlanInfo.originalPriceStr}
                      </div>
                    </div>
                  </div>

                  {/* Input 1: Name */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                    <label style={{ fontSize: 12.5, fontWeight: 700, color: '#e2e8f0' }}>
                      Họ và Tên <span style={{ color: '#ee4d2d' }}>*</span>
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
                        borderRadius: 10,
                        padding: '11px 14px',
                        color: '#ffffff',
                        fontSize: 13.5,
                        outline: 'none',
                      }}
                    />
                  </div>

                  {/* Input 2: Phone */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                    <label style={{ fontSize: 12.5, fontWeight: 700, color: '#e2e8f0' }}>
                      Số điện thoại / Zalo <span style={{ color: '#ee4d2d' }}>*</span>
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
                        borderRadius: 10,
                        padding: '11px 14px',
                        color: '#ffffff',
                        fontSize: 13.5,
                        outline: 'none',
                      }}
                    />
                  </div>

                  {/* Input 3: Email */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                    <label style={{ fontSize: 12.5, fontWeight: 700, color: '#e2e8f0' }}>
                      Email nhận mã nguồn & tài liệu <span style={{ fontSize: 11, color: '#10b981' }}>(Khuyên dùng)</span>
                    </label>
                    <input
                      type="email"
                      placeholder="VD: name@gmail.com"
                      value={orderEmail}
                      onChange={(e) => setOrderEmail(e.target.value)}
                      style={{
                        width: '100%',
                        boxSizing: 'border-box',
                        background: 'rgba(255, 255, 255, 0.06)',
                        border: '1.5px solid rgba(255, 255, 255, 0.15)',
                        borderRadius: 10,
                        padding: '11px 14px',
                        color: '#ffffff',
                        fontSize: 13.5,
                        outline: 'none',
                      }}
                    />
                  </div>

                  {/* Input 4: Notes */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                    <label style={{ fontSize: 12.5, fontWeight: 700, color: '#cbd5e1' }}>
                      Ghi chú hoặc yêu cầu hỗ trợ <span style={{ fontSize: 11, color: '#94a3b8' }}>(Tùy chọn)</span>
                    </label>
                    <input
                      type="text"
                      placeholder={selectedPlan === '799k' ? 'VD: Setup tên miền myshop.vn giúp mình...' : 'VD: Cần hỗ trợ hướng dẫn cài đặt qua Ultraviewer...'}
                      value={orderNotes}
                      onChange={(e) => setOrderNotes(e.target.value)}
                      style={{
                        width: '100%',
                        boxSizing: 'border-box',
                        background: 'rgba(255, 255, 255, 0.06)',
                        border: '1.5px solid rgba(255, 255, 255, 0.15)',
                        borderRadius: 10,
                        padding: '11px 14px',
                        color: '#ffffff',
                        fontSize: 13.5,
                        outline: 'none',
                      }}
                    />
                  </div>

                  {/* Submit Button */}
                  <CoolMode options={{ particle: "🎉" }} className="w-full" style={{ width: '100%' } as React.CSSProperties}>
                    <button
                      type="submit"
                      disabled={isOrderSubmitting}
                      style={{
                        width: '100%',
                        padding: '14px 18px',
                        background: selectedPlan === '799k'
                          ? 'linear-gradient(135deg, #6366f1 0%, #4f46e5 50%, #4338ca 100%)'
                          : 'linear-gradient(135deg, #ee4d2d 0%, #ff5722 50%, #f97316 100%)',
                        color: '#ffffff',
                        border: 'none',
                        borderRadius: 12,
                        fontSize: 15,
                        fontWeight: 900,
                        cursor: isOrderSubmitting ? 'not-allowed' : 'pointer',
                        boxShadow: selectedPlan === '799k' ? '0 8px 25px rgba(99, 102, 241, 0.5)' : '0 8px 25px rgba(238, 77, 45, 0.5)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: 8,
                        transition: 'all 0.2s ease',
                      }}
                    >
                      <FiZap size={16} />
                      {isOrderSubmitting ? 'ĐANG XỬ LÝ...' : `XÁC NHẬN ĐĂNG KÝ ${currentPlanInfo.priceStr}`}
                    </button>
                  </CoolMode>
                </form>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ==========================================================================
         MOBILE STICKY BAR
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
            onClick={() => openOrderModal('399k')}
          >
            <FiZap /> Mua Gói 399K
          </button>
        </CoolMode>
      </div>

      {/* ==========================================================================
         LIGHTBOX PREVIEW MODAL
         ========================================================================== */}
      {activePreviewIndex !== null && currentGalleryList[activePreviewIndex] && (
        <div className={styles.lightboxOverlay} onClick={closePreview}>
          <div className={styles.lightboxHeader} onClick={(e) => e.stopPropagation()}>
            <div className={styles.lightboxTitleWrap}>
              <span className={styles.lightboxCounter}>
                {previewGalleryType === 'admin' ? '⚙️ HỆ THỐNG QUẢN TRỊ ADMIN • ' : '🛍️ GIAO DIỆN STOREFRONT • '}
                {activePreviewIndex + 1} / {currentGalleryList.length} • (DÙNG PHÍM ⬅️ ➡️)
              </span>
              <h3 className={styles.lightboxTitle}>
                {currentGalleryList[activePreviewIndex].title}
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

          <div className={styles.lightboxBody} onClick={closePreview}>
            <button
              type="button"
              className={`${styles.lightboxNavBtn} ${styles.lightboxNavPrev}`}
              onClick={prevPreview}
              title="Ảnh trước"
              aria-label="Ảnh trước"
            >
              <FiChevronLeft />
            </button>

            <div className={styles.lightboxImgWrap} onClick={(e) => e.stopPropagation()}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={currentGalleryList[activePreviewIndex].src}
                alt={currentGalleryList[activePreviewIndex].title}
                className={styles.lightboxImg}
              />
            </div>

            <button
              type="button"
              className={`${styles.lightboxNavBtn} ${styles.lightboxNavNext}`}
              onClick={nextPreview}
              title="Ảnh tiếp theo"
              aria-label="Ảnh tiếp theo"
            >
              <FiChevronRight />
            </button>
          </div>

          <div className={styles.lightboxFooter} onClick={(e) => e.stopPropagation()}>
            <p className={styles.lightboxDesc}>
              {currentGalleryList[activePreviewIndex].desc}
            </p>

            <div className={styles.lightboxThumbnails}>
              {currentGalleryList.map((item, idx) => (
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
