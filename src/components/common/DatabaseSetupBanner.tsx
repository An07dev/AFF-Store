'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  FiDatabase,
  FiAlertTriangle,
  FiArrowRight,
  FiCheckCircle,
  FiRefreshCw,
  FiZap,
  FiShield,
  FiCheck,
  FiCopy,
  FiShoppingBag,
  FiLock,
  FiKey,
  FiUserCheck,
} from 'react-icons/fi';
import toast from 'react-hot-toast';
import { apiFetch } from '@/lib/api';
import styles from './DatabaseSetupBanner.module.css';

interface DbStatus {
  isVercel: boolean;
  hasUriConfigured: boolean;
  hasMasterCluster: boolean;
  tenant?: {
    shopName: string;
    dbName: string;
    licenseKey?: string;
  };
  isConnected: boolean;
  isSeeded: boolean;
  isLocked?: boolean;
  isRevoked?: boolean;
  licenseStatus?: string;
  errorMessage: string | null;
  stats: {
    users: number;
    products: number;
    categories: number;
  };
}

export default function DatabaseSetupBanner() {
  const router = useRouter();
  const pathname = usePathname();
  const [status, setStatus] = useState<DbStatus | null>(null);
  const [loading, setLoading] = useState(true);

  // Form & License States
  const [shopName, setShopName] = useState('Shop Của Tôi');
  const [licenseKey, setLicenseKey] = useState('');
  const [seeding, setSeeding] = useState(false);
  const [progressPercent, setProgressPercent] = useState(0);
  const [progressText, setProgressText] = useState('');
  const [createdDbName, setCreatedDbName] = useState('');
  const [activatedKey, setActivatedKey] = useState('');
  const [buyerName, setBuyerName] = useState('');
  const [setupDone, setSetupDone] = useState(false);
  const [showAdvancedUri, setShowAdvancedUri] = useState(false);
  const [customUri, setCustomUri] = useState('');
  const [testingUri, setTestingUri] = useState(false);
  const [recheckingLicense, setRecheckingLicense] = useState(false);
  const [copiedPass, setCopiedPass] = useState(false);
  const [copiedEmail, setCopiedEmail] = useState(false);
  const [copiedKey, setCopiedKey] = useState(false);
  const [isModalClosed, setIsModalClosed] = useState(false);

  // Do not show modal when on /setup page
  const isSetupPage = pathname === '/setup';
  const isAdminPage = pathname?.startsWith('/admin');

  const checkDb = async (forceFresh = false) => {
    try {
      const res = await apiFetch(`/api/system/db-status${forceFresh ? '?fresh=1' : ''}`);
      const data = await res.json();
      if (data.success && data.data) {
        setStatus(data.data);
      }
    } catch (err) {
      setStatus({
        isVercel: false,
        hasUriConfigured: false,
        hasMasterCluster: true,
        isConnected: false,
        isSeeded: false,
        errorMessage: 'Không thể kết nối máy chủ CSDL',
        stats: { users: 0, products: 0, categories: 0 },
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isSetupPage) return;
    checkDb();
  }, [pathname, isSetupPage]);

  // Handle License Validation & 1-Click Provisioning
  const handleActivateAndProvision = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();

    const name = shopName.trim() || 'Shop Mới';
    const key = licenseKey.trim().toUpperCase();

    if (!key) {
      toast.error('Vui lòng nhập Mã Kích Hoạt Bản Quyền (License Key)!');
      return;
    }

    setSeeding(true);
    setSetupDone(false);
    setProgressPercent(15);
    setProgressText(`[1/4] Đang xác thực Mã Bản Quyền trên Master Server...`);

    const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

    try {
      await delay(400);
      setProgressPercent(35);
      setProgressText(`[2/4] Mã hợp lệ! Đang cấp phát CSDL MongoDB riêng cho "${name}"...`);

      // Call Provisioning API with License Key
      const res = await apiFetch('/api/setup/provision', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ shopName: name, licenseKey: key }),
      });

      const data = await res.json();

      if (!data.success) {
        throw new Error(data.message || 'Kích hoạt bản quyền thất bại');
      }

      await delay(500);
      setProgressPercent(75);
      setProgressText(`[3/4] Đang tạo tài khoản Quản trị viên tối cao: admin@shopbig.vn...`);

      await delay(500);
      setProgressPercent(100);
      setCreatedDbName(data.data?.dbName || '');
      setActivatedKey(data.data?.licenseKey || key);
      setBuyerName(data.data?.buyerName || '');
      setProgressText(`🎉 Kích hoạt bản quyền và cấp CSDL (${data.data?.dbName || ''}) thành công 100%!`);
      setSetupDone(true);
      toast.success(`🎉 Kích hoạt bản quyền cho "${name}" thành công!`);

      // Refresh database status
      checkDb(true);
    } catch (err: any) {
      toast.error(err.message || 'Lỗi kích hoạt bản quyền');
      setProgressText(`❌ Lỗi: ${err.message || 'Thất bại'}`);
      setTimeout(() => {
        setSeeding(false);
      }, 4000);
    }
  };

  // Handle Manual Custom URI (Alternative)
  const handleConnectCustomUri = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customUri.trim()) {
      toast.error('Vui lòng dán link MONGODB_URI');
      return;
    }

    setTestingUri(true);
    try {
      const res = await apiFetch('/api/setup/test-connection', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ uri: customUri }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success('Kết nối MongoDB thành công! Hãy nhập License Key để tiếp tục.');
        setShowAdvancedUri(false);
      } else {
        toast.error(data.message || 'Kết nối thất bại');
      }
    } catch (err: any) {
      toast.error('Lỗi kiểm tra kết nối');
    } finally {
      setTestingUri(false);
    }
  };

  const copyToClipboard = (text: string, type: 'email' | 'pass' | 'key') => {
    navigator.clipboard.writeText(text);
    if (type === 'email') {
      setCopiedEmail(true);
      setTimeout(() => setCopiedEmail(false), 2000);
    } else if (type === 'pass') {
      setCopiedPass(true);
      setTimeout(() => setCopiedPass(false), 2000);
    } else {
      setCopiedKey(true);
      setTimeout(() => setCopiedKey(false), 2000);
    }
    toast.success(`Đã copy vào Clipboard!`);
  };

  // Go to admin page and hide modal
  const handleGoToAdmin = (e?: React.MouseEvent) => {
    if (e) e.preventDefault();
    setIsModalClosed(true);
    router.push('/admin/login');
  };

  // Complete and enter store
  const handleFinishAndEnterStore = () => {
    setIsModalClosed(true);
    router.refresh();
  };

  // 1. CRITICAL: If the store's license is REVOKED or LOCKED, block 100% access everywhere!
  if (status?.isRevoked || status?.isLocked || status?.licenseStatus === 'revoked') {
    return (
      <div className={styles.modalBackdrop}>
        <div className={`${styles.modalCard} ${styles.lockoutModalCard}`}>
          <div className={styles.modalHeaderCenter}>
            <div className={styles.iconLockoutGlow}>
              <FiLock size={36} color="#ef4444" />
            </div>
            <div className={styles.lockoutBadge}>
              <FiAlertTriangle size={13} /> TRẠNG THÁI: TẠM KHÓA BẢN QUYỀN
            </div>
            <h2 className={styles.modalTitle} style={{ color: '#fca5a5' }}>
              Cửa Hàng Tạm Ngưng Hoạt Động
            </h2>
            <p className={styles.modalDesc}>
              Mã bản quyền của website này đã bị tạm khóa hoặc thu hồi từ máy chủ quản trị trung tâm.
            </p>
          </div>

          <div className={styles.lockoutDetailsCard}>
            <div className={styles.credRow}>
              <span className={styles.credLabel}>
                <FiKey size={15} /> Mã Bản Quyền:
              </span>
              <strong className={styles.credValHighlight} style={{ color: '#ef4444' }}>
                {status.tenant?.licenseKey || 'AFF-UNKNOWN'}
              </strong>
            </div>
            <div className={styles.credRow}>
              <span className={styles.credLabel}>
                <FiShoppingBag size={15} /> Tên Cửa Hàng:
              </span>
              <strong className={styles.credVal}>{status.tenant?.shopName || 'Shop Của Tôi'}</strong>
            </div>
            <div className={styles.credRow}>
              <span className={styles.credLabel}>
                <FiAlertTriangle size={15} /> Lý Do:
              </span>
              <span style={{ color: '#fca5a5', fontSize: '13px' }}>
                {status.errorMessage || 'Bản quyền bị thu hồi bởi nhà phát hành do vi phạm chính sách hoặc hết hạn sử dụng.'}
              </span>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 20 }}>
            <button
              type="button"
              className={styles.btnSubmitLarge}
              style={{
                background: 'linear-gradient(135deg, #ef4444, #dc2626)',
                boxShadow: '0 8px 25px rgba(239, 68, 68, 0.4)',
              }}
              disabled={recheckingLicense}
              onClick={async () => {
                setRecheckingLicense(true);
                try {
                  const res = await apiFetch('/api/system/db-status?fresh=1');
                  const data = await res.json();
                  if (data.success && data.data) {
                    setStatus(data.data);
                    if (!data.data.isLocked && !data.data.isRevoked && data.data.licenseStatus !== 'revoked') {
                      toast.success('🎉 Bản quyền đã được mở khóa thành công!');
                    } else {
                      toast.error('Mã bản quyền vẫn đang trong trạng thái bị khóa trên máy chủ.');
                    }
                  }
                } catch (e) {
                  toast.error('Không thể kết nối máy chủ bản quyền.');
                } finally {
                  setRecheckingLicense(false);
                }
              }}
            >
              <FiRefreshCw size={16} className={recheckingLicense ? styles.spin : ''} />
              <span>{recheckingLicense ? 'Đang kiểm tra máy chủ...' : 'Kiểm Tra Lại Trạng Thái Bản Quyền'}</span>
            </button>

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
                padding: '12px',
                borderRadius: 10,
                background: 'rgba(255, 255, 255, 0.06)',
                border: '1px solid rgba(255, 255, 255, 0.12)',
                color: '#94a3b8',
                fontSize: 13.5,
                fontWeight: 700,
              }}
            >
              💬 Liên Hệ Nhà Phát Hành Để Mở Khóa
            </a>
          </div>
        </div>
      </div>
    );
  }

  // 2. Normal Setup Checks
  if (isSetupPage || isAdminPage || loading || !status || isModalClosed) {
    return null;
  }

  // If connected and seeded, no modal needed
  if (status.isConnected && status.isSeeded && !setupDone) {
    return null;
  }

  return (
    <div className={styles.modalBackdrop}>
      <div className={styles.modalCard}>
        {/* State 1: Active Setup Progress / Success */}
        {seeding || setupDone ? (
          <div className={styles.progressModalBody}>
            {/* Header */}
            <div className={styles.modalHeaderCenter}>
              <div className={setupDone ? styles.iconCelebration : styles.iconPulseBox}>
                {setupDone ? <FiCheckCircle size={36} /> : <FiRefreshCw className={styles.spin} size={32} />}
              </div>
              <h2 className={styles.modalTitle}>
                {setupDone ? '🎉 Kích Hoạt Bản Quyền Thành Công!' : 'Đang Xác Thực Bản Quyền & Khởi Tạo...'}
              </h2>
              <p className={styles.modalDesc}>
                {setupDone
                  ? 'Hệ thống đã xác thực bản quyền, cấp CSDL riêng và tạo tài khoản Quản trị viên thành công.'
                  : 'Vui lòng giữ nguyên trình duyệt trong giây lát để hệ thống hoàn tất.'}
              </p>
            </div>

            {/* Progress Bar & Status Text */}
            <div className={styles.progressSection}>
              <div className={styles.progressTrack}>
                <div
                  className={`${styles.progressFill} ${setupDone ? styles.progressSuccess : ''}`}
                  style={{ width: `${progressPercent}%` }}
                >
                  <div className={styles.progressShimmer}></div>
                </div>
              </div>
              <div className={styles.progressLabelRow}>
                <span className={styles.progressText}>{progressText}</span>
                <span className={styles.percentText}>{progressPercent}%</span>
              </div>
            </div>

            {/* Success Credentials Card */}
            {setupDone && (
              <div className={styles.credentialsCard}>
                <div className={styles.credRow}>
                  <span className={styles.credLabel}>
                    <FiKey size={15} /> Mã Bản Quyền:
                  </span>
                  <div className={styles.credValWrap}>
                    <strong className={styles.credValHighlight}>{activatedKey}</strong>
                    <button
                      type="button"
                      className={styles.btnCopy}
                      onClick={() => copyToClipboard(activatedKey, 'key')}
                      title="Copy Key"
                    >
                      {copiedKey ? <FiCheck size={13} color="#10b981" /> : <FiCopy size={13} />}
                    </button>
                  </div>
                </div>

                <div className={styles.credRow}>
                  <span className={styles.credLabel}>
                    <FiDatabase size={15} /> Tên CSDL Riêng:
                  </span>
                  <strong className={styles.credValHighlight}>{createdDbName || 'shop_primary'}</strong>
                </div>

                <div className={styles.credRow}>
                  <span className={styles.credLabel}>
                    <FiUserCheck size={15} /> Email Quản Trị (Admin):
                  </span>
                  <div className={styles.credValWrap}>
                    <strong className={styles.credVal}>admin@shopbig.vn</strong>
                    <button
                      type="button"
                      className={styles.btnCopy}
                      onClick={() => copyToClipboard('admin@shopbig.vn', 'email')}
                      title="Copy Email"
                    >
                      {copiedEmail ? <FiCheck size={13} color="#10b981" /> : <FiCopy size={13} />}
                    </button>
                  </div>
                </div>

                <div className={styles.credRow}>
                  <span className={styles.credLabel}>
                    <FiLock size={15} /> Mật Khẩu Admin:
                  </span>
                  <div className={styles.credValWrap}>
                    <strong className={styles.credVal}>admin123</strong>
                    <button
                      type="button"
                      className={styles.btnCopy}
                      onClick={() => copyToClipboard('admin123', 'pass')}
                      title="Copy Mật khẩu"
                    >
                      {copiedPass ? <FiCheck size={13} color="#10b981" /> : <FiCopy size={13} />}
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Action Buttons */}
            {setupDone && (
              <div className={styles.modalActionButtons}>
                <button
                  type="button"
                  className={styles.btnPrimaryLarge}
                  onClick={handleGoToAdmin}
                >
                  <FiShield size={18} />
                  <span>Đăng Nhập Trang Quản Trị (Admin)</span>
                  <FiArrowRight size={16} />
                </button>
                <button
                  type="button"
                  className={styles.btnSecondaryLarge}
                  onClick={handleFinishAndEnterStore}
                >
                  <FiShoppingBag size={18} />
                  <span>Vào Xem Cửa Hàng (Storefront)</span>
                </button>
              </div>
            )}
          </div>
        ) : showAdvancedUri ? (
          /* State 2: Advanced Manual URI Form */
          <form className={styles.advancedForm} onSubmit={handleConnectCustomUri}>
            <div className={styles.modalHeaderCenter}>
              <div className={styles.iconBoxMini}>
                <FiDatabase size={26} color="#3b82f6" />
              </div>
              <h2 className={styles.modalTitle}>Cấu Hình MONGODB_URI Thủ Công</h2>
              <p className={styles.modalDesc}>
                Dành cho nhà phát triển muốn sử dụng chuỗi kết nối MongoDB Atlas riêng của mình.
              </p>
            </div>

            <div className={styles.formGroup}>
              <label className={styles.formLabel}>Chuỗi kết nối MongoDB của bạn:</label>
              <input
                type="text"
                className={styles.formInput}
                placeholder="mongodb+srv://user:password@cluster0.mongodb.net/dbname"
                value={customUri}
                onChange={(e) => setCustomUri(e.target.value)}
                autoFocus
              />
            </div>

            <div className={styles.advancedButtons}>
              <button
                type="button"
                className={styles.btnBack}
                onClick={() => setShowAdvancedUri(false)}
              >
                Quay lại
              </button>
              <button
                type="submit"
                className={styles.btnSubmit}
                disabled={testingUri}
              >
                {testingUri ? 'Đang kết nối...' : '⚡ Kiểm Tra Kết Nối'}
              </button>
            </div>
          </form>
        ) : (
          /* State 3: Normal License Key & Setup Form (Unskippable) */
          <form className={styles.initialForm} onSubmit={handleActivateAndProvision}>
            {/* Top Icon */}
            <div className={styles.modalHeaderCenter}>
              <div className={styles.iconBoxGlow}>
                <FiKey size={32} color="#3b82f6" />
              </div>
              <div className={styles.requiredBadge}>
                <FiShield size={13} /> Kích Hoạt Bản Quyền • Cấp CSDL Riêng
              </div>
              <h2 className={styles.modalTitle}>Kích Hoạt Cửa Hàng & Khởi Tạo CSDL</h2>
              <p className={styles.modalDesc}>
                Nhập Mã Bản Quyền (License Key) được cấp khi mua mã nguồn để mở khóa và khởi tạo CSDL riêng cho cửa hàng.
              </p>
            </div>

            {/* Shop Name Input */}
            <div className={styles.formGroup}>
              <label className={styles.formLabel}>Tên cửa hàng / Thương hiệu của bạn:</label>
              <div className={styles.inputWithIcon}>
                <FiShoppingBag className={styles.inputInnerIcon} size={18} />
                <input
                  type="text"
                  required
                  className={styles.formInput}
                  placeholder="Ví dụ: Shop Thời Trang Nam Phong"
                  value={shopName}
                  onChange={(e) => setShopName(e.target.value)}
                />
              </div>
            </div>

            {/* License Key Input */}
            <div className={styles.formGroup}>
              <div className={styles.labelRow}>
                <label className={styles.formLabel}>Mã kích hoạt bản quyền (License Key):</label>
                <span className={styles.oneTimeTag}>Dùng 1 lần duy nhất</span>
              </div>
              <div className={styles.inputWithIcon}>
                <FiKey className={styles.inputInnerIcon} size={18} />
                <input
                  type="text"
                  required
                  className={`${styles.formInput} ${styles.inputLicense}`}
                  placeholder="AFF-XXXX-XXXX-XXXX"
                  value={licenseKey}
                  onChange={(e) => setLicenseKey(e.target.value.toUpperCase())}
                  autoFocus
                />
              </div>
            </div>

            {/* 1-Click Submit Button */}
            <button
              type="submit"
              className={styles.btnSubmitLarge}
              disabled={seeding}
            >
              <FiZap size={20} />
              <span>⚡ Kích Hoạt Bản Quyền & Tạo CSDL Riêng</span>
            </button>

            {/* Footer options */}
            <div className={styles.modalFooter}>
              <button
                type="button"
                className={styles.btnAdvancedToggle}
                onClick={() => setShowAdvancedUri(true)}
              >
                ⚙️ Tùy chọn nâng cao: Nhập MONGODB_URI thủ công
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
