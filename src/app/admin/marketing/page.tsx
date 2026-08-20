'use client';

import React, { useState, useEffect } from 'react';
import {
  FiSave,
  FiShare2,
  FiTarget,
  FiCode,
  FiActivity,
  FiCheckCircle,
  FiInfo,
  FiPlay,
  FiZap,
  FiBarChart2,
  FiTrendingUp,
  FiShoppingBag,
  FiUsers,
  FiDollarSign,
  FiArrowRight,
} from 'react-icons/fi';
import toast from 'react-hot-toast';
import { formatPrice } from '@/lib/utils';
import { apiFetch } from '@/lib/api';
import { IMarketingConfig, defaultMarketingConfig } from '@/types/marketing';
import styles from './page.module.css';

export default function MarketingPage() {
  const [activeTab, setActiveTab] = useState<'analytics' | 'facebook' | 'tiktok' | 'google' | 'custom' | 'test'>('analytics');
  const [config, setConfig] = useState<IMarketingConfig>(defaultMarketingConfig);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Marketing Analytics Report state
  const [reportPeriod, setReportPeriod] = useState<'today' | '7days' | '30days' | 'all'>('7days');
  const [marketingReport, setMarketingReport] = useState<any>(null);
  const [loadingReport, setLoadingReport] = useState(false);

  // Test Event Tool state
  const [testEventName, setTestEventName] = useState<'Purchase' | 'AddToCart' | 'ViewContent'>('Purchase');
  const [testValue, setTestValue] = useState('250000');
  const [testEmail, setTestEmail] = useState('khachhang@gmail.com');
  const [testPhone, setTestPhone] = useState('0988888888');
  const [testOutput, setTestOutput] = useState<string | null>(null);
  const [isTesting, setIsTesting] = useState(false);

  // Load Marketing Funnel Report
  const loadMarketingReport = async (period: string) => {
    try {
      setLoadingReport(true);
      const res = await apiFetch(`/api/reports/marketing?period=${period}`);
      const data = await res.json();
      if (data.success && data.data) {
        setMarketingReport(data.data);
      }
    } catch (err) {
      console.error('Error fetching marketing report:', err);
    } finally {
      setLoadingReport(false);
    }
  };

  useEffect(() => {
    loadMarketingReport(reportPeriod);
  }, [reportPeriod]);

  // Fetch Marketing Settings from API
  useEffect(() => {
    async function loadMarketingSettings() {
      try {
        setLoading(true);
        const res = await apiFetch('/api/settings/marketing');
        const data = await res.json();
        if (data.success && data.data) {
          setConfig(data.data);
        }
      } catch (err) {
        console.error('Error fetching marketing settings:', err);
        toast.error('Lỗi khi tải cấu hình Marketing');
      } finally {
        setLoading(false);
      }
    }
    loadMarketingSettings();
  }, []);

  // Save Marketing Settings
  const handleSaveTracking = async () => {
    try {
      setSaving(true);
      const res = await apiFetch('/api/settings/marketing', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(config),
      });

      const data = await res.json();
      if (data.success) {
        toast.success('Lưu cấu hình Marketing & Tracking Pixel thành công!');
      } else {
        toast.error(data.message || 'Lỗi khi lưu cấu hình');
      }
    } catch (err) {
      toast.error('Lỗi kết nối máy chủ khi lưu cấu hình');
    } finally {
      setSaving(false);
    }
  };

  // Run Test CAPI Event
  const handleRunTestEvent = async () => {
    try {
      setIsTesting(true);
      setTestOutput('Đang gửi sự kiện thử nghiệm lên Facebook CAPI & TikTok Events API...');

      const res = await apiFetch('/api/tracking/events', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          eventName: testEventName,
          eventId: `test_${Date.now()}`,
          eventSourceUrl: 'https://shoptik.vn/test',
          userData: {
            email: testEmail,
            phone: testPhone,
          },
          customData: {
            value: parseInt(testValue, 10) || 0,
            currency: 'VND',
            content_name: 'Sản Phẩm Test Thử Nghiệm CAPI',
            content_ids: ['prod_test_123'],
            num_items: 1,
            order_id: `ORD_TEST_${Math.floor(Math.random() * 100000)}`,
          },
          isTest: true,
        }),
      });

      const data = await res.json();
      setTestOutput(JSON.stringify(data, null, 2));
      if (data.success) {
        toast.success('Đã gửi sự kiện thử nghiệm thành công! Kiểm tra kết quả bên dưới.');
      }
    } catch (err: any) {
      setTestOutput(`Lỗi gửi sự kiện test: ${err.message}`);
      toast.error('Lỗi khi gửi sự kiện test');
    } finally {
      setIsTesting(false);
    }
  };

  if (loading) {
    return (
      <div className={styles.container}>
        <div style={{ padding: 40, textAlign: 'center', color: 'var(--text-muted)' }}>
          Đang tải cấu hình Marketing & Tracking Pixels...
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      {/* Header */}
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>Marketing & Tracking Pixels</h1>
          <p className={styles.subtitle}>
            Cấu hình mã theo dõi chuyển đổi Facebook CAPI, TikTok Events API, GA4 và mã nhúng tùy biến.
          </p>
        </div>
        <button
          className={styles.saveBtn}
          onClick={handleSaveTracking}
          disabled={saving}
        >
          <FiSave size={16} />
          <span>{saving ? 'Đang lưu...' : 'Lưu Cấu Hình'}</span>
        </button>
      </div>

      {/* Tabs Navigation */}
      <div className={styles.tabsBar}>
        <button
          className={`${styles.tabBtn} ${activeTab === 'analytics' ? styles.activeTabBtn : ''}`}
          onClick={() => setActiveTab('analytics')}
        >
          <FiBarChart2 /> Báo Cáo Phễu Chuyển Đổi
        </button>
        <button
          className={`${styles.tabBtn} ${activeTab === 'facebook' ? styles.activeTabBtn : ''}`}
          onClick={() => setActiveTab('facebook')}
        >
          <FiShare2 /> Facebook Pixel & CAPI
        </button>
        <button
          className={`${styles.tabBtn} ${activeTab === 'tiktok' ? styles.activeTabBtn : ''}`}
          onClick={() => setActiveTab('tiktok')}
        >
          <FiTarget /> TikTok Pixel & Events API
        </button>
        <button
          className={`${styles.tabBtn} ${activeTab === 'google' ? styles.activeTabBtn : ''}`}
          onClick={() => setActiveTab('google')}
        >
          <FiActivity /> Google Analytics 4 & GTM
        </button>
        <button
          className={`${styles.tabBtn} ${activeTab === 'custom' ? styles.activeTabBtn : ''}`}
          onClick={() => setActiveTab('custom')}
        >
          <FiCode /> Mã Script Tùy Chỉnh
        </button>
        <button
          className={`${styles.tabBtn} ${activeTab === 'test' ? styles.activeTabBtn : ''}`}
          onClick={() => setActiveTab('test')}
        >
          <FiZap /> Kiểm Tra Event
        </button>
      </div>

      {/* TAB 0: MARKETING ANALYTICS & CONVERSION FUNNEL */}
      {activeTab === 'analytics' && (
        <div>
          {/* Period Filter Bar */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, flexWrap: 'wrap', gap: 10 }}>
            <h2 style={{ fontSize: 16, fontWeight: 800, margin: 0, color: 'var(--text-main)' }}>
              Phân Tích Hiệu Quả Chiến Dịch & Phễu Khách Hàng
            </h2>
            <div className={styles.periodWrap}>
              {[
                { key: 'today', label: 'Hôm nay' },
                { key: '7days', label: '7 ngày qua' },
                { key: '30days', label: '30 ngày qua' },
                { key: 'all', label: 'Toàn thời gian' },
              ].map((p) => (
                <button
                  key={p.key}
                  type="button"
                  className={`${styles.periodBtn} ${reportPeriod === p.key ? styles.activePeriodBtn : ''}`}
                  onClick={() => setReportPeriod(p.key as any)}
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>

          {/* 4 Main KPI Cards */}
          <div className={styles.kpiGrid}>
            <div className={styles.kpiCard} style={{ '--kpi-accent': '#10b981' } as any}>
              <div className={styles.kpiLabel}>
                <span>Tỷ Lệ Chuyển Đổi (CVR)</span>
                <FiTrendingUp style={{ color: '#10b981' }} />
              </div>
              <div className={styles.kpiValue}>
                {marketingReport?.kpis?.overallCvr || 0}%
              </div>
              <div className={styles.kpiSub}>
                {marketingReport?.kpis?.purchases || 0} đơn / {marketingReport?.kpis?.pageViews || 0} lượt truy cập
              </div>
            </div>

            <div className={styles.kpiCard} style={{ '--kpi-accent': '#3b82f6' } as any}>
              <div className={styles.kpiLabel}>
                <span>Tỷ Lệ Thêm Giỏ Hàng</span>
                <FiShoppingBag style={{ color: '#3b82f6' }} />
              </div>
              <div className={styles.kpiValue}>
                {marketingReport?.kpis?.cartRate || 0}%
              </div>
              <div className={styles.kpiSub}>
                Khách xem hàng quyết định thêm vào giỏ
              </div>
            </div>

            <div className={styles.kpiCard} style={{ '--kpi-accent': '#ef4444' } as any}>
              <div className={styles.kpiLabel}>
                <span>Tỷ Lệ Rớt Giỏ Hàng</span>
                <FiUsers style={{ color: '#ef4444' }} />
              </div>
              <div className={styles.kpiValue}>
                {marketingReport?.kpis?.cartAbandonmentRate || 0}%
              </div>
              <div className={styles.kpiSub}>
                Thêm giỏ nhưng chưa hoàn tất thanh toán
              </div>
            </div>

            <div className={styles.kpiCard} style={{ '--kpi-accent': '#f59e0b' } as any}>
              <div className={styles.kpiLabel}>
                <span>Giá Trị Trung Bình / Đơn (AOV)</span>
                <FiDollarSign style={{ color: '#f59e0b' }} />
              </div>
              <div className={styles.kpiValue}>
                {formatPrice(marketingReport?.kpis?.averageOrderValue || 0)}
              </div>
              <div className={styles.kpiSub}>
                Tổng doanh thu: {formatPrice(marketingReport?.kpis?.totalRevenue || 0)}
              </div>
            </div>
          </div>

          {/* Conversion Funnel Visualization Card */}
          <div className={styles.card}>
            <div className={styles.cardHeader}>
              <div>
                <h3 className={styles.cardTitle}>Phễu Chuyển Đổi Thương Mại Điện Tử (Conversion Funnel)</h3>
                <p className={styles.cardDesc}>
                  Đo lường chi tiết từng bước rơi rụng từ lượt xem trang đến khi mua hàng thành công.
                </p>
              </div>
            </div>

            <div className={styles.funnelContainer}>
              {marketingReport?.funnelSteps?.map((step: any, idx: number) => (
                <div key={idx} className={styles.funnelStepCard}>
                  <div className={styles.funnelStepHeader}>
                    <span>{step.step}</span>
                    <span style={{ color: '#fbbf24', fontSize: 14, fontWeight: 900 }}>
                      {step.count.toLocaleString()} lượt
                    </span>
                  </div>

                  <div className={styles.funnelProgressTrack}>
                    <div
                      className={styles.funnelProgressBar}
                      style={{ width: `${Math.max(6, step.percentOfTotal)}%` }}
                    />
                  </div>

                  <div className={styles.funnelStepMeta}>
                    <span>Chiếm {step.percentOfTotal}% tổng lượt truy cập</span>
                    {step.dropOffPercent > 0 && (
                      <span className={styles.dropOffBadge}>
                        Rơi rụng: -{step.dropOffPercent}% so với bước trước
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Traffic Source Attribution Breakdown Card */}
          <div className={styles.card}>
            <div className={styles.cardHeader}>
              <div>
                <h3 className={styles.cardTitle}>Hiệu Quả Doanh Thu Theo Kênh Quảng Cáo (Attribution)</h3>
                <p className={styles.cardDesc}>
                  Đo lường nguồn traffic mang lại chuyển đổi cao nhất từ các nền tảng Marketing.
                </p>
              </div>
            </div>

            <div className={styles.tableResponsive}>
              <table className={styles.channelsTable}>
                <thead>
                  <tr>
                    <th>Kênh Marketing / Nguồn</th>
                    <th>Lượt Truy Cập</th>
                    <th>Thêm Vào Giỏ</th>
                    <th>Đơn Mua</th>
                    <th>Tỷ Lệ CVR</th>
                    <th>Doanh Thu Đạt Được</th>
                  </tr>
                </thead>
                <tbody>
                  {marketingReport?.channels?.map((ch: any, i: number) => (
                    <tr key={i}>
                      <td>
                        <div className={styles.channelBadge}>
                          {ch.icon === 'facebook' && <FiShare2 style={{ color: '#3b82f6' }} />}
                          {ch.icon === 'tiktok' && <FiTarget style={{ color: '#ec4899' }} />}
                          {ch.icon === 'google' && <FiActivity style={{ color: '#f59e0b' }} />}
                          {ch.icon === 'direct' && <FiUsers style={{ color: '#10b981' }} />}
                          <span>{ch.channel}</span>
                        </div>
                      </td>
                      <td>{ch.visits.toLocaleString()}</td>
                      <td>{ch.addToCart.toLocaleString()}</td>
                      <td style={{ fontWeight: 700, color: '#10b981' }}>{ch.purchases.toLocaleString()}</td>
                      <td>{ch.cvr}%</td>
                      <td style={{ fontWeight: 800, color: '#f97316' }}>{formatPrice(ch.revenue)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 1: FACEBOOK PIXEL & CAPI */}
      {activeTab === 'facebook' && (
        <div className={styles.card}>
          <div className={styles.cardHeader}>
            <div className={styles.cardTitleWrap}>
              <FiShare2 className={styles.platformIcon} style={{ color: '#3b82f6' }} />
              <div>
                <h2 className={styles.cardTitle}>Facebook Pixel & Conversions API (CAPI)</h2>
                <p className={styles.cardDesc}>
                  Đo lường chuyển đổi chuẩn Meta, chống mất dữ liệu trên iOS 14.5+ bằng Server-side API.
                </p>
              </div>
            </div>
            <div className={styles.toggleWrap}>
              <span className={styles.toggleLabel}>
                {config.facebookEnabled ? 'Đang Bật' : 'Đang Tắt'}
              </span>
              <label className={styles.switch}>
                <input
                  type="checkbox"
                  checked={config.facebookEnabled}
                  onChange={(e) => setConfig({ ...config, facebookEnabled: e.target.checked })}
                />
                <span className={styles.slider}></span>
              </label>
            </div>
          </div>

          <div className={styles.formGridTwo}>
            <div className={styles.inputGroup}>
              <label className={styles.inputLabel}>Facebook Pixel ID *</label>
              <input
                type="text"
                className={styles.input}
                placeholder="Ví dụ: 123456789012345"
                value={config.facebookPixelId}
                onChange={(e) => setConfig({ ...config, facebookPixelId: e.target.value })}
              />
              <span className={styles.inputDesc}>Lấy từ Trình quản lý sự kiện Facebook (Events Manager).</span>
            </div>

            <div className={styles.inputGroup}>
              <label className={styles.inputLabel}>Mã Sự Kiện Thử Nghiệm (Test Event Code)</label>
              <input
                type="text"
                className={styles.input}
                placeholder="Ví dụ: TEST12345 (Tùy chọn)"
                value={config.facebookTestEventCode}
                onChange={(e) => setConfig({ ...config, facebookTestEventCode: e.target.value })}
              />
              <span className={styles.inputDesc}>Dùng để xem live test trong tab "Thử nghiệm sự kiện" của Meta.</span>
            </div>
          </div>

          <div className={styles.inputGroup}>
            <label className={styles.inputLabel}>Conversions API Access Token (CAPI Token)</label>
            <input
              type="password"
              className={styles.input}
              placeholder="EAABsbCS1i8kBA..."
              value={config.facebookAccessToken}
              onChange={(e) => setConfig({ ...config, facebookAccessToken: e.target.value })}
            />
            <span className={styles.inputDesc}>
              Tạo trong Events Manager &gt; Cài đặt &gt; Conversions API &gt; Tạo mã truy cập trực tiếp.
            </span>
          </div>

          <div className={styles.hintBox}>
            <FiInfo size={18} style={{ flexShrink: 0, marginTop: 2 }} />
            <div>
              <strong>Lợi ích của Conversions API (CAPI):</strong> Dữ liệu đơn hàng (`Purchase`, `AddToCart`) được gửi trực tiếp từ máy chủ đến Facebook kèm mã `event_id` giúp tối ưu hóa giá thầu quảng cáo chính xác và chống chặn quảng cáo từ trình duyệt.
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: TIKTOK PIXEL & EVENTS API */}
      {activeTab === 'tiktok' && (
        <div className={styles.card}>
          <div className={styles.cardHeader}>
            <div className={styles.cardTitleWrap}>
              <FiTarget className={styles.platformIcon} style={{ color: '#ec4899' }} />
              <div>
                <h2 className={styles.cardTitle}>TikTok Pixel & Events API</h2>
                <p className={styles.cardDesc}>
                  Tối ưu chiến dịch TikTok Ads và đo lường chuyển đổi PlaceAnOrder, AddToCart thời gian thực.
                </p>
              </div>
            </div>
            <div className={styles.toggleWrap}>
              <span className={styles.toggleLabel}>
                {config.tiktokEnabled ? 'Đang Bật' : 'Đang Tắt'}
              </span>
              <label className={styles.switch}>
                <input
                  type="checkbox"
                  checked={config.tiktokEnabled}
                  onChange={(e) => setConfig({ ...config, tiktokEnabled: e.target.checked })}
                />
                <span className={styles.slider}></span>
              </label>
            </div>
          </div>

          <div className={styles.formGridTwo}>
            <div className={styles.inputGroup}>
              <label className={styles.inputLabel}>TikTok Pixel ID *</label>
              <input
                type="text"
                className={styles.input}
                placeholder="Ví dụ: C7ABCDE123456789"
                value={config.tiktokPixelId}
                onChange={(e) => setConfig({ ...config, tiktokPixelId: e.target.value })}
              />
              <span className={styles.inputDesc}>Lấy từ TikTok Ads Manager &gt; Assets &gt; Events.</span>
            </div>

            <div className={styles.inputGroup}>
              <label className={styles.inputLabel}>TikTok Test Event Code</label>
              <input
                type="text"
                className={styles.input}
                placeholder="Ví dụ: TEST_TIKTOK_123"
                value={config.tiktokTestEventCode}
                onChange={(e) => setConfig({ ...config, tiktokTestEventCode: e.target.value })}
              />
              <span className={styles.inputDesc}>Dùng để kiểm tra sự kiện trong tab Test Events của TikTok.</span>
            </div>
          </div>

          <div className={styles.inputGroup}>
            <label className={styles.inputLabel}>TikTok Events API Access Token</label>
            <input
              type="password"
              className={styles.input}
              placeholder="tt_app_token_99..."
              value={config.tiktokAccessToken}
              onChange={(e) => setConfig({ ...config, tiktokAccessToken: e.target.value })}
            />
            <span className={styles.inputDesc}>
              Mã truy cập Events API tạo trong phần Cài đặt Pixel trên TikTok Ads Manager.
            </span>
          </div>
        </div>
      )}

      {/* TAB 3: GOOGLE ANALYTICS 4 & GTM */}
      {activeTab === 'google' && (
        <div className={styles.card}>
          <div className={styles.cardHeader}>
            <div className={styles.cardTitleWrap}>
              <FiActivity className={styles.platformIcon} style={{ color: '#f59e0b' }} />
              <div>
                <h2 className={styles.cardTitle}>Google Analytics 4 (GA4) & Google Tag Manager</h2>
                <p className={styles.cardDesc}>
                  Theo dõi luồng người dùng, nguồn truy cập UTM, hành vi cuộn trang và doanh thu thương mại điện tử.
                </p>
              </div>
            </div>
            <div className={styles.toggleWrap}>
              <span className={styles.toggleLabel}>
                {config.googleEnabled ? 'Đang Bật' : 'Đang Tắt'}
              </span>
              <label className={styles.switch}>
                <input
                  type="checkbox"
                  checked={config.googleEnabled}
                  onChange={(e) => setConfig({ ...config, googleEnabled: e.target.checked })}
                />
                <span className={styles.slider}></span>
              </label>
            </div>
          </div>

          <div className={styles.formGridTwo}>
            <div className={styles.inputGroup}>
              <label className={styles.inputLabel}>Google Analytics 4 Measurement ID</label>
              <input
                type="text"
                className={styles.input}
                placeholder="G-XXXXXXXXXX"
                value={config.googleAnalyticsId}
                onChange={(e) => setConfig({ ...config, googleAnalyticsId: e.target.value })}
              />
              <span className={styles.inputDesc}>Mã đo lường luồng dữ liệu web trong Google Analytics.</span>
            </div>

            <div className={styles.inputGroup}>
              <label className={styles.inputLabel}>Google Tag Manager ID (GTM Container)</label>
              <input
                type="text"
                className={styles.input}
                placeholder="GTM-XXXXXXX"
                value={config.googleTagManagerId}
                onChange={(e) => setConfig({ ...config, googleTagManagerId: e.target.value })}
              />
              <span className={styles.inputDesc}>Mã vùng chứa GTM nếu bạn quản lý thẻ tập trung.</span>
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: CUSTOM SCRIPTS */}
      {activeTab === 'custom' && (
        <div className={styles.card}>
          <div className={styles.cardHeader}>
            <div className={styles.cardTitleWrap}>
              <FiCode className={styles.platformIcon} style={{ color: '#10b981' }} />
              <div>
                <h2 className={styles.cardTitle}>Mã Script Tùy Chỉnh (Custom Code)</h2>
                <p className={styles.cardDesc}>
                  Chèn thêm các mã script của bên thứ ba như Zalo Chat, LiveChat, Hotjar, Microsoft Clarity...
                </p>
              </div>
            </div>
          </div>

          <div className={styles.formGrid}>
            <div className={styles.inputGroup}>
              <label className={styles.inputLabel}>Mã chèn trong thẻ &lt;head&gt;</label>
              <textarea
                className={styles.textarea}
                placeholder="<!-- Thêm mã script chèn trong header tại đây -->"
                value={config.customHeadScripts}
                onChange={(e) => setConfig({ ...config, customHeadScripts: e.target.value })}
              />
            </div>

            <div className={styles.inputGroup}>
              <label className={styles.inputLabel}>Mã chèn trước thẻ đóng &lt;/body&gt;</label>
              <textarea
                className={styles.textarea}
                placeholder="<!-- Thêm mã script chèn trước thẻ đóng body tại đây -->"
                value={config.customBodyScripts}
                onChange={(e) => setConfig({ ...config, customBodyScripts: e.target.value })}
              />
            </div>
          </div>
        </div>
      )}

      {/* TAB 5: TEST EVENT CONSOLE */}
      {activeTab === 'test' && (
        <div className={styles.testCard}>
          <div>
            <h2 className={styles.cardTitle}>Công Cụ Kiểm Tra & Chuẩn Đoán Server CAPI</h2>
            <p className={styles.cardDesc}>
              Bắn thử nghiệm sự kiện máy chủ để kiểm tra Access Token và Pixel ID đã kết nối hợp lệ chưa.
            </p>
          </div>

          <div className={styles.formGridTwo}>
            <div className={styles.inputGroup}>
              <label className={styles.inputLabel}>Loại Sự Kiện Test</label>
              <select
                className={styles.input}
                value={testEventName}
                onChange={(e) => setTestEventName(e.target.value as any)}
              >
                <option value="Purchase">Purchase (Mua hàng thành công)</option>
                <option value="AddToCart">AddToCart (Thêm vào giỏ)</option>
                <option value="ViewContent">ViewContent (Xem sản phẩm)</option>
              </select>
            </div>

            <div className={styles.inputGroup}>
              <label className={styles.inputLabel}>Giá trị đơn hàng thử nghiệm (VND)</label>
              <input
                type="number"
                className={styles.input}
                value={testValue}
                onChange={(e) => setTestValue(e.target.value)}
              />
            </div>
          </div>

          <div className={styles.formGridTwo}>
            <div className={styles.inputGroup}>
              <label className={styles.inputLabel}>Email khách hàng test</label>
              <input
                type="email"
                className={styles.input}
                value={testEmail}
                onChange={(e) => setTestEmail(e.target.value)}
              />
            </div>
            <div className={styles.inputGroup}>
              <label className={styles.inputLabel}>Số điện thoại test</label>
              <input
                type="text"
                className={styles.input}
                value={testPhone}
                onChange={(e) => setTestPhone(e.target.value)}
              />
            </div>
          </div>

          <button
            className={styles.testActionBtn}
            onClick={handleRunTestEvent}
            disabled={isTesting}
          >
            <FiPlay size={16} />
            <span>{isTesting ? 'Đang gửi sự kiện test...' : 'Gửi Sự Kiện Thử Nghiệm Ngay'}</span>
          </button>

          {testOutput && (
            <div className={styles.inputGroup}>
              <label className={styles.inputLabel}>Kết quả phản hồi từ Máy Chủ & API Đối tác:</label>
              <pre className={styles.consoleOutput}>{testOutput}</pre>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
