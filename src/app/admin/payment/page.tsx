'use client';

import React, { useState, useEffect } from 'react';
import {
  FiCreditCard,
  FiSave,
  FiCopy,
  FiCheck,
  FiZap,
  FiRefreshCw,
  FiCheckCircle,
  FiDollarSign,
  FiSearch,
} from 'react-icons/fi';
import toast from 'react-hot-toast';
import { formatPrice } from '@/lib/utils';
import { apiFetch, API_BASE_URL } from '@/lib/api';
import styles from './page.module.css';

export const BANK_GROUPS = [
  {
    group: '⭐ Ngân Hàng Phổ Biến & Big 4 (Khuyên Dùng)',
    banks: [
      { code: 'MBBank', name: 'MB Bank (Ngân hàng TMCP Quân Đội)' },
      { code: 'VCB', name: 'Vietcombank (Ngân hàng Ngoại Thương Việt Nam)' },
      { code: 'TCB', name: 'Techcombank (Ngân hàng Kỹ Thương Việt Nam)' },
      { code: 'BIDV', name: 'BIDV (Ngân hàng Đầu tư & Phát triển Việt Nam)' },
      { code: 'CTG', name: 'VietinBank (Ngân hàng Công Thương Việt Nam)' },
      { code: 'ACB', name: 'ACB (Ngân hàng Á Châu)' },
      { code: 'VPB', name: 'VPBank (Ngân hàng Việt Nam Thịnh Vượng)' },
      { code: 'TPB', name: 'TPBank (Ngân hàng Tiên Phong)' },
      { code: 'STB', name: 'Sacombank (Ngân hàng Sài Gòn Thương Tín)' },
      { code: 'VBA', name: 'Agribank (Ngân hàng Nông Nghiệp & PTNT)' },
    ],
  },
  {
    group: '🏛️ Ngân Hàng Thương Mại Cổ Phần',
    banks: [
      { code: 'HDB', name: 'HDBank (Ngân hàng Phát triển TP.HCM)' },
      { code: 'VIB', name: 'VIB (Ngân hàng Quốc Tế Việt Nam)' },
      { code: 'SHB', name: 'SHB (Ngân hàng Sài Gòn - Hà Nội)' },
      { code: 'MSB', name: 'MSB (Ngân hàng Hàng Hải Việt Nam)' },
      { code: 'OCB', name: 'OCB (Ngân hàng Phương Đông)' },
      { code: 'LPB', name: 'LPBank (Ngân hàng Bưu Điện Liên Việt)' },
      { code: 'SSB', name: 'SeABank (Ngân hàng Đông Nam Á)' },
      { code: 'EIB', name: 'Eximbank (Ngân hàng Xuất Nhập Khẩu Việt Nam)' },
      { code: 'NAB', name: 'Nam A Bank (Ngân hàng Nam Á)' },
      { code: 'PVCB', name: 'PVcomBank (Ngân hàng Đại Chúng Việt Nam)' },
      { code: 'BVB', name: 'BaoVietBank (Ngân hàng Bảo Việt)' },
      { code: 'BAB', name: 'BacABank (Ngân hàng Bắc Á)' },
      { code: 'VAB', name: 'VietABank (Ngân hàng Việt Á)' },
      { code: 'KLB', name: 'KienlongBank (Ngân hàng Kiên Long)' },
      { code: 'NCB', name: 'NCB (Ngân hàng Quốc Dân)' },
      { code: 'SGB', name: 'SaigonBank (Ngân hàng Sài Gòn Công Thương)' },
      { code: 'VIETBANK', name: 'Vietbank (Ngân hàng Việt Nam Thương Tín)' },
      { code: 'BVBANK', name: 'BVBank (Ngân hàng Bản Việt)' },
      { code: 'PGB', name: 'PGBank (Ngân hàng Thịnh Vượng và Phát Triển)' },
      { code: 'GPB', name: 'GPBank (Ngân hàng Dầu Khí Toàn Cầu)' },
      { code: 'OceanBank', name: 'OceanBank (Ngân hàng Đại Dương)' },
      { code: 'CB', name: 'CBBank (Ngân hàng Xây Dựng)' },
    ],
  },
  {
    group: '📱 Ngân Hàng Số & Ví Điện Tử',
    banks: [
      { code: 'TIMO', name: 'Timo (Ngân hàng số Timo by BVBank)' },
      { code: 'CAKE', name: 'Cake (Ngân hàng số Cake by VPBank)' },
      { code: 'TNEX', name: 'TNEX (Ngân hàng số TNEX by MSB)' },
      { code: 'VTLMONEY', name: 'Viettel Money (Ví điện tử Viettel)' },
      { code: 'VNPTMONEY', name: 'VNPT Money (Ví điện tử VNPT)' },
    ],
  },
  {
    group: '🌐 Ngân Hàng Quốc Tế & Liên Doanh',
    banks: [
      { code: 'SHBVN', name: 'Shinhan Bank (Ngân hàng Shinhan Việt Nam)' },
      { code: 'WOO', name: 'Woori Bank (Ngân hàng Woori Việt Nam)' },
      { code: 'HSBC', name: 'HSBC (Ngân hàng TNHH MTV HSBC Việt Nam)' },
      { code: 'SCBVL', name: 'Standard Chartered (Ngân hàng Standard Chartered VN)' },
      { code: 'PBVN', name: 'Public Bank (Ngân hàng Public Bank Việt Nam)' },
      { code: 'HLBVN', name: 'Hong Leong Bank (Ngân hàng Hong Leong Việt Nam)' },
      { code: 'CIMB', name: 'CIMB (Ngân hàng CIMB Việt Nam)' },
      { code: 'UOB', name: 'UOB (Ngân hàng United Overseas Bank Việt Nam)' },
      { code: 'IVB', name: 'IndovinaBank (Ngân hàng TNHH Indovina)' },
      { code: 'VRB', name: 'VRB (Ngân hàng Liên doanh Việt - Nga)' },
      { code: 'COOPBANK', name: 'Co-opBank (Ngân hàng Hợp tác xã Việt Nam)' },
    ],
  },
];

const BANK_LIST = BANK_GROUPS.flatMap((g) => g.banks);

export default function PaymentAdminPage() {
  const [codEnabled, setCodEnabled] = useState(true);
  const [bankTransferEnabled, setBankTransferEnabled] = useState(true);
  const [bankName, setBankName] = useState('MBBank');
  const [accountNumber, setAccountNumber] = useState('0988123456');
  const [accountName, setAccountName] = useState('SHOPTIK VIETNAM');
  const [sepayToken, setSepayToken] = useState('SEPAY_API_TOKEN_983741');
  const [saving, setSaving] = useState(false);
  const [copied, setCopied] = useState(false);

  // Webhook Simulator State (API 9.2)
  const [simOrderCode, setSimOrderCode] = useState('ST2602');
  const [simAmount, setSimAmount] = useState(689000);
  const [simGateway, setSimGateway] = useState('MBBank');
  const [isSimulating, setIsSimulating] = useState(false);
  const [simOutput, setSimOutput] = useState<string | null>(null);

  // Status Checker State (API 9.1)
  const [checkCode, setCheckCode] = useState('ST2602');
  const [checkResult, setCheckResult] = useState<any | null>(null);
  const [isChecking, setIsChecking] = useState(false);

  useEffect(() => {
    const fetchConfig = async () => {
      try {
        const res = await apiFetch('/api/settings/payment');
        const data = await res.json();
        if (data.success && data.data) {
          if (data.data.codEnabled !== undefined) setCodEnabled(!!data.data.codEnabled);
          if (data.data.bankTransferEnabled !== undefined) setBankTransferEnabled(!!data.data.bankTransferEnabled);
          if (data.data.bankName) setBankName(data.data.bankName);
          if (data.data.accountNumber) setAccountNumber(data.data.accountNumber);
          if (data.data.accountName) setAccountName(data.data.accountName);
          if (data.data.sepayToken) setSepayToken(data.data.sepayToken);
        }
      } catch (e) {
        console.error('Error fetching payment config:', e);
      }
    };
    fetchConfig();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    const data = { codEnabled, bankTransferEnabled, bankName, accountNumber, accountName, sepayToken };
    try {
      const res = await apiFetch('/api/settings/payment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      const resData = await res.json();
      if (resData.success) {
        localStorage.setItem('payment_settings', JSON.stringify(data));
        toast.success('Đã lưu cấu hình phương thức thanh toán thành công!');
      } else {
        toast.error(resData.message || 'Lỗi khi lưu cấu hình');
      }
    } catch (e) {
      toast.error('Lỗi kết nối máy chủ');
    } finally {
      setSaving(false);
    }
  };

  const copyWebhookUrl = () => {
    const baseUrl = API_BASE_URL || (typeof window !== 'undefined' ? window.location.origin : '');
    const url = `${baseUrl}/api/webhooks/sepay`;
    navigator.clipboard.writeText(url);
    setCopied(true);
    toast.success('Đã copy Webhook URL vào bộ nhớ đệm!');
    setTimeout(() => setCopied(false), 2000);
  };

  // Run Webhook Simulation (API 9.2)
  const handleSimulateWebhook = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSimulating(true);
    setSimOutput(null);

    const payload = {
      id: Math.floor(Math.random() * 900000) + 100000,
      gateway: simGateway,
      transactionDate: new Date().toISOString().replace('T', ' ').substring(0, 19),
      accountNumber: accountNumber,
      transferType: 'in',
      transferAmount: Number(simAmount),
      content: `Thanh toan don hang ${simOrderCode}`,
      referenceCode: `FT${Date.now()}`,
    };

    try {
      const res = await apiFetch('/api/webhooks/sepay', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      setSimOutput(
        `[${new Date().toLocaleTimeString()}] Status: ${res.status}\nPayload: ${JSON.stringify(payload, null, 2)}\nResponse: ${JSON.stringify(data, null, 2)}`
      );
      if (data.success) {
        toast.success(`Webhook kích hoạt thành công: ${data.message}`);
      } else {
        toast.error(data.message || 'Webhook trả về lỗi');
      }
    } catch (e) {
      toast.error('Lỗi kết nối máy chủ');
    } finally {
      setIsSimulating(false);
    }
  };

  // Run Realtime Polling Status Check (API 9.1)
  const handleCheckStatus = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!checkCode.trim()) return;
    setIsChecking(true);
    try {
      const res = await apiFetch(`/api/payment/status?code=${encodeURIComponent(checkCode.trim())}`);
      const data = await res.json();
      if (data.success && data.data) {
        setCheckResult(data.data);
        toast.success(`Trạng thái đơn #${checkCode}: ${data.data.isPaid ? 'Đã thanh toán (PAID)' : 'Chưa thanh toán'}`);
      } else {
        toast.error(data.message || 'Không tìm thấy đơn hàng');
        setCheckResult(null);
      }
    } catch (e) {
      toast.error('Lỗi kiểm tra trạng thái thanh toán');
    } finally {
      setIsChecking(false);
    }
  };

  const previewQrUrl = `https://img.vietqr.io/image/${bankName}-${accountNumber}-compact2.png?amount=200000&addInfo=Thanh%20toan%20ST2601&accountName=${encodeURIComponent(accountName)}`;

  return (
    <div className={styles.container}>
      {/* Header */}
      <div className={styles.header}>
        <div className={styles.titleArea}>
          <h1 className={styles.title}>Cổng Thanh Toán VietQR & SePay Webhook</h1>
          <p className={styles.subtitle}>
            Cấu hình tài khoản nhận tiền ngân hàng, kiểm tra biến động số dư tự động và test webhook
          </p>
        </div>
      </div>

      <div className={styles.layoutGrid}>
        {/* Left Column: Account & Webhook Settings */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
          {/* Payment Methods Toggle Card */}
          <div className={styles.card}>
            <h3 className={styles.cardTitle}>
              <FiDollarSign style={{ color: '#10b981' }} />
              Trạng Thái Phương Thức Thanh Toán (Bật / Tắt)
            </h3>
            <p style={{ fontSize: 13, color: 'var(--text-muted, #94a3b8)', marginTop: -6, marginBottom: 14 }}>
              Cấu hình các hình thức thanh toán được phép hiển thị tại trang Checkout của khách hàng
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {/* Option 1: COD */}
              <div
                style={{
                  background: 'var(--bg-main, #090a0f)',
                  border: '1px solid var(--border-color, #232838)',
                  borderRadius: 10,
                  padding: '12px 16px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: 12,
                }}
              >
                <div>
                  <div style={{ fontWeight: 700, fontSize: 14, color: 'var(--text-main, #f8fafc)' }}>
                    💵 Thanh toán khi nhận hàng (COD)
                  </div>
                  <div style={{ fontSize: 12, color: 'var(--text-muted, #94a3b8)', marginTop: 2 }}>
                    Khách hàng thanh toán tiền mặt cho Shipper khi nhận được kiện hàng
                  </div>
                </div>
                <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', flexShrink: 0 }}>
                  <input
                    type="checkbox"
                    checked={codEnabled}
                    onChange={(e) => setCodEnabled(e.target.checked)}
                    style={{ width: 18, height: 18, accentColor: 'var(--primary, #3b82f6)', cursor: 'pointer' }}
                  />
                  <span style={{ fontWeight: 700, fontSize: 13, color: codEnabled ? '#10b981' : '#64748b' }}>
                    {codEnabled ? 'Đang Bật' : 'Đang Tắt'}
                  </span>
                </label>
              </div>

              {/* Option 2: Bank Transfer VietQR */}
              <div
                style={{
                  background: 'var(--bg-main, #090a0f)',
                  border: '1px solid var(--border-color, #232838)',
                  borderRadius: 10,
                  padding: '12px 16px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: 12,
                }}
              >
                <div>
                  <div style={{ fontWeight: 700, fontSize: 14, color: 'var(--text-main, #f8fafc)' }}>
                    ⚡ Chuyển khoản Ngân hàng (VietQR / SePay Tự Động)
                  </div>
                  <div style={{ fontSize: 12, color: 'var(--text-muted, #94a3b8)', marginTop: 2 }}>
                    Tự động tạo mã QR Napas247 và tự động xác nhận Đã Thanh Toán khi tiền về tài khoản
                  </div>
                </div>
                <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', flexShrink: 0 }}>
                  <input
                    type="checkbox"
                    checked={bankTransferEnabled}
                    onChange={(e) => setBankTransferEnabled(e.target.checked)}
                    style={{ width: 18, height: 18, accentColor: 'var(--primary, #3b82f6)', cursor: 'pointer' }}
                  />
                  <span style={{ fontWeight: 700, fontSize: 13, color: bankTransferEnabled ? '#10b981' : '#64748b' }}>
                    {bankTransferEnabled ? 'Đang Bật' : 'Đang Tắt'}
                  </span>
                </label>
              </div>
            </div>
          </div>

          {/* Settings Card */}
          <div className={styles.card}>
            <h3 className={styles.cardTitle}>
              <FiCreditCard style={{ color: 'var(--primary, #3b82f6)' }} />
              Cấu Hình Tài Khoản Nhận Tiền Tự Động
            </h3>

            <form className={styles.form} onSubmit={handleSave}>
              <div className={styles.inputGroup}>
                <label className={styles.label}>Ngân hàng thụ hưởng</label>
                <select
                  className={styles.select}
                  value={bankName}
                  onChange={(e) => setBankName(e.target.value)}
                >
                  {BANK_GROUPS.map((grp) => (
                    <optgroup key={grp.group} label={grp.group}>
                      {grp.banks.map((b) => (
                        <option key={b.code} value={b.code}>
                          {b.code} - {b.name}
                        </option>
                      ))}
                    </optgroup>
                  ))}
                </select>
              </div>

              <div className={styles.inputGroup}>
                <label className={styles.label}>Số tài khoản ngân hàng *</label>
                <input
                  type="text"
                  required
                  placeholder="VD: 0988123456"
                  className={styles.input}
                  value={accountNumber}
                  onChange={(e) => setAccountNumber(e.target.value.replace(/\s+/g, ''))}
                />
              </div>

              <div className={styles.inputGroup}>
                <label className={styles.label}>Tên chủ tài khoản (In hoa không dấu) *</label>
                <input
                  type="text"
                  required
                  placeholder="VD: SHOPTIK VIETNAM"
                  className={styles.input}
                  value={accountName}
                  onChange={(e) => setAccountName(e.target.value.toUpperCase())}
                />
              </div>

              <div className={styles.inputGroup}>
                <label className={styles.label}>SePay API Token / Secret</label>
                <input
                  type="password"
                  placeholder="Nhập API Token từ dashboard SePay.vn..."
                  className={styles.input}
                  value={sepayToken}
                  onChange={(e) => setSepayToken(e.target.value)}
                />
              </div>

              <div className={styles.inputGroup}>
                <label className={styles.label}>Đường dẫn Webhook SePay (Endpoint)</label>
                <div className={styles.copyBox}>
                  <span className={styles.copyText}>
                    {typeof window !== 'undefined' ? `${window.location.origin}/api/webhooks/sepay` : '/api/webhooks/sepay'}
                  </span>
                  <button type="button" className={styles.copyBtn} onClick={copyWebhookUrl}>
                    {copied ? <FiCheck style={{ color: '#10b981' }} /> : <FiCopy />}
                    {copied ? 'Đã copy' : 'Copy'}
                  </button>
                </div>
              </div>

              <button type="submit" className={styles.saveBtn} disabled={saving}>
                <FiSave /> {saving ? 'Đang lưu...' : 'Lưu cấu hình tài khoản'}
              </button>
            </form>
          </div>

          {/* Realtime Status Checker (API 9.1) */}
          <div className={styles.card}>
            <h3 className={styles.cardTitle}>
              <FiSearch style={{ color: 'var(--primary, #3b82f6)' }} />
              Kiểm Tra Trạng Thái Thanh Toán Realtime (API 9.1)
            </h3>

            <form onSubmit={handleCheckStatus} style={{ display: 'flex', gap: 10 }}>
              <input
                type="text"
                className={styles.input}
                placeholder="Nhập mã đơn (#ST...)"
                value={checkCode}
                onChange={(e) => setCheckCode(e.target.value)}
              />
              <button
                type="submit"
                className={styles.saveBtn}
                style={{ width: 140, padding: 0 }}
                disabled={isChecking}
              >
                {isChecking ? 'Đang tra...' : 'Tra cứu'}
              </button>
            </form>

            {checkResult && (
              <div
                style={{
                  backgroundColor: 'var(--bg-main, #090a0f)',
                  border: '1px solid var(--border-color, #232838)',
                  borderRadius: 8,
                  padding: 14,
                  fontSize: '0.875rem',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 6,
                }}
              >
                <div>
                  Mã đơn: <strong style={{ color: 'var(--primary, #3b82f6)' }}>#{checkResult.orderCode}</strong>
                </div>
                <div>
                  Tổng tiền: <strong>{formatPrice(checkResult.totalAmount)}</strong>
                </div>
                <div>
                  Trạng thái thanh toán:{' '}
                  <span
                    style={{
                      fontWeight: 700,
                      color: checkResult.isPaid ? '#10b981' : '#f59e0b',
                    }}
                  >
                    {checkResult.isPaid ? '● Đã thanh toán (PAID)' : '○ Chưa thanh toán (UNPAID)'}
                  </span>
                </div>
                <div>
                  Trạng thái đơn hàng: <strong>{checkResult.orderStatus}</strong>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Live VietQR Preview & SePay Webhook Simulator (API 9.2) */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
          {/* Live VietQR Preview */}
          <div className={styles.card}>
            <h3 className={styles.cardTitle}>
              <FiCheckCircle style={{ color: '#10b981' }} />
              Xem Trước Mã VietQR Thanh Toán Động
            </h3>

            <div className={styles.qrBox}>
              <img src={previewQrUrl} alt="VietQR Demo" className={styles.qrImage} />
              <div className={styles.qrInfo}>
                <strong>{accountName}</strong>
                <br />
                Ngân hàng: <strong>{bankName}</strong> | STK: <strong>{accountNumber}</strong>
                <br />
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted, #94a3b8)' }}>
                  Mã QR chuẩn Napas247 tự động điền số tiền và mã đơn khi khách hàng quét App Ngân Hàng.
                </span>
              </div>
            </div>
          </div>

          {/* Interactive Webhook Simulator (API 9.2) */}
          <div className={styles.card}>
            <h3 className={styles.cardTitle}>
              <FiZap style={{ color: '#f59e0b' }} />
              Giả Lập Biến Động Số Dư SePay (Test Webhook)
            </h3>

            <form className={styles.form} onSubmit={handleSimulateWebhook}>
              <div className={styles.inputGroup}>
                <label className={styles.label}>Mã đơn hàng cần thanh toán</label>
                <input
                  type="text"
                  required
                  placeholder="VD: ST2602"
                  className={styles.input}
                  value={simOrderCode}
                  onChange={(e) => setSimOrderCode(e.target.value.toUpperCase())}
                />
              </div>

              <div className={styles.inputGroup}>
                <label className={styles.label}>Số tiền chuyển vào (₫)</label>
                <input
                  type="number"
                  required
                  className={styles.input}
                  value={simAmount}
                  onChange={(e) => setSimAmount(Number(e.target.value) || 0)}
                />
              </div>

              <div className={styles.inputGroup}>
                <label className={styles.label}>Ngân hàng thanh toán (Gateway)</label>
                <select
                  className={styles.select}
                  value={simGateway}
                  onChange={(e) => setSimGateway(e.target.value)}
                >
                  {BANK_GROUPS.map((grp) => (
                    <optgroup key={grp.group} label={grp.group}>
                      {grp.banks.map((b) => (
                        <option key={b.code} value={b.code}>
                          {b.code} - {b.name}
                        </option>
                      ))}
                    </optgroup>
                  ))}
                </select>
              </div>

              <button
                type="submit"
                className={styles.saveBtn}
                style={{ background: '#f59e0b', color: '#000' }}
                disabled={isSimulating}
              >
                <FiZap /> {isSimulating ? 'Đang gửi Webhook...' : 'Kích hoạt Webhook SePay Giả Lập'}
              </button>
            </form>

            {simOutput && (
              <div className={styles.consoleOutput}>
                {simOutput}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}