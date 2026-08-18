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

const BANK_LIST = [
  { code: 'MBBank', name: 'MB Bank (Ngân hàng Quân Đội)' },
  { code: 'VCB', name: 'Vietcombank (Ngân hàng Ngoại Thương)' },
  { code: 'TCB', name: 'Techcombank (Ngân hàng Kỹ Thương)' },
  { code: 'ACB', name: 'ACB (Ngân hàng Á Châu)' },
  { code: 'VPB', name: 'VPBank (Ngân hàng Việt Nam Thịnh Vượng)' },
  { code: 'TPB', name: 'TPBank (Ngân hàng Tiên Phong)' },
  { code: 'BIDV', name: 'BIDV (Ngân hàng Đầu tư & Phát triển)' },
  { code: 'CTG', name: 'VietinBank (Ngân hàng Công Thương)' },
  { code: 'VBA', name: 'Agribank (Ngân hàng Nông Nghiệp)' },
  { code: 'STB', name: 'Sacombank (Ngân hàng Sài Gòn Thương Tín)' },
];

export default function PaymentAdminPage() {
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
    const saved = localStorage.getItem('payment_settings');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed.bankName) setBankName(parsed.bankName);
        if (parsed.accountNumber) setAccountNumber(parsed.accountNumber);
        if (parsed.accountName) setAccountName(parsed.accountName);
        if (parsed.sepayToken) setSepayToken(parsed.sepayToken);
      } catch (e) {}
    }
  }, []);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    const data = { bankName, accountNumber, accountName, sepayToken };
    localStorage.setItem('payment_settings', JSON.stringify(data));
    setTimeout(() => {
      setSaving(false);
      toast.success('Đã lưu cấu hình tài khoản SePay & VietQR thành công!');
    }, 400);
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
                  {BANK_LIST.map((b) => (
                    <option key={b.code} value={b.code}>
                      {b.code} - {b.name}
                    </option>
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