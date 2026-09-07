'use client';

import React, { useState, useEffect, useCallback } from 'react';
import toast from 'react-hot-toast';
import {
  FiKey,
  FiShield,
  FiClock,
  FiCheckCircle,
  FiSlash,
  FiDollarSign,
  FiPlus,
  FiRefreshCw,
  FiCopy,
  FiSearch,
  FiTrash2,
  FiLock,
  FiUnlock,
  FiMessageSquare,
  FiDownload,
  FiLayers,
  FiShoppingBag,
  FiUsers,
  FiExternalLink,
  FiX,
  FiDatabase,
  FiZap,
  FiMail,
  FiActivity,
  FiCheck,
  FiSend,
  FiCreditCard,
  FiSave,
  FiEye,
  FiHelpCircle,
} from 'react-icons/fi';
import styles from './master.module.css';

interface LicenseItem {
  _id: string;
  licenseKey: string;
  buyerName: string;
  buyerPhone?: string;
  plan: string;
  price: number;
  notes?: string;
  status: 'available' | 'active' | 'revoked';
  shopName?: string | null;
  assignedDb?: string | null;
  activatedAt?: string | null;
  createdAt: string;
  updatedAt: string;
}

interface Metrics {
  total: number;
  available: number;
  active: number;
  revoked: number;
  count399k: number;
  count799k: number;
  revenue399k: number;
  revenue799k: number;
  totalRevenue: number;
}

interface LeadItem {
  _id?: string;
  orderCode: string;
  name: string;
  phone: string;
  email?: string;
  notes?: string;
  plan: string;
  amount: number;
  paymentStatus: string;
  createdAt: string;
}

interface OrderItem {
  _id: string;
  orderCode: string;
  customer: {
    name: string;
    phone: string;
    email?: string;
    address?: string;
    city?: string;
  };
  items: Array<{
    productName: string;
    price: number;
    quantity: number;
    total: number;
  }>;
  totalAmount: number;
  paymentMethod: string;
  paymentStatus: string;
  shippingStatus: string;
  trackingCode?: string;
  createdAt: string;
}

interface CustomerItem {
  _id: string;
  name: string;
  phone: string;
  email?: string;
  totalOrders: number;
  totalSpent: number;
  tags: string[];
  lastOrderAt?: string;
  createdAt: string;
}

interface WebhookLogItem {
  _id: string;
  gateway: string;
  transactionId: string | number;
  transferAmount: number;
  transferContent: string;
  referenceCode?: string;
  matchedOrderCode?: string;
  buyerName?: string;
  buyerPhone?: string;
  buyerEmail?: string;
  generatedLicenseKey?: string;
  emailStatus: 'sent' | 'skipped_no_email' | 'failed' | 'simulated';
  emailError?: string;
  status: 'success' | 'failed' | 'ignored';
  message: string;
  createdAt: string;
}

interface PaymentConfigState {
  bankCode: string;
  bankName: string;
  accountNumber: string;
  accountName: string;
  qrTemplate: string;
  sepayApiKey: string;
  sepayWebhookSecret: string;
  smtpHost: string;
  smtpPort: number;
  smtpSecure: boolean;
  smtpUser: string;
  smtpPass: string;
  smtpFrom: string;
  adminNotifyEmail?: string;
  emailSubjectTemplate?: string;
  emailBannerTitle?: string;
  emailIntroText?: string;
  sourceCodeDownloadUrl: string;
  hotlineSupport: string;
  docsUrl: string;
}

const VIETNAM_BANKS = [
  { code: 'MB', name: 'MBBank (Ngân Hàng Quân Đội)' },
  { code: 'VCB', name: 'Vietcombank (Ngoại Thương Việt Nam)' },
  { code: 'TCB', name: 'Techcombank (Kỹ Thương Việt Nam)' },
  { code: 'VPB', name: 'VPBank (Việt Nam Thịnh Vượng)' },
  { code: 'ACB', name: 'ACB (Á Châu)' },
  { code: 'BIDV', name: 'BIDV (Đầu Tư & Phát Triển)' },
  { code: 'ICB', name: 'VietinBank (Công Thương Việt Nam)' },
  { code: 'VBA', name: 'Agribank (Nông Nghiệp & PTNT)' },
  { code: 'TPB', name: 'TPBank (Tiên Phong)' },
  { code: 'MSB', name: 'MSB (Hàng Hải Việt Nam)' },
  { code: 'STB', name: 'Sacombank (Sài Gòn Thương Tín)' },
  { code: 'OCB', name: 'OCB (Phương Đông)' },
  { code: 'VIB', name: 'VIB (Quốc Tế)' },
  { code: 'SEAB', name: 'SeABank (Đông Nam Á)' },
  { code: 'SHB', name: 'SHB (Sài Gòn - Hà Nội)' },
  { code: 'LPB', name: 'LPBank (Lộc Phát Việt Nam)' },
  { code: 'HDB', name: 'HDBank (Phát Triển TP.HCM)' },
  { code: 'CAKE', name: 'CAKE by VPBank' },
  { code: 'TIMO', name: 'Timo by BanVietBank' },
];

const DEFAULT_MASTER_PIN = '888888';
const DEFAULT_SECRET_TOKEN = 'shopbig@master2026';

export default function MasterLicensesPage() {
  // Gatekeeper state
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [pinInput, setPinInput] = useState<string>('');
  const [pinError, setPinError] = useState<string>('');

  // Active Tab: 'licenses' | 'config' | 'email' | 'webhook' | 'leads' | 'orders' | 'customers'
  const [activeTab, setActiveTab] = useState<
    'licenses' | 'config' | 'email' | 'webhook' | 'leads' | 'orders' | 'customers'
  >('licenses');

  // Time & Realtime State
  const [currentTime, setCurrentTime] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // License Data & Filters
  const [licenses, setLicenses] = useState<LicenseItem[]>([]);
  const [metrics, setMetrics] = useState<Metrics>({
    total: 0,
    available: 0,
    active: 0,
    revoked: 0,
    count399k: 0,
    count799k: 0,
    revenue399k: 0,
    revenue799k: 0,
    totalRevenue: 0,
  });
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [planFilter, setPlanFilter] = useState<string>('all');

  // Leads, Orders, Customers, Webhook Logs
  const [leads, setLeads] = useState<LeadItem[]>([]);
  const [orders, setOrders] = useState<OrderItem[]>([]);
  const [customers, setCustomers] = useState<CustomerItem[]>([]);
  const [webhookLogs, setWebhookLogs] = useState<WebhookLogItem[]>([]);

  // Payment & Email Config State
  const [configData, setConfigData] = useState<PaymentConfigState>({
    bankCode: 'MB',
    bankName: 'MBBank (Ngân Hàng Quân Đội)',
    accountNumber: '0973475484',
    accountName: 'SHOPBIG STORE',
    qrTemplate: 'compact2',
    sepayApiKey: 'shopbig_sepay_secret_2026',
    sepayWebhookSecret: '',
    smtpHost: 'smtp.gmail.com',
    smtpPort: 465,
    smtpSecure: true,
    smtpUser: '',
    smtpPass: '',
    smtpFrom: '"ShopBig Master" <noreply@shopbig.vn>',
    adminNotifyEmail: '',
    emailSubjectTemplate: '[ShopBig] Bàn Giao Mã Bản Quyền & Mã Nguồn Đơn Hàng #{orderCode}',
    emailBannerTitle: 'XÁC NHẬN BÀN GIAO MÃ NGUỒN SHOPBIG',
    emailIntroText:
      'Hệ thống ShopBig đã ghi nhận giao dịch thanh toán thành công của bạn qua VietQR SePay. Dưới đây là thông tin bàn giao mã kích hoạt bản quyền và gói source code hoàn chỉnh:',
    sourceCodeDownloadUrl: 'https://drive.google.com/drive/folders/shopbig-source-code-full-package',
    hotlineSupport: '0988.888.888',
    docsUrl: 'https://shopbig.vn/docs/setup-guide',
  });
  const [isSavingConfig, setIsSavingConfig] = useState<boolean>(false);
  const [showSmtpPass, setShowSmtpPass] = useState<boolean>(false);

  // Email Test & Preview State
  const [testEmailRecipient, setTestEmailRecipient] = useState<string>('');
  const [isSendingTestEmail, setIsSendingTestEmail] = useState<boolean>(false);
  const [showEmailPreviewModal, setShowEmailPreviewModal] = useState<boolean>(false);

  // Manual Email Dispatch Modal
  const [manualEmailModal, setManualEmailModal] = useState<{
    isOpen: boolean;
    toEmail: string;
    buyerName: string;
    buyerPhone: string;
    licenseKey: string;
    orderCode: string;
    plan: string;
    amount: number;
    isSending: boolean;
  }>({
    isOpen: false,
    toEmail: '',
    buyerName: '',
    buyerPhone: '',
    licenseKey: '',
    orderCode: '',
    plan: '799k',
    amount: 799000,
    isSending: false,
  });

  // Webhook Simulator State
  const [simOrderCode, setSimOrderCode] = useState<string>('ST799K_123456');
  const [simName, setSimName] = useState<string>('Nguyễn Văn Khách Hàng');
  const [simPhone, setSimPhone] = useState<string>('0988776655');
  const [simEmail, setSimEmail] = useState<string>('khachhang@gmail.com');
  const [simAmount, setSimAmount] = useState<number>(799000);
  const [isSimulating, setIsSimulating] = useState<boolean>(false);

  // Create Modal State
  const [isCreateModalOpen, setIsCreateModalOpen] = useState<boolean>(false);
  const [buyerName, setBuyerName] = useState<string>('');
  const [buyerPhone, setBuyerPhone] = useState<string>('');
  const [licensePlan, setLicensePlan] = useState<'399k' | '799k' | 'custom'>('399k');
  const [licensePrice, setLicensePrice] = useState<number>(399000);
  const [licenseNotes, setLicenseNotes] = useState<string>('');
  const [licenseCount, setLicenseCount] = useState<number>(1);
  const [hotline, setHotline] = useState<string>('0988.888.888');
  const [isCreating, setIsCreating] = useState<boolean>(false);
  const [createdResult, setCreatedResult] = useState<any[] | null>(null);

  // Revoke / Action Confirm Modal
  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean;
    license: LicenseItem | null;
    action: 'revoke' | 'reactivate' | 'delete';
    reason: string;
  }>({
    isOpen: false,
    license: null,
    action: 'revoke',
    reason: '',
  });

  // Check saved session auth
  useEffect(() => {
    const savedAuth = localStorage.getItem('master_admin_auth');
    if (savedAuth === 'true') {
      setIsAuthenticated(true);
    }
  }, []);

  // Realtime clock
  useEffect(() => {
    const updateClock = () => {
      const now = new Date();
      setCurrentTime(
        now.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit', second: '2-digit' })
      );
    };
    updateClock();
    const interval = setInterval(updateClock, 1000);
    return () => clearInterval(interval);
  }, []);

  // Fetch licenses
  const fetchLicenses = useCallback(async () => {
    try {
      setIsLoading(true);
      const params = new URLSearchParams();
      if (statusFilter !== 'all') params.set('status', statusFilter);
      if (planFilter !== 'all') params.set('plan', planFilter);
      if (searchQuery.trim()) params.set('q', searchQuery.trim());
      params.set('limit', '100');

      const res = await fetch(`/api/master/licenses?${params.toString()}`);
      const data = await res.json();
      if (data.success) {
        setLicenses(data.data || []);
        if (data.metrics) setMetrics(data.metrics);
      }
    } catch {
      // ignore
    } finally {
      setIsLoading(false);
    }
  }, [statusFilter, planFilter, searchQuery]);

  // Fetch leads
  const fetchLeads = useCallback(async () => {
    try {
      const res = await fetch('/api/landing-leads?limit=50');
      const data = await res.json();
      if (data.success) {
        setLeads(data.data || []);
      }
    } catch {
      // ignore
    }
  }, []);

  // Fetch orders
  const fetchOrders = useCallback(async () => {
    try {
      const res = await fetch('/api/orders?limit=50');
      const data = await res.json();
      if (data.success) {
        setOrders(data.data || []);
      }
    } catch {
      // ignore
    }
  }, []);

  // Fetch customers
  const fetchCustomers = useCallback(async () => {
    try {
      const res = await fetch('/api/customers?limit=50');
      const data = await res.json();
      if (data.success) {
        setCustomers(data.data || []);
      }
    } catch {
      // ignore
    }
  }, []);

  // Fetch webhook logs
  const fetchWebhookLogs = useCallback(async () => {
    try {
      const res = await fetch('/api/webhooks/sepay?limit=50');
      const data = await res.json();
      if (data.success) {
        setWebhookLogs(data.data || []);
      }
    } catch {
      // ignore
    }
  }, []);

  // Fetch Master Config
  const fetchMasterConfig = useCallback(async () => {
    try {
      const res = await fetch('/api/master/config');
      const data = await res.json();
      if (data.success && data.data) {
        setConfigData((prev) => ({ ...prev, ...data.data }));
      }
    } catch {
      // ignore
    }
  }, []);

  // Load all data
  const refreshAll = useCallback(() => {
    fetchLicenses();
    fetchLeads();
    fetchOrders();
    fetchCustomers();
    fetchWebhookLogs();
    fetchMasterConfig();
  }, [fetchLicenses, fetchLeads, fetchOrders, fetchCustomers, fetchWebhookLogs, fetchMasterConfig]);

  useEffect(() => {
    if (!isAuthenticated) return;
    refreshAll();

    // Tự động reload dữ liệu mỗi 4 giây (3-5s) để lắng nghe SePay Webhook theo thời gian thực
    const autoRefreshTimer = setInterval(() => {
      fetchWebhookLogs();
      fetchLeads();
      fetchLicenses();
    }, 4000);

    return () => clearInterval(autoRefreshTimer);
  }, [isAuthenticated, refreshAll, fetchWebhookLogs, fetchLeads, fetchLicenses]);

  // Handle PIN Unlock
  const handlePinSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (pinInput === DEFAULT_MASTER_PIN || pinInput === DEFAULT_SECRET_TOKEN) {
      setIsAuthenticated(true);
      localStorage.setItem('master_admin_auth', 'true');
      toast.success('Xác thực quyền Master thành công!');
    } else {
      setPinError('Mã PIN không chính xác! Vui lòng thử lại (Mặc định: 888888)');
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    localStorage.removeItem('master_admin_auth');
    toast.success('Đã khóa phiên quản trị');
  };

  // Copy helper
  const copyText = (text: string, label: string = 'Đã sao chép') => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(text);
      toast.success(label, { icon: '📋' });
    }
  };

  // Handle Save Payment & Email Config
  const handleSaveConfig = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsSavingConfig(true);
      const res = await fetch('/api/master/config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(configData),
      });
      const data = await res.json();
      if (data.success) {
        toast.success('Đã lưu cấu hình Ngân hàng & Email SMTP thành công!', { icon: '💾' });
        if (data.data) setConfigData(data.data);
      } else {
        toast.error(data.message || 'Lỗi khi lưu cấu hình');
      }
    } catch {
      toast.error('Lỗi kết nối máy chủ');
    } finally {
      setIsSavingConfig(false);
    }
  };

  // Handle Send Test Email
  const handleSendTestEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!testEmailRecipient || !testEmailRecipient.includes('@')) {
      toast.error('Vui lòng nhập địa chỉ email người nhận hợp lệ!');
      return;
    }

    try {
      setIsSendingTestEmail(true);
      const res = await fetch('/api/master/email/test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          toEmail: testEmailRecipient.trim(),
          smtpHost: configData.smtpHost,
          smtpPort: configData.smtpPort,
          smtpSecure: configData.smtpSecure,
          smtpUser: configData.smtpUser,
          smtpPass: configData.smtpPass,
          smtpFrom: configData.smtpFrom,
        }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success(data.message, { icon: '✉️', duration: 6000 });
      } else {
        toast.error(data.message || 'Lỗi gửi email thử nghiệm', { duration: 6000 });
      }
    } catch {
      toast.error('Lỗi khi gửi yêu cầu test email');
    } finally {
      setIsSendingTestEmail(false);
    }
  };

  // Handle Manual Email Dispatch
  const handleSendManualEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setManualEmailModal((prev) => ({ ...prev, isSending: true }));
      const res = await fetch('/api/master/email/send-manual', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          toEmail: manualEmailModal.toEmail.trim(),
          licenseKey: manualEmailModal.licenseKey,
          buyerName: manualEmailModal.buyerName,
          buyerPhone: manualEmailModal.buyerPhone,
          orderCode: manualEmailModal.orderCode,
          plan: manualEmailModal.plan,
          amount: manualEmailModal.amount,
        }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success(data.message, { icon: '✉️' });
        setManualEmailModal((prev) => ({ ...prev, isOpen: false }));
      } else {
        toast.error(data.message || 'Lỗi khi gửi mail');
      }
    } catch {
      toast.error('Lỗi máy chủ');
    } finally {
      setManualEmailModal((prev) => ({ ...prev, isSending: false }));
    }
  };

  // Open Create Modal & reset fields
  const handleOpenCreateModal = (prefill?: { name?: string; phone?: string; plan?: string }) => {
    setBuyerName(prefill?.name || '');
    setBuyerPhone(prefill?.phone || '');
    const planValue = prefill?.plan === '799k' ? '799k' : '399k';
    setLicensePlan(planValue);
    setLicensePrice(planValue === '799k' ? 799000 : 399000);
    setLicenseNotes(prefill ? 'Tạo từ Lead đăng ký Landing Page' : '');
    setLicenseCount(1);
    setCreatedResult(null);
    setIsCreateModalOpen(true);
  };

  // Submit Create License
  const handleCreateLicenseSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!buyerName.trim()) {
      toast.error('Vui lòng nhập tên khách hàng');
      return;
    }

    try {
      setIsCreating(true);
      const res = await fetch('/api/master/licenses/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          buyerName: buyerName.trim(),
          buyerPhone: buyerPhone.trim(),
          plan: licensePlan,
          price: licensePrice,
          notes: licenseNotes.trim(),
          count: licenseCount,
          hotline,
        }),
      });

      const data = await res.json();
      if (data.success) {
        toast.success(`Đã tạo thành công ${data.count} mã bản quyền!`, { icon: '🔑' });
        setCreatedResult(data.data || []);
        fetchLicenses();
        fetchCustomers();
      } else {
        toast.error(data.message || 'Lỗi khi tạo mã bản quyền');
      }
    } catch {
      toast.error('Lỗi kết nối máy chủ');
    } finally {
      setIsCreating(false);
    }
  };

  // Handle Revoke / Reactivate
  const handleToggleRevoke = async () => {
    if (!confirmModal.license) return;
    try {
      const res = await fetch('/api/master/licenses/revoke', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          licenseKey: confirmModal.license.licenseKey,
          action: confirmModal.action,
          reason: confirmModal.reason,
        }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success(data.message);
        setConfirmModal({ isOpen: false, license: null, action: 'revoke', reason: '' });
        fetchLicenses();
      } else {
        toast.error(data.message);
      }
    } catch {
      toast.error('Lỗi khi thực hiện thao tác');
    }
  };

  // Handle Delete
  const handleDeleteLicense = async () => {
    if (!confirmModal.license) return;
    try {
      const res = await fetch(`/api/master/licenses/${confirmModal.license.licenseKey}?force=true`, {
        method: 'DELETE',
      });
      const data = await res.json();
      if (data.success) {
        toast.success(data.message);
        setConfirmModal({ isOpen: false, license: null, action: 'delete', reason: '' });
        fetchLicenses();
      } else {
        toast.error(data.message);
      }
    } catch {
      toast.error('Lỗi khi xóa mã bản quyền');
    }
  };

  // Handle Webhook Simulation
  const handleSimulateWebhook = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsSimulating(true);
      const payload = {
        id: Math.floor(100000 + Math.random() * 900000),
        gateway: 'VietQR SePay Simulation',
        transactionDate: new Date().toISOString().replace('T', ' ').substring(0, 19),
        accountNumber: configData.accountNumber || '0973475484',
        content: `${simOrderCode} ${simName} chuyen tien mua ShopBig`,
        transferType: 'in',
        transferAmount: simAmount,
        referenceCode: `SIM.${Date.now()}`,
        description: simOrderCode,
      };

      const res = await fetch('/api/webhooks/sepay', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (data.success) {
        toast.success(`Webhook xử lý thành công! Đã cấp Key: ${data.licenseKey}`, { icon: '⚡' });
        refreshAll();
      } else {
        toast.error(data.message || 'Lỗi mô phỏng Webhook');
      }
    } catch {
      toast.error('Lỗi gửi request Webhook');
    } finally {
      setIsSimulating(false);
    }
  };

  // Export CSV helper
  const handleExportCSV = () => {
    if (licenses.length === 0) {
      toast.error('Không có dữ liệu để xuất');
      return;
    }
    const headers = ['Mã Key', 'Khách Hàng', 'SĐT', 'Gói', 'Giá', 'Trạng Thái', 'Tên Shop', 'Database Tenant', 'Ngày Tạo'];
    const rows = licenses.map((l) => [
      l.licenseKey,
      `"${l.buyerName.replace(/"/g, '""')}"`,
      `"${l.buyerPhone || ''}"`,
      l.plan,
      l.price,
      l.status,
      `"${l.shopName || ''}"`,
      `"${l.assignedDb || ''}"`,
      new Date(l.createdAt).toLocaleString('vi-VN'),
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `shopbig_licenses_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success('Đã xuất file CSV thành công!');
  };

  // Gatekeeper Screen if not authenticated
  if (!isAuthenticated) {
    return (
      <div className={styles.masterContainer}>
        <div className={styles.gatekeeperWrap}>
          <div className={styles.gatekeeperCard}>
            <div className={styles.gatekeeperIcon}>
              <FiShield />
            </div>
            <h1 className={styles.gatekeeperTitle}>Master Gatekeeper</h1>
            <p className={styles.gatekeeperSub}>
              Khu vực quản trị bản quyền & hệ thống độc quyền dành cho Chủ sở hữu ShopBig.
            </p>
            <form onSubmit={handlePinSubmit}>
              <input
                type="password"
                placeholder="Nhập mã PIN Admin"
                value={pinInput}
                onChange={(e) => {
                  setPinInput(e.target.value);
                  setPinError('');
                }}
                className={styles.pinInput}
                maxLength={20}
                autoFocus
              />
              {pinError && (
                <p style={{ color: '#f87171', fontSize: '12px', margin: '-10px 0 14px 0' }}>
                  {pinError}
                </p>
              )}
              <button type="submit" className={styles.btnPrimary} style={{ width: '100%', justifyContent: 'center' }}>
                <FiUnlock /> Xác Thực Truy Cập
              </button>
            </form>
            <p style={{ fontSize: '11px', color: '#64748b', marginTop: '16px' }}>
              Mã PIN bảo vệ mặc định: <span style={{ color: '#818cf8', fontWeight: 600 }}>888888</span>
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.masterContainer}>
      {/* Top Navigation */}
      <header className={styles.topNav}>
        <div className={styles.topNavInner}>
          <div className={styles.brandGroup}>
            <div className={styles.brandLogo}>
              <FiKey />
            </div>
            <div className={styles.brandText}>
              <h1>
                ShopBig Master License Control
                <span className={styles.masterBadge}>Owner Access</span>
              </h1>
              <p>
                <span className={styles.liveDot}></span>
                Master DB: <code style={{ color: '#38bdf8' }}>webstore._system_licenses</code>
                <span style={{ color: '#64748b' }}>•</span>
                <span>{currentTime}</span>
              </p>
            </div>
          </div>

          <div className={styles.navActions}>
            <button
              onClick={() => handleOpenCreateModal()}
              className={styles.btnPrimary}
              id="btn-create-key"
            >
              <FiPlus /> Tạo Mã Bản Quyền Mới
            </button>
            <button
              onClick={() => {
                refreshAll();
                toast.success('Đã làm mới dữ liệu realtime');
              }}
              className={styles.btnSecondary}
              title="Làm mới dữ liệu"
            >
              <FiRefreshCw className={isLoading ? 'animate-spin' : ''} /> Làm Mới
            </button>
            <button onClick={handleLogout} className={styles.btnSecondary} title="Khóa màn hình">
              <FiLock /> Khóa
            </button>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className={styles.mainWrapper}>
        {/* Navigation Tabs */}
        <div className={styles.tabsContainer}>
          <button
            onClick={() => setActiveTab('licenses')}
            className={`${styles.tabItem} ${activeTab === 'licenses' ? styles.tabItemActive : ''}`}
          >
            <FiKey /> Quản Lý Bản Quyền
            <span className={styles.tabBadge}>{metrics.total}</span>
          </button>
          <button
            onClick={() => setActiveTab('config')}
            className={`${styles.tabItem} ${activeTab === 'config' ? styles.tabItemActive : ''}`}
          >
            <FiCreditCard style={{ color: '#38bdf8' }} /> Cấu Hình Ngân Hàng & VietQR
          </button>
          <button
            onClick={() => setActiveTab('email')}
            className={`${styles.tabItem} ${activeTab === 'email' ? styles.tabItemActive : ''}`}
          >
            <FiMail style={{ color: '#34d399' }} /> Cấu Hình Gửi Mail SMTP
          </button>
          <button
            onClick={() => setActiveTab('webhook')}
            className={`${styles.tabItem} ${activeTab === 'webhook' ? styles.tabItemActive : ''}`}
          >
            <FiZap style={{ color: '#fbbf24' }} /> SePay Webhook Auto-Pilot
            <span className={styles.tabBadge} style={{ background: 'rgba(245, 158, 11, 0.25)', color: '#fbbf24' }}>
              {webhookLogs.length}
            </span>
          </button>
          <button
            onClick={() => setActiveTab('leads')}
            className={`${styles.tabItem} ${activeTab === 'leads' ? styles.tabItemActive : ''}`}
          >
            <FiUsers /> Khách Đăng Ký (Leads)
            <span className={styles.tabBadge}>{leads.length}</span>
          </button>
          <button
            onClick={() => setActiveTab('orders')}
            className={`${styles.tabItem} ${activeTab === 'orders' ? styles.tabItemActive : ''}`}
          >
            <FiShoppingBag /> Đơn Hàng (Orders)
            <span className={styles.tabBadge}>{orders.length}</span>
          </button>
          <button
            onClick={() => setActiveTab('customers')}
            className={`${styles.tabItem} ${activeTab === 'customers' ? styles.tabItemActive : ''}`}
          >
            <FiDatabase /> CRM Khách Hàng
            <span className={styles.tabBadge}>{customers.length}</span>
          </button>
        </div>

        {/* ================= TAB 1: MASTER LICENSES ================= */}
        {activeTab === 'licenses' && (
          <>
            {/* Metric Cards */}
            <div className={styles.metricsGrid}>
              <div className={`${styles.metricCard} ${styles.cardTotal}`}>
                <div className={styles.metricHeader}>
                  <span className={styles.metricTitle}>Tổng Key Đã Cấp</span>
                  <div className={styles.metricIconWrap}>
                    <FiKey />
                  </div>
                </div>
                <div className={styles.metricValue}>{metrics.total}</div>
                <div className={styles.metricSubtext}>Toàn bộ mã bản quyền trong hệ thống</div>
              </div>

              <div className={`${styles.metricCard} ${styles.cardAvailable}`}>
                <div className={styles.metricHeader}>
                  <span className={styles.metricTitle}>Key Khả Dụng</span>
                  <div className={styles.metricIconWrap}>
                    <FiClock />
                  </div>
                </div>
                <div className={styles.metricValue} style={{ color: '#fbbf24' }}>
                  {metrics.available}
                </div>
                <div className={styles.metricSubtext}>Chưa kích hoạt • Sẵn sàng bàn giao</div>
              </div>

              <div className={`${styles.metricCard} ${styles.cardActive}`}>
                <div className={styles.metricHeader}>
                  <span className={styles.metricTitle}>Đang Hoạt Động</span>
                  <div className={styles.metricIconWrap}>
                    <FiCheckCircle />
                  </div>
                </div>
                <div className={styles.metricValue} style={{ color: '#34d399' }}>
                  {metrics.active}
                </div>
                <div className={styles.metricSubtext}>Đã gán Database riêng & chạy shop</div>
              </div>

              <div className={`${styles.metricCard} ${styles.cardRevoked}`}>
                <div className={styles.metricHeader}>
                  <span className={styles.metricTitle}>Đã Bị Khóa</span>
                  <div className={styles.metricIconWrap}>
                    <FiSlash />
                  </div>
                </div>
                <div className={styles.metricValue} style={{ color: '#f87171' }}>
                  {metrics.revoked}
                </div>
                <div className={styles.metricSubtext}>Tạm dừng hoặc thu hồi quyền truy cập</div>
              </div>

              <div className={`${styles.metricCard} ${styles.cardRevenue}`}>
                <div className={styles.metricHeader}>
                  <span className={styles.metricTitle}>Doanh Thu Ước Tính</span>
                  <div className={styles.metricIconWrap}>
                    <FiDollarSign />
                  </div>
                </div>
                <div className={styles.metricValue} style={{ color: '#c084fc', fontSize: '24px' }}>
                  {metrics.totalRevenue.toLocaleString('vi-VN')}₫
                </div>
                <div className={styles.metricSubtext}>
                  399K ({metrics.count399k}) • 799K ({metrics.count799k})
                </div>
              </div>
            </div>

            {/* Table Section */}
            <div className={styles.sectionCard}>
              {/* Toolbar */}
              <div className={styles.toolbar}>
                <div className={styles.searchWrap}>
                  <FiSearch className={styles.searchIcon} />
                  <input
                    type="text"
                    placeholder="Tìm theo Mã Key, Tên Khách, SĐT, Tên Shop, Tenant DB..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className={styles.searchInput}
                  />
                </div>

                <div className={styles.filterGroup}>
                  <button
                    onClick={() => setStatusFilter('all')}
                    className={`${styles.filterBtn} ${statusFilter === 'all' ? styles.filterBtnActive : ''}`}
                  >
                    Tất Cả ({metrics.total})
                  </button>
                  <button
                    onClick={() => setStatusFilter('available')}
                    className={`${styles.filterBtn} ${statusFilter === 'available' ? styles.filterBtnActive : ''}`}
                  >
                    🟡 Khả Dụng ({metrics.available})
                  </button>
                  <button
                    onClick={() => setStatusFilter('active')}
                    className={`${styles.filterBtn} ${statusFilter === 'active' ? styles.filterBtnActive : ''}`}
                  >
                    🟢 Đang Chạy ({metrics.active})
                  </button>
                  <button
                    onClick={() => setStatusFilter('revoked')}
                    className={`${styles.filterBtn} ${statusFilter === 'revoked' ? styles.filterBtnActive : ''}`}
                  >
                    🔴 Bị Khóa ({metrics.revoked})
                  </button>
                  <button onClick={handleExportCSV} className={styles.btnSecondary} title="Xuất file CSV">
                    <FiDownload /> Xuất CSV
                  </button>
                </div>
              </div>

              {/* Data Table */}
              <div className={styles.tableContainer}>
                <table className={styles.dataTable}>
                  <thead>
                    <tr>
                      <th>Mã Bản Quyền (License Key)</th>
                      <th>Khách Hàng / Gói</th>
                      <th>Trạng Thái</th>
                      <th>Cửa Hàng Kích Hoạt</th>
                      <th>CSDL Riêng (Tenant DB)</th>
                      <th>Ngày Tạo / Kích Hoạt</th>
                      <th style={{ textAlign: 'right' }}>Thao Tác</th>
                    </tr>
                  </thead>
                  <tbody>
                    {licenses.length === 0 ? (
                      <tr>
                        <td colSpan={7}>
                          <div className={styles.emptyState}>
                            <FiKey className={styles.emptyStateIcon} />
                            <p>Không tìm thấy mã bản quyền nào phù hợp với bộ lọc.</p>
                            <button
                              onClick={() => handleOpenCreateModal()}
                              className={styles.btnPrimary}
                              style={{ margin: '12px auto 0 auto' }}
                            >
                              <FiPlus /> Tạo Mã Đầu Tiên
                            </button>
                          </div>
                        </td>
                      </tr>
                    ) : (
                      licenses.map((lic) => {
                        const zaloMsg = `Cảm ơn ${lic.buyerName} đã mua mã nguồn ShopBig (${lic.plan === '799k' ? 'Gói Setup A-Z 799K' : 'Gói Tự Cài Đặt 399K'})!\n🔑 Mã bản quyền của bạn: ${lic.licenseKey}\n🌐 Hướng dẫn kích hoạt: Mở website -> Nhập tên shop và mã key để hệ thống tự động kích hoạt CSDL riêng trong 3 giây.\n📞 Hotline kỹ thuật hỗ trợ: ${configData.hotlineSupport || hotline}`;

                        return (
                          <tr key={lic._id}>
                            <td>
                              <span
                                className={styles.keyBadge}
                                onClick={() => copyText(lic.licenseKey, `Đã chép: ${lic.licenseKey}`)}
                                title="Bấm để sao chép mã Key"
                              >
                                {lic.licenseKey}
                                <FiCopy style={{ fontSize: '11px', opacity: 0.7 }} />
                              </span>
                            </td>

                            <td>
                              <div style={{ fontWeight: 600, color: '#ffffff' }}>{lic.buyerName}</div>
                              <div style={{ fontSize: '12px', color: '#94a3b8', display: 'flex', gap: '6px', alignItems: 'center' }}>
                                {lic.buyerPhone ? (
                                  <a
                                    href={`https://zalo.me/${lic.buyerPhone}`}
                                    target="_blank"
                                    rel="noreferrer"
                                    style={{ color: '#38bdf8', textDecoration: 'none' }}
                                    title="Mở chat Zalo"
                                  >
                                    📱 {lic.buyerPhone}
                                  </a>
                                ) : (
                                  <span>Chưa có SĐT</span>
                                )}
                                <span>•</span>
                                <span style={{ color: lic.plan === '799k' ? '#c084fc' : '#818cf8', fontWeight: 600 }}>
                                  {lic.plan === '799k' ? 'Gói 799K' : 'Gói 399K'}
                                </span>
                              </div>
                            </td>

                            <td>
                              {lic.status === 'active' && (
                                <span className={`${styles.statusBadge} ${styles.statusActive}`}>
                                  🟢 Đang hoạt động
                                </span>
                              )}
                              {lic.status === 'available' && (
                                <span className={`${styles.statusBadge} ${styles.statusAvailable}`}>
                                  🟡 Chưa kích hoạt
                                </span>
                              )}
                              {lic.status === 'revoked' && (
                                <span className={`${styles.statusBadge} ${styles.statusRevoked}`}>
                                  🔴 Đã bị khóa
                                </span>
                              )}
                            </td>

                            <td>
                              {lic.shopName ? (
                                <span style={{ color: '#f8fafc', fontWeight: 500 }}>🏪 {lic.shopName}</span>
                              ) : (
                                <span style={{ color: '#64748b' }}>—</span>
                              )}
                            </td>

                            <td>
                              {lic.assignedDb ? (
                                <code
                                  style={{
                                    color: '#34d399',
                                    background: 'rgba(16, 185, 129, 0.1)',
                                    padding: '3px 8px',
                                    borderRadius: '6px',
                                    fontSize: '12px',
                                  }}
                                >
                                  {lic.assignedDb}
                                </code>
                              ) : (
                                <span style={{ color: '#64748b' }}>—</span>
                              )}
                            </td>

                            <td>
                              <div style={{ fontSize: '12.5px', color: '#cbd5e1' }}>
                                {new Date(lic.createdAt).toLocaleDateString('vi-VN')}
                              </div>
                              <div style={{ fontSize: '11px', color: '#64748b' }}>
                                {new Date(lic.createdAt).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}
                              </div>
                            </td>

                            <td style={{ textAlign: 'right' }}>
                              <div className={styles.actionGroup} style={{ justifyContent: 'flex-end' }}>
                                <button
                                  onClick={() => copyText(zaloMsg, `Đã sao chép tin nhắn Zalo gửi ${lic.buyerName}!`)}
                                  className={`${styles.actionBtn} ${styles.actionBtnZalo}`}
                                  title="Sao chép tin nhắn Zalo mẫu gửi khách"
                                >
                                  <FiMessageSquare /> Zalo
                                </button>

                                <button
                                  onClick={() =>
                                    setManualEmailModal({
                                      isOpen: true,
                                      toEmail: '',
                                      buyerName: lic.buyerName,
                                      buyerPhone: lic.buyerPhone || '',
                                      licenseKey: lic.licenseKey,
                                      orderCode: `LIC_${lic.licenseKey}`,
                                      plan: lic.plan,
                                      amount: lic.price,
                                      isSending: false,
                                    })
                                  }
                                  className={`${styles.actionBtn}`}
                                  style={{ color: '#34d399', borderColor: 'rgba(16,185,129,0.3)' }}
                                  title="Gửi Email bàn giao mã nguồn & bản quyền"
                                >
                                  <FiMail /> Gửi Mail
                                </button>

                                {lic.status === 'revoked' ? (
                                  <button
                                    onClick={() =>
                                      setConfirmModal({
                                        isOpen: true,
                                        license: lic,
                                        action: 'reactivate',
                                        reason: '',
                                      })
                                    }
                                    className={`${styles.actionBtn} ${styles.actionBtnReactivate}`}
                                    title="Mở lại bản quyền"
                                  >
                                    <FiUnlock /> Mở
                                  </button>
                                ) : (
                                  <button
                                    onClick={() =>
                                      setConfirmModal({
                                        isOpen: true,
                                        license: lic,
                                        action: 'revoke',
                                        reason: '',
                                      })
                                    }
                                    className={`${styles.actionBtn} ${styles.actionBtnRevoke}`}
                                    title="Thu hồi / Khóa key này"
                                  >
                                    <FiSlash /> Khóa
                                  </button>
                                )}

                                {lic.status !== 'active' && (
                                  <button
                                    onClick={() =>
                                      setConfirmModal({
                                        isOpen: true,
                                        license: lic,
                                        action: 'delete',
                                        reason: '',
                                      })
                                    }
                                    className={styles.actionBtn}
                                    style={{ color: '#f87171' }}
                                    title="Xóa mã key"
                                  >
                                    <FiTrash2 />
                                  </button>
                                )}
                              </div>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}

        {/* ================= TAB 2: BANK & PAYMENT CONFIG ================= */}
        {activeTab === 'config' && (
          <div className={styles.sectionCard}>
            <div className={styles.toolbar}>
              <div>
                <h2 style={{ margin: '0 0 4px 0', fontSize: '17px', color: '#ffffff', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <FiCreditCard style={{ color: '#38bdf8' }} /> Cấu Hình Tài Khoản Ngân Hàng & Thanh Toán VietQR
                </h2>
                <p style={{ margin: 0, fontSize: '13px', color: '#94a3b8' }}>
                  Cấu hình số tài khoản ngân hàng nhận tiền chuyển khoản khi khách đặt mua gói từ Landing Page.
                </p>
              </div>
              <button onClick={fetchMasterConfig} className={styles.btnSecondary}>
                <FiRefreshCw /> Tải Lại Cấu Hình
              </button>
            </div>

            <form onSubmit={handleSaveConfig}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '24px' }}>
                {/* Left Column: Bank Account Info */}
                <div style={{ background: 'rgba(255, 255, 255, 0.02)', padding: '20px', borderRadius: '14px', border: '1px solid rgba(255, 255, 255, 0.06)' }}>
                  <h3 style={{ margin: '0 0 16px 0', fontSize: '15px', color: '#38bdf8', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    💳 1. Tài Khoản Ngân Hàng Nhận Tiền
                  </h3>

                  <div className={styles.formGroup}>
                    <label className={styles.formLabel}>Ngân Hàng Thụ Hưởng</label>
                    <select
                      value={configData.bankCode}
                      onChange={(e) => {
                        const selected = VIETNAM_BANKS.find((b) => b.code === e.target.value);
                        setConfigData((prev) => ({
                          ...prev,
                          bankCode: e.target.value,
                          bankName: selected?.name || e.target.value,
                        }));
                      }}
                      className={styles.formSelect}
                    >
                      {VIETNAM_BANKS.map((b) => (
                        <option key={b.code} value={b.code}>
                          {b.name} ({b.code})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className={styles.formGroup}>
                    <label className={styles.formLabel}>Số Tài Khoản Ngân Hàng (STK)</label>
                    <input
                      type="text"
                      value={configData.accountNumber}
                      onChange={(e) => setConfigData((prev) => ({ ...prev, accountNumber: e.target.value }))}
                      className={styles.formInput}
                      placeholder="VD: 0973475484"
                      required
                    />
                  </div>

                  <div className={styles.formGroup}>
                    <label className={styles.formLabel}>Tên Chủ Tài Khoản (Không dấu in hoa)</label>
                    <input
                      type="text"
                      value={configData.accountName}
                      onChange={(e) => setConfigData((prev) => ({ ...prev, accountName: e.target.value.toUpperCase() }))}
                      className={styles.formInput}
                      placeholder="VD: NGUYEN VAN A hoặc SHOPBIG STORE"
                      required
                    />
                  </div>

                  <div className={styles.formGroup}>
                    <label className={styles.formLabel}>Mẫu Giao Diện Mã VietQR</label>
                    <select
                      value={configData.qrTemplate}
                      onChange={(e) => setConfigData((prev) => ({ ...prev, qrTemplate: e.target.value }))}
                      className={styles.formSelect}
                    >
                      <option value="compact2">compact2 (Khuyên dùng - Đẹp & Rõ nét)</option>
                      <option value="compact">compact (Gọn nhẹ)</option>
                      <option value="qr_only">qr_only (Chỉ mã QR)</option>
                      <option value="print">print (Bản in tiêu chuẩn)</option>
                    </select>
                  </div>

                  <div className={styles.formGroup}>
                    <label className={styles.formLabel}>Hotline / Zalo Hỗ Trợ Kỹ Thuật</label>
                    <input
                      type="text"
                      value={configData.hotlineSupport}
                      onChange={(e) => setConfigData((prev) => ({ ...prev, hotlineSupport: e.target.value }))}
                      className={styles.formInput}
                      placeholder="VD: 0988.888.888"
                    />
                  </div>
                </div>

                {/* Right Column: Live VietQR Preview */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                  <div style={{ background: '#080a12', padding: '20px', borderRadius: '14px', border: '1px solid rgba(99, 102, 241, 0.3)', textAlign: 'center' }}>
                    <h4 style={{ margin: '0 0 10px 0', fontSize: '14px', color: '#a5b4fc' }}>
                      ⚡ Xem Trước Mã VietQR Thực Tế
                    </h4>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={`https://img.vietqr.io/image/${configData.bankCode || 'MB'}-${configData.accountNumber || '0973475484'}-${configData.qrTemplate || 'compact2'}.png?amount=799000&addInfo=ST799K_TEST&accountName=${encodeURIComponent(configData.accountName || 'SHOPBIG STORE')}`}
                      alt="VietQR Preview"
                      style={{ width: 220, height: 'auto', margin: '0 auto', display: 'block', borderRadius: 10, background: '#fff', padding: 8 }}
                    />
                    <div style={{ marginTop: '12px', fontSize: '12.5px', color: '#cbd5e1' }}>
                      <div>Ngân hàng: <strong style={{ color: '#fff' }}>{configData.bankName}</strong></div>
                      <div>STK: <strong style={{ color: '#38bdf8' }}>{configData.accountNumber}</strong></div>
                      <div>Chủ TK: <strong style={{ color: '#34d399' }}>{configData.accountName}</strong></div>
                    </div>
                  </div>
                </div>
              </div>

              <div style={{ marginTop: '24px', display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
                <button type="submit" disabled={isSavingConfig} className={styles.btnPrimary} style={{ padding: '12px 28px', fontSize: '14.5px' }}>
                  {isSavingConfig ? <FiRefreshCw className="animate-spin" /> : <FiSave />}
                  {isSavingConfig ? 'Đang lưu...' : '💾 Lưu Cấu Hình Ngân Hàng'}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* ================= TAB 3: EMAIL SMTP & TEMPLATES ================= */}
        {activeTab === 'email' && (
          <div className={styles.sectionCard}>
            <div className={styles.toolbar}>
              <div>
                <h2 style={{ margin: '0 0 4px 0', fontSize: '17px', color: '#ffffff', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <FiMail style={{ color: '#34d399' }} /> Cấu Hình Gửi Mail Tự Động (SMTP Mail Server & Bàn Giao Source Code)
                </h2>
                <p style={{ margin: 0, fontSize: '13px', color: '#94a3b8' }}>
                  Cấu hình máy chủ SMTP và mẫu nội dung email tự động gửi kèm mã bản quyền & link tải source code cho khách.
                </p>
              </div>
              <div style={{ display: 'flex', gap: '8px' }}>
                <button
                  type="button"
                  onClick={() => setShowEmailPreviewModal(true)}
                  className={styles.btnSecondary}
                >
                  <FiEye /> Xem Trước Mẫu Email
                </button>
              </div>
            </div>

            <form onSubmit={handleSaveConfig}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '24px' }}>
                {/* 1. SMTP Server Settings */}
                <div style={{ background: 'rgba(255, 255, 255, 0.02)', padding: '20px', borderRadius: '14px', border: '1px solid rgba(255, 255, 255, 0.06)' }}>
                  <h3 style={{ margin: '0 0 16px 0', fontSize: '15px', color: '#34d399', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    ⚙️ 1. Thông Số Máy Chủ SMTP
                  </h3>

                  <div className={styles.formGroup}>
                    <label className={styles.formLabel}>Dịch Vụ Email / Preset Nhanh</label>
                    <select
                      onChange={(e) => {
                        const val = e.target.value;
                        if (val === 'gmail') {
                          setConfigData((prev) => ({ ...prev, smtpHost: 'smtp.gmail.com', smtpPort: 465, smtpSecure: true }));
                        } else if (val === 'outlook') {
                          setConfigData((prev) => ({ ...prev, smtpHost: 'smtp.office365.com', smtpPort: 587, smtpSecure: false }));
                        } else if (val === 'zoho') {
                          setConfigData((prev) => ({ ...prev, smtpHost: 'smtp.zoho.com', smtpPort: 465, smtpSecure: true }));
                        }
                      }}
                      className={styles.formSelect}
                    >
                      <option value="gmail">Gmail (smtp.gmail.com - Port 465 SSL)</option>
                      <option value="outlook">Microsoft Outlook / Office 365 (Port 587 TLS)</option>
                      <option value="zoho">Zoho Mail (smtp.zoho.com - Port 465)</option>
                      <option value="custom">Tùy Chỉnh (Custom SMTP Server)</option>
                    </select>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '12px' }}>
                    <div className={styles.formGroup}>
                      <label className={styles.formLabel}>SMTP Host</label>
                      <input
                        type="text"
                        value={configData.smtpHost}
                        onChange={(e) => setConfigData((prev) => ({ ...prev, smtpHost: e.target.value }))}
                        className={styles.formInput}
                        placeholder="smtp.gmail.com"
                        required
                      />
                    </div>
                    <div className={styles.formGroup}>
                      <label className={styles.formLabel}>Port</label>
                      <input
                        type="number"
                        value={configData.smtpPort}
                        onChange={(e) => setConfigData((prev) => ({ ...prev, smtpPort: Number(e.target.value) }))}
                        className={styles.formInput}
                        placeholder="465"
                        required
                      />
                    </div>
                  </div>

                  <div className={styles.formGroup}>
                    <label className={styles.formLabel}>Tài Khoản Email Gửi (SMTP User / Gmail)</label>
                    <input
                      type="text"
                      value={configData.smtpUser}
                      onChange={(e) => setConfigData((prev) => ({ ...prev, smtpUser: e.target.value }))}
                      className={styles.formInput}
                      placeholder="VD: your_email@gmail.com"
                    />
                  </div>

                  <div className={styles.formGroup}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <label className={styles.formLabel}>Mật Khẩu Ứng Dụng (App Password 16 ký tự)</label>
                      <button
                        type="button"
                        onClick={() => setShowSmtpPass(!showSmtpPass)}
                        style={{ background: 'none', border: 'none', color: '#38bdf8', fontSize: '11px', cursor: 'pointer', padding: 0 }}
                      >
                        {showSmtpPass ? 'Ẩn' : 'Hiện'} mật khẩu
                      </button>
                    </div>
                    <input
                      type={showSmtpPass ? 'text' : 'password'}
                      value={configData.smtpPass}
                      onChange={(e) => setConfigData((prev) => ({ ...prev, smtpPass: e.target.value }))}
                      className={styles.formInput}
                      placeholder="xxxx xxxx xxxx xxxx (Mã 16 chữ cái)"
                    />
                    <div className={styles.formHelp}>
                      💡 Với Gmail: Bật Xác minh 2 bước -&gt; Tạo Mật khẩu ứng dụng (App Passwords) để lấy mã 16 ký tự.
                    </div>
                  </div>

                  <div className={styles.formGroup}>
                    <label className={styles.formLabel}>Tên Người Gửi & Tiêu Đề Header (From Name)</label>
                    <input
                      type="text"
                      value={configData.smtpFrom}
                      onChange={(e) => setConfigData((prev) => ({ ...prev, smtpFrom: e.target.value }))}
                      className={styles.formInput}
                      placeholder='"ShopBig Master" <noreply@shopbig.vn>'
                    />
                  </div>

                  <div className={styles.formGroup}>
                    <label className={styles.formLabel}>Email Nhận Thông Báo Bán Được Hàng (Admin BCC)</label>
                    <input
                      type="email"
                      value={configData.adminNotifyEmail || ''}
                      onChange={(e) => setConfigData((prev) => ({ ...prev, adminNotifyEmail: e.target.value }))}
                      className={styles.formInput}
                      placeholder="VD: admin_nhan_thong_bao@gmail.com"
                    />
                  </div>
                </div>

                {/* 2. Email Delivery Content & Live SMTP Test */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                  {/* Content Settings */}
                  <div style={{ background: 'rgba(255, 255, 255, 0.02)', padding: '20px', borderRadius: '14px', border: '1px solid rgba(255, 255, 255, 0.06)' }}>
                    <h3 style={{ margin: '0 0 16px 0', fontSize: '15px', color: '#fbbf24', display: 'flex', alignItems: 'center', gap: '6px' }}>
                      📝 2. Nội Dung Mẫu & Link Tải Source Code
                    </h3>

                    <div className={styles.formGroup}>
                      <label className={styles.formLabel}>Link Tải Trọn Bộ Mã Nguồn (Google Drive / Zip URL)</label>
                      <input
                        type="text"
                        value={configData.sourceCodeDownloadUrl}
                        onChange={(e) => setConfigData((prev) => ({ ...prev, sourceCodeDownloadUrl: e.target.value }))}
                        className={styles.formInput}
                        placeholder="https://drive.google.com/drive/folders/..."
                      />
                    </div>

                    <div className={styles.formGroup}>
                      <label className={styles.formLabel}>Tiêu Đề Email Gửi Cho Khách</label>
                      <input
                        type="text"
                        value={configData.emailSubjectTemplate || ''}
                        onChange={(e) => setConfigData((prev) => ({ ...prev, emailSubjectTemplate: e.target.value }))}
                        className={styles.formInput}
                        placeholder="[ShopBig] Bàn Giao Mã Bản Quyền & Mã Nguồn Đơn Hàng #{orderCode}"
                      />
                    </div>

                    <div className={styles.formGroup}>
                      <label className={styles.formLabel}>Banner Tiêu Đề Trong Thư</label>
                      <input
                        type="text"
                        value={configData.emailBannerTitle || ''}
                        onChange={(e) => setConfigData((prev) => ({ ...prev, emailBannerTitle: e.target.value }))}
                        className={styles.formInput}
                        placeholder="XÁC NHẬN BÀN GIAO MÃ NGUỒN SHOPBIG"
                      />
                    </div>

                    <div className={styles.formGroup}>
                      <label className={styles.formLabel}>Lời Nhắn / Lời Chào Mở Đầu</label>
                      <textarea
                        value={configData.emailIntroText || ''}
                        onChange={(e) => setConfigData((prev) => ({ ...prev, emailIntroText: e.target.value }))}
                        className={styles.formTextarea}
                        rows={3}
                      />
                    </div>
                  </div>

                  {/* Live SMTP Test Box */}
                  <div style={{ background: '#080a12', padding: '20px', borderRadius: '14px', border: '1px solid rgba(16, 185, 129, 0.3)' }}>
                    <h4 style={{ margin: '0 0 8px 0', fontSize: '14px', color: '#34d399', display: 'flex', alignItems: 'center', gap: '6px' }}>
                      ⚡ 3. Thử Nghiệm Gửi Thử Email (Live SMTP Tester)
                    </h4>
                    <p style={{ margin: '0 0 12px 0', fontSize: '12px', color: '#94a3b8' }}>
                      Nhập email của bạn để gửi thử 1 bức thư bàn giao hoàn chỉnh và kiểm tra kết nối SMTP.
                    </p>

                    <div style={{ display: 'flex', gap: '8px' }}>
                      <input
                        type="email"
                        value={testEmailRecipient}
                        onChange={(e) => setTestEmailRecipient(e.target.value)}
                        placeholder="Nhập email của bạn để nhận test..."
                        className={styles.formInput}
                        style={{ flex: 1 }}
                      />
                      <button
                        type="button"
                        onClick={handleSendTestEmail}
                        disabled={isSendingTestEmail}
                        className={styles.btnPrimary}
                        style={{ background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)', whiteSpace: 'nowrap' }}
                      >
                        {isSendingTestEmail ? <FiRefreshCw className="animate-spin" /> : <FiSend />}
                        {isSendingTestEmail ? 'Đang gửi...' : 'Gửi Thử Ngay'}
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              <div style={{ marginTop: '24px', display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
                <button type="submit" disabled={isSavingConfig} className={styles.btnPrimary} style={{ padding: '12px 28px', fontSize: '14.5px' }}>
                  {isSavingConfig ? <FiRefreshCw className="animate-spin" /> : <FiSave />}
                  {isSavingConfig ? 'Đang lưu...' : '💾 Lưu Toàn Bộ Cấu Hình Email SMTP'}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* ================= TAB 4: SEPAY WEBHOOK AUTO-PILOT ================= */}
        {activeTab === 'webhook' && (
          <div>
            {/* Config & URL Banner */}
            <div
              style={{
                background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.15) 0%, rgba(168, 85, 247, 0.15) 100%)',
                border: '1px solid rgba(99, 102, 241, 0.35)',
                borderRadius: '16px',
                padding: '24px',
                marginBottom: '24px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: '16px',
              }}
            >
              <div>
                <h3 style={{ margin: '0 0 6px 0', fontSize: '17px', color: '#ffffff', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <FiZap style={{ color: '#fbbf24' }} /> SePay Webhook Endpoint (Tự Động Hóa 100%)
                </h3>
                <p style={{ margin: 0, fontSize: '13px', color: '#cbd5e1' }}>
                  Copy URL này dán vào cấu hình Webhook trên trang quản trị <strong>SePay.vn</strong>. Khi khách quét mã VietQR thanh toán thành công, hệ thống sẽ tự sinh Key và gửi Email kèm Source code tức thì.
                </p>
                <div style={{ marginTop: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <code
                    style={{
                      background: '#080a12',
                      border: '1px solid rgba(56, 189, 248, 0.4)',
                      padding: '8px 14px',
                      borderRadius: '8px',
                      color: '#38bdf8',
                      fontFamily: 'monospace',
                      fontSize: '13.5px',
                      fontWeight: 600,
                    }}
                  >
                    {typeof window !== 'undefined' ? `${window.location.origin}/api/webhooks/sepay` : '/api/webhooks/sepay'}
                  </code>
                  <button
                    onClick={() =>
                      copyText(
                        `${window.location.origin}/api/webhooks/sepay`,
                        'Đã sao chép Webhook URL!'
                      )
                    }
                    className={styles.btnPrimary}
                    style={{ padding: '8px 14px', fontSize: '13px' }}
                  >
                    <FiCopy /> Sao Chép URL
                  </button>
                </div>
              </div>

              <div style={{ textAlign: 'right' }}>
                <span className={styles.statusIndicator}>
                  <span className={styles.liveDot}></span> Webhook Listener: Active
                </span>
              </div>
            </div>

            {/* Webhook Simulator Box */}
            <div className={styles.sectionCard} style={{ marginBottom: '24px' }}>
              <h3 style={{ margin: '0 0 14px 0', fontSize: '15px', color: '#ffffff', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <FiActivity style={{ color: '#38bdf8' }} /> Mô Phỏng Giao Dịch SePay (Test Webhook Simulator)
              </h3>
              <p style={{ fontSize: '13px', color: '#94a3b8', margin: '0 0 16px 0' }}>
                Thử nghiệm quy trình: Nhập mã đơn hàng hoặc thông tin khách -&gt; Bấm gửi để kích hoạt webhook tự động sinh Key và gửi Mail.
              </p>

              <form onSubmit={handleSimulateWebhook}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '14px' }}>
                  <div>
                    <label className={styles.formLabel}>Mã Đơn Hàng (Order Code)</label>
                    <input
                      type="text"
                      value={simOrderCode}
                      onChange={(e) => setSimOrderCode(e.target.value)}
                      className={styles.formInput}
                      placeholder="VD: ST799K_123456"
                      required
                    />
                  </div>

                  <div>
                    <label className={styles.formLabel}>Tên Khách Hàng</label>
                    <input
                      type="text"
                      value={simName}
                      onChange={(e) => setSimName(e.target.value)}
                      className={styles.formInput}
                      placeholder="VD: Nguyễn Văn Test"
                      required
                    />
                  </div>

                  <div>
                    <label className={styles.formLabel}>Số Điện Thoại / Zalo</label>
                    <input
                      type="text"
                      value={simPhone}
                      onChange={(e) => setSimPhone(e.target.value)}
                      className={styles.formInput}
                      placeholder="VD: 0988776655"
                      required
                    />
                  </div>

                  <div>
                    <label className={styles.formLabel}>Email Nhận Source Code</label>
                    <input
                      type="email"
                      value={simEmail}
                      onChange={(e) => setSimEmail(e.target.value)}
                      className={styles.formInput}
                      placeholder="VD: khach@gmail.com"
                    />
                  </div>

                  <div>
                    <label className={styles.formLabel}>Số Tiền Chuyển Khoản</label>
                    <select
                      value={simAmount}
                      onChange={(e) => setSimAmount(Number(e.target.value))}
                      className={styles.formSelect}
                    >
                      <option value={799000}>799.000₫ (Gói Setup A-Z)</option>
                      <option value={399000}>399.000₫ (Gói Tự Cài Đặt)</option>
                      <option value={10000}>10.000₫ (Gói Test Thử Nghiệm)</option>
                    </select>
                  </div>
                </div>

                <div style={{ marginTop: '16px', display: 'flex', justifyContent: 'flex-end' }}>
                  <button type="submit" disabled={isSimulating} className={styles.btnPrimary}>
                    {isSimulating ? <FiRefreshCw className="animate-spin" /> : <FiSend />}
                    {isSimulating ? 'Đang kích hoạt...' : '⚡ Bắn Webhook Test & Tạo Key Tự Động'}
                  </button>
                </div>
              </form>
            </div>

            {/* Webhook Logs Table */}
            <div className={styles.sectionCard}>
              <div className={styles.toolbar}>
                <h3 style={{ margin: 0, fontSize: '15px', color: '#ffffff', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <FiClock style={{ color: '#818cf8' }} /> Nhật Ký Giao Dịch SePay Webhook ({webhookLogs.length})
                </h3>
                <button onClick={fetchWebhookLogs} className={styles.btnSecondary}>
                  <FiRefreshCw /> Làm Mới Logs
                </button>
              </div>

              <div className={styles.tableContainer}>
                <table className={styles.dataTable}>
                  <thead>
                    <tr>
                      <th>Thời Gian</th>
                      <th>Mã Đơn / Nội Dung CK</th>
                      <th>Số Tiền</th>
                      <th>Khách Hàng</th>
                      <th>Key Đã Cấp Tự Động</th>
                      <th>Trạng Thái Email</th>
                      <th>Kết Quả</th>
                    </tr>
                  </thead>
                  <tbody>
                    {webhookLogs.length === 0 ? (
                      <tr>
                        <td colSpan={7} style={{ textAlign: 'center', padding: '32px' }}>
                          Chưa có nhật ký Webhook nào được ghi nhận.
                        </td>
                      </tr>
                    ) : (
                      webhookLogs.map((log) => (
                        <tr key={log._id}>
                          <td style={{ fontSize: '12px', color: '#94a3b8' }}>
                            {new Date(log.createdAt).toLocaleString('vi-VN')}
                          </td>
                          <td>
                            <div style={{ fontWeight: 600, color: '#38bdf8' }}>
                              {log.matchedOrderCode || `#${log.transactionId}`}
                            </div>
                            <div style={{ fontSize: '11px', color: '#64748b', maxWidth: '240px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                              {log.transferContent}
                            </div>
                          </td>
                          <td style={{ fontWeight: 700, color: '#34d399' }}>
                            {log.transferAmount?.toLocaleString('vi-VN')}₫
                          </td>
                          <td>
                            <div style={{ fontWeight: 600, color: '#ffffff' }}>{log.buyerName || 'Khách VietQR'}</div>
                            <div style={{ fontSize: '11px', color: '#94a3b8' }}>
                              {log.buyerPhone} {log.buyerEmail ? `• ${log.buyerEmail}` : ''}
                            </div>
                          </td>
                          <td>
                            {log.generatedLicenseKey ? (
                              <span
                                className={styles.keyBadge}
                                onClick={() => copyText(log.generatedLicenseKey!, `Đã chép: ${log.generatedLicenseKey}`)}
                              >
                                {log.generatedLicenseKey}
                                <FiCopy style={{ fontSize: '10px' }} />
                              </span>
                            ) : (
                              <span style={{ color: '#64748b' }}>—</span>
                            )}
                          </td>
                          <td>
                            {log.emailStatus === 'sent' && (
                              <span className={`${styles.statusBadge} ${styles.statusActive}`}>
                                ✉️ Đã gửi mail
                              </span>
                            )}
                            {log.emailStatus === 'simulated' && (
                              <span className={`${styles.statusBadge} ${styles.statusAvailable}`}>
                                ✉️ Đã log (Mô phỏng)
                              </span>
                            )}
                            {log.emailStatus === 'skipped_no_email' && (
                              <span className={styles.statusBadge} style={{ background: 'rgba(255,255,255,0.05)', color: '#94a3b8' }}>
                                Không có email
                              </span>
                            )}
                            {log.emailStatus === 'failed' && (
                              <span className={`${styles.statusBadge} ${styles.statusRevoked}`}>
                                ❌ Lỗi gửi mail
                              </span>
                            )}
                          </td>
                          <td>
                            <span
                              className={`${styles.statusBadge} ${
                                log.status === 'success' ? styles.statusActive : styles.statusRevoked
                              }`}
                            >
                              {log.status === 'success' ? 'Thành công' : 'Thất bại'}
                            </span>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ================= TAB 5: LANDING LEADS ================= */}
        {activeTab === 'leads' && (
          <div className={styles.sectionCard}>
            <div className={styles.toolbar}>
              <h2 style={{ margin: 0, fontSize: '16px', color: '#ffffff', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <FiZap style={{ color: '#fbbf24' }} /> Danh Sách Khách Hàng Đặt Mua Gói Trên Landing Page
              </h2>
              <button onClick={fetchLeads} className={styles.btnSecondary}>
                <FiRefreshCw /> Làm Mới
              </button>
            </div>

            <div className={styles.tableContainer}>
              <table className={styles.dataTable}>
                <thead>
                  <tr>
                    <th>Mã Đơn / Lead</th>
                    <th>Khách Hàng</th>
                    <th>Số Điện Thoại / Email</th>
                    <th>Gói Đăng Ký</th>
                    <th>Số Tiền</th>
                    <th>Trạng Thái</th>
                    <th>Ghi Chú</th>
                    <th>Thời Gian</th>
                    <th style={{ textAlign: 'right' }}>Thao Tác</th>
                  </tr>
                </thead>
                <tbody>
                  {leads.length === 0 ? (
                    <tr>
                      <td colSpan={9} style={{ textAlign: 'center', padding: '32px' }}>
                        Chưa có lượt đăng ký nào từ Landing Page.
                      </td>
                    </tr>
                  ) : (
                    leads.map((lead, idx) => (
                      <tr key={lead.orderCode || idx}>
                        <td>
                          <code style={{ color: '#818cf8', fontWeight: 700 }}>{lead.orderCode}</code>
                        </td>
                        <td style={{ fontWeight: 600, color: '#ffffff' }}>{lead.name}</td>
                        <td>
                          <div>
                            <a
                              href={`https://zalo.me/${lead.phone}`}
                              target="_blank"
                              rel="noreferrer"
                              style={{ color: '#38bdf8', textDecoration: 'none' }}
                            >
                              📱 {lead.phone}
                            </a>
                          </div>
                          {lead.email && <div style={{ fontSize: '11px', color: '#94a3b8' }}>{lead.email}</div>}
                        </td>
                        <td>
                          <span
                            style={{
                              background: lead.plan === '799k' ? 'rgba(168, 85, 247, 0.2)' : 'rgba(99, 102, 241, 0.2)',
                              color: lead.plan === '799k' ? '#c084fc' : '#a5b4fc',
                              padding: '3px 8px',
                              borderRadius: '6px',
                              fontWeight: 600,
                              fontSize: '12px',
                            }}
                          >
                            {lead.plan === '799k' ? 'Gói Setup 799K' : 'Gói Tự Cài 399K'}
                          </span>
                        </td>
                        <td style={{ fontWeight: 700, color: '#34d399' }}>
                          {(lead.amount || (lead.plan === '799k' ? 799000 : 399000)).toLocaleString('vi-VN')}₫
                        </td>
                        <td>
                          <span
                            className={`${styles.statusBadge} ${
                              lead.paymentStatus === 'paid' ? styles.statusActive : styles.statusAvailable
                            }`}
                          >
                            {lead.paymentStatus === 'paid' ? '🟢 Đã thanh toán' : '🟡 Chờ VietQR'}
                          </span>
                        </td>
                        <td style={{ fontSize: '12px', color: '#cbd5e1', maxWidth: '180px' }}>
                          {lead.notes || '—'}
                        </td>
                        <td style={{ fontSize: '12px', color: '#94a3b8' }}>
                          {new Date(lead.createdAt).toLocaleString('vi-VN')}
                        </td>
                        <td style={{ textAlign: 'right' }}>
                          <div style={{ display: 'flex', gap: '6px', justifyContent: 'flex-end' }}>
                            <button
                              onClick={() =>
                                handleOpenCreateModal({
                                  name: lead.name,
                                  phone: lead.phone,
                                  plan: lead.plan,
                                })
                              }
                              className={styles.btnPrimary}
                              style={{ fontSize: '12px', padding: '6px 12px' }}
                              title="Cấp License Key ngay cho khách hàng này"
                            >
                              <FiKey /> Cấp Key
                            </button>
                            {lead.email && (
                              <button
                                onClick={() =>
                                  setManualEmailModal({
                                    isOpen: true,
                                    toEmail: lead.email || '',
                                    buyerName: lead.name,
                                    buyerPhone: lead.phone,
                                    licenseKey: '',
                                    orderCode: lead.orderCode,
                                    plan: lead.plan,
                                    amount: lead.amount || 799000,
                                    isSending: false,
                                  })
                                }
                                className={styles.actionBtn}
                                style={{ color: '#34d399', borderColor: 'rgba(16,185,129,0.3)' }}
                                title="Gửi mail bàn giao mã nguồn"
                              >
                                <FiMail />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ================= TAB 6: ORDERS ================= */}
        {activeTab === 'orders' && (
          <div className={styles.sectionCard}>
            <div className={styles.toolbar}>
              <h2 style={{ margin: 0, fontSize: '16px', color: '#ffffff', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <FiShoppingBag style={{ color: '#818cf8' }} /> Quản Lý Đơn Hàng (Orders Database)
              </h2>
              <button onClick={fetchOrders} className={styles.btnSecondary}>
                <FiRefreshCw /> Làm Mới
              </button>
            </div>

            <div className={styles.tableContainer}>
              <table className={styles.dataTable}>
                <thead>
                  <tr>
                    <th>Mã Đơn Hàng</th>
                    <th>Khách Hàng</th>
                    <th>Sản Phẩm</th>
                    <th>Tổng Tiền</th>
                    <th>Thanh Toán</th>
                    <th>Vận Chuyển</th>
                    <th>Ngày Đặt</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.length === 0 ? (
                    <tr>
                      <td colSpan={7} style={{ textAlign: 'center', padding: '32px' }}>
                        Chưa có đơn hàng nào trong CSDL.
                      </td>
                    </tr>
                  ) : (
                    orders.map((ord) => (
                      <tr key={ord._id}>
                        <td>
                          <code style={{ color: '#818cf8', fontWeight: 700 }}>{ord.orderCode}</code>
                        </td>
                        <td>
                          <div style={{ fontWeight: 600, color: '#ffffff' }}>{ord.customer?.name}</div>
                          <div style={{ fontSize: '12px', color: '#94a3b8' }}>📱 {ord.customer?.phone}</div>
                        </td>
                        <td>
                          <div style={{ fontSize: '12px' }}>
                            {ord.items?.map((it, i) => (
                              <div key={i}>
                                • {it.productName} (x{it.quantity})
                              </div>
                            ))}
                          </div>
                        </td>
                        <td style={{ fontWeight: 700, color: '#34d399' }}>
                          {ord.totalAmount?.toLocaleString('vi-VN')}₫
                        </td>
                        <td>
                          <span
                            className={`${styles.statusBadge} ${
                              ord.paymentStatus === 'paid' ? styles.statusActive : styles.statusAvailable
                            }`}
                          >
                            {ord.paymentStatus === 'paid' ? 'Đã thanh toán' : 'Chờ thanh toán'}
                          </span>
                        </td>
                        <td>
                          <span className={styles.statusBadge} style={{ background: 'rgba(255,255,255,0.05)' }}>
                            {ord.shippingStatus || 'Chờ xử lý'}
                          </span>
                        </td>
                        <td style={{ fontSize: '12px', color: '#94a3b8' }}>
                          {new Date(ord.createdAt).toLocaleString('vi-VN')}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ================= TAB 7: CUSTOMERS CRM ================= */}
        {activeTab === 'customers' && (
          <div className={styles.sectionCard}>
            <div className={styles.toolbar}>
              <h2 style={{ margin: 0, fontSize: '16px', color: '#ffffff', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <FiDatabase style={{ color: '#38bdf8' }} /> Danh Sách Khách Hàng (Customer Database CRM)
              </h2>
              <button onClick={fetchCustomers} className={styles.btnSecondary}>
                <FiRefreshCw /> Làm Mới
              </button>
            </div>

            <div className={styles.tableContainer}>
              <table className={styles.dataTable}>
                <thead>
                  <tr>
                    <th>Khách Hàng</th>
                    <th>Số Điện Thoại / Zalo</th>
                    <th>Email</th>
                    <th>Tổng Đơn</th>
                    <th>Tổng Chi Tiêu</th>
                    <th>Tags Phân Loại</th>
                    <th>Mua Gần Nhất</th>
                  </tr>
                </thead>
                <tbody>
                  {customers.length === 0 ? (
                    <tr>
                      <td colSpan={7} style={{ textAlign: 'center', padding: '32px' }}>
                        Chưa có dữ liệu khách hàng.
                      </td>
                    </tr>
                  ) : (
                    customers.map((cust) => (
                      <tr key={cust._id}>
                        <td style={{ fontWeight: 600, color: '#ffffff' }}>{cust.name}</td>
                        <td>
                          <a
                            href={`https://zalo.me/${cust.phone}`}
                            target="_blank"
                            rel="noreferrer"
                            style={{ color: '#38bdf8', textDecoration: 'none', fontWeight: 600 }}
                          >
                            📱 {cust.phone}
                          </a>
                        </td>
                        <td style={{ fontSize: '12px', color: '#cbd5e1' }}>{cust.email || '—'}</td>
                        <td>
                          <span className={styles.tabBadge}>{cust.totalOrders} đơn</span>
                        </td>
                        <td style={{ fontWeight: 700, color: '#34d399' }}>
                          {cust.totalSpent?.toLocaleString('vi-VN')}₫
                        </td>
                        <td>
                          <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
                            {cust.tags?.map((t, idx) => (
                              <span
                                key={idx}
                                style={{
                                  fontSize: '11px',
                                  background: 'rgba(99, 102, 241, 0.15)',
                                  color: '#a5b4fc',
                                  padding: '2px 6px',
                                  borderRadius: '4px',
                                }}
                              >
                                #{t}
                              </span>
                            ))}
                          </div>
                        </td>
                        <td style={{ fontSize: '12px', color: '#94a3b8' }}>
                          {cust.lastOrderAt ? new Date(cust.lastOrderAt).toLocaleDateString('vi-VN') : '—'}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>

      {/* ================= MODAL: XEM TRƯỚC GIAO DIỆN EMAIL ================= */}
      {showEmailPreviewModal && (
        <div className={styles.modalBackdrop}>
          <div className={styles.modalContent} style={{ maxWidth: '640px' }}>
            <div className={styles.modalHeader}>
              <h2>
                <FiEye style={{ color: '#34d399' }} /> Xem Trước Mẫu Email Bàn Giao (HTML Preview)
              </h2>
              <button onClick={() => setShowEmailPreviewModal(false)} className={styles.modalCloseBtn}>
                <FiX />
              </button>
            </div>

            <div className={styles.modalBody} style={{ padding: '16px', background: '#080a12' }}>
              <div
                style={{
                  background: '#0f1422',
                  borderRadius: '12px',
                  border: '1px solid #232838',
                  overflow: 'hidden',
                  color: '#e2e8f0',
                  fontSize: '13px',
                }}
              >
                <div style={{ background: 'linear-gradient(135deg, #4338ca 0%, #6366f1 50%, #8b5cf6 100%)', padding: '24px 20px', textAlign: 'center', color: '#fff' }}>
                  <div style={{ display: 'inline-block', background: 'rgba(255,255,255,0.2)', border: '1px solid rgba(255,255,255,0.3)', borderRadius: '20px', padding: '3px 12px', fontSize: '10px', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#fff', marginBottom: '8px' }}>
                    ✓ THANH TOÁN THÀNH CÔNG • XÁC THỰC 100%
                  </div>
                  <h3 style={{ margin: '0 0 4px 0', fontSize: '18px', fontWeight: 800 }}>
                    {configData.emailBannerTitle || 'XÁC NHẬN BÀN GIAO MÃ NGUỒN & BẢN QUYỀN'}
                  </h3>
                  <p style={{ margin: 0, fontSize: '12px', opacity: 0.9 }}>
                    Nền Tảng Bán Hàng Ngoại Sàn Tự Động Hóa ShopBig
                  </p>
                </div>

                <div style={{ padding: '24px 20px' }}>
                  <p style={{ marginTop: 0, fontSize: '14px' }}>
                    Kính gửi <strong>Nguyễn Văn Khách Hàng</strong>,
                    <br /><br />
                    {configData.emailIntroText || 'Hệ thống ShopBig đã ghi nhận giao dịch thanh toán thành công cho đơn hàng #ST399K_123456. Chúng tôi xin trân trọng gửi tới bạn thông tin bản quyền và đường link tải trọn bộ mã nguồn:'}
                  </p>

                  <div style={{ background: 'linear-gradient(180deg, rgba(99, 102, 241, 0.12) 0%, rgba(139, 92, 246, 0.06) 100%)', border: '1.5px dashed #6366f1', borderRadius: '12px', padding: '16px', textAlign: 'center', margin: '16px 0' }}>
                    <div style={{ fontSize: '11px', fontWeight: 700, color: '#a5b4fc', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '6px' }}>
                      🔑 MÃ BẢN QUYỀN HỆ THỐNG (LICENSE KEY)
                    </div>
                    <div style={{ fontFamily: 'monospace', fontSize: '20px', fontWeight: 800, color: '#38bdf8', background: '#0b0f19', padding: '8px 16px', borderRadius: '6px', display: 'inline-block', border: '1px solid rgba(56, 189, 248, 0.35)' }}>
                      AFF-DEMO-XXXX-9999
                    </div>
                    <div style={{ fontSize: '11px', color: '#94a3b8', marginTop: '8px' }}>
                      Mã bản quyền định danh chính thức cấp quyền quản trị trọn đời cho chủ shop.
                    </div>
                  </div>

                  <div style={{ background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)', color: '#fff', padding: '13px 20px', borderRadius: '10px', textAlign: 'center', fontWeight: 700, margin: '16px 0', fontSize: '14px' }}>
                    📥 TẢI TRỌN BỘ MÃ NGUỒN (GOOGLE DRIVE)
                  </div>

                  <div style={{ background: '#1a2234', border: '1px solid #28334e', borderRadius: '8px', overflow: 'hidden', margin: '16px 0', fontSize: '12px' }}>
                    <div style={{ background: '#202b42', padding: '8px 12px', fontWeight: 700, color: '#cbd5e1', borderBottom: '1px solid #28334e' }}>
                      📋 Chi Tiết Đơn Hàng & Giao Dịch
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 12px', borderBottom: '1px solid #232d44', color: '#94a3b8' }}>
                      <span>Mã đơn hàng:</span>
                      <strong style={{ color: '#fff' }}>#ST399K_123456</strong>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 12px', borderBottom: '1px solid #232d44', color: '#94a3b8' }}>
                      <span>Gói bản quyền:</span>
                      <strong style={{ color: '#a5b4fc' }}>Gói Tự Cài Đặt (399K)</strong>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 12px', borderBottom: '1px solid #232d44', color: '#94a3b8' }}>
                      <span>Số tiền thanh toán:</span>
                      <strong style={{ color: '#34d399' }}>399.000₫</strong>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 12px', color: '#94a3b8' }}>
                      <span>Trạng thái:</span>
                      <strong style={{ color: '#38bdf8' }}>✓ Đã kích hoạt trọn đời</strong>
                    </div>
                  </div>

                  <div style={{ background: 'rgba(255, 255, 255, 0.02)', border: '1px solid #232d44', borderRadius: '8px', padding: '12px 14px', fontSize: '12px', lineHeight: 1.6, color: '#cbd5e1' }}>
                    <div style={{ color: '#fbbf24', fontWeight: 700, marginBottom: '4px' }}>🤝 Kênh Hỗ Trợ Kỹ Thuật:</div>
                    <div>• <strong>Hotline / Zalo:</strong> <span style={{ color: '#38bdf8' }}>{configData.hotlineSupport || '0988.888.888'}</span></div>
                    <div>• <strong>Tài liệu:</strong> <span style={{ color: '#38bdf8' }}>{configData.docsUrl || 'https://shopbig.vn/docs'}</span></div>
                  </div>
                </div>

                <div style={{ background: '#0b0f19', borderTop: '1px solid #1f293d', padding: '14px 20px', textAlign: 'center', fontSize: '11px', color: '#64748b' }}>
                  © 2026 <strong>ShopBig Platform</strong>. Nền tảng bán hàng ngoại sàn tự động hóa 100%.
                </div>
              </div>
            </div>

            <div className={styles.modalFooter}>
              <button onClick={() => setShowEmailPreviewModal(false)} className={styles.btnPrimary}>
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ================= MODAL: GỬI LẠI MAIL THỦ CÔNG ================= */}
      {manualEmailModal.isOpen && (
        <div className={styles.modalBackdrop}>
          <div className={styles.modalContent} style={{ maxWidth: '480px' }}>
            <div className={styles.modalHeader}>
              <h2>
                <FiMail style={{ color: '#34d399' }} /> Gửi Email Bàn Giao Mã Nguồn & Bản Quyền
              </h2>
              <button
                onClick={() => setManualEmailModal((prev) => ({ ...prev, isOpen: false }))}
                className={styles.modalCloseBtn}
              >
                <FiX />
              </button>
            </div>

            <form onSubmit={handleSendManualEmail}>
              <div className={styles.modalBody}>
                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>Email người nhận (*)</label>
                  <input
                    type="email"
                    value={manualEmailModal.toEmail}
                    onChange={(e) => setManualEmailModal((prev) => ({ ...prev, toEmail: e.target.value }))}
                    className={styles.formInput}
                    placeholder="VD: khach@gmail.com"
                    required
                    autoFocus
                  />
                </div>

                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>Tên khách hàng</label>
                  <input
                    type="text"
                    value={manualEmailModal.buyerName}
                    onChange={(e) => setManualEmailModal((prev) => ({ ...prev, buyerName: e.target.value }))}
                    className={styles.formInput}
                  />
                </div>

                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>Mã Bản Quyền Bàn Giao (*)</label>
                  <input
                    type="text"
                    value={manualEmailModal.licenseKey}
                    onChange={(e) => setManualEmailModal((prev) => ({ ...prev, licenseKey: e.target.value.toUpperCase() }))}
                    className={styles.formInput}
                    placeholder="VD: AFF-XXXX-XXXX-XXXX"
                    required
                  />
                </div>
              </div>

              <div className={styles.modalFooter}>
                <button
                  type="button"
                  onClick={() => setManualEmailModal((prev) => ({ ...prev, isOpen: false }))}
                  className={styles.btnSecondary}
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={manualEmailModal.isSending}
                  className={styles.btnPrimary}
                  style={{ background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)' }}
                >
                  {manualEmailModal.isSending ? <FiRefreshCw className="animate-spin" /> : <FiSend />}
                  {manualEmailModal.isSending ? 'Đang gửi...' : 'Gửi Email Ngay'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================= MODAL: TẠO KEY MỚI ================= */}
      {isCreateModalOpen && (
        <div className={styles.modalBackdrop}>
          <div className={styles.modalContent}>
            <div className={styles.modalHeader}>
              <h2>
                <FiKey style={{ color: '#818cf8' }} /> Tạo Mã Bản Quyền Mới (Master License)
              </h2>
              <button onClick={() => setIsCreateModalOpen(false)} className={styles.modalCloseBtn}>
                <FiX />
              </button>
            </div>

            {createdResult ? (
              <div className={styles.modalBody}>
                <div className={styles.successBox}>
                  <FiCheckCircle style={{ fontSize: '36px', color: '#34d399', marginBottom: '8px' }} />
                  <h3 style={{ margin: '0 0 6px 0', color: '#ffffff', fontSize: '17px' }}>
                    Tạo Bản Quyền Thành Công!
                  </h3>
                  <p style={{ margin: 0, fontSize: '13px', color: '#cbd5e1' }}>
                    Mã bản quyền đã được lưu trực tiếp vào CSDL Master MongoDB.
                  </p>

                  {createdResult.map((res, idx) => (
                    <div key={idx} style={{ marginTop: '14px' }}>
                      <div
                        className={styles.successKeyDisplay}
                        onClick={() => copyText(res.licenseKey, `Đã sao chép: ${res.licenseKey}`)}
                        title="Bấm để sao chép"
                      >
                        {res.licenseKey}
                        <FiCopy style={{ fontSize: '16px' }} />
                      </div>

                      <button
                        type="button"
                        onClick={() => copyText(res.zaloMessage, 'Đã sao chép tin nhắn mẫu gửi Zalo!')}
                        className={styles.btnPrimary}
                        style={{ width: '100%', justifyContent: 'center', marginBottom: '10px' }}
                      >
                        <FiMessageSquare /> Sao Chép Tin Nhắn Mẫu Gửi Zalo
                      </button>

                      <div className={styles.zaloPreviewBox}>
                        <strong>Xem trước nội dung tin nhắn gửi khách:</strong>
                        <br />
                        {res.zaloMessage}
                      </div>
                    </div>
                  ))}
                </div>

                <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
                  <button
                    onClick={() => {
                      setCreatedResult(null);
                      setBuyerName('');
                      setBuyerPhone('');
                    }}
                    className={styles.btnSecondary}
                  >
                    + Tạo Thêm Key Khác
                  </button>
                  <button onClick={() => setIsCreateModalOpen(false)} className={styles.btnPrimary}>
                    Hoàn Tất & Đóng
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleCreateLicenseSubmit}>
                <div className={styles.modalBody}>
                  <div className={styles.formGroup}>
                    <label className={styles.formLabel}>Tên khách hàng / Người mua (*)</label>
                    <input
                      type="text"
                      placeholder="VD: Anh Nam - Founder Shop Giày"
                      value={buyerName}
                      onChange={(e) => setBuyerName(e.target.value)}
                      className={styles.formInput}
                      required
                      autoFocus
                    />
                  </div>

                  <div className={styles.formGroup}>
                    <label className={styles.formLabel}>Số điện thoại / Zalo</label>
                    <input
                      type="text"
                      placeholder="VD: 0988888888"
                      value={buyerPhone}
                      onChange={(e) => setBuyerPhone(e.target.value)}
                      className={styles.formInput}
                    />
                    <div className={styles.formHelp}>Hệ thống sẽ tự động lưu vào CRM và liên kết chat Zalo.</div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                    <div className={styles.formGroup}>
                      <label className={styles.formLabel}>Gói bản quyền</label>
                      <select
                        value={licensePlan}
                        onChange={(e) => {
                          const val = e.target.value as '399k' | '799k' | 'custom';
                          setLicensePlan(val);
                          if (val === '399k') setLicensePrice(399000);
                          if (val === '799k') setLicensePrice(799000);
                        }}
                        className={styles.formSelect}
                      >
                        <option value="399k">Gói Tự Cài Đặt (399.000₫)</option>
                        <option value="799k">Gói Setup A-Z Trọn Gói (799.000₫)</option>
                        <option value="custom">Gói Tùy Chỉnh Doanh Nghiệp</option>
                      </select>
                    </div>

                    <div className={styles.formGroup}>
                      <label className={styles.formLabel}>Giá thu (VNĐ)</label>
                      <input
                        type="number"
                        value={licensePrice}
                        onChange={(e) => setLicensePrice(Number(e.target.value))}
                        className={styles.formInput}
                      />
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                    <div className={styles.formGroup}>
                      <label className={styles.formLabel}>Số lượng tạo (Bulk)</label>
                      <select
                        value={licenseCount}
                        onChange={(e) => setLicenseCount(Number(e.target.value))}
                        className={styles.formSelect}
                      >
                        <option value={1}>Tạo 1 mã duy nhất</option>
                        <option value={5}>Tạo nhanh 5 mã (Bulk 5)</option>
                        <option value={10}>Tạo nhanh 10 mã (Bulk 10)</option>
                      </select>
                    </div>

                    <div className={styles.formGroup}>
                      <label className={styles.formLabel}>Hotline hỗ trợ kỹ thuật</label>
                      <input
                        type="text"
                        value={hotline}
                        onChange={(e) => setHotline(e.target.value)}
                        className={styles.formInput}
                      />
                    </div>
                  </div>

                  <div className={styles.formGroup}>
                    <label className={styles.formLabel}>Ghi chú nội bộ</label>
                    <textarea
                      placeholder="VD: Đã chuyển khoản Techcombank, mua qua Facebook Ads..."
                      value={licenseNotes}
                      onChange={(e) => setLicenseNotes(e.target.value)}
                      className={styles.formTextarea}
                      rows={2}
                    />
                  </div>
                </div>

                <div className={styles.modalFooter}>
                  <button
                    type="button"
                    onClick={() => setIsCreateModalOpen(false)}
                    className={styles.btnSecondary}
                  >
                    Hủy
                  </button>
                  <button type="submit" disabled={isCreating} className={styles.btnPrimary}>
                    {isCreating ? <FiRefreshCw className="animate-spin" /> : <FiPlus />}
                    {isCreating ? 'Đang tạo key...' : `Tạo ${licenseCount} Mã Bản Quyền`}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* ================= MODAL: XÁC NHẬN THAO TÁC / KHÓA / XÓA ================= */}
      {confirmModal.isOpen && confirmModal.license && (
        <div className={styles.modalBackdrop}>
          <div className={styles.modalContent} style={{ maxWidth: '460px' }}>
            <div className={styles.modalHeader}>
              <h2>
                {confirmModal.action === 'revoke' && <FiSlash style={{ color: '#f87171' }} />}
                {confirmModal.action === 'reactivate' && <FiUnlock style={{ color: '#34d399' }} />}
                {confirmModal.action === 'delete' && <FiTrash2 style={{ color: '#f87171' }} />}
                {confirmModal.action === 'revoke' && 'Khóa / Thu Hồi Bản Quyền'}
                {confirmModal.action === 'reactivate' && 'Mở Lại Bản Quyền'}
                {confirmModal.action === 'delete' && 'Xác Nhận Xóa Bản Quyền'}
              </h2>
              <button
                onClick={() => setConfirmModal({ isOpen: false, license: null, action: 'revoke', reason: '' })}
                className={styles.modalCloseBtn}
              >
                <FiX />
              </button>
            </div>

            <div className={styles.modalBody}>
              <p style={{ margin: '0 0 12px 0', fontSize: '13.5px', color: '#cbd5e1' }}>
                Mã Key:{' '}
                <strong style={{ color: '#ffffff', fontFamily: 'monospace' }}>
                  {confirmModal.license.licenseKey}
                </strong>
                <br />
                Khách hàng: <strong style={{ color: '#ffffff' }}>{confirmModal.license.buyerName}</strong>
              </p>

              {confirmModal.action === 'revoke' && (
                <>
                  <p style={{ fontSize: '12.5px', color: '#f87171', margin: '0 0 12px 0' }}>
                    ⚠️ Khi khóa, website shop sử dụng key này sẽ lập tức bị chặn truy cập và yêu cầu liên hệ Master Admin.
                  </p>
                  <div className={styles.formGroup}>
                    <label className={styles.formLabel}>Lý do khóa (tùy chọn):</label>
                    <input
                      type="text"
                      placeholder="VD: Khách vi phạm điều khoản / chưa thanh toán..."
                      value={confirmModal.reason}
                      onChange={(e) =>
                        setConfirmModal((prev) => ({ ...prev, reason: e.target.value }))
                      }
                      className={styles.formInput}
                    />
                  </div>
                </>
              )}

              {confirmModal.action === 'reactivate' && (
                <p style={{ fontSize: '12.5px', color: '#34d399', margin: '0 0 12px 0' }}>
                  Bản quyền sẽ được khôi phục trạng thái hoạt động bình thường.
                </p>
              )}

              {confirmModal.action === 'delete' && (
                <p style={{ fontSize: '12.5px', color: '#f87171', margin: '0 0 12px 0' }}>
                  ⚠️ Hành động này sẽ xóa vĩnh viễn mã key này khỏi Master Database!
                </p>
              )}
            </div>

            <div className={styles.modalFooter}>
              <button
                onClick={() => setConfirmModal({ isOpen: false, license: null, action: 'revoke', reason: '' })}
                className={styles.btnSecondary}
              >
                Hủy
              </button>
              {confirmModal.action === 'delete' ? (
                <button
                  onClick={handleDeleteLicense}
                  className={styles.btnPrimary}
                  style={{ background: '#ef4444', borderColor: '#f87171' }}
                >
                  Xác Nhận Xóa
                </button>
              ) : (
                <button onClick={handleToggleRevoke} className={styles.btnPrimary}>
                  Xác Nhận Cập Nhật
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
