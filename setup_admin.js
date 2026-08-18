const fs = require('fs');
const path = require('path');

const basePath = path.join(__dirname, 'src/app');

const files = {
  // 1. Layout
  'admin/layout.tsx': `'use client';
import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { FiHome, FiPackage, FiShoppingCart, FiUsers, FiBarChart2, FiTruck, FiTarget, FiSettings, FiMenu, FiBell, FiUser } from 'react-icons/fi';
import styles from './layout.module.css';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const pathname = usePathname();

  const menuItems = [
    { name: 'Dashboard', icon: FiHome, path: '/admin' },
    { name: 'Sản phẩm', icon: FiPackage, path: '/admin/products' },
    { name: 'Đơn hàng', icon: FiShoppingCart, path: '/admin/orders' },
    { name: 'Khách hàng', icon: FiUsers, path: '/admin/customers' },
    { name: 'Báo cáo', icon: FiBarChart2, path: '/admin/reports' },
    { name: 'Vận chuyển', icon: FiTruck, path: '/admin/shipping' },
    { name: 'Marketing', icon: FiTarget, path: '/admin/marketing' },
    { name: 'Cài đặt', icon: FiSettings, path: '/admin/settings' },
  ];

  return (
    <div className={\`admin-theme \${styles.adminLayout}\`}>
      <aside className={\`\${styles.sidebar} \${sidebarOpen ? styles.sidebarOpen : ''}\`}>
        <div className={styles.sidebarHeader}>
          <h2>ShopTik Admin</h2>
        </div>
        <nav className={styles.sidebarNav}>
          {menuItems.map((item) => {
            const isActive = pathname === item.path || pathname.startsWith(item.path + '/');
            return (
              <Link key={item.path} href={item.path} className={\`\${styles.menuItem} \${isActive ? styles.active : ''}\`}>
                <item.icon className={styles.icon} />
                <span>{item.name}</span>
              </Link>
            );
          })}
        </nav>
      </aside>
      <div className={styles.mainContent}>
        <header className={styles.header}>
          <button className={styles.menuToggle} onClick={() => setSidebarOpen(!sidebarOpen)}>
            <FiMenu />
          </button>
          <div className={styles.headerRight}>
            <button className={styles.iconButton}>
              <FiBell />
            </button>
            <div className={styles.userInfo}>
              <FiUser className={styles.userIcon} />
              <span>Admin</span>
            </div>
          </div>
        </header>
        <main className={styles.content}>
          {children}
        </main>
      </div>
      {sidebarOpen && <div className={styles.overlay} onClick={() => setSidebarOpen(false)}></div>}
    </div>
  );
}
`,
  'admin/layout.module.css': `.adminLayout {
  display: flex;
  min-height: 100vh;
  background-color: var(--admin-bg, #0f1117);
  color: var(--admin-text, #f3f4f6);
  font-family: system-ui, -apple-system, sans-serif;
}

.sidebar {
  width: 260px;
  background-color: var(--admin-card, #1a1d27);
  border-right: 1px solid var(--admin-border, #2d3343);
  display: flex;
  flex-direction: column;
  transition: transform 0.3s ease;
  z-index: 100;
}

.sidebarHeader {
  height: 64px;
  display: flex;
  align-items: center;
  padding: 0 24px;
  border-bottom: 1px solid var(--admin-border, #2d3343);
}

.sidebarHeader h2 {
  font-size: 1.25rem;
  font-weight: 700;
  color: var(--admin-accent, #3b82f6);
  margin: 0;
}

.sidebarNav {
  padding: 16px 0;
  flex: 1;
  overflow-y: auto;
}

.menuItem {
  display: flex;
  align-items: center;
  padding: 12px 24px;
  color: var(--admin-text-muted, #9ca3af);
  text-decoration: none;
  transition: all 0.2s ease;
}

.menuItem:hover, .menuItem.active {
  color: var(--admin-text, #f3f4f6);
  background-color: rgba(59, 130, 246, 0.1);
}

.menuItem.active {
  border-right: 3px solid var(--admin-accent, #3b82f6);
}

.icon {
  margin-right: 12px;
  font-size: 1.25rem;
}

.mainContent {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-width: 0;
}

.header {
  height: 64px;
  background-color: var(--admin-card, #1a1d27);
  border-bottom: 1px solid var(--admin-border, #2d3343);
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 24px;
}

.menuToggle {
  background: none;
  border: none;
  color: var(--admin-text, #f3f4f6);
  font-size: 1.5rem;
  cursor: pointer;
  display: none;
}

.headerRight {
  display: flex;
  align-items: center;
  gap: 16px;
}

.iconButton {
  background: none;
  border: none;
  color: var(--admin-text-muted, #9ca3af);
  font-size: 1.25rem;
  cursor: pointer;
}

.iconButton:hover {
  color: var(--admin-text, #f3f4f6);
}

.userInfo {
  display: flex;
  align-items: center;
  gap: 8px;
  font-weight: 500;
}

.userIcon {
  font-size: 1.25rem;
}

.content {
  padding: 24px;
  flex: 1;
  overflow-y: auto;
}

@media (max-width: 768px) {
  .sidebar {
    position: fixed;
    top: 0;
    left: 0;
    bottom: 0;
    transform: translateX(-100%);
  }
  
  .sidebarOpen {
    transform: translateX(0);
  }

  .menuToggle {
    display: block;
  }

  .overlay {
    position: fixed;
    inset: 0;
    background: rgba(0, 0, 0, 0.5);
    z-index: 90;
  }
}
`,

  // 2. Dashboard
  'admin/page.tsx': `'use client';
import React, { useState } from 'react';
import { FiDollarSign, FiShoppingCart, FiUsers, FiPercent } from 'react-icons/fi';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, BarElement, ArcElement, Title, Tooltip, Legend, Filler } from 'chart.js';
import { Line, Doughnut } from 'react-chartjs-2';
import styles from './page.module.css';
import Link from 'next/link';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, BarElement, ArcElement, Title, Tooltip, Legend, Filler);

export default function Dashboard() {
  const [chartPeriod, setChartPeriod] = useState('7');

  const lineChartData = {
    labels: ['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'],
    datasets: [
      {
        label: 'Doanh thu',
        data: [12000000, 19000000, 15000000, 25000000, 22000000, 30000000, 28000000],
        borderColor: '#3b82f6',
        backgroundColor: 'rgba(59, 130, 246, 0.2)',
        fill: true,
      },
    ],
  };

  const doughnutData = {
    labels: ['Chờ xác nhận', 'Đang xử lý', 'Đang giao', 'Đã giao', 'Đã hủy'],
    datasets: [{
      data: [12, 19, 15, 45, 5],
      backgroundColor: ['#eab308', '#a855f7', '#06b6d4', '#22c55e', '#ef4444'],
      borderWidth: 0,
    }],
  };

  return (
    <div className={styles.dashboard}>
      <h1 className={styles.pageTitle}>Tổng quan</h1>
      
      <div className={styles.statsGrid}>
        <div className={styles.statCard}>
          <div className={styles.statIcon} style={{ background: 'rgba(59, 130, 246, 0.1)', color: '#3b82f6' }}><FiDollarSign /></div>
          <div className={styles.statInfo}>
            <p className={styles.statLabel}>Doanh thu hôm nay</p>
            <h3 className={styles.statValue}>15.420.000 ₫</h3>
            <span className={\`\${styles.trend} \${styles.trendUp}\`}>+12.5%</span>
          </div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statIcon} style={{ background: 'rgba(34, 197, 94, 0.1)', color: '#22c55e' }}><FiShoppingCart /></div>
          <div className={styles.statInfo}>
            <p className={styles.statLabel}>Đơn hàng mới</p>
            <h3 className={styles.statValue}>45</h3>
            <span className={\`\${styles.trend} \${styles.trendUp}\`}>+5.2%</span>
          </div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statIcon} style={{ background: 'rgba(168, 85, 247, 0.1)', color: '#a855f7' }}><FiUsers /></div>
          <div className={styles.statInfo}>
            <p className={styles.statLabel}>Khách hàng mới</p>
            <h3 className={styles.statValue}>12</h3>
            <span className={\`\${styles.trend} \${styles.trendDown}\`}>-2.1%</span>
          </div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statIcon} style={{ background: 'rgba(234, 179, 8, 0.1)', color: '#eab308' }}><FiPercent /></div>
          <div className={styles.statInfo}>
            <p className={styles.statLabel}>Tỷ lệ chuyển đổi</p>
            <h3 className={styles.statValue}>3.2%</h3>
            <span className={\`\${styles.trend} \${styles.trendUp}\`}>+0.4%</span>
          </div>
        </div>
      </div>

      <div className={styles.chartsGrid}>
        <div className={styles.chartCard}>
          <div className={styles.cardHeader}>
            <h3>Biểu đồ doanh thu</h3>
            <select value={chartPeriod} onChange={(e) => setChartPeriod(e.target.value)} className={styles.select}>
              <option value="7">7 ngày qua</option>
              <option value="30">30 ngày qua</option>
            </select>
          </div>
          <div className={styles.chartContainer}>
            <Line data={lineChartData} options={{ maintainAspectRatio: false, responsive: true }} />
          </div>
        </div>
        
        <div className={styles.chartCard}>
          <div className={styles.cardHeader}>
            <h3>Trạng thái đơn hàng</h3>
          </div>
          <div className={styles.chartContainer}>
            <Doughnut data={doughnutData} options={{ maintainAspectRatio: false, responsive: true }} />
          </div>
        </div>
      </div>

      <div className={styles.tablesGrid}>
        <div className={styles.card}>
          <div className={styles.cardHeader}>
            <h3>Đơn hàng gần đây</h3>
            <Link href="/admin/orders" className={styles.link}>Xem tất cả</Link>
          </div>
          <div className={styles.tableResponsive}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Mã đơn</th>
                  <th>Khách hàng</th>
                  <th>Tổng tiền</th>
                  <th>Trạng thái</th>
                  <th>Ngày</th>
                </tr>
              </thead>
              <tbody>
                {[1,2,3,4,5].map(i => (
                  <tr key={i} className={styles.clickableRow}>
                    <td>#ORD-{2000+i}</td>
                    <td>Nguyễn Văn A</td>
                    <td>1.250.000 ₫</td>
                    <td><span className={\`\${styles.badge} \${styles.badgeSuccess}\`}>Đã giao</span></td>
                    <td>20/10/2023</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
        
        <div className={styles.card}>
          <div className={styles.cardHeader}>
            <h3>Sản phẩm bán chạy</h3>
          </div>
          <div className={styles.productList}>
            {[1,2,3,4,5].map(i => (
              <div key={i} className={styles.productItem}>
                <div className={styles.productImg}></div>
                <div className={styles.productInfo}>
                  <h4>Áo thun nam cao cấp {i}</h4>
                  <p>Đã bán: 12{i}</p>
                </div>
                <div className={styles.productRevenue}>
                  12.000.000 ₫
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
`,
  'admin/page.module.css': `.pageTitle { margin-top: 0; margin-bottom: 24px; font-size: 1.5rem; font-weight: 600; }
.statsGrid { display: grid; grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); gap: 24px; margin-bottom: 24px; }
.statCard { background: var(--admin-card); padding: 24px; border-radius: 8px; display: flex; align-items: center; border: 1px solid var(--admin-border); }
.statIcon { width: 48px; height: 48px; border-radius: 8px; display: flex; align-items: center; justify-content: center; font-size: 24px; margin-right: 16px; }
.statInfo { flex: 1; }
.statLabel { margin: 0; font-size: 0.875rem; color: var(--admin-text-muted); }
.statValue { margin: 4px 0 0; font-size: 1.5rem; font-weight: 600; }
.trend { font-size: 0.875rem; font-weight: 500; }
.trendUp { color: #22c55e; }
.trendDown { color: #ef4444; }
.chartsGrid { display: grid; grid-template-columns: 2fr 1fr; gap: 24px; margin-bottom: 24px; }
.chartCard { background: var(--admin-card); padding: 24px; border-radius: 8px; border: 1px solid var(--admin-border); }
.cardHeader { display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px; }
.cardHeader h3 { margin: 0; font-size: 1.125rem; }
.chartContainer { height: 300px; position: relative; }
.select { background: var(--admin-bg); color: var(--admin-text); border: 1px solid var(--admin-border); padding: 6px 12px; border-radius: 4px; }
.tablesGrid { display: grid; grid-template-columns: 2fr 1fr; gap: 24px; }
.card { background: var(--admin-card); padding: 24px; border-radius: 8px; border: 1px solid var(--admin-border); }
.link { color: var(--admin-accent); text-decoration: none; font-size: 0.875rem; }
.tableResponsive { overflow-x: auto; }
.table { width: 100%; border-collapse: collapse; text-align: left; }
.table th { padding: 12px; color: var(--admin-text-muted); border-bottom: 1px solid var(--admin-border); font-weight: 500; }
.table td { padding: 12px; border-bottom: 1px solid var(--admin-border); }
.clickableRow { cursor: pointer; transition: background 0.2s; }
.clickableRow:hover { background: rgba(255,255,255,0.02); }
.badge { padding: 4px 8px; border-radius: 999px; font-size: 0.75rem; font-weight: 500; }
.badgeSuccess { background: rgba(34, 197, 94, 0.1); color: #22c55e; }
.productList { display: flex; flex-direction: column; gap: 16px; }
.productItem { display: flex; align-items: center; gap: 12px; }
.productImg { width: 48px; height: 48px; background: var(--admin-bg); border-radius: 4px; border: 1px solid var(--admin-border); }
.productInfo { flex: 1; }
.productInfo h4 { margin: 0 0 4px; font-size: 0.875rem; }
.productInfo p { margin: 0; font-size: 0.75rem; color: var(--admin-text-muted); }
.productRevenue { font-weight: 500; font-size: 0.875rem; }
@media (max-width: 1024px) { .chartsGrid, .tablesGrid { grid-template-columns: 1fr; } }
`,

  // 3. Products
  'admin/products/page.tsx': `'use client';
import React from 'react';
import Link from 'next/link';
import { FiPlus, FiSearch, FiEdit2, FiTrash2 } from 'react-icons/fi';
import styles from './page.module.css';

export default function ProductsPage() {
  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <h1 className={styles.title}>Quản lý sản phẩm</h1>
        <Link href="/admin/products/new" className={styles.btnPrimary}>
          <FiPlus /> Thêm sản phẩm
        </Link>
      </div>

      <div className={styles.card}>
        <div className={styles.filters}>
          <div className={styles.searchBox}>
            <FiSearch className={styles.searchIcon} />
            <input type="text" placeholder="Tìm kiếm sản phẩm..." className={styles.searchInput} />
          </div>
          <select className={styles.select}>
            <option value="">Tất cả danh mục</option>
            <option value="áo">Áo</option>
            <option value="quần">Quần</option>
          </select>
          <select className={styles.select}>
            <option value="">Trạng thái</option>
            <option value="active">Đang bán</option>
            <option value="hidden">Đã ẩn</option>
          </select>
        </div>

        <div className={styles.tableResponsive}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th><input type="checkbox" /></th>
                <th>Ảnh</th>
                <th>Tên sản phẩm</th>
                <th>Giá</th>
                <th>Giá sale</th>
                <th>Tồn kho</th>
                <th>Đã bán</th>
                <th>Trạng thái</th>
                <th>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {[1,2,3].map(i => (
                <tr key={i}>
                  <td><input type="checkbox" /></td>
                  <td><div className={styles.thumbnail}></div></td>
                  <td>Sản phẩm mẫu {i}</td>
                  <td>250.000 ₫</td>
                  <td>199.000 ₫</td>
                  <td>50</td>
                  <td>12</td>
                  <td>
                    <label className={styles.switch}>
                      <input type="checkbox" defaultChecked />
                      <span className={styles.slider}></span>
                    </label>
                  </td>
                  <td>
                    <div className={styles.actions}>
                      <Link href={\`/admin/products/\${i}/edit\`} className={styles.actionBtn}><FiEdit2 /></Link>
                      <button className={\`\${styles.actionBtn} \${styles.danger}\`}><FiTrash2 /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
`,
  'admin/products/page.module.css': `.page { display: flex; flex-direction: column; gap: 24px; }
.header { display: flex; justify-content: space-between; align-items: center; }
.title { margin: 0; font-size: 1.5rem; }
.btnPrimary { display: flex; align-items: center; gap: 8px; background: var(--admin-accent, #3b82f6); color: white; padding: 8px 16px; border-radius: 6px; text-decoration: none; font-weight: 500; border: none; cursor: pointer; }
.btnPrimary:hover { opacity: 0.9; }
.card { background: var(--admin-card); border-radius: 8px; border: 1px solid var(--admin-border); overflow: hidden; }
.filters { display: flex; gap: 16px; padding: 16px; border-bottom: 1px solid var(--admin-border); flex-wrap: wrap; }
.searchBox { position: relative; flex: 1; min-width: 200px; }
.searchIcon { position: absolute; left: 12px; top: 50%; transform: translateY(-50%); color: var(--admin-text-muted); }
.searchInput { width: 100%; background: var(--admin-bg); border: 1px solid var(--admin-border); color: var(--admin-text); padding: 8px 12px 8px 36px; border-radius: 6px; outline: none; }
.searchInput:focus { border-color: var(--admin-accent); }
.select { background: var(--admin-bg); border: 1px solid var(--admin-border); color: var(--admin-text); padding: 8px 12px; border-radius: 6px; outline: none; }
.tableResponsive { overflow-x: auto; }
.table { width: 100%; border-collapse: collapse; text-align: left; }
.table th, .table td { padding: 12px 16px; border-bottom: 1px solid var(--admin-border); }
.table th { color: var(--admin-text-muted); font-weight: 500; background: rgba(0,0,0,0.2); }
.thumbnail { width: 40px; height: 40px; background: var(--admin-bg); border-radius: 4px; border: 1px solid var(--admin-border); }
.switch { position: relative; display: inline-block; width: 44px; height: 24px; }
.switch input { opacity: 0; width: 0; height: 0; }
.slider { position: absolute; cursor: pointer; top: 0; left: 0; right: 0; bottom: 0; background-color: var(--admin-border); transition: .4s; border-radius: 24px; }
.slider:before { position: absolute; content: ""; height: 18px; width: 18px; left: 3px; bottom: 3px; background-color: white; transition: .4s; border-radius: 50%; }
input:checked + .slider { background-color: var(--admin-accent); }
input:checked + .slider:before { transform: translateX(20px); }
.actions { display: flex; gap: 8px; }
.actionBtn { background: none; border: none; color: var(--admin-text-muted); cursor: pointer; font-size: 1rem; padding: 4px; border-radius: 4px; }
.actionBtn:hover { color: var(--admin-text); background: rgba(255,255,255,0.1); }
.danger:hover { color: #ef4444; }
`,
  'admin/products/new/page.tsx': `'use client';
import React from 'react';
import Link from 'next/link';
import { FiArrowLeft, FiUploadCloud } from 'react-icons/fi';
import styles from './page.module.css';

export default function NewProductPage() {
  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <div className={styles.titleGroup}>
          <Link href="/admin/products" className={styles.backBtn}><FiArrowLeft /></Link>
          <h1 className={styles.title}>Thêm sản phẩm mới</h1>
        </div>
        <div className={styles.actions}>
          <button className={styles.btnSecondary}>Lưu nháp</button>
          <button className={styles.btnPrimary}>Đăng sản phẩm</button>
        </div>
      </div>

      <div className={styles.grid}>
        <div className={styles.mainCol}>
          <div className={styles.card}>
            <h3>Thông tin cơ bản</h3>
            <div className={styles.formGroup}>
              <label>Tên sản phẩm</label>
              <input type="text" className={styles.input} placeholder="Nhập tên sản phẩm..." />
            </div>
            <div className={styles.formGroup}>
              <label>Mô tả</label>
              <textarea className={styles.textarea} rows={6} placeholder="Mô tả sản phẩm..."></textarea>
            </div>
          </div>

          <div className={styles.card}>
            <h3>Hình ảnh</h3>
            <div className={styles.uploadArea}>
              <FiUploadCloud className={styles.uploadIcon} />
              <p>Kéo thả hình ảnh vào đây hoặc click để tải lên</p>
            </div>
          </div>

          <div className={styles.card}>
            <h3>Biến thể</h3>
            <button className={styles.btnSecondary}>+ Thêm nhóm biến thể</button>
          </div>
        </div>

        <div className={styles.sideCol}>
          <div className={styles.card}>
            <h3>Trạng thái</h3>
            <div className={styles.formGroup}>
              <label className={styles.checkboxLabel}>
                <input type="checkbox" defaultChecked /> Kích hoạt
              </label>
              <label className={styles.checkboxLabel}>
                <input type="checkbox" /> Sản phẩm nổi bật
              </label>
            </div>
          </div>

          <div className={styles.card}>
            <h3>Phân loại</h3>
            <div className={styles.formGroup}>
              <label>Danh mục</label>
              <select className={styles.select}>
                <option>Chọn danh mục...</option>
              </select>
            </div>
            <div className={styles.formGroup}>
              <label>Tags</label>
              <input type="text" className={styles.input} placeholder="Tag1, Tag2..." />
            </div>
          </div>

          <div className={styles.card}>
            <h3>Giá & Tồn kho</h3>
            <div className={styles.formGroup}>
              <label>Giá gốc (₫)</label>
              <input type="number" className={styles.input} />
            </div>
            <div className={styles.formGroup}>
              <label>Giá khuyến mãi (₫)</label>
              <input type="number" className={styles.input} />
            </div>
            <div className={styles.formGroup}>
              <label>Tồn kho</label>
              <input type="number" className={styles.input} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
`,
  'admin/products/new/page.module.css': `.page { display: flex; flex-direction: column; gap: 24px; }
.header { display: flex; justify-content: space-between; align-items: center; }
.titleGroup { display: flex; align-items: center; gap: 16px; }
.backBtn { color: var(--admin-text-muted); font-size: 1.5rem; text-decoration: none; display: flex; align-items: center; }
.backBtn:hover { color: var(--admin-text); }
.title { margin: 0; font-size: 1.5rem; }
.actions { display: flex; gap: 12px; }
.btnSecondary { background: var(--admin-card); border: 1px solid var(--admin-border); color: var(--admin-text); padding: 8px 16px; border-radius: 6px; cursor: pointer; font-weight: 500; }
.btnSecondary:hover { background: rgba(255,255,255,0.05); }
.btnPrimary { background: var(--admin-accent); border: 1px solid var(--admin-accent); color: white; padding: 8px 16px; border-radius: 6px; cursor: pointer; font-weight: 500; }
.grid { display: grid; grid-template-columns: 2fr 1fr; gap: 24px; }
.mainCol { display: flex; flex-direction: column; gap: 24px; }
.sideCol { display: flex; flex-direction: column; gap: 24px; }
.card { background: var(--admin-card); border: 1px solid var(--admin-border); border-radius: 8px; padding: 24px; }
.card h3 { margin: 0 0 16px; font-size: 1.125rem; }
.formGroup { margin-bottom: 16px; display: flex; flex-direction: column; gap: 8px; }
.formGroup label { font-size: 0.875rem; font-weight: 500; color: var(--admin-text-muted); }
.input, .textarea, .select { width: 100%; background: var(--admin-bg); border: 1px solid var(--admin-border); color: var(--admin-text); padding: 10px 12px; border-radius: 6px; outline: none; font-family: inherit; }
.input:focus, .textarea:focus, .select:focus { border-color: var(--admin-accent); }
.uploadArea { border: 2px dashed var(--admin-border); border-radius: 8px; padding: 40px; text-align: center; color: var(--admin-text-muted); cursor: pointer; transition: all 0.2s; }
.uploadArea:hover { border-color: var(--admin-accent); color: var(--admin-text); background: rgba(59,130,246,0.05); }
.uploadIcon { font-size: 3rem; margin-bottom: 12px; }
.checkboxLabel { display: flex; align-items: center; gap: 8px; cursor: pointer; color: var(--admin-text); }
@media (max-width: 1024px) { .grid { grid-template-columns: 1fr; } }
`,
  'admin/products/[id]/edit/page.tsx': `'use client';
import { useParams } from 'next/navigation';
import NewProductPage from '../../new/page';

export default function EditProductPage() {
  const params = useParams();
  const id = params.id as string;
  // This would fetch and pass data to the form
  return <NewProductPage />;
}
`,

  // 4. Orders
  'admin/orders/page.tsx': `'use client';
import React from 'react';
import Link from 'next/link';
import { FiSearch, FiEye } from 'react-icons/fi';
import styles from './page.module.css';

export default function OrdersPage() {
  const tabs = ['Tất cả', 'Chờ xác nhận', 'Đang xử lý', 'Đang giao', 'Đã giao', 'Đã hủy'];

  return (
    <div className={styles.page}>
      <h1 className={styles.title}>Quản lý đơn hàng</h1>
      
      <div className={styles.card}>
        <div className={styles.tabs}>
          {tabs.map((tab, i) => (
            <button key={i} className={\`\${styles.tab} \${i===0 ? styles.activeTab : ''}\`}>{tab}</button>
          ))}
        </div>
        
        <div className={styles.filters}>
          <div className={styles.searchBox}>
            <FiSearch className={styles.searchIcon} />
            <input type="text" placeholder="Tìm theo mã đơn, SĐT..." className={styles.searchInput} />
          </div>
          <input type="date" className={styles.dateInput} />
        </div>

        <div className={styles.tableResponsive}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Mã đơn</th>
                <th>Khách hàng</th>
                <th>Sản phẩm</th>
                <th>Tổng tiền</th>
                <th>Trạng thái</th>
                <th>Ngày tạo</th>
                <th>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {[1,2,3,4,5].map(i => (
                <tr key={i}>
                  <td className={styles.bold}>#ORD-200{i}</td>
                  <td>Nguyễn Văn B<br/><span className={styles.textMuted}>0901234567</span></td>
                  <td>3 sản phẩm</td>
                  <td className={styles.bold}>850.000 ₫</td>
                  <td><span className={\`\${styles.badge} \${styles.badgePending}\`}>Chờ xác nhận</span></td>
                  <td>21/10/2023</td>
                  <td>
                    <Link href={\`/admin/orders/\${i}\`} className={styles.actionBtn}><FiEye /></Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
`,
  'admin/orders/page.module.css': `.page { display: flex; flex-direction: column; gap: 24px; }
.title { margin: 0; font-size: 1.5rem; }
.card { background: var(--admin-card); border-radius: 8px; border: 1px solid var(--admin-border); overflow: hidden; }
.tabs { display: flex; border-bottom: 1px solid var(--admin-border); overflow-x: auto; }
.tab { background: none; border: none; padding: 16px 24px; color: var(--admin-text-muted); cursor: pointer; font-weight: 500; white-space: nowrap; border-bottom: 2px solid transparent; }
.tab:hover { color: var(--admin-text); }
.activeTab { color: var(--admin-accent); border-bottom-color: var(--admin-accent); }
.filters { display: flex; gap: 16px; padding: 16px; border-bottom: 1px solid var(--admin-border); }
.searchBox { position: relative; flex: 1; }
.searchIcon { position: absolute; left: 12px; top: 50%; transform: translateY(-50%); color: var(--admin-text-muted); }
.searchInput { width: 100%; background: var(--admin-bg); border: 1px solid var(--admin-border); color: var(--admin-text); padding: 8px 12px 8px 36px; border-radius: 6px; outline: none; }
.dateInput { background: var(--admin-bg); border: 1px solid var(--admin-border); color: var(--admin-text); padding: 8px 12px; border-radius: 6px; outline: none; }
.tableResponsive { overflow-x: auto; }
.table { width: 100%; border-collapse: collapse; text-align: left; }
.table th, .table td { padding: 12px 16px; border-bottom: 1px solid var(--admin-border); }
.table th { color: var(--admin-text-muted); font-weight: 500; background: rgba(0,0,0,0.2); }
.bold { font-weight: 600; }
.textMuted { color: var(--admin-text-muted); font-size: 0.875rem; }
.badge { padding: 4px 10px; border-radius: 999px; font-size: 0.75rem; font-weight: 600; }
.badgePending { background: rgba(234, 179, 8, 0.1); color: #eab308; }
.actionBtn { color: var(--admin-text-muted); padding: 6px; border-radius: 4px; display: inline-flex; transition: all 0.2s; }
.actionBtn:hover { color: var(--admin-accent); background: rgba(59, 130, 246, 0.1); }
`,
  'admin/orders/[id]/page.tsx': `'use client';
import React from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { FiArrowLeft, FiCheck, FiTruck, FiUser, FiMapPin, FiPackage } from 'react-icons/fi';
import styles from './page.module.css';

export default function OrderDetailPage() {
  const params = useParams();
  const id = params.id as string;

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <div className={styles.titleGroup}>
          <Link href="/admin/orders" className={styles.backBtn}><FiArrowLeft /></Link>
          <h1 className={styles.title}>Đơn hàng #ORD-{id}</h1>
          <span className={\`\${styles.badge} \${styles.badgePending}\`}>Chờ xác nhận</span>
        </div>
        <div className={styles.actions}>
          <button className={styles.btnDanger}>Hủy đơn</button>
          <button className={styles.btnPrimary}><FiCheck /> Xác nhận đơn</button>
        </div>
      </div>

      <div className={styles.timeline}>
        <div className={\`\${styles.step} \${styles.stepActive}\`}>
          <div className={styles.stepIcon}>1</div>
          <div className={styles.stepText}>Chờ xác nhận</div>
        </div>
        <div className={styles.step}>
          <div className={styles.stepIcon}>2</div>
          <div className={styles.stepText}>Đang xử lý</div>
        </div>
        <div className={styles.step}>
          <div className={styles.stepIcon}>3</div>
          <div className={styles.stepText}>Đang giao</div>
        </div>
        <div className={styles.step}>
          <div className={styles.stepIcon}>4</div>
          <div className={styles.stepText}>Đã giao</div>
        </div>
      </div>

      <div className={styles.grid}>
        <div className={styles.mainCol}>
          <div className={styles.card}>
            <h3>Sản phẩm (<FiPackage className={styles.inlineIcon}/> 2)</h3>
            <div className={styles.productList}>
              {[1,2].map(i => (
                <div key={i} className={styles.productItem}>
                  <div className={styles.productImg}></div>
                  <div className={styles.productInfo}>
                    <h4>Áo thun nam {i}</h4>
                    <p className={styles.textMuted}>Size: L | Màu: Đen</p>
                  </div>
                  <div className={styles.productPrice}>
                    <p>250.000 ₫ x 1</p>
                    <strong>250.000 ₫</strong>
                  </div>
                </div>
              ))}
            </div>
            <div className={styles.summary}>
              <div className={styles.summaryRow}><span>Tạm tính:</span><span>500.000 ₫</span></div>
              <div className={styles.summaryRow}><span>Phí vận chuyển:</span><span>30.000 ₫</span></div>
              <div className={styles.summaryRow}><span>Giảm giá:</span><span>0 ₫</span></div>
              <div className={\`\${styles.summaryRow} \${styles.totalRow}\`}><span>Tổng cộng:</span><span>530.000 ₫</span></div>
            </div>
          </div>
        </div>

        <div className={styles.sideCol}>
          <div className={styles.card}>
            <h3><FiUser className={styles.inlineIcon}/> Khách hàng</h3>
            <p className={styles.infoText}><strong>Nguyễn Văn B</strong></p>
            <p className={styles.infoText}>0901234567</p>
            <p className={styles.infoText}>nguyenvanb@example.com</p>
          </div>
          
          <div className={styles.card}>
            <h3><FiMapPin className={styles.inlineIcon}/> Địa chỉ giao hàng</h3>
            <p className={styles.infoText}>123 Đường ABC</p>
            <p className={styles.infoText}>Phường X, Quận Y</p>
            <p className={styles.infoText}>TP. Hồ Chí Minh</p>
          </div>

          <div className={styles.card}>
            <h3><FiTruck className={styles.inlineIcon}/> Vận chuyển</h3>
            <p className={styles.textMuted}>Chưa có thông tin vận chuyển.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
`,
  'admin/orders/[id]/page.module.css': `.page { display: flex; flex-direction: column; gap: 24px; }
.header { display: flex; justify-content: space-between; align-items: center; }
.titleGroup { display: flex; align-items: center; gap: 16px; }
.backBtn { color: var(--admin-text-muted); font-size: 1.5rem; text-decoration: none; display: flex; align-items: center; }
.title { margin: 0; font-size: 1.5rem; }
.badge { padding: 4px 10px; border-radius: 999px; font-size: 0.875rem; font-weight: 600; }
.badgePending { background: rgba(234, 179, 8, 0.1); color: #eab308; }
.actions { display: flex; gap: 12px; }
.btnPrimary { display: flex; align-items: center; gap: 8px; background: var(--admin-accent); color: white; border: none; padding: 8px 16px; border-radius: 6px; cursor: pointer; font-weight: 500; }
.btnDanger { background: transparent; border: 1px solid #ef4444; color: #ef4444; padding: 8px 16px; border-radius: 6px; cursor: pointer; font-weight: 500; }
.timeline { display: flex; justify-content: space-between; background: var(--admin-card); border: 1px solid var(--admin-border); border-radius: 8px; padding: 24px; position: relative; }
.timeline::before { content: ""; position: absolute; top: 36px; left: 60px; right: 60px; height: 2px; background: var(--admin-border); z-index: 0; }
.step { position: relative; z-index: 1; display: flex; flex-direction: column; align-items: center; gap: 12px; flex: 1; }
.stepIcon { width: 28px; height: 28px; border-radius: 50%; background: var(--admin-bg); border: 2px solid var(--admin-border); display: flex; align-items: center; justify-content: center; font-weight: 600; color: var(--admin-text-muted); }
.stepText { font-size: 0.875rem; color: var(--admin-text-muted); font-weight: 500; }
.stepActive .stepIcon { border-color: var(--admin-accent); background: var(--admin-accent); color: white; }
.stepActive .stepText { color: var(--admin-accent); }
.grid { display: grid; grid-template-columns: 2fr 1fr; gap: 24px; }
.mainCol, .sideCol { display: flex; flex-direction: column; gap: 24px; }
.card { background: var(--admin-card); border: 1px solid var(--admin-border); border-radius: 8px; padding: 24px; }
.card h3 { margin: 0 0 16px; font-size: 1.125rem; display: flex; align-items: center; gap: 8px; }
.inlineIcon { color: var(--admin-text-muted); }
.productList { display: flex; flex-direction: column; gap: 16px; border-bottom: 1px solid var(--admin-border); padding-bottom: 16px; margin-bottom: 16px; }
.productItem { display: flex; gap: 16px; align-items: center; }
.productImg { width: 64px; height: 64px; background: var(--admin-bg); border: 1px solid var(--admin-border); border-radius: 6px; }
.productInfo { flex: 1; }
.productInfo h4 { margin: 0 0 4px; }
.textMuted { color: var(--admin-text-muted); font-size: 0.875rem; margin: 0; }
.productPrice { text-align: right; }
.productPrice p { margin: 0 0 4px; color: var(--admin-text-muted); font-size: 0.875rem; }
.summaryRow { display: flex; justify-content: space-between; margin-bottom: 8px; color: var(--admin-text-muted); }
.totalRow { font-size: 1.125rem; font-weight: 600; color: var(--admin-text); border-top: 1px solid var(--admin-border); padding-top: 16px; margin-top: 8px; }
.infoText { margin: 0 0 8px; }
@media (max-width: 768px) { .grid { grid-template-columns: 1fr; } .timeline::before { display: none; } }
`,

  // 5. Customers
  'admin/customers/page.tsx': `'use client';
import React from 'react';
import Link from 'next/link';
import { FiSearch, FiDownload } from 'react-icons/fi';
import styles from './page.module.css';

export default function CustomersPage() {
  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <h1 className={styles.title}>Quản lý khách hàng (CRM)</h1>
        <button className={styles.btnSecondary}><FiDownload /> Xuất dữ liệu</button>
      </div>

      <div className={styles.card}>
        <div className={styles.filters}>
          <div className={styles.searchBox}>
            <FiSearch className={styles.searchIcon} />
            <input type="text" placeholder="Tìm theo tên, SĐT, Email..." className={styles.searchInput} />
          </div>
        </div>

        <div className={styles.tableResponsive}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Khách hàng</th>
                <th>Liên hệ</th>
                <th>Số đơn</th>
                <th>Tổng chi tiêu</th>
                <th>Tags</th>
                <th>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {[1,2,3].map(i => (
                <tr key={i}>
                  <td>
                    <div className={styles.customerName}>Trần Văn {i}</div>
                    <div className={styles.textMuted}>Đăng ký: 10/10/2023</div>
                  </td>
                  <td>
                    <div>098765432{i}</div>
                    <div className={styles.textMuted}>tranvan{i}@gmail.com</div>
                  </td>
                  <td>{i * 3}</td>
                  <td className={styles.bold}>{i * 1250000} ₫</td>
                  <td><span className={styles.tag}>VIP</span></td>
                  <td><Link href={\`/admin/customers/\${i}\`} className={styles.link}>Chi tiết</Link></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
`,
  'admin/customers/page.module.css': `.page { display: flex; flex-direction: column; gap: 24px; }
.header { display: flex; justify-content: space-between; align-items: center; }
.title { margin: 0; font-size: 1.5rem; }
.btnSecondary { display: flex; align-items: center; gap: 8px; background: var(--admin-card); border: 1px solid var(--admin-border); color: var(--admin-text); padding: 8px 16px; border-radius: 6px; cursor: pointer; font-weight: 500; }
.card { background: var(--admin-card); border-radius: 8px; border: 1px solid var(--admin-border); overflow: hidden; }
.filters { padding: 16px; border-bottom: 1px solid var(--admin-border); }
.searchBox { position: relative; max-width: 400px; }
.searchIcon { position: absolute; left: 12px; top: 50%; transform: translateY(-50%); color: var(--admin-text-muted); }
.searchInput { width: 100%; background: var(--admin-bg); border: 1px solid var(--admin-border); color: var(--admin-text); padding: 8px 12px 8px 36px; border-radius: 6px; outline: none; }
.tableResponsive { overflow-x: auto; }
.table { width: 100%; border-collapse: collapse; text-align: left; }
.table th, .table td { padding: 12px 16px; border-bottom: 1px solid var(--admin-border); }
.table th { color: var(--admin-text-muted); font-weight: 500; background: rgba(0,0,0,0.2); }
.customerName { font-weight: 600; }
.textMuted { color: var(--admin-text-muted); font-size: 0.875rem; margin-top: 4px; }
.bold { font-weight: 600; }
.tag { background: rgba(168, 85, 247, 0.1); color: #a855f7; padding: 4px 8px; border-radius: 4px; font-size: 0.75rem; font-weight: 600; }
.link { color: var(--admin-accent); text-decoration: none; font-weight: 500; }
`,
  'admin/customers/[id]/page.tsx': `'use client';
import { useParams } from 'next/navigation';
import styles from './page.module.css';

export default function CustomerDetailPage() {
  const params = useParams();
  const id = params.id as string;
  return (
    <div className={styles.page}>
      <h1>Chi tiết khách hàng #{id}</h1>
      <p>Content goes here. Same pattern as others.</p>
    </div>
  );
}
`,
  'admin/customers/[id]/page.module.css': `.page { display: flex; flex-direction: column; gap: 24px; }`,

  // 6. Reports
  'admin/reports/page.tsx': `'use client';
import React from 'react';
import styles from './page.module.css';

export default function ReportsPage() {
  return (
    <div className={styles.page}>
      <h1>Báo cáo</h1>
      <p>Report charts and data...</p>
    </div>
  );
}
`,
  'admin/reports/page.module.css': `.page { display: flex; flex-direction: column; gap: 24px; }`,

  // 7. Shipping
  'admin/shipping/page.tsx': `'use client';
import React from 'react';
import styles from './page.module.css';

export default function ShippingPage() {
  return (
    <div className={styles.page}>
      <h1>Vận chuyển</h1>
      <div className={styles.card}>
        <h3>Cấu hình API Giao Hàng</h3>
        <p>GHTK, GHN, ViettelPost config inputs...</p>
      </div>
    </div>
  );
}
`,
  'admin/shipping/page.module.css': `.page { display: flex; flex-direction: column; gap: 24px; }
.card { background: var(--admin-card); border-radius: 8px; padding: 24px; border: 1px solid var(--admin-border); }
`,

  // 8. Marketing
  'admin/marketing/page.tsx': `'use client';
import React from 'react';
import styles from './page.module.css';

export default function MarketingPage() {
  return (
    <div className={styles.page}>
      <h1>Marketing & Tracking</h1>
      <div className={styles.card}>
        <h3>Facebook Pixel & TikTok Pixel</h3>
        <p>Config inputs for marketing tags...</p>
      </div>
    </div>
  );
}
`,
  'admin/marketing/page.module.css': `.page { display: flex; flex-direction: column; gap: 24px; }
.card { background: var(--admin-card); border-radius: 8px; padding: 24px; border: 1px solid var(--admin-border); }
`,

  // 9. Settings
  'admin/settings/page.tsx': `'use client';
import React from 'react';
import styles from './page.module.css';

export default function SettingsPage() {
  return (
    <div className={styles.page}>
      <h1>Cài đặt cửa hàng</h1>
      <div className={styles.card}>
        <h3>Thông tin chung</h3>
        <p>Shop name, logo, address...</p>
      </div>
    </div>
  );
}
`,
  'admin/settings/page.module.css': `.page { display: flex; flex-direction: column; gap: 24px; }
.card { background: var(--admin-card); border-radius: 8px; padding: 24px; border: 1px solid var(--admin-border); }
`,

  // 10. Login
  'login/page.tsx': `'use client';
import React from 'react';
import styles from './page.module.css';

export default function LoginPage() {
  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <h2 className={styles.title}>ShopTik Admin</h2>
        <form className={styles.form}>
          <div className={styles.inputGroup}>
            <label>Email</label>
            <input type="email" className={styles.input} placeholder="admin@shoptik.com" />
          </div>
          <div className={styles.inputGroup}>
            <label>Mật khẩu</label>
            <input type="password" className={styles.input} placeholder="••••••••" />
          </div>
          <button type="button" className={styles.btn}>Đăng nhập</button>
        </form>
      </div>
    </div>
  );
}
`,
  'login/page.module.css': `.container { min-height: 100vh; display: flex; align-items: center; justify-content: center; background: #0f1117; }
.card { background: #1a1d27; padding: 40px; border-radius: 12px; width: 100%; max-width: 400px; border: 1px solid #2d3343; }
.title { color: #f3f4f6; text-align: center; margin-top: 0; margin-bottom: 32px; font-size: 1.75rem; }
.form { display: flex; flex-direction: column; gap: 20px; }
.inputGroup { display: flex; flex-direction: column; gap: 8px; }
.inputGroup label { color: #9ca3af; font-size: 0.875rem; }
.input { background: #0f1117; border: 1px solid #2d3343; color: #f3f4f6; padding: 12px; border-radius: 6px; outline: none; }
.input:focus { border-color: #3b82f6; }
.btn { background: linear-gradient(to right, #3b82f6, #2563eb); color: white; border: none; padding: 12px; border-radius: 6px; font-weight: 600; cursor: pointer; font-size: 1rem; }
.btn:hover { opacity: 0.9; }
`
};

Object.entries(files).forEach(([filePath, content]) => {
  const fullPath = path.join(basePath, filePath);
  fs.mkdirSync(path.dirname(fullPath), { recursive: true });
  fs.writeFileSync(fullPath, content, 'utf-8');
  console.log('Created:', fullPath);
});
