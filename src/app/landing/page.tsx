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
} from 'react-icons/fi';
import styles from './page.module.css';

export default function LandingPage() {
  // Theme Showcase State
  const [activeThemeDemo, setActiveThemeDemo] = useState<'shopee' | 'tiktok' | 'dark' | 'light'>('shopee');

  // Interactive Feature Tab State
  const [activeFeatureTab, setActiveFeatureTab] = useState<'storefront' | 'admin' | 'automation'>('storefront');

  // FAQ Accordion State
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  const toggleFaq = (index: number) => {
    setOpenFaq(openFaq === index ? null : index);
  };

  const themeConfigMap = {
    shopee: {
      name: 'Shopee Orange',
      primary: '#ee4d2d',
      bg: '#f8fafc',
      cardBg: '#ffffff',
      textColor: '#0f172a',
      badgeBg: '#fee2e2',
      badgeColor: '#ef4444',
      tag: 'Chuẩn Sàn TMĐT Shopee - Rực Rỡ & Kích Thích Mua Hàng',
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
    },
  };

  const currentTheme = themeConfigMap[activeThemeDemo];

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
              <li><a href="#automation" className={styles.navLink}>Vận Hành Tự Động</a></li>
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

              {/* Showcase Hero Visual Grid */}
              <div style={{ padding: '30px 20px', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 20 }}>
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
            <h2 className={styles.sectionTitle}>6 Trụ Cột Đột Phá Khác Biệt Hoàn Toàn</h2>
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

          <div className={styles.themeSelectorTabs}>
            <button
              type="button"
              className={`${styles.themeTabBtn} ${activeThemeDemo === 'shopee' ? styles.themeTabActive : ''}`}
              onClick={() => setActiveThemeDemo('shopee')}
            >
              🛍️ Shopee Orange
            </button>
            <button
              type="button"
              className={`${styles.themeTabBtn} ${activeThemeDemo === 'tiktok' ? styles.themeTabActive : ''}`}
              onClick={() => setActiveThemeDemo('tiktok')}
            >
              🎵 TikTok Dark
            </button>
            <button
              type="button"
              className={`${styles.themeTabBtn} ${activeThemeDemo === 'dark' ? styles.themeTabActive : ''}`}
              onClick={() => setActiveThemeDemo('dark')}
            >
              🌙 Sleek Dark
            </button>
            <button
              type="button"
              className={`${styles.themeTabBtn} ${activeThemeDemo === 'light' ? styles.themeTabActive : ''}`}
              onClick={() => setActiveThemeDemo('light')}
            >
              ☀️ Clean Light
            </button>
          </div>

          {/* Interactive Preview Mockup Box */}
          <div
            className={styles.themePreviewCard}
            style={{
              backgroundColor: currentTheme.bg,
              color: currentTheme.textColor,
            }}
          >
            <div className={styles.themeMockupHeader}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <div style={{ width: 28, height: 28, borderRadius: 6, background: currentTheme.primary, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 800 }}>
                  ST
                </div>
                <span style={{ fontWeight: 800, fontSize: 15 }}>ShopTik Demo Store</span>
              </div>
              <span
                style={{
                  background: currentTheme.badgeBg,
                  color: currentTheme.badgeColor,
                  padding: '4px 12px',
                  borderRadius: 20,
                  fontSize: 12,
                  fontWeight: 700,
                }}
              >
                {currentTheme.tag}
              </span>
            </div>

            <div className={styles.themeMockupBody}>
              {/* Product Preview 1 */}
              <div className={styles.mockupProductCard} style={{ backgroundColor: currentTheme.cardBg }}>
                <img
                  src="https://images.unsplash.com/photo-1586363104862-3a5e2ab60d99?w=600&auto=format&fit=crop&q=80"
                  alt="Product"
                  className={styles.mockupThumb}
                />
                <div style={{ fontWeight: 700, fontSize: 14 }}>Áo Polo Nam Phối Cổ Dệt Bo Cotton</div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ color: currentTheme.primary, fontWeight: 900, fontSize: 16 }}>229.000₫</span>
                  <span style={{ fontSize: 12, textDecoration: 'line-through', opacity: 0.6 }}>350.000₫</span>
                </div>
                <button
                  type="button"
                  style={{
                    backgroundColor: currentTheme.primary,
                    color: '#ffffff',
                    border: 'none',
                    borderRadius: 8,
                    padding: '8px 14px',
                    fontWeight: 700,
                    fontSize: 13,
                    cursor: 'pointer',
                    width: '100%',
                  }}
                >
                  Mua Ngay
                </button>
              </div>

              {/* Product Preview 2 */}
              <div className={styles.mockupProductCard} style={{ backgroundColor: currentTheme.cardBg }}>
                <img
                  src="https://images.unsplash.com/photo-1583863788434-e58a36330cf0?w=600&auto=format&fit=crop&q=80"
                  alt="Product"
                  className={styles.mockupThumb}
                />
                <div style={{ fontWeight: 700, fontSize: 14 }}>Củ Sạc Nhanh GaN 65W 3 Cổng PD</div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ color: currentTheme.primary, fontWeight: 900, fontSize: 16 }}>299.000₫</span>
                  <span style={{ fontSize: 12, textDecoration: 'line-through', opacity: 0.6 }}>490.000₫</span>
                </div>
                <button
                  type="button"
                  style={{
                    backgroundColor: currentTheme.primary,
                    color: '#ffffff',
                    border: 'none',
                    borderRadius: 8,
                    padding: '8px 14px',
                    fontWeight: 700,
                    fontSize: 13,
                    cursor: 'pointer',
                    width: '100%',
                  }}
                >
                  Mua Ngay
                </button>
              </div>

              {/* Product Preview 3 */}
              <div className={styles.mockupProductCard} style={{ backgroundColor: currentTheme.cardBg }}>
                <img
                  src="https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=600&auto=format&fit=crop&q=80"
                  alt="Product"
                  className={styles.mockupThumb}
                />
                <div style={{ fontWeight: 700, fontSize: 14 }}>Tai Nghe Bluetooth TWS Chống Ồn ANC</div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ color: currentTheme.primary, fontWeight: 900, fontSize: 16 }}>420.000₫</span>
                  <span style={{ fontSize: 12, textDecoration: 'line-through', opacity: 0.6 }}>650.000₫</span>
                </div>
                <button
                  type="button"
                  style={{
                    backgroundColor: currentTheme.primary,
                    color: '#ffffff',
                    border: 'none',
                    borderRadius: 8,
                    padding: '8px 14px',
                    fontWeight: 700,
                    fontSize: 13,
                    cursor: 'pointer',
                    width: '100%',
                  }}
                >
                  Mua Ngay
                </button>
              </div>
            </div>
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
