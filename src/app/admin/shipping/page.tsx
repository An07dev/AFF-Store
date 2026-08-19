'use client';

import React, { useState, useEffect } from 'react';
import {
  FiTruck,
  FiSave,
  FiCheckCircle,
  FiDollarSign,
  FiZap,
  FiSend,
  FiActivity,
  FiKey,
  FiLayers,
  FiSettings,
  FiEye,
  FiEyeOff,
  FiX,
} from 'react-icons/fi';
import toast from 'react-hot-toast';
import { formatPrice } from '@/lib/utils';
import { vietnamProvinces } from '@/lib/vietnamLocations';
import Skeleton from '@/components/common/Skeleton';
import { apiFetch } from '@/lib/api';
import styles from './page.module.css';

export default function ShippingAdminPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [testingProvider, setTestingProvider] = useState<string | null>(null);

  // Modal State for Carrier Token & Shop ID Configuration
  const [isConfigModalOpen, setIsConfigModalOpen] = useState(false);
  const [activeModalCarrier, setActiveModalCarrier] = useState<'ghn' | 'ghtk' | 'viettelpost'>('ghn');
  const [showTokens, setShowTokens] = useState({
    ghn: false,
    ghtk: false,
    viettelpost: false,
  });

  // Helper to format number with thousand dots separator (VD: 100.000)
  const formatWithDots = (val: string | number) => {
    if (val === '' || val === undefined || val === null) return '';
    const digits = val.toString().replace(/\D/g, '');
    if (!digits) return '';
    return Number(digits).toLocaleString('vi-VN');
  };

  const parseFromDots = (val: string | number) => {
    if (typeof val === 'number') return val;
    const digits = (val || '').toString().replace(/\D/g, '');
    return digits ? Number(digits) : 0;
  };

  // Full Shipping Config State (API 8.3)
  const [config, setConfig] = useState({
    carriers: {
      ghn: {
        enabled: true,
        token: '',
        shopId: '',
        environment: 'production',
      },
      ghtk: {
        enabled: true,
        token: '',
        partnerId: '',
        environment: 'production',
      },
      viettelpost: {
        enabled: true,
        token: '',
        username: '',
        password: '',
        environment: 'production',
      },
    },
    rates: {
      defaultInnerFee: 22000,
      defaultOuterFee: 32000,
      freeShippingThreshold: 500000,
      autoPushOrder: true,
    },
  });

  // Calculator State (API 8.1)
  const [calcData, setCalcData] = useState({
    province: 'Hà Nội',
    district: 'Quận Cầu Giấy',
    weight: 500,
    orderValue: 450000,
  });
  const [calcResults, setCalcResults] = useState<any | null>(null);
  const [isCalculating, setIsCalculating] = useState(false);

  // 3rd-Party Webhook Simulator State
  const [webhookSim, setWebhookSim] = useState({
    carrier: 'ghn',
    orderCode: 'ST949668',
    status: 'delivering',
    location: 'Bưu cục Châu Đốc - An Giang',
    description: 'Shipper đang trên đường phát hàng tận nơi đến bạn',
    shipperName: 'Nguyễn Văn Phát',
    shipperPhone: '0988.777.666',
  });
  const [isSimulating, setIsSimulating] = useState(false);
  const [simResult, setSimResult] = useState<any | null>(null);

  // Load Shipping Config (API 8.3 GET)
  const loadConfig = async () => {
    try {
      setLoading(true);
      const res = await apiFetch('/api/shipping/config');
      const data = await res.json();
      if (data.success && data.data) {
        setConfig(data.data);
      }
    } catch (e) {
      toast.error('Lỗi tải cấu hình vận chuyển');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadConfig();
  }, []);

  // Save Shipping Config (API 8.3 POST)
  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await apiFetch('/api/shipping/config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(config),
      });
      const data = await res.json();
      if (data.success) {
        toast.success(data.message || 'Cập nhật cấu hình vận chuyển thành công!');
        if (data.data) setConfig(data.data);
      } else {
        toast.error(data.message || 'Lỗi lưu cấu hình');
      }
    } catch (e) {
      toast.error('Lỗi kết nối máy chủ');
    } finally {
      setSaving(false);
    }
  };

  // Test Carrier Connection (API 8.3 TEST)
  const handleTestConnection = async (provider: string, tokenOverride?: string) => {
    setTestingProvider(provider);
    try {
      let payload: any = { provider };

      if (provider === 'ghn') {
        payload = {
          provider: 'ghn',
          token: tokenOverride || config.carriers.ghn.token,
          shopId: config.carriers.ghn.shopId,
          environment: config.carriers.ghn.environment,
        };
      } else if (provider === 'ghtk') {
        payload = {
          provider: 'ghtk',
          token: tokenOverride || config.carriers.ghtk.token,
        };
      } else if (provider === 'viettelpost') {
        payload = {
          provider: 'viettelpost',
          token: tokenOverride || config.carriers.viettelpost.token,
        };
      }

      const res = await apiFetch('/api/shipping/test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (data.success) {
        if (data.warning) {
          toast(data.message, { icon: '⚠️', duration: 6000 });
        } else {
          toast.success(data.message || `Kết nối tới ${provider.toUpperCase()} thành công!`, { duration: 6000 });
        }
      } else {
        toast.error(data.message || 'Lỗi kiểm tra kết nối', { duration: 6000 });
      }
    } catch (e) {
      toast.error('Lỗi kiểm tra kết nối API');
    } finally {
      setTestingProvider(null);
    }
  };

  // Calculate & Compare 3 Carriers (API 8.1 POST)
  const handleCalculateFee = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setIsCalculating(true);
    try {
      const res = await apiFetch('/api/shipping/calculate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(calcData),
      });
      const data = await res.json();
      if (data.success && data.data) {
        setCalcResults(data.data);
        toast.success('Đã tính và so sánh cước phí 3 hãng!');
      } else {
        toast.error(data.message || 'Lỗi tính cước phí');
      }
    } catch (e) {
      toast.error('Lỗi kết nối máy chủ');
    } finally {
      setIsCalculating(false);
    }
  };

  // Simulate 3rd-Party Logistics Webhook (GHN / GHTK / Viettel Post)
  const handleSimulateWebhook = async (customStep?: string) => {
    if (!webhookSim.orderCode.trim()) {
      toast.error('Vui lòng nhập mã đơn hàng');
      return;
    }
    const targetStatus = customStep || webhookSim.status;
    setIsSimulating(true);
    try {
      let payload: any = {};
      if (webhookSim.carrier === 'ghn') {
        payload = {
          ClientOrderCode: webhookSim.orderCode.trim().toUpperCase(),
          OrderCode: `GHN-${webhookSim.orderCode.trim().replace(/\D/g, '') || '928371'}`,
          Status: targetStatus,
          Location: webhookSim.location,
          Description: webhookSim.description,
          ShipperName: webhookSim.shipperName,
          ShipperPhone: webhookSim.shipperPhone,
        };
      } else if (webhookSim.carrier === 'ghtk') {
        const statusMap: any = {
          confirmed: 2,
          shipping: 3,
          delivering: 4,
          delivered: 5,
        };
        payload = {
          partner_id: webhookSim.orderCode.trim().toUpperCase(),
          label_id: `GHTK.${webhookSim.orderCode.trim().replace(/\D/g, '') || '839201'}`,
          status_id: statusMap[targetStatus] || 4,
          reason: webhookSim.description,
          address: webhookSim.location,
        };
      } else {
        const vtpStatusMap: any = {
          confirmed: 102,
          shipping: 300,
          delivering: 500,
          delivered: 501,
        };
        payload = {
          ORDER_REFERENCE: webhookSim.orderCode.trim().toUpperCase(),
          ORDER_NUMBER: `VTP${webhookSim.orderCode.trim().replace(/\D/g, '') || '748291'}`,
          ORDER_STATUS: vtpStatusMap[targetStatus] || 500,
          NOTE: webhookSim.description,
          LOCAL_ADDRESS: webhookSim.location,
        };
      }

      const res = await apiFetch(`/api/webhooks/shipping?carrier=${webhookSim.carrier}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      setSimResult(data);
      if (data.success) {
        toast.success(data.message || 'Mô phỏng Webhook vận chuyển thành công!');
      } else {
        toast.error(data.message || 'Lỗi xử lý Webhook');
      }
    } catch (e) {
      toast.error('Lỗi kết nối máy chủ');
    } finally {
      setIsSimulating(false);
    }
  };

  return (
    <div className={styles.container}>
      {/* Header */}
      <div className={styles.header}>
        <div className={styles.titleArea}>
          <h1 className={styles.title}>Quản Lý Vận Chuyển & Cước Phí</h1>
          <p className={styles.subtitle}>
            Tích hợp kết nối 3 đơn vị vận chuyển hàng đầu: GHN, GHTK, Viettel Post
          </p>
        </div>

        <div className={styles.headerActions}>
          <button
            type="button"
            className={styles.saveBtn}
            style={{ background: '#00BFA5', borderColor: '#00BFA5' }}
            onClick={() => {
              setActiveModalCarrier('ghn');
              setIsConfigModalOpen(true);
            }}
          >
            <FiSettings /> Cấu Hình Token API & Shop ID (Modal)
          </button>
          <button
            type="button"
            className={styles.secondaryBtn}
            onClick={() => handleTestConnection('all')}
            disabled={!!testingProvider}
          >
            <FiActivity /> {testingProvider === 'all' ? 'Đang kiểm tra...' : 'Ping kết nối 3 hãng'}
          </button>
          <button
            type="button"
            className={styles.saveBtn}
            onClick={handleSave}
            disabled={saving}
          >
            <FiSave /> {saving ? 'Đang lưu...' : 'Lưu vào Database'}
          </button>
        </div>
      </div>

      {loading ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <Skeleton type="rect" height={200} />
          <Skeleton type="rect" height={320} />
        </div>
      ) : (
        <>
          {/* Section 1: So Sánh Cước Phí 3 Hãng (API 8.1) */}
          <div className={styles.card}>
            <h3 className={styles.cardTitle}>
              <FiZap style={{ color: 'var(--primary, #3b82f6)' }} />
              Công Cụ So Sánh Cước Phí Trực Tiếp (API 8.1)
            </h3>

            {/* Province & District Dropdowns */}
            {(() => {
              const selectedProvinceObj =
                vietnamProvinces.find((p) => p.name === calcData.province) || vietnamProvinces[0];
              return (
                <form onSubmit={handleCalculateFee}>
                  <div className={styles.calcGrid}>
                    <div className={styles.inputGroup}>
                      <label>Tỉnh / Thành phố nhận</label>
                      <select
                        className={styles.select}
                        value={calcData.province}
                        onChange={(e) => {
                          const newProv = e.target.value;
                          const pData = vietnamProvinces.find((p) => p.name === newProv);
                          const firstDist = pData?.districts?.[0]?.name || '';
                          setCalcData({ ...calcData, province: newProv, district: firstDist });
                        }}
                      >
                        {vietnamProvinces.map((p) => (
                          <option key={p.name} value={p.name}>
                            {p.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className={styles.inputGroup}>
                      <label>Quận / Huyện</label>
                      <select
                        className={styles.select}
                        value={calcData.district}
                        onChange={(e) => setCalcData({ ...calcData, district: e.target.value })}
                      >
                        {selectedProvinceObj?.districts?.map((d) => (
                          <option key={d.name} value={d.name}>
                            {d.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className={styles.inputGroup}>
                      <label>Khối lượng (Gram)</label>
                      <input
                        type="number"
                        min="50"
                        step="50"
                        className={styles.input}
                        value={calcData.weight}
                        onChange={(e) => setCalcData({ ...calcData, weight: parseInt(e.target.value) || 0 })}
                      />
                    </div>

                    <button
                      type="submit"
                      className={styles.saveBtn}
                      style={{ width: '100%', height: 42, justifyContent: 'center' }}
                      disabled={isCalculating}
                    >
                      <FiSend /> {isCalculating ? 'Đang tính...' : 'So sánh'}
                    </button>
                  </div>
                </form>
              );
            })()}

            {/* Results Grid */}
            {calcResults && (
              <div className={styles.resultCards} style={{ marginTop: 16 }}>
                {/* GHN */}
                <div className={`${styles.resultCard} ${styles.bestChoice}`}>
                  <div className={styles.bestBadge}>Giao Nhanh</div>
                  <div className={styles.providerName}>⚡ Giao Hàng Nhanh (GHN)</div>
                  <div className={styles.providerFee}>{formatPrice(calcResults.ghn?.fee || 22000)}</div>
                  <div className={styles.providerTime}>
                    Thời gian: <strong>{calcResults.ghn?.estimatedTime || '1 ngày'}</strong>
                  </div>
                </div>

                {/* GHTK */}
                <div className={styles.resultCard}>
                  <div className={styles.providerName}>📦 Giao Hàng Tiết Kiệm (GHTK)</div>
                  <div className={styles.providerFee}>{formatPrice(calcResults.ghtk?.fee || 20000)}</div>
                  <div className={styles.providerTime}>
                    Thời gian: <strong>{calcResults.ghtk?.estimatedTime || '1-2 ngày'}</strong>
                  </div>
                </div>

                {/* Viettel Post */}
                <div className={styles.resultCard}>
                  <div className={styles.providerName}>🚚 Viettel Post Tiêu Chuẩn</div>
                  <div className={styles.providerFee}>{formatPrice(calcResults.viettelpost?.fee || 21000)}</div>
                  <div className={styles.providerTime}>
                    Thời gian: <strong>{calcResults.viettelpost?.estimatedTime || '1-2 ngày'}</strong>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Section 2: Cấu Hình Chi Tiết 3 Đơn Vị Vận Chuyển (API 8.3) */}
          <div className={styles.card}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 }}>
              <h3 className={styles.cardTitle} style={{ margin: 0 }}>
                <FiKey style={{ color: 'var(--primary, #3b82f6)' }} />
                Cấu Hình Token API & Mã Cửa Hàng Từng Hãng
              </h3>
              <button
                type="button"
                className={styles.secondaryBtn}
                style={{ borderColor: '#00BFA5', color: '#00BFA5' }}
                onClick={() => {
                  setActiveModalCarrier('ghn');
                  setIsConfigModalOpen(true);
                }}
              >
                <FiSettings /> Mở Modal Cấu Hình Đầy Đủ (DB)
              </button>
            </div>

            {/* 1. GHN Block */}
            <div className={`${styles.carrierBlock} ${config.carriers.ghn.enabled ? styles.active : ''}`}>
              <div className={styles.carrierHeader}>
                <div className={styles.carrierBrand}>
                  <div className={styles.brandLogo} style={{ backgroundColor: '#ea580c' }}>
                    GHN
                  </div>
                  <div>
                    <h4>Giao Hàng Nhanh (GHN Express)</h4>
                    <p>Kết nối dịch vụ giao hàng thương mại điện tử chuyên nghiệp</p>
                  </div>
                </div>

                <div className={styles.carrierActions}>
                  <button
                    type="button"
                    className={styles.testBadge}
                    style={{ borderColor: '#00BFA5', color: '#00BFA5' }}
                    onClick={() => {
                      setActiveModalCarrier('ghn');
                      setIsConfigModalOpen(true);
                    }}
                  >
                    <FiSettings /> Sửa Token & Shop ID
                  </button>
                  <button
                    type="button"
                    className={styles.testBadge}
                    onClick={() => handleTestConnection('ghn', config.carriers.ghn.token)}
                    disabled={testingProvider === 'ghn'}
                  >
                    <FiCheckCircle /> {testingProvider === 'ghn' ? 'Đang test...' : 'Test API GHN'}
                  </button>

                  <label className={styles.switch}>
                    <input
                      type="checkbox"
                      checked={config.carriers.ghn.enabled}
                      onChange={(e) =>
                        setConfig({
                          ...config,
                          carriers: {
                            ...config.carriers,
                            ghn: { ...config.carriers.ghn, enabled: e.target.checked },
                          },
                        })
                      }
                    />
                    <span className={styles.slider}></span>
                  </label>
                </div>
              </div>

              {config.carriers.ghn.enabled && (
                <div className={styles.grid3}>
                  <div className={styles.inputGroup}>
                    <label>Token API GHN *</label>
                    <input
                      type="password"
                      className={styles.input}
                      placeholder="Nhập API Token GHN..."
                      value={config.carriers.ghn.token}
                      onChange={(e) =>
                        setConfig({
                          ...config,
                          carriers: {
                            ...config.carriers,
                            ghn: { ...config.carriers.ghn, token: e.target.value },
                          },
                        })
                      }
                    />
                  </div>

                  <div className={styles.inputGroup}>
                    <label>Shop ID GHN</label>
                    <input
                      type="text"
                      className={styles.input}
                      placeholder="VD: 184920"
                      value={config.carriers.ghn.shopId}
                      onChange={(e) =>
                        setConfig({
                          ...config,
                          carriers: {
                            ...config.carriers,
                            ghn: { ...config.carriers.ghn, shopId: e.target.value },
                          },
                        })
                      }
                    />
                  </div>

                  <div className={styles.inputGroup}>
                    <label>Môi trường</label>
                    <select
                      className={styles.select}
                      value={config.carriers.ghn.environment}
                      onChange={(e) =>
                        setConfig({
                          ...config,
                          carriers: {
                            ...config.carriers,
                            ghn: { ...config.carriers.ghn, environment: e.target.value },
                          },
                        })
                      }
                    >
                      <option value="production">Production (Chính thức)</option>
                      <option value="sandbox">Sandbox (Thử nghiệm)</option>
                    </select>
                  </div>
                </div>
              )}
            </div>

            {/* 2. GHTK Block */}
            <div className={`${styles.carrierBlock} ${config.carriers.ghtk.enabled ? styles.active : ''}`}>
              <div className={styles.carrierHeader}>
                <div className={styles.carrierBrand}>
                  <div className={styles.brandLogo} style={{ backgroundColor: '#15803d' }}>
                    GHTK
                  </div>
                  <div>
                    <h4>Giao Hàng Tiết Kiệm (GHTK)</h4>
                    <p>Phí ship cạnh tranh, tối ưu cho các đơn hàng thời trang toàn quốc</p>
                  </div>
                </div>

                <div className={styles.carrierActions}>
                  <button
                    type="button"
                    className={styles.testBadge}
                    style={{ borderColor: '#00BFA5', color: '#00BFA5' }}
                    onClick={() => {
                      setActiveModalCarrier('ghtk');
                      setIsConfigModalOpen(true);
                    }}
                  >
                    <FiSettings /> Sửa Token & Partner ID
                  </button>
                  <button
                    type="button"
                    className={styles.testBadge}
                    onClick={() => handleTestConnection('ghtk', config.carriers.ghtk.token)}
                    disabled={testingProvider === 'ghtk'}
                  >
                    <FiCheckCircle /> {testingProvider === 'ghtk' ? 'Đang test...' : 'Test API GHTK'}
                  </button>

                  <label className={styles.switch}>
                    <input
                      type="checkbox"
                      checked={config.carriers.ghtk.enabled}
                      onChange={(e) =>
                        setConfig({
                          ...config,
                          carriers: {
                            ...config.carriers,
                            ghtk: { ...config.carriers.ghtk, enabled: e.target.checked },
                          },
                        })
                      }
                    />
                    <span className={styles.slider}></span>
                  </label>
                </div>
              </div>

              {config.carriers.ghtk.enabled && (
                <div className={styles.grid3}>
                  <div className={styles.inputGroup}>
                    <label>Token API GHTK *</label>
                    <input
                      type="password"
                      className={styles.input}
                      placeholder="Nhập API Token GHTK..."
                      value={config.carriers.ghtk.token}
                      onChange={(e) =>
                        setConfig({
                          ...config,
                          carriers: {
                            ...config.carriers,
                            ghtk: { ...config.carriers.ghtk, token: e.target.value },
                          },
                        })
                      }
                    />
                  </div>

                  <div className={styles.inputGroup}>
                    <label>Mã Đối Tác (Partner ID)</label>
                    <input
                      type="text"
                      className={styles.input}
                      placeholder="VD: PARTNER_01"
                      value={config.carriers.ghtk.partnerId}
                      onChange={(e) =>
                        setConfig({
                          ...config,
                          carriers: {
                            ...config.carriers,
                            ghtk: { ...config.carriers.ghtk, partnerId: e.target.value },
                          },
                        })
                      }
                    />
                  </div>

                  <div className={styles.inputGroup}>
                    <label>Môi trường</label>
                    <select
                      className={styles.select}
                      value={config.carriers.ghtk.environment}
                      onChange={(e) =>
                        setConfig({
                          ...config,
                          carriers: {
                            ...config.carriers,
                            ghtk: { ...config.carriers.ghtk, environment: e.target.value },
                          },
                        })
                      }
                    >
                      <option value="production">Production (Chính thức)</option>
                      <option value="sandbox">Sandbox (Thử nghiệm)</option>
                    </select>
                  </div>
                </div>
              )}
            </div>

            {/* 3. Viettel Post Block */}
            <div className={`${styles.carrierBlock} ${config.carriers.viettelpost.enabled ? styles.active : ''}`}>
              <div className={styles.carrierHeader}>
                <div className={styles.carrierBrand}>
                  <div className={styles.brandLogo} style={{ backgroundColor: '#dc2626' }}>
                    VTP
                  </div>
                  <div>
                    <h4>Viettel Post (VTP)</h4>
                    <p>Mạng lưới rộng khắp phủ kín 63 tỉnh thành & hải đảo</p>
                  </div>
                </div>

                <div className={styles.carrierActions}>
                  <button
                    type="button"
                    className={styles.testBadge}
                    style={{ borderColor: '#00BFA5', color: '#00BFA5' }}
                    onClick={() => {
                      setActiveModalCarrier('viettelpost');
                      setIsConfigModalOpen(true);
                    }}
                  >
                    <FiSettings /> Sửa Token & Tài Khoản
                  </button>
                  <button
                    type="button"
                    className={styles.testBadge}
                    onClick={() => handleTestConnection('viettelpost', config.carriers.viettelpost.token)}
                    disabled={testingProvider === 'viettelpost'}
                  >
                    <FiCheckCircle /> {testingProvider === 'viettelpost' ? 'Đang test...' : 'Test API VTP'}
                  </button>

                  <label className={styles.switch}>
                    <input
                      type="checkbox"
                      checked={config.carriers.viettelpost.enabled}
                      onChange={(e) =>
                        setConfig({
                          ...config,
                          carriers: {
                            ...config.carriers,
                            viettelpost: { ...config.carriers.viettelpost, enabled: e.target.checked },
                          },
                        })
                      }
                    />
                    <span className={styles.slider}></span>
                  </label>
                </div>
              </div>

              {config.carriers.viettelpost.enabled && (
                <div className={styles.grid3}>
                  <div className={styles.inputGroup}>
                    <label>Token Secret Viettel Post *</label>
                    <input
                      type="password"
                      className={styles.input}
                      placeholder="Nhập API Secret Token..."
                      value={config.carriers.viettelpost.token}
                      onChange={(e) =>
                        setConfig({
                          ...config,
                          carriers: {
                            ...config.carriers,
                            viettelpost: { ...config.carriers.viettelpost, token: e.target.value },
                          },
                        })
                      }
                    />
                  </div>

                  <div className={styles.inputGroup}>
                    <label>Tài khoản Doanh Nghiệp (Username)</label>
                    <input
                      type="text"
                      className={styles.input}
                      placeholder="VD: shoptik_vtp"
                      value={config.carriers.viettelpost.username}
                      onChange={(e) =>
                        setConfig({
                          ...config,
                          carriers: {
                            ...config.carriers,
                            viettelpost: { ...config.carriers.viettelpost, username: e.target.value },
                          },
                        })
                      }
                    />
                  </div>

                  <div className={styles.inputGroup}>
                    <label>Môi trường</label>
                    <select
                      className={styles.select}
                      value={config.carriers.viettelpost.environment}
                      onChange={(e) =>
                        setConfig({
                          ...config,
                          carriers: {
                            ...config.carriers,
                            viettelpost: { ...config.carriers.viettelpost, environment: e.target.value },
                          },
                        })
                      }
                    >
                      <option value="production">Production (Chính thức)</option>
                      <option value="sandbox">Sandbox (Thử nghiệm)</option>
                    </select>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Section 3: Chính Sách Biểu Phí & Freeship (API 8.3) */}
          <div className={styles.card}>
            <h3 className={styles.cardTitle}>
              <FiDollarSign style={{ color: 'var(--primary, #3b82f6)' }} />
              Chính Sách Biểu Phí Mặc Định & Miễn Phí Vận Chuyển
            </h3>

            <div className={styles.grid2}>
              <div className={styles.inputGroup}>
                <label>Cước phí vận chuyển Nội thành mặc định (₫)</label>
                <input
                  type="text"
                  inputMode="numeric"
                  className={styles.input}
                  placeholder="VD: 22.000"
                  value={formatWithDots(config.rates.defaultInnerFee)}
                  onChange={(e) =>
                    setConfig({
                      ...config,
                      rates: {
                        ...config.rates,
                        defaultInnerFee: parseFromDots(e.target.value),
                      },
                    })
                  }
                />
                <span className={styles.helperText}>Áp dụng cho đơn giao trong cùng tỉnh/thành phố với kho hàng.</span>
              </div>

              <div className={styles.inputGroup}>
                <label>Cước phí vận chuyển Ngoại thành / Liên tỉnh (₫)</label>
                <input
                  type="text"
                  inputMode="numeric"
                  className={styles.input}
                  placeholder="VD: 32.000"
                  value={formatWithDots(config.rates.defaultOuterFee)}
                  onChange={(e) =>
                    setConfig({
                      ...config,
                      rates: {
                        ...config.rates,
                        defaultOuterFee: parseFromDots(e.target.value),
                      },
                    })
                  }
                />
                <span className={styles.helperText}>Áp dụng khi vận chuyển liên tỉnh đi các khu vực khác.</span>
              </div>
            </div>

            <div className={styles.inputGroup} style={{ marginTop: 12 }}>
              <label>Ngưỡng giá trị đơn hàng Miễn Phí Vận Chuyển (Freeship Toàn Quốc) (₫)</label>
              <input
                type="text"
                inputMode="numeric"
                className={styles.input}
                placeholder="VD: 500.000"
                value={formatWithDots(config.rates.freeShippingThreshold)}
                onChange={(e) =>
                  setConfig({
                    ...config,
                    rates: {
                      ...config.rates,
                      freeShippingThreshold: parseFromDots(e.target.value),
                    },
                  })
                }
              />
              <span className={styles.helperText}>
                Đơn hàng đạt từ {formatPrice(config.rates.freeShippingThreshold)} trở lên sẽ được miễn phí vận chuyển tự động lúc thanh toán.
              </span>
            </div>

            {/* Auto Push Orders Toggle */}
            <div style={{ marginTop: 16, padding: '12px 16px', background: 'var(--bg-main, #090a0f)', borderRadius: 8, border: '1px solid var(--border-color, #232838)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <strong style={{ color: '#fff', fontSize: 14 }}>Tự Động Đẩy Đơn Sang Hãng Khi Khách Thanh Toán Xong</strong>
                <p style={{ margin: '2px 0 0', fontSize: 12, color: 'var(--text-muted, #94a3b8)' }}>
                  Khi khách hàng quét mã VietQR hoặc chuyển khoản thành công, hệ thống tự động tạo mã vận đơn GHN / GHTK ngay lập tức.
                </p>
              </div>
              <label className={styles.switch}>
                <input
                  type="checkbox"
                  checked={!!config.rates.autoPushOrder}
                  onChange={(e) =>
                    setConfig({
                      ...config,
                      rates: {
                        ...config.rates,
                        autoPushOrder: e.target.checked,
                      },
                    })
                  }
                />
                <span className={styles.slider} />
              </label>
            </div>
          </div>

          {/* Section 4: Trung Tâm Kiểm Thử Webhook Vận Chuyển 3rd-Party */}
          <div className={styles.card} style={{ border: '2px solid #00BFA5' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <h3 className={styles.cardTitle} style={{ margin: 0 }}>
                <FiActivity style={{ color: '#00BFA5' }} />
                Trung Tâm Kiểm Thử Webhook Vận Chuyển (GHN / GHTK / Viettel Post)
              </h3>
              <span style={{ fontSize: 11, background: '#e6fffa', color: '#00897b', padding: '4px 10px', borderRadius: 20, fontWeight: 700 }}>
                ⚡ Live Webhook Simulator
              </span>
            </div>
            <p style={{ fontSize: 13, color: 'var(--text-muted, #6b7280)', marginBottom: 16 }}>
              Mô phỏng dữ liệu Webhook gửi từ các hãng giao hàng để kiểm tra luồng cập nhật trạng thái đơn và thanh tiến trình 5 bước trên trang <code>/tracking</code>.
            </p>

            <div className={styles.grid3}>
              <div className={styles.inputGroup}>
                <label>Hãng vận chuyển gửi Webhook</label>
                <select
                  className={styles.select}
                  value={webhookSim.carrier}
                  onChange={(e) => setWebhookSim({ ...webhookSim, carrier: e.target.value })}
                >
                  <option value="ghn">Giao Hàng Nhanh (GHN)</option>
                  <option value="ghtk">Giao Hàng Tiết Kiệm (GHTK)</option>
                  <option value="viettelpost">Viettel Post</option>
                </select>
              </div>

              <div className={styles.inputGroup}>
                <label>Mã đơn hàng cần test (Order Code)</label>
                <input
                  type="text"
                  className={styles.input}
                  placeholder="VD: ST949668"
                  value={webhookSim.orderCode}
                  onChange={(e) => setWebhookSim({ ...webhookSim, orderCode: e.target.value })}
                />
              </div>

              <div className={styles.inputGroup}>
                <label>Chọn bước tiến trình cần kích hoạt</label>
                <select
                  className={styles.select}
                  value={webhookSim.status}
                  onChange={(e) => setWebhookSim({ ...webhookSim, status: e.target.value })}
                >
                  <option value="confirmed">Bước 2: Đang xác nhận đơn (Shop chuẩn bị đóng gói)</option>
                  <option value="shipping">Bước 3: Bàn giao vận chuyển (Hãng đã nhận & đang trung chuyển)</option>
                  <option value="delivering">Bước 4: Đang giao hàng (Shipper đang phát tận nơi)</option>
                  <option value="delivered">Bước 5: Đã giao thành công (Đổi COD thành Paid)</option>
                </select>
              </div>
            </div>

            <div className={styles.grid3} style={{ marginTop: 12 }}>
              <div className={styles.inputGroup}>
                <label>Vị trí bưu cục / Kho phát</label>
                <input
                  type="text"
                  className={styles.input}
                  placeholder="VD: Bưu cục Châu Đốc - An Giang"
                  value={webhookSim.location}
                  onChange={(e) => setWebhookSim({ ...webhookSim, location: e.target.value })}
                />
              </div>

              <div className={styles.inputGroup}>
                <label>Tên Shipper giao hàng</label>
                <input
                  type="text"
                  className={styles.input}
                  placeholder="VD: Nguyễn Văn Phát"
                  value={webhookSim.shipperName}
                  onChange={(e) => setWebhookSim({ ...webhookSim, shipperName: e.target.value })}
                />
              </div>

              <div className={styles.inputGroup}>
                <label>Số điện thoại Shipper</label>
                <input
                  type="text"
                  className={styles.input}
                  placeholder="VD: 0988.777.666"
                  value={webhookSim.shipperPhone}
                  onChange={(e) => setWebhookSim({ ...webhookSim, shipperPhone: e.target.value })}
                />
              </div>
            </div>

            {/* Quick 1-Click Stepper Action Buttons */}
            <div style={{ marginTop: 16, display: 'flex', gap: 10, flexWrap: 'wrap' }}>
              <button
                type="button"
                className={styles.saveBtn}
                style={{ background: '#00BFA5', borderColor: '#00BFA5' }}
                onClick={() => handleSimulateWebhook()}
                disabled={isSimulating}
              >
                <FiZap /> {isSimulating ? 'Đang gửi...' : '⚡ Bắn Webhook Trạng Thái Đã Chọn'}
              </button>

              <button
                type="button"
                className={styles.testBtn}
                onClick={() => handleSimulateWebhook('confirmed')}
                disabled={isSimulating}
                title="Kích hoạt bước 2"
              >
                ▶ Test Bước 2 (Xác nhận)
              </button>

              <button
                type="button"
                className={styles.testBtn}
                onClick={() => handleSimulateWebhook('shipping')}
                disabled={isSimulating}
                title="Kích hoạt bước 3"
              >
                ▶ Test Bước 3 (Bàn giao)
              </button>

              <button
                type="button"
                className={styles.testBtn}
                onClick={() => handleSimulateWebhook('delivering')}
                disabled={isSimulating}
                title="Kích hoạt bước 4"
              >
                ▶ Test Bước 4 (Đang phát)
              </button>

              <button
                type="button"
                className={styles.testBtn}
                onClick={() => handleSimulateWebhook('delivered')}
                disabled={isSimulating}
                title="Kích hoạt bước 5"
                style={{ color: '#059669', borderColor: '#059669' }}
              >
                ▶ Test Bước 5 (Đã giao)
              </button>
            </div>

            {simResult && (
              <div style={{ marginTop: 16, padding: 14, background: '#f8fafc', borderRadius: 8, border: '1px solid #e2e8f0', fontSize: 13 }}>
                <strong style={{ color: simResult.success ? '#059669' : '#dc2626' }}>
                  {simResult.success ? '✓ Phản hồi Webhook 200 OK:' : '✕ Lỗi:'}
                </strong>{' '}
                {simResult.message}
              </div>
            )}
          </div>
        </>
      )}

      {/* MODAL CẤU HÌNH TOKEN & MÃ CỬA HÀNG (DATABASE) */}
      {isConfigModalOpen && (
        <div className={styles.modalOverlay} onClick={() => setIsConfigModalOpen(false)}>
          <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <div>
                <h3 className={styles.modalTitle}>
                  <FiSettings style={{ color: 'var(--primary, #3b82f6)' }} />
                  Cấu Hình Token API & Mã Cửa Hàng (Database)
                </h3>
                <p style={{ margin: '4px 0 0', fontSize: 12, color: 'var(--text-muted, #94a3b8)' }}>
                  Dữ liệu được lưu động trực tiếp vào cơ sở dữ liệu MongoDB Atlas (không lưu file .env)
                </p>
              </div>
              <button
                type="button"
                className={styles.closeBtn}
                onClick={() => setIsConfigModalOpen(false)}
                aria-label="Đóng modal"
              >
                <FiX size={20} />
              </button>
            </div>

            {/* Tabs */}
            <div className={styles.modalTabs}>
              <button
                type="button"
                className={`${styles.modalTab} ${activeModalCarrier === 'ghn' ? styles.modalTabActive : ''}`}
                onClick={() => setActiveModalCarrier('ghn')}
              >
                <span style={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: '#ea580c' }} />
                Giao Hàng Nhanh (GHN)
              </button>
              <button
                type="button"
                className={`${styles.modalTab} ${activeModalCarrier === 'ghtk' ? styles.modalTabActive : ''}`}
                onClick={() => setActiveModalCarrier('ghtk')}
              >
                <span style={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: '#15803d' }} />
                Giao Hàng Tiết Kiệm (GHTK)
              </button>
              <button
                type="button"
                className={`${styles.modalTab} ${activeModalCarrier === 'viettelpost' ? styles.modalTabActive : ''}`}
                onClick={() => setActiveModalCarrier('viettelpost')}
              >
                <span style={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: '#dc2626' }} />
                Viettel Post
              </button>
            </div>

            <div className={styles.modalBody}>
              {/* GHN Form */}
              {activeModalCarrier === 'ghn' && (
                <>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'var(--bg-main, #090a0f)', padding: '12px 16px', borderRadius: 8, border: '1px solid var(--border-color, #232838)' }}>
                    <div>
                      <strong style={{ color: '#fff', fontSize: 14 }}>Kích hoạt dịch vụ GHN Express</strong>
                      <p style={{ margin: '2px 0 0', fontSize: 12, color: '#94a3b8' }}>Bật để tính phí tự động và đẩy vận đơn trực tiếp sang GHN</p>
                    </div>
                    <label className={styles.switch}>
                      <input
                        type="checkbox"
                        checked={config.carriers.ghn.enabled}
                        onChange={(e) =>
                          setConfig({
                            ...config,
                            carriers: {
                              ...config.carriers,
                              ghn: { ...config.carriers.ghn, enabled: e.target.checked },
                            },
                          })
                        }
                      />
                      <span className={styles.slider} />
                    </label>
                  </div>

                  <div className={styles.inputGroup}>
                    <label>Token API GHN (Lấy từ sso.ghn.vn) *</label>
                    <div className={styles.tokenInputWrap}>
                      <input
                        type={showTokens.ghn ? 'text' : 'password'}
                        className={styles.input}
                        placeholder="VD: f49c1538-9a10-11f1-98fd-3649f7abce24"
                        value={config.carriers.ghn.token}
                        onChange={(e) =>
                          setConfig({
                            ...config,
                            carriers: {
                              ...config.carriers,
                              ghn: { ...config.carriers.ghn, token: e.target.value },
                            },
                          })
                        }
                      />
                      <button
                        type="button"
                        className={styles.toggleEyeBtn}
                        onClick={() => setShowTokens({ ...showTokens, ghn: !showTokens.ghn })}
                        title={showTokens.ghn ? 'Ẩn Token' : 'Hiện Token'}
                      >
                        {showTokens.ghn ? <FiEyeOff size={16} /> : <FiEye size={16} />}
                      </button>
                    </div>
                    <span className={styles.helperText}>
                      Token API của tài khoản khách hàng GHN dùng để xác thực các yêu cầu tạo đơn và tính phí.
                    </span>
                  </div>

                  <div className={styles.grid2}>
                    <div className={styles.inputGroup}>
                      <label>Mã Cửa Hàng (Shop ID) GHN *</label>
                      <input
                        type="text"
                        className={styles.input}
                        placeholder="VD: 6611723"
                        value={config.carriers.ghn.shopId}
                        onChange={(e) =>
                          setConfig({
                            ...config,
                            carriers: {
                              ...config.carriers,
                              ghn: { ...config.carriers.ghn, shopId: e.target.value },
                            },
                          })
                        }
                      />
                      <span className={styles.helperText}>Mã cửa hàng hiển thị góc trên bên phải trang khachhang.ghn.vn</span>
                    </div>

                    <div className={styles.inputGroup}>
                      <label>Môi trường API</label>
                      <select
                        className={styles.select}
                        value={config.carriers.ghn.environment}
                        onChange={(e) =>
                          setConfig({
                            ...config,
                            carriers: {
                              ...config.carriers,
                              ghn: { ...config.carriers.ghn, environment: e.target.value },
                            },
                          })
                        }
                      >
                        <option value="production">Production (Chính thức online-gateway.ghn.vn)</option>
                        <option value="sandbox">Sandbox (Thử nghiệm dev-online-gateway.ghn.vn)</option>
                      </select>
                    </div>
                  </div>
                </>
              )}

              {/* GHTK Form */}
              {activeModalCarrier === 'ghtk' && (
                <>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'var(--bg-main, #090a0f)', padding: '12px 16px', borderRadius: 8, border: '1px solid var(--border-color, #232838)' }}>
                    <div>
                      <strong style={{ color: '#fff', fontSize: 14 }}>Kích hoạt dịch vụ GHTK</strong>
                      <p style={{ margin: '2px 0 0', fontSize: 12, color: '#94a3b8' }}>Dịch vụ Giao Hàng Tiết Kiệm</p>
                    </div>
                    <label className={styles.switch}>
                      <input
                        type="checkbox"
                        checked={config.carriers.ghtk.enabled}
                        onChange={(e) =>
                          setConfig({
                            ...config,
                            carriers: {
                              ...config.carriers,
                              ghtk: { ...config.carriers.ghtk, enabled: e.target.checked },
                            },
                          })
                        }
                      />
                      <span className={styles.slider} />
                    </label>
                  </div>

                  <div className={styles.inputGroup}>
                    <label>Token API GHTK *</label>
                    <div className={styles.tokenInputWrap}>
                      <input
                        type={showTokens.ghtk ? 'text' : 'password'}
                        className={styles.input}
                        placeholder="Nhập API Token GHTK..."
                        value={config.carriers.ghtk.token}
                        onChange={(e) =>
                          setConfig({
                            ...config,
                            carriers: {
                              ...config.carriers,
                              ghtk: { ...config.carriers.ghtk, token: e.target.value },
                            },
                          })
                        }
                      />
                      <button
                        type="button"
                        className={styles.toggleEyeBtn}
                        onClick={() => setShowTokens({ ...showTokens, ghtk: !showTokens.ghtk })}
                        title={showTokens.ghtk ? 'Ẩn Token' : 'Hiện Token'}
                      >
                        {showTokens.ghtk ? <FiEyeOff size={16} /> : <FiEye size={16} />}
                      </button>
                    </div>
                  </div>

                  <div className={styles.grid2}>
                    <div className={styles.inputGroup}>
                      <label>Mã Đối Tác (Partner ID)</label>
                      <input
                        type="text"
                        className={styles.input}
                        placeholder="VD: PARTNER_SHOPTIK_01"
                        value={config.carriers.ghtk.partnerId}
                        onChange={(e) =>
                          setConfig({
                            ...config,
                            carriers: {
                              ...config.carriers,
                              ghtk: { ...config.carriers.ghtk, partnerId: e.target.value },
                            },
                          })
                        }
                      />
                    </div>

                    <div className={styles.inputGroup}>
                      <label>Môi trường API</label>
                      <select
                        className={styles.select}
                        value={config.carriers.ghtk.environment}
                        onChange={(e) =>
                          setConfig({
                            ...config,
                            carriers: {
                              ...config.carriers,
                              ghtk: { ...config.carriers.ghtk, environment: e.target.value },
                            },
                          })
                        }
                      >
                        <option value="production">Production (services.giaohangtietkiem.vn)</option>
                        <option value="sandbox">Sandbox (services-dev.giaohangtietkiem.vn)</option>
                      </select>
                    </div>
                  </div>
                </>
              )}

              {/* Viettel Post Form */}
              {activeModalCarrier === 'viettelpost' && (
                <>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'var(--bg-main, #090a0f)', padding: '12px 16px', borderRadius: 8, border: '1px solid var(--border-color, #232838)' }}>
                    <div>
                      <strong style={{ color: '#fff', fontSize: 14 }}>Kích hoạt dịch vụ Viettel Post</strong>
                      <p style={{ margin: '2px 0 0', fontSize: 12, color: '#94a3b8' }}>Dịch vụ bưu chính Viettel Post</p>
                    </div>
                    <label className={styles.switch}>
                      <input
                        type="checkbox"
                        checked={config.carriers.viettelpost.enabled}
                        onChange={(e) =>
                          setConfig({
                            ...config,
                            carriers: {
                              ...config.carriers,
                              viettelpost: { ...config.carriers.viettelpost, enabled: e.target.checked },
                            },
                          })
                        }
                      />
                      <span className={styles.slider} />
                    </label>
                  </div>

                  <div className={styles.inputGroup}>
                    <label>Token Secret Viettel Post</label>
                    <div className={styles.tokenInputWrap}>
                      <input
                        type={showTokens.viettelpost ? 'text' : 'password'}
                        className={styles.input}
                        placeholder="Nhập API Secret Token..."
                        value={config.carriers.viettelpost.token}
                        onChange={(e) =>
                          setConfig({
                            ...config,
                            carriers: {
                              ...config.carriers,
                              viettelpost: { ...config.carriers.viettelpost, token: e.target.value },
                            },
                          })
                        }
                      />
                      <button
                        type="button"
                        className={styles.toggleEyeBtn}
                        onClick={() => setShowTokens({ ...showTokens, viettelpost: !showTokens.viettelpost })}
                        title={showTokens.viettelpost ? 'Ẩn Token' : 'Hiện Token'}
                      >
                        {showTokens.viettelpost ? <FiEyeOff size={16} /> : <FiEye size={16} />}
                      </button>
                    </div>
                  </div>

                  <div className={styles.grid2}>
                    <div className={styles.inputGroup}>
                      <label>Tài khoản Doanh Nghiệp (Username)</label>
                      <input
                        type="text"
                        className={styles.input}
                        placeholder="VD: account.dev.vtp@viettelpost.com"
                        value={config.carriers.viettelpost.username}
                        onChange={(e) =>
                          setConfig({
                            ...config,
                            carriers: {
                              ...config.carriers,
                              viettelpost: { ...config.carriers.viettelpost, username: e.target.value },
                            },
                          })
                        }
                      />
                    </div>

                    <div className={styles.inputGroup}>
                      <label>Môi trường API</label>
                      <select
                        className={styles.select}
                        value={config.carriers.viettelpost.environment}
                        onChange={(e) =>
                          setConfig({
                            ...config,
                            carriers: {
                              ...config.carriers,
                              viettelpost: { ...config.carriers.viettelpost, environment: e.target.value },
                            },
                          })
                        }
                      >
                        <option value="production">Production (partner.viettelpost.vn)</option>
                        <option value="sandbox">Sandbox (partner-dev.viettelpost.vn)</option>
                      </select>
                    </div>
                  </div>
                </>
              )}
            </div>

            <div className={styles.modalFooter}>
              <button
                type="button"
                className={styles.secondaryBtn}
                onClick={() => handleTestConnection(activeModalCarrier, config.carriers[activeModalCarrier]?.token)}
                disabled={testingProvider === activeModalCarrier}
              >
                <FiActivity /> {testingProvider === activeModalCarrier ? 'Đang kiểm tra...' : `Test kết nối ${activeModalCarrier.toUpperCase()}`}
              </button>

              <div style={{ display: 'flex', gap: 10 }}>
                <button
                  type="button"
                  className={styles.secondaryBtn}
                  onClick={() => setIsConfigModalOpen(false)}
                >
                  Đóng
                </button>
                <button
                  type="button"
                  className={styles.saveBtn}
                  onClick={async () => {
                    await handleSave();
                    setIsConfigModalOpen(false);
                  }}
                  disabled={saving}
                >
                  <FiSave /> {saving ? 'Đang lưu...' : '💾 Lưu Cấu Hình Vào Database'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

