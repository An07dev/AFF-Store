'use client';

import React, { useState } from 'react';
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
} from 'react-icons/fi';
import styles from './page.module.css';

export default function LandingPage() {
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
         1. STICKY HEADER & NAVBAR
         ========================================================================== */}
      <header className={styles.header}>
        <div className={styles.container}>
          <div className={styles.navInner}>
            <Link href="/landing" className={styles.logo}>
              <div className={styles.logoIcon}>
                <FiShoppingBag size={20} />
              </div>
              <span>ShopTik<span style={{ color: '#ee4d2d' }}>.</span></span>
            </Link>

            <ul className={styles.navLinks}>
              <li><a href="#features" className={styles.navLink}>Tính Năng</a></li>
              <li><a href="#themes" className={styles.navLink}>Giao Diện Theme</a></li>
              <li><a href="#hosting" className={styles.navLink}>Hosting & Tên Miền</a></li>
              <li><a href="#metrics" className={styles.navLink}>Hiệu Quả</a></li>
              <li><a href="#faq" className={styles.navLink}>Hỏi Đáp</a></li>
            </ul>

            <div className={styles.headerCtas}>
              <Link href="/admin" className={styles.btnSecondary}>
                <FiZap /> Admin Demo
              </Link>
              <Link href="/" className={`${styles.btnPrimary} ${styles.btnGradientShopee}`}>
                <FiShoppingBag /> Mua Sắm Live
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* ==========================================================================
         2. HERO SECTION
         ========================================================================== */}
      <section className={styles.heroSection}>
        <div className={styles.container}>
          <div className={styles.badgePill}>
            <FiZap className={styles.trustIconCheck} /> Hệ Sinh Thái E-Commerce Tự Động Hóa 100% Thế Hệ Mới
          </div>

          <h1 className={styles.heroTitle}>
            Nền Tảng Bán Hàng <span className={styles.gradientText}>Đột Phá Chuyển Đổi</span> & Vận Hành Thông Minh
          </h1>

          <p className={styles.heroDesc}>
            Trải nghiệm hệ thống thương mại điện tử toàn diện tích hợp <strong>Multi-Theme Shopee / TikTok</strong>,
            thanh toán <strong>VietQR SePay tự động trong 1 giây</strong>, vận chuyển <strong>Đa Hãng GHN / GHTK 1-Click</strong> và đo lường <strong>Meta CAPI & TikTok Events API</strong> chuẩn xác.
          </p>

          <div className={styles.heroCtaGroup}>
            <Link href="/" className={`${styles.btnPrimary} ${styles.btnHeroPrimary} ${styles.btnGradientShopee}`}>
              <FiShoppingBag size={18} /> Khám Phá Cửa Hàng Trực Tiếp
            </Link>
            <Link href="/admin" className={`${styles.btnSecondary} ${styles.btnHeroSecondary}`}>
              <FiZap size={18} /> Trải Nghiệm Trang Quản Trị
            </Link>
          </div>

          <div className={styles.heroTrustBadges}>
            <div className={styles.trustItem}>
              <FiCheckCircle className={styles.trustIconCheck} /> Không Cần Chụp Màn Hình Chuyển Khoản
            </div>
            <div className={styles.trustItem}>
              <FiCheckCircle className={styles.trustIconCheck} /> Khử Trùng Lặp 100% Meta & TikTok Pixel
            </div>
            <div className={styles.trustItem}>
              <FiCheckCircle className={styles.trustIconCheck} /> Xuất Vận Đơn GHN/GHTK 1 Cú Click
            </div>
          </div>

          {/* Device Showcase Mockup Frame */}
          <div className={styles.heroShowcaseWrap}>
            <div className={styles.showcaseFrame}>
              <div className={styles.frameBar}>
                <div className={styles.frameDots}>
                  <div className={`${styles.frameDot} ${styles.frameDotRed}`} />
                  <div className={`${styles.frameDot} ${styles.frameDotYellow}`} />
                  <div className={`${styles.frameDot} ${styles.frameDotGreen}`} />
                </div>
                <div className={styles.frameAddressBar}>
                  🔒 https://shoptik.vn/ — Giao Diện Trực Quan Tương Thích Mọi Thiết Bị
                </div>
              </div>

              {/* Showcase Hero Visual Grid (2 Cột x 2 Hàng) */}
              <div className={styles.heroVisualGrid}>
                {/* Feature Mini Card 1 */}
                <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 14, padding: 20, textAlign: 'left' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
                    <div style={{ width: 36, height: 36, borderRadius: 8, background: 'rgba(238, 77, 45, 0.15)', color: '#ee4d2d', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800 }}>
                      ⚡
                    </div>
                    <div>
                      <div style={{ fontWeight: 800, fontSize: 14 }}>Flash Sale & FOMO</div>
                      <div style={{ fontSize: 11.5, color: '#94a3b8' }}>Đa khung giờ & Đếm ngược</div>
                    </div>
                  </div>
                  <div style={{ height: 6, background: 'rgba(255,255,255,0.08)', borderRadius: 3, overflow: 'hidden', marginBottom: 8 }}>
                    <div style={{ width: '85%', height: '100%', background: 'linear-gradient(90deg, #ea580c, #f97316)', borderRadius: 3 }} />
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: '#94a3b8' }}>
                    <span>🔥 Đã bán: 85/100</span>
                    <span style={{ color: '#f97316', fontWeight: 700 }}>Cháy hàng 85%</span>
                  </div>
                </div>

                {/* Feature Mini Card 2 */}
                <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 14, padding: 20, textAlign: 'left' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
                    <div style={{ width: 36, height: 36, borderRadius: 8, background: 'rgba(16, 185, 129, 0.15)', color: '#10b981', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800 }}>
                      💳
                    </div>
                    <div>
                      <div style={{ fontWeight: 800, fontSize: 14 }}>VietQR Khớp Lệnh 1s</div>
                      <div style={{ fontSize: 11.5, color: '#94a3b8' }}>Xác nhận tự động qua SePay</div>
                    </div>
                  </div>
                  <div style={{ background: 'rgba(16, 185, 129, 0.1)', border: '1px dashed #10b981', borderRadius: 8, padding: '8px 12px', fontSize: 12, color: '#10b981', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <span>Cú pháp: <strong>ST123456</strong></span>
                    <span style={{ fontWeight: 800 }}>✓ ĐÃ THANH TOÁN</span>
                  </div>
                </div>

                {/* Feature Mini Card 3 */}
                <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 14, padding: 20, textAlign: 'left' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
                    <div style={{ width: 36, height: 36, borderRadius: 8, background: 'rgba(59, 130, 246, 0.15)', color: '#3b82f6', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800 }}>
                      🚚
                    </div>
                    <div>
                      <div style={{ fontWeight: 800, fontSize: 14 }}>Vận Chuyển Đa Hãng</div>
                      <div style={{ fontSize: 11.5, color: '#94a3b8' }}>GHN / GHTK / Viettel Post</div>
                    </div>
                  </div>
                  <div style={{ fontSize: 12, color: '#cbd5e1', display: 'flex', alignItems: 'center', gap: 6 }}>
                    <FiCheckCircle style={{ color: '#3b82f6' }} /> Tính cước theo vị trí & Tracking 5 bước
                  </div>
                </div>

                {/* Feature Mini Card 4: Email Automation */}
                <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 14, padding: 20, textAlign: 'left' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
                    <div style={{ width: 36, height: 36, borderRadius: 8, background: 'rgba(6, 182, 212, 0.15)', color: '#06b6d4', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800 }}>
                      ✉️
                    </div>
                    <div>
                      <div style={{ fontWeight: 800, fontSize: 14 }}>Email Tự Động Hóa</div>
                      <div style={{ fontSize: 11.5, color: '#94a3b8' }}>Hóa đơn & Báo đơn tức thì</div>
                    </div>
                  </div>
                  <div style={{ fontSize: 12, color: '#cbd5e1', display: 'flex', alignItems: 'center', gap: 6 }}>
                    <FiCheckCircle style={{ color: '#06b6d4' }} /> Gửi song song khách & Admin qua Gmail SMTP
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ==========================================================================
         3. PARTNER & INTEGRATION LOGOS
         ========================================================================== */}
      <section className={styles.partnerSection}>
        <div className={styles.container}>
          <div className={styles.partnerTitle}>CÔNG NGHỆ & ĐỐI TÁC VẬN HÀNH HÀNG ĐẦU</div>
          <div className={styles.partnerGrid}>
            <div className={styles.partnerCard}>⚡ Next.js 15 App Router</div>
            <div className={styles.partnerCard}>🚚 Giao Hàng Nhanh (GHN)</div>
            <div className={styles.partnerCard}>📦 Giao Hàng Tiết Kiệm (GHTK)</div>
            <div className={styles.partnerCard}>📮 Viettel Post</div>
            <div className={styles.partnerCard}>💳 SePay VietQR Napas247</div>
            <div className={styles.partnerCard}>✉️ Gmail SMTP Email</div>
            <div className={styles.partnerCard}>🟣 Hostinger Cloud (Auto Deploy)</div>
            <div className={styles.partnerCard}>🎯 Meta Conversions API</div>
            <div className={styles.partnerCard}>🎵 TikTok Events API</div>
            <div className={styles.partnerCard}>💬 Socket.IO Realtime</div>
          </div>
        </div>
      </section>

      {/* ==========================================================================
         4. CORE PILLARS & CUTTING-EDGE FEATURES (6 PILLARS)
         ========================================================================== */}
      <section id="features" style={{ padding: '80px 0 40px' }}>
        <div className={styles.container}>
          <div className={styles.sectionTitleBlock}>
            <span className={styles.sectionTag}>VŨ KHÍ TĂNG TRƯỞNG DOANH SỐ</span>
            <h2 className={styles.sectionTitle}>7 Trụ Cột Đột Phá Khác Biệt Hoàn Toàn</h2>
            <p className={styles.sectionSubtitle}>
              Mọi tính năng được nghiên cứu và thiết kế tối ưu hóa hành vi mua hàng, loại bỏ 100% rào cản thanh toán và thất thoát dữ liệu quảng cáo.
            </p>
          </div>

          <div className={styles.featuresGrid}>
            {/* Pillar 1: Multi-Theme */}
            <div className={styles.featureCard}>
              <div className={`${styles.featureIconWrap} ${styles.iconOrange}`}>
                <FiLayers />
              </div>
              <h3 className={styles.featureName}>Giao Diện Multi-Theme Đa Dạng</h3>
              <p className={styles.featureDesc}>
                Biến hóa phong cách giao diện ngay lập tức với hệ thống CSS Variables toàn diện: Cam Shopee rực rỡ, Đen TikTok thời thượng hoặc Sleek Dark Mode sang trọng.
              </p>
              <ul className={styles.featureList}>
                <li className={styles.featureListItem}><FiCheck className={styles.featureListCheck} /> Chuyển đổi 1-Click không cần build lại</li>
                <li className={styles.featureListItem}><FiCheck className={styles.featureListCheck} /> Đồng bộ từ Storefront đến Admin</li>
                <li className={styles.featureListItem}><FiCheck className={styles.featureListCheck} /> Tùy biến mã màu HEX theo từng thương hiệu</li>
              </ul>
            </div>

            {/* Pillar 2: VietQR SePay */}
            <div className={styles.featureCard}>
              <div className={`${styles.featureIconWrap} ${styles.iconGreen}`}>
                <FiCreditCard />
              </div>
              <h3 className={styles.featureName}>Thanh Toán VietQR Tự Động 100%</h3>
              <p className={styles.featureDesc}>
                Tự sinh mã QR ngân hàng kèm số tiền và mã đơn. Khách hàng quét mã qua app ngân hàng $\rightarrow$ Hệ thống tự động xác nhận đơn đã thanh toán trong 1 giây qua Webhook SePay!
              </p>
              <ul className={styles.featureList}>
                <li className={styles.featureListItem}><FiCheck className={styles.featureListCheck} /> Khách không cần chụp màn hình chuyển khoản</li>
                <li className={styles.featureListItem}><FiCheck className={styles.featureListCheck} /> Tiền vào thẳng tài khoản ngân hàng của bạn</li>
                <li className={styles.featureListItem}><FiCheck className={styles.featureListCheck} /> Hỗ trợ MBBank, VCB, Techcombank, MSB...</li>
              </ul>
            </div>

            {/* Pillar 3: Multi-Carrier Logistics */}
            <div className={styles.featureCard}>
              <div className={`${styles.featureIconWrap} ${styles.iconBlue}`}>
                <FiTruck />
              </div>
              <h3 className={styles.featureName}>Vận Chuyển Đa Hãng 1-Chạm</h3>
              <p className={styles.featureDesc}>
                Tích hợp trực tiếp API Giao Hàng Nhanh (GHN), Giao Hàng Tiết Kiệm (GHTK) và Viettel Post. Tính cước chuẩn xác theo vị trí địa lý và xuất vận đơn chỉ với 1 cú click.
              </p>
              <ul className={styles.featureList}>
                <li className={styles.featureListItem}><FiCheck className={styles.featureListCheck} /> Tự động phân luồng đúng hãng khách chọn</li>
                <li className={styles.featureListItem}><FiCheck className={styles.featureListCheck} /> Trang tra cứu vận đơn lộ trình 5 bước (`/tracking`)</li>
                <li className={styles.featureListItem}><FiCheck className={styles.featureListCheck} /> Hủy đơn 2 chiều đồng bộ với bưu tá</li>
              </ul>
            </div>

            {/* Pillar 4: Flash Sale & FOMO */}
            <div className={styles.featureCard}>
              <div className={`${styles.featureIconWrap} ${styles.iconRed}`}>
                <FiZap />
              </div>
              <h3 className={styles.featureName}>Vũ Khí FOMO & Flash Sale Đa Khung Giờ</h3>
              <p className={styles.featureDesc}>
                Kích thích tâm lý mua sắm gấp gáp với cơ chế đếm ngược thời gian thực, quản lý các khung giờ sale vàng trong ngày, ngày cụ thể và dải ngày linh hoạt.
              </p>
              <ul className={styles.featureList}>
                <li className={styles.featureListItem}><FiCheck className={styles.featureListCheck} /> Popup "Khách vừa mua" tạo hiệu ứng đám đông</li>
                <li className={styles.featureListItem}><FiCheck className={styles.featureListCheck} /> Đồng hồ giữ đơn ưu đãi tại trang Checkout</li>
                <li className={styles.featureListItem}><FiCheck className={styles.featureListCheck} /> Thanh tiến độ cháy hàng (% Sold Progress)</li>
              </ul>
            </div>

            {/* Pillar 5: Meta CAPI & TikTok Events API */}
            <div className={styles.featureCard}>
              <div className={`${styles.featureIconWrap} ${styles.iconPurple}`}>
                <FiBarChart2 />
              </div>
              <h3 className={styles.featureName}>Đo Lường Kép Meta CAPI & TikTok API</h3>
              <p className={styles.featureDesc}>
                Gửi trực tiếp sự kiện mua hàng từ Server đến Meta Graph API & TikTok Business API. Khử trùng lặp 100% bằng `event_id`, bỏ qua rào cản AdBlock và iOS 14.5+.
              </p>
              <ul className={styles.featureList}>
                <li className={styles.featureListItem}><FiCheck className={styles.featureListCheck} /> Băm bảo mật SHA-256 (Email, SĐT, IP, User Agent)</li>
                <li className={styles.featureListItem}><FiCheck className={styles.featureListCheck} /> Tối ưu giá thầu quảng cáo CPA và ROI chiến dịch</li>
                <li className={styles.featureListItem}><FiCheck className={styles.featureListCheck} /> Báo cáo phễu chuyển đổi thời gian thực</li>
              </ul>
            </div>

            {/* Pillar 6: Realtime Chat & AI Bot */}
            <div className={styles.featureCard}>
              <div className={`${styles.featureIconWrap} ${styles.iconAmber}`}>
                <FiMessageSquare />
              </div>
              <h3 className={styles.featureName}>CSKH Realtime Socket.IO & Chatbot</h3>
              <p className={styles.featureDesc}>
                Hệ thống trò chuyện trực tuyến tức thì giữa khách hàng và tư vấn viên, kết hợp AI Chatbot tự động tư vấn sản phẩm, giải đáp thắc mắc và tra cứu đơn 24/7.
              </p>
              <ul className={styles.featureList}>
                <li className={styles.featureListItem}><FiCheck className={styles.featureListCheck} /> Máy chủ Socket.IO độc lập độ trễ siêu thấp</li>
                <li className={styles.featureListItem}><FiCheck className={styles.featureListCheck} /> Tự động trả lời câu hỏi thường gặp khi admin offline</li>
                <li className={styles.featureListItem}><FiCheck className={styles.featureListCheck} /> Đính kèm sản phẩm và thông tin đơn hàng trong chat</li>
              </ul>
            </div>

            {/* Pillar 7: Automated Email System */}
            <div className={styles.featureCard}>
              <div className={`${styles.featureIconWrap} ${styles.iconCyan}`}>
                <FiMail />
              </div>
              <h3 className={styles.featureName}>Gửi Email Thông Báo Tự Động 100%</h3>
              <p className={styles.featureDesc}>
                Tự động gửi email xác nhận kèm hóa đơn chi tiết ngay khi khách đặt hàng thành công, đồng thời phát cảnh báo có đơn mới tức thì về hòm thư của chủ shop qua Gmail SMTP.
              </p>
              <ul className={styles.featureList}>
                <li className={styles.featureListItem}><FiCheck className={styles.featureListCheck} /> Hóa đơn điện tử đầy đủ sản phẩm, ảnh, giá và phí ship</li>
                <li className={styles.featureListItem}><FiCheck className={styles.featureListCheck} /> Thông báo Realtime cho Admin khi phát sinh đơn hàng</li>
                <li className={styles.featureListItem}><FiCheck className={styles.featureListCheck} /> Template HTML cao cấp, responsive trên Mobile & Desktop</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* ==========================================================================
         5. INTERACTIVE THEME PREVIEW SHOWCASE
         ========================================================================== */}
      <section id="themes" className={styles.themeShowcaseSection}>
        <div className={styles.container}>
          <div className={styles.sectionTitleBlock}>
            <span className={styles.sectionTag}>TÙY BIẾN KHÔNG GIỚI HẠN</span>
            <h2 className={styles.sectionTitle}>Trải Nghiệm Đổi Giao Diện Trực Tiếp</h2>
            <p className={styles.sectionSubtitle}>
              Bấm vào các nút dưới đây để xem trước cách hệ thống tự động đổi màu sắc, nút bấm và phong cách hiển thị theo từng bộ theme:
            </p>
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
                <button
                  type="button"
                  className={styles.controlBtnSmall}
                  onClick={handleCopyCss}
                  style={{ backgroundColor: 'rgba(59, 130, 246, 0.15)', borderColor: '#3b82f6', color: '#60a5fa' }}
                >
                  {copiedToast ? '✓ Đã Copy CSS Variables!' : '📋 Sao Chép Mã CSS'}
                </button>
                <Link
                  href="/admin/settings"
                  className={styles.controlBtnSmall}
                  style={{ backgroundColor: 'rgba(238, 77, 45, 0.15)', borderColor: '#ee4d2d', color: '#f97316' }}
                >
                  ⚙️ Cài Đặt Trong Admin
                </Link>
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
        <div className={styles.container}>
          <div className={styles.sectionTitleBlock}>
            <span className={styles.sectionTag}>🚀 TRIỂN KHAI NHANH CHÓNG & TIẾT KIỆM</span>
            <h2 className={styles.sectionTitle}>Giải Pháp Hosting Hostinger Tối Ưu Cho ShopTik</h2>
            <p className={styles.sectionSubtitle}>
              Khởi chạy website bán hàng hoàn chỉnh chỉ trong 5 phút. Tặng 1 Tên Miền Quốc Tế Miễn Phí và Giảm Thêm 10% khi đăng ký qua đối tác độc quyền!
            </p>
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
         7. CUSTOMER TESTIMONIALS
         ========================================================================== */}
      <section style={{ padding: '80px 0' }}>
        <div className={styles.container}>
          <div className={styles.sectionTitleBlock}>
            <span className={styles.sectionTag}>KHÁCH HÀNG & CHỦ SHOP ĐÁNH GIÁ</span>
            <h2 className={styles.sectionTitle}>Được Tin Dùng Bởi Các Nhà Bán Hàng</h2>
            <p className={styles.sectionSubtitle}>
              Lắng nghe cảm nhận thực tế từ các thương hiệu đã triển khai hệ thống ShopTik:
            </p>
          </div>

          <div className={styles.testimonialsGrid}>
            <div className={styles.testimonialCard}>
              <p className={styles.testimonialQuote}>
                "Từ ngày chuyển sang dùng tính năng quét mã VietQR tự động của ShopTik, bên mình tiết kiệm hẳn 2 nhân sự trực đối soát sao kê ngân hàng. Khách chuyển tiền xong là web tự báo thành công ngay lập tức!"
              </p>
              <div className={styles.testimonialAuthor}>
                <img
                  src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80"
                  alt="Author"
                  className={styles.authorAvatar}
                />
                <div>
                  <div className={styles.authorName}>Nguyễn Thu Hằng</div>
                  <div className={styles.authorRole}>CEO • Hằng Boutique Fashion</div>
                </div>
              </div>
            </div>

            <div className={styles.testimonialCard}>
              <p className={styles.testimonialQuote}>
                "Quảng cáo Facebook và TikTok của shop mình từng bị rớt 30% đơn vì khách dùng iOS chặn cookie. Sau khi có Meta CAPI và TikTok Events API server-side, số liệu chuẩn đét, giá CPA giảm rõ rệt."
              </p>
              <div className={styles.testimonialAuthor}>
                <img
                  src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&auto=format&fit=crop&q=80"
                  alt="Author"
                  className={styles.authorAvatar}
                />
                <div>
                  <div className={styles.authorName}>Trần Hoàng Minh</div>
                  <div className={styles.authorRole}>Founder • TechZone Phụ Kiện</div>
                </div>
              </div>
            </div>

            <div className={styles.testimonialCard}>
              <p className={styles.testimonialQuote}>
                "Nút xuất đơn 1-Click sang GHN và GHTK cực kỳ tiện lợi. Đơn hàng khách chọn hãng nào là hệ thống tự gọi đúng hãng đó, shipper qua lấy hàng theo mã vận đơn in sẵn, không phải gõ tay lại địa chỉ."
              </p>
              <div className={styles.testimonialAuthor}>
                <img
                  src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=200&auto=format&fit=crop&q=80"
                  alt="Author"
                  className={styles.authorAvatar}
                />
                <div>
                  <div className={styles.authorName}>Lê Phương Thảo</div>
                  <div className={styles.authorRole}>Quản Lý Vận Hành • Thảo House Living</div>
                </div>
              </div>
            </div>
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
            Trải nghiệm nền tảng thương mại điện tử mượt mà, chuyên nghiệp và tự động hóa hàng đầu ngay hôm nay!
          </p>
          <div style={{ display: 'flex', justifyContent: 'center', gap: 16, flexWrap: 'wrap' }}>
            <Link href="/" className={`${styles.btnPrimary} ${styles.btnHeroPrimary} ${styles.btnGradientShopee}`}>
              <FiShoppingBag size={18} /> Vào Xem Cửa Hàng Trực Tiếp
            </Link>
            <Link href="/admin" className={`${styles.btnSecondary} ${styles.btnHeroSecondary}`}>
              <FiZap size={18} /> Truy Cập Trang Quản Trị
            </Link>
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
  );
}
