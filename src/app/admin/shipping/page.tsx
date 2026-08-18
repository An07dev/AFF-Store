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

  // Full Shipping Config State (API 8.3)
  const [config, setConfig] = useState({
    carriers: {
      ghn: {
        enabled: true,
        token: 'ghn_prod_token_demo_873912',
        shopId: '184920',
        environment: 'production',
      },
      ghtk: {
        enabled: true,
        token: 'ghtk_api_token_demo_982341',
        partnerId: 'PARTNER_SHOPTIK_01',
        environment: 'production',
      },
      viettelpost: {
        enabled: true,
        token: 'vtp_secret_token_demo_109283',
        username: 'shoptik_vtp',
        environment: 'production',
      },
    },
    rates: {
      defaultInnerFee: 22000,
      defaultOuterFee: 32000,
      freeShippingThreshold: 500000,
      autoPushOrder: false,
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
  const handleTestConnection = async (provider: string, token?: string) => {
    setTestingProvider(provider);
    try {
      const res = await apiFetch('/api/shipping/test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ provider, token }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success(data.message || `Kết nối tới ${provider.toUpperCase()} thành công!`);
      } else {
        toast.error(data.message || 'Lỗi kiểm tra kết nối');
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
            <FiSave /> {saving ? 'Đang lưu...' : 'Lưu cấu hình API'}
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
            <h3 className={styles.cardTitle}>
              <FiKey style={{ color: 'var(--primary, #3b82f6)' }} />
              Cấu Hình Token API & Mã Cửa Hàng Từng Hãng
            </h3>

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
                  type="number"
                  className={styles.input}
                  value={config.rates.defaultInnerFee}
                  onChange={(e) =>
                    setConfig({
                      ...config,
                      rates: {
                        ...config.rates,
                        defaultInnerFee: parseInt(e.target.value) || 0,
                      },
                    })
                  }
                />
                <span className={styles.helperText}>Áp dụng cho đơn giao trong cùng tỉnh/thành phố với kho hàng.</span>
              </div>

              <div className={styles.inputGroup}>
                <label>Cước phí vận chuyển Ngoại thành / Liên tỉnh (₫)</label>
                <input
                  type="number"
                  className={styles.input}
                  value={config.rates.defaultOuterFee}
                  onChange={(e) =>
                    setConfig({
                      ...config,
                      rates: {
                        ...config.rates,
                        defaultOuterFee: parseInt(e.target.value) || 0,
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
                type="number"
                className={styles.input}
                value={config.rates.freeShippingThreshold}
                onChange={(e) =>
                  setConfig({
                    ...config,
                    rates: {
                      ...config.rates,
                      freeShippingThreshold: parseInt(e.target.value) || 0,
                    },
                  })
                }
              />
              <span className={styles.helperText}>
                Đơn hàng đạt từ {formatPrice(config.rates.freeShippingThreshold)} trở lên sẽ được miễn phí vận chuyển tự động lúc thanh toán.
              </span>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
