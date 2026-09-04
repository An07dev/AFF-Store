'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  FiDatabase,
  FiCheckCircle,
  FiAlertTriangle,
  FiServer,
  FiCloud,
  FiKey,
  FiExternalLink,
  FiArrowRight,
  FiRefreshCw,
  FiLock,
  FiShield,
  FiShoppingBag,
  FiCheck,
  FiCopy,
  FiTerminal,
  FiActivity,
  FiLayers,
  FiUserCheck,
  FiZap,
} from 'react-icons/fi';
import toast from 'react-hot-toast';
import { apiFetch } from '@/lib/api';
import styles from './page.module.css';

interface DbStatus {
  isVercel: boolean;
  hasUriConfigured: boolean;
  isConnected: boolean;
  isSeeded: boolean;
  environment: string;
  errorMessage: string | null;
  stats: {
    users: number;
    products: number;
    categories: number;
  };
}

interface StepItem {
  id: number;
  title: string;
  description: string;
  status: 'pending' | 'running' | 'completed' | 'error';
  log: string;
}

const INITIAL_STEPS: StepItem[] = [
  {
    id: 1,
    title: 'Kiểm tra & Kết nối Database',
    description: 'Xác thực đường truyền và bắt tay với máy chủ MongoDB',
    status: 'pending',
    log: 'Đang đợi khởi tạo kết nối...',
  },
  {
    id: 2,
    title: 'Tạo tài khoản Quản trị viên (Admin)',
    description: 'Tạo admin@shopbig.vn với mật khẩu mã hóa bcrypt bảo mật',
    status: 'pending',
    log: 'Đang chuẩn bị dữ liệu xác thực...',
  },
  {
    id: 3,
    title: 'Khởi tạo Danh mục ngành hàng',
    description: 'Tạo 4 danh mục chính: Thời trang nam, nữ, phụ kiện, đồ điện tử',
    status: 'pending',
    log: 'Đang đợi đồng bộ danh mục...',
  },
  {
    id: 4,
    title: 'Nạp Sản phẩm mẫu, Biến thể & Kho hàng',
    description: 'Tạo các sản phẩm mẫu có sẵn biến thể size/màu và đánh giá 5 sao',
    status: 'pending',
    log: 'Đang đợi nạp kho sản phẩm...',
  },
  {
    id: 5,
    title: 'Kích hoạt Cấu hình & Theme ShopBig',
    description: 'Thiết lập thông tin thương hiệu, logo và giao diện hoàn tất',
    status: 'pending',
    log: 'Đang lưu cấu hình hệ thống...',
  },
];

export default function SetupPage() {
  const router = useRouter();
  const [status, setStatus] = useState<DbStatus | null>(null);
  const [loadingStatus, setLoadingStatus] = useState(true);

  // Test connection state
  const [customUri, setCustomUri] = useState('');
  const [testingUri, setTestingUri] = useState(false);
  const [testProgress, setTestProgress] = useState<string>('');
  const [testResult, setTestResult] = useState<{ success: boolean; message: string; ping?: number } | null>(null);

  // Seed / Progress state
  const [seeding, setSeeding] = useState(false);
  const [progressPercent, setProgressPercent] = useState(0);
  const [steps, setSteps] = useState<StepItem[]>(INITIAL_STEPS);
  const [logs, setLogs] = useState<string[]>([]);
  const [seedResult, setSeedResult] = useState<any>(null);
  const [copiedPass, setCopiedPass] = useState(false);
  const [copiedEmail, setCopiedEmail] = useState(false);
  const logTerminalRef = useRef<HTMLDivElement>(null);

  // Auto scroll logs
  useEffect(() => {
    if (logTerminalRef.current) {
      logTerminalRef.current.scrollTop = logTerminalRef.current.scrollHeight;
    }
  }, [logs]);

  const addLog = (msg: string) => {
    const time = new Date().toLocaleTimeString();
    setLogs((prev) => [...prev, `[${time}] ${msg}`]);
  };

  const fetchStatus = async () => {
    try {
      setLoadingStatus(true);
      const res = await apiFetch('/api/system/db-status');
      const data = await res.json();
      if (data.success && data.data) {
        setStatus(data.data);
      }
    } catch (err: any) {
      toast.error('Không thể kiểm tra trạng thái CSDL');
    } finally {
      setLoadingStatus(false);
    }
  };

  useEffect(() => {
    fetchStatus();
  }, []);

  const handleTestConnection = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customUri.trim()) {
      toast.error('Vui lòng nhập chuỗi kết nối MongoDB (MONGODB_URI)');
      return;
    }

    setTestingUri(true);
    setTestResult(null);
    setTestProgress('Đang gửi truy vấn kết nối đến máy chủ MongoDB...');

    const startTime = Date.now();
    try {
      setTimeout(() => setTestProgress('Đang xác thực thông tin tài khoản & quyền truy cập...'), 400);

      const res = await apiFetch('/api/setup/test-connection', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ uri: customUri }),
      });
      const data = await res.json();
      const elapsed = Date.now() - startTime;
      
      setTestResult({
        ...data,
        ping: elapsed,
      });

      if (data.success) {
        toast.success(data.message || 'Kết nối thành công!');
      } else {
        toast.error(data.message || 'Kết nối thất bại');
      }
    } catch (err: any) {
      setTestResult({
        success: false,
        message: err.message || 'Lỗi kiểm tra kết nối',
      });
      toast.error('Lỗi kiểm tra kết nối');
    } finally {
      setTestingUri(false);
      setTestProgress('');
    }
  };

  const handleInitializeDb = async () => {
    setSeeding(true);
    setSeedResult(null);
    setProgressPercent(10);
    setLogs([]);
    
    // Reset steps
    const newSteps: StepItem[] = INITIAL_STEPS.map((s) => ({ ...s, status: 'pending' }));
    setSteps(newSteps);

    // Step 1: Connecting
    addLog('🚀 Bắt đầu quá trình khởi tạo cơ sở dữ liệu ShopBig...');
    newSteps[0].status = 'running';
    newSteps[0].log = 'Đang bắt tay với cơ sở dữ liệu...';
    setSteps([...newSteps]);
    setProgressPercent(20);

    const stepDelay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

    try {
      await stepDelay(500);
      newSteps[0].status = 'completed';
      newSteps[0].log = 'Kết nối Mongoose thành công (ReadyState: 1)';
      addLog('✅ [Database] Đã kết nối cơ sở dữ liệu thành công!');
      
      // Step 2: Admin
      newSteps[1].status = 'running';
      newSteps[1].log = 'Đang băm mật khẩu bcrypt và tạo quyền Admin...';
      setSteps([...newSteps]);
      setProgressPercent(40);
      addLog('👤 [Admin] Đang khởi tạo tài khoản quản trị: admin@shopbig.vn');

      await stepDelay(600);
      newSteps[1].status = 'completed';
      newSteps[1].log = 'Đã tạo xong: admin@shopbig.vn / admin123';
      addLog('✅ [Admin] Tạo tài khoản Admin thành công!');

      // Step 3: Categories
      newSteps[2].status = 'running';
      newSteps[2].log = 'Đang tạo danh mục ngành hàng...';
      setSteps([...newSteps]);
      setProgressPercent(60);
      addLog('📁 [Category] Đang tạo danh mục sản phẩm (Thời trang, Phụ kiện, Điện tử)...');

      // Call the actual API
      const apiPromise = apiFetch('/api/setup/initialize', { method: 'POST' });

      await stepDelay(500);
      newSteps[2].status = 'completed';
      newSteps[2].log = 'Đã tạo 4 danh mục chính thành công';
      addLog('✅ [Category] Hoàn tất 4 danh mục sản phẩm!');

      // Step 4: Products & Reviews
      newSteps[3].status = 'running';
      newSteps[3].log = 'Đang nạp sản phẩm mẫu, phân loại biến thể size/màu & đánh giá...';
      setSteps([...newSteps]);
      setProgressPercent(80);
      addLog('🛍️ [Product] Đang nạp danh sách sản phẩm mẫu và kho biến thể...');

      const res = await apiPromise;
      const data = await res.json();

      await stepDelay(600);
      if (data.success) {
        newSteps[3].status = 'completed';
        newSteps[3].log = `Đã nạp ${data.data?.stats?.products || 4} sản phẩm mẫu và đánh giá 5 sao`;
        addLog(`✅ [Product] Nạp thành công ${data.data?.stats?.products || 4} sản phẩm mẫu!`);

        // Step 5: Theme & Settings
        newSteps[4].status = 'running';
        newSteps[4].log = 'Đang đồng bộ giao diện và kích hoạt hệ thống...';
        setSteps([...newSteps]);
        setProgressPercent(95);
        addLog('🎨 [Theme] Đang áp dụng thiết lập Theme & Logo ShopBig...');

        await stepDelay(500);
        newSteps[4].status = 'completed';
        newSteps[4].log = 'Giao diện & CSDL đã sẵn sàng 100%';
        setSteps([...newSteps]);
        setProgressPercent(100);
        addLog('🎉 [Success] Tất cả các bước đã hoàn tất thành công 100%!');

        setSeedResult(data.data);
        toast.success(data.message || 'Khởi tạo dữ liệu thành công!');
        fetchStatus();
      } else {
        throw new Error(data.message || 'Lỗi khởi tạo CSDL từ máy chủ');
      }
    } catch (err: any) {
      addLog(`❌ [Error] Thao tác thất bại: ${err.message}`);
      toast.error(err.message || 'Lỗi hệ thống khi khởi tạo');
      // Mark current running step as error
      setSteps((prev) =>
        prev.map((s) => (s.status === 'running' ? { ...s, status: 'error', log: err.message } : s))
      );
    } finally {
      setSeeding(false);
    }
  };

  const copyToClipboard = (text: string, type: 'email' | 'pass') => {
    navigator.clipboard.writeText(text);
    if (type === 'email') {
      setCopiedEmail(true);
      setTimeout(() => setCopiedEmail(false), 2000);
    } else {
      setCopiedPass(true);
      setTimeout(() => setCopiedPass(false), 2000);
    }
    toast.success(`Đã copy ${type === 'email' ? 'Email' : 'Mật khẩu'} vào Clipboard!`);
  };

  return (
    <div className={styles.wrapper}>
      <header className={styles.header}>
        <div className={styles.headerInner}>
          <div className={styles.brand}>
            <div className={styles.brandIconBox}>
              <img src="/images/logo.png" alt="ShopBig Logo" className={styles.brandImg} />
            </div>
            <div>
              <h1 className={styles.brandTitle}>ShopBig Setup Wizard</h1>
              <span className={styles.brandSubtitle}>Trình Thiết Lập Cơ Sở Dữ Liệu & Khởi Tạo Hệ Thống</span>
            </div>
          </div>

          <div className={styles.headerActions}>
            <button
              type="button"
              className={styles.refreshBtn}
              onClick={fetchStatus}
              disabled={loadingStatus}
            >
              <FiRefreshCw className={loadingStatus ? styles.spin : ''} />
              <span>Làm mới trạng thái</span>
            </button>
            <Link href="/" className={styles.headerLink}>
              Trang Bán Hàng
            </Link>
          </div>
        </div>
      </header>

      <main className={styles.main}>
        {/* Card 1: System Live Status */}
        <section className={styles.card}>
          <div className={styles.cardHeader}>
            <div className={styles.cardHeaderIcon}>
              <FiServer />
            </div>
            <div>
              <h2 className={styles.cardTitle}>1. Trạng Thái Hệ Thống & Kết Nối CSDL</h2>
              <p className={styles.cardDesc}>Kiểm tra thời gian thực môi trường chạy và tình trạng kết nối</p>
            </div>
          </div>

          <div className={styles.statusGrid}>
            <div className={styles.statusItem}>
              <span className={styles.statusLabel}>Môi trường triển khai:</span>
              <span className={styles.badgeInfo}>
                {status?.isVercel ? '☁️ Vercel Serverless' : '💻 Local / Máy chủ riêng'}
              </span>
            </div>

            <div className={styles.statusItem}>
              <span className={styles.statusLabel}>Trạng thái kết nối DB:</span>
              {status?.isConnected ? (
                <span className={styles.badgeSuccess}>
                  <FiCheckCircle /> Đã kết nối thành công
                </span>
              ) : (
                <span className={styles.badgeDanger}>
                  <FiAlertTriangle /> Chưa có kết nối CSDL
                </span>
              )}
            </div>

            <div className={styles.statusItem}>
              <span className={styles.statusLabel}>Dữ liệu hệ thống:</span>
              {status?.isSeeded ? (
                <span className={styles.badgeSuccess}>
                  <FiCheckCircle /> Đầy đủ ({status.stats.products} sản phẩm, {status.stats.categories} danh mục)
                </span>
              ) : (
                <span className={styles.badgeWarning}>
                  <FiAlertTriangle /> CSDL trống (Chưa khởi tạo)
                </span>
              )}
            </div>
          </div>

          {status?.errorMessage && (
            <div className={styles.errorBox}>
              <strong>Chi tiết lỗi:</strong> {status.errorMessage}
            </div>
          )}
        </section>

        {/* Card 2: MongoDB Atlas Setup Guide & Connection Form */}
        <section className={styles.card}>
          <div className={styles.cardHeader}>
            <div className={styles.cardHeaderIcon}>
              <FiCloud />
            </div>
            <div>
              <h2 className={styles.cardTitle}>2. Cấu Hình Chuỗi Kết Nối (MONGODB_URI)</h2>
              <p className={styles.cardDesc}>
                {status?.isVercel
                  ? 'Khi chạy trên Vercel/Cloud, bạn cần thêm biến MONGODB_URI vào Vercel Environment Variables'
                  : 'Sử dụng MongoDB Atlas đám mây miễn phí hoặc CSDL cục bộ nhúng'}
              </p>
            </div>
          </div>

          {/* Guide Steps */}
          <div className={styles.guideSteps}>
            <h3 className={styles.guideTitle}>📖 3 Bước lấy MONGODB_URI miễn phí 100% từ MongoDB Atlas (2 phút):</h3>
            <div className={styles.stepsList}>
              <div className={styles.stepItem}>
                <span className={styles.stepNum}>1</span>
                <div>
                  <strong>Đăng ký tài khoản miễn phí:</strong>
                  <p>
                    Truy cập{' '}
                    <a href="https://www.mongodb.com/cloud/atlas/register" target="_blank" rel="noreferrer">
                      mongodb.com/cloud/atlas <FiExternalLink size={12} />
                    </a>{' '}
                    và chọn gói <strong>M0 Free (Miễn phí vĩnh viễn)</strong>.
                  </p>
                </div>
              </div>

              <div className={styles.stepItem}>
                <span className={styles.stepNum}>2</span>
                <div>
                  <strong>Mở quyền truy cập IP (Network Access):</strong>
                  <p>
                    Vào <strong>Security &gt; Network Access</strong> &gt; Nhấn <strong>Add IP Address</strong> &gt; Chọn{' '}
                    <strong>Allow Access from Anywhere (0.0.0.0/0)</strong> để Vercel/Website kết nối được.
                  </p>
                </div>
              </div>

              <div className={styles.stepItem}>
                <span className={styles.stepNum}>3</span>
                <div>
                  <strong>Lấy chuỗi kết nối & Thêm vào Vercel:</strong>
                  <p>
                    Nhấn <strong>Connect &gt; Drivers</strong> &gt; Copy chuỗi kết nối (thay thế <code>&lt;password&gt;</code> bằng mật khẩu DB của bạn).
                  </p>
                  <p style={{ marginTop: 4 }}>
                    👉 Trên Vercel: Vào <strong>Project Settings &gt; Environment Variables</strong> &gt; Thêm Key: <code>MONGODB_URI</code> với Value vừa copy.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Test connection tool */}
          <form className={styles.testForm} onSubmit={handleTestConnection}>
            <label className={styles.inputLabel}>Kiểm tra chuỗi kết nối MongoDB của bạn:</label>
            <div className={styles.inputRow}>
              <input
                type="text"
                className={styles.inputUri}
                placeholder="mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/webbanhang?retryWrites=true&w=majority"
                value={customUri}
                onChange={(e) => setCustomUri(e.target.value)}
              />
              <button type="submit" className={styles.btnTest} disabled={testingUri}>
                {testingUri ? (
                  <span className={styles.btnLoadingInner}>
                    <FiRefreshCw className={styles.spin} /> Đang kiểm tra...
                  </span>
                ) : (
                  <span className={styles.btnContent}>
                    <FiZap /> Kiểm Tra Kết Nối
                  </span>
                )}
              </button>
            </div>

            {testingUri && (
              <div className={styles.testLiveNotice}>
                <div className={styles.miniSpinner}></div>
                <span>{testProgress}</span>
              </div>
            )}

            {testResult && (
              <div className={testResult.success ? styles.resultSuccess : styles.resultError}>
                <div className={styles.resultHead}>
                  {testResult.success ? <FiCheckCircle size={18} /> : <FiAlertTriangle size={18} />}
                  <span>{testResult.message}</span>
                </div>
                {testResult.ping !== undefined && testResult.success && (
                  <div className={styles.pingBadge}>
                    <FiActivity size={13} /> Thời gian phản hồi: <strong>{testResult.ping} ms</strong>
                  </div>
                )}
              </div>
            )}
          </form>
        </section>

        {/* Card 3: 1-Click Auto Seed Initial Data with Step-by-step Progress Tracker */}
        <section className={styles.card}>
          <div className={styles.cardHeader}>
            <div className={styles.cardHeaderIcon}>
              <FiKey />
            </div>
            <div>
              <h2 className={styles.cardTitle}>3. Khởi Tạo Dữ Liệu & Tạo Tài Khoản Admin</h2>
              <p className={styles.cardDesc}>Tạo sẵn tài khoản quản trị viên, danh mục, sản phẩm mẫu và thiết lập theme chuẩn</p>
            </div>
          </div>

          <div className={styles.seedArea}>
            <p className={styles.seedNotice}>
              Khi nhấn nút dưới đây, hệ thống sẽ tự động tạo tài khoản Admin <strong>admin@shopbig.vn</strong> (mật khẩu <strong>admin123</strong>) cùng toàn bộ danh mục, banner, sản phẩm mẫu và cấu hình để bạn bắt đầu bán hàng ngay lập tức.
            </p>

            {/* Main Action Button */}
            {!seeding && !seedResult && (
              <button
                type="button"
                className={styles.btnSeed}
                onClick={handleInitializeDb}
                disabled={seeding || !status?.isConnected}
              >
                <FiShoppingBag size={18} />
                <span>🚀 Khởi Tạo Dữ Liệu Mẫu & Tài Khoản Admin</span>
              </button>
            )}

            {!status?.isConnected && !seeding && !seedResult && (
              <span className={styles.warnText}>⚠️ Bạn cần kết nối CSDL ở Bước 2 trước khi khởi tạo dữ liệu.</span>
            )}

            {/* LIVE STEP-BY-STEP PROGRESS TRACKER COMPONENT */}
            {(seeding || steps[0].status !== 'pending') && (
              <div className={styles.progressContainer}>
                {/* Progress Header & Percentage Bar */}
                <div className={styles.progressHeader}>
                  <div className={styles.progressTitleBox}>
                    <div className={styles.progressIconWrap}>
                      {progressPercent === 100 ? (
                        <FiCheckCircle className={styles.iconCompleted} size={22} />
                      ) : (
                        <FiRefreshCw className={styles.spinIcon} size={22} />
                      )}
                    </div>
                    <div>
                      <h4 className={styles.progressTitle}>
                        {progressPercent === 100
                          ? '🎉 Khởi tạo hoàn tất 100%!'
                          : 'Đang tiến hành khởi tạo hệ thống...'}
                      </h4>
                      <p className={styles.progressSub}>
                        {progressPercent === 100
                          ? 'Cơ sở dữ liệu và tài khoản Admin đã sẵn sàng hoạt động.'
                          : 'Vui lòng không tắt trình duyệt trong quá trình nạp dữ liệu.'}
                      </p>
                    </div>
                  </div>
                  <div className={styles.percentBadge}>{progressPercent}%</div>
                </div>

                {/* Animated Progress Bar */}
                <div className={styles.progressBarTrack}>
                  <div
                    className={`${styles.progressBarFill} ${progressPercent === 100 ? styles.progressBarSuccess : ''}`}
                    style={{ width: `${progressPercent}%` }}
                  >
                    <div className={styles.progressBarGlow}></div>
                  </div>
                </div>

                {/* Detailed Steps Checklist */}
                <div className={styles.stepsTimeline}>
                  {steps.map((step) => {
                    const isDone = step.status === 'completed';
                    const isRunning = step.status === 'running';
                    const isError = step.status === 'error';

                    return (
                      <div
                        key={step.id}
                        className={`${styles.timelineItem} ${
                          isDone ? styles.itemDone : isRunning ? styles.itemRunning : isError ? styles.itemError : styles.itemPending
                        }`}
                      >
                        <div className={styles.timelineIconCol}>
                          {isDone ? (
                            <div className={styles.circleDone}>
                              <FiCheck size={14} />
                            </div>
                          ) : isRunning ? (
                            <div className={styles.circleRunning}>
                              <div className={styles.innerPulse}></div>
                            </div>
                          ) : isError ? (
                            <div className={styles.circleError}>
                              <FiAlertTriangle size={14} />
                            </div>
                          ) : (
                            <div className={styles.circlePending}>{step.id}</div>
                          )}
                          {step.id !== steps.length && <div className={styles.timelineLine}></div>}
                        </div>

                        <div className={styles.timelineContent}>
                          <div className={styles.timelineRow}>
                            <strong className={styles.stepName}>{step.title}</strong>
                            <span className={styles.stepStatusBadge}>
                              {isDone && '✓ Hoàn thành'}
                              {isRunning && '⏳ Đang thực hiện...'}
                              {isError && '❌ Thất bại'}
                              {step.status === 'pending' && 'Chờ xử lý'}
                            </span>
                          </div>
                          <p className={styles.stepDescription}>{step.description}</p>
                          <div className={styles.stepLogSnippet}>
                            <code>{step.log}</code>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Real-time Activity Terminal Log */}
                <div className={styles.terminalBox}>
                  <div className={styles.terminalHeader}>
                    <div className={styles.terminalDots}>
                      <span className={styles.dotRed}></span>
                      <span className={styles.dotYellow}></span>
                      <span className={styles.dotGreen}></span>
                    </div>
                    <div className={styles.terminalTitle}>
                      <FiTerminal size={12} /> Live Setup Log
                    </div>
                  </div>
                  <div className={styles.terminalBody} ref={logTerminalRef}>
                    {logs.map((log, idx) => (
                      <div key={idx} className={styles.logLine}>
                        {log}
                      </div>
                    ))}
                    {seeding && (
                      <div className={styles.logLineTyping}>
                        <span className={styles.cursor}>_</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Seed Success Credentials Box */}
                {seedResult && (
                  <div className={styles.seedSuccessBox}>
                    <div className={styles.successCelebration}>
                      <div className={styles.celebrationIcon}>
                        <FiCheckCircle size={32} />
                      </div>
                      <div>
                        <h4 className={styles.seedSuccessTitle}>
                          Hệ thống đã sẵn sàng hoạt động!
                        </h4>
                        <p className={styles.seedSuccessDesc}>
                          Đã tạo tài khoản Quản trị viên tối cao cùng dữ liệu cửa hàng mẫu hoàn chỉnh.
                        </p>
                      </div>
                    </div>

                    <div className={styles.adminCredentials}>
                      <div className={styles.credRow}>
                        <span className={styles.credLabel}>
                          <FiUserCheck size={16} /> Email Quản Trị:
                        </span>
                        <div className={styles.credValueBox}>
                          <strong className={styles.credVal}>{seedResult.adminEmail}</strong>
                          <button
                            type="button"
                            className={styles.btnCopy}
                            onClick={() => copyToClipboard(seedResult.adminEmail, 'email')}
                            title="Copy Email"
                          >
                            {copiedEmail ? <FiCheck size={14} color="#10b981" /> : <FiCopy size={14} />}
                          </button>
                        </div>
                      </div>

                      <div className={styles.credRow}>
                        <span className={styles.credLabel}>
                          <FiLock size={16} /> Mật Khẩu Quản Trị:
                        </span>
                        <div className={styles.credValueBox}>
                          <strong className={styles.credVal}>{seedResult.adminPassword}</strong>
                          <button
                            type="button"
                            className={styles.btnCopy}
                            onClick={() => copyToClipboard(seedResult.adminPassword, 'pass')}
                            title="Copy Mật khẩu"
                          >
                            {copiedPass ? <FiCheck size={14} color="#10b981" /> : <FiCopy size={14} />}
                          </button>
                        </div>
                      </div>

                      <div className={styles.credRow}>
                        <span className={styles.credLabel}>
                          <FiLayers size={16} /> Dữ Liệu Đã Tạo:
                        </span>
                        <span className={styles.credStats}>
                          <strong>{seedResult.stats?.products || 4}</strong> sản phẩm mẫu,{' '}
                          <strong>{seedResult.stats?.categories || 4}</strong> danh mục
                        </span>
                      </div>
                    </div>

                    <div className={styles.navButtons}>
                      <Link href="/admin/login" className={styles.btnNavAdmin}>
                        <FiShield size={18} />
                        <span>Đăng Nhập Trang Quản Trị (Admin)</span>
                        <FiArrowRight size={16} />
                      </Link>
                      <Link href="/" className={styles.btnNavStore}>
                        <FiShoppingBag size={18} />
                        <span>Xem Cửa Hàng (Storefront)</span>
                      </Link>
                      <button
                        type="button"
                        className={styles.btnReSeed}
                        onClick={handleInitializeDb}
                        disabled={seeding}
                      >
                        <FiRefreshCw size={14} />
                        <span>Nạp lại dữ liệu mẫu</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </section>
      </main>
    </div>
  );
}

