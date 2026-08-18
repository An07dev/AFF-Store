const http = require('http');

const BASE_URL = 'http://localhost:3000';

async function request(path, options = {}) {
  return new Promise((resolve, reject) => {
    const url = new URL(path, BASE_URL);
    const reqOptions = {
      method: options.method || 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...(options.headers || {}),
      },
    };

    const req = http.request(url, reqOptions, (res) => {
      let body = '';
      res.on('data', (chunk) => (body += chunk));
      res.on('end', () => {
        try {
          const parsed = JSON.parse(body);
          resolve({ status: res.statusCode, data: parsed });
        } catch (e) {
          resolve({ status: res.statusCode, raw: body });
        }
      });
    });

    req.on('error', reject);
    if (options.body) {
      req.write(JSON.stringify(options.body));
    }
    req.end();
  });
}

async function runE2ETests() {
  console.log('====================================================');
  console.log('🚀 STARTING COMPREHENSIVE ADMIN E2E TEST SUITE');
  console.log('====================================================\n');

  let passed = 0;
  let failed = 0;

  function assert(condition, testName, details = '') {
    if (condition) {
      console.log(`  ✅ PASS: ${testName}`);
      passed++;
    } else {
      console.error(`  ❌ FAIL: ${testName} - ${details}`);
      failed++;
    }
  }

  try {
    // 1. Auth Login API
    console.log('[1/9] Testing Auth & Admin Security API...');
    const loginRes = await request('/api/auth/login', {
      method: 'POST',
      body: { email: 'admin@shoptik.vn', password: 'admin123' },
    });
    assert(loginRes.status === 200 && loginRes.data.success && loginRes.data.token, 'Admin Login (POST /api/auth/login)');
    const token = loginRes.data?.token;

    // 1.2 Auth Me
    const meRes = await request('/api/auth/me', {
      headers: { Authorization: `Bearer ${token}` },
    });
    assert(meRes.status === 200 && meRes.data.user?.role === 'admin', 'Verify Current Admin (GET /api/auth/me)');

    // 2. Dashboard Reports API
    console.log('\n[2/9] Testing Dashboard & Reports API...');
    const report7Days = await request('/api/reports?period=7days');
    assert(
      report7Days.status === 200 &&
      report7Days.data.success &&
      typeof report7Days.data.data.totalRevenue === 'number' &&
      Array.isArray(report7Days.data.data.revenueByDate) &&
      typeof report7Days.data.data.ordersByStatus === 'object',
      'Dashboard Reports (GET /api/reports?period=7days)'
    );

    const reportMonth = await request('/api/reports?period=thisMonth');
    assert(reportMonth.status === 200 && reportMonth.data.success, 'Dashboard Reports (GET /api/reports?period=thisMonth)');

    // 3. Categories Management API
    console.log('\n[3/9] Testing Categories API (Mục 3)...');
    const getCatsRes = await request('/api/categories');
    assert(getCatsRes.status === 200 && Array.isArray(getCatsRes.data.data), 'List Categories (GET /api/categories)');
    const categoryCount = getCatsRes.data.data.length;

    // Create test category
    const createCatRes = await request('/api/categories', {
      method: 'POST',
      body: {
        name: 'Danh Mục Test E2E ' + Date.now(),
        description: 'Mô tả test tự động',
        order: 99,
        isActive: true,
      },
    });
    assert(createCatRes.status === 201 && createCatRes.data.success, 'Create Category (POST /api/categories)');
    const testCatId = createCatRes.data?.data?._id;

    // Update test category
    if (testCatId) {
      const updateCatRes = await request(`/api/categories/${testCatId}`, {
        method: 'PUT',
        body: { name: 'Danh Mục Test E2E (Đã Sửa)', order: 100 },
      });
      assert(updateCatRes.status === 200 && updateCatRes.data.success, 'Update Category (PUT /api/categories/[id])');
    }

    // 4. Products Management API
    console.log('\n[4/9] Testing Products API (Mục 2)...');
    const getProdsRes = await request('/api/products?page=1&limit=10&status=all&sort=newest');
    assert(
      getProdsRes.status === 200 &&
      getProdsRes.data.success &&
      Array.isArray(getProdsRes.data.data) &&
      getProdsRes.data.pagination,
      'List Products with Filters (GET /api/products)'
    );

    // Create test product
    const createProdRes = await request('/api/products', {
      method: 'POST',
      body: {
        name: 'Sản Phẩm Test E2E ' + Date.now(),
        price: 350000,
        salePrice: 280000,
        category: testCatId || getCatsRes.data.data[0]?._id,
        images: ['https://images.unsplash.com/photo-1581655353564-df123a1eb820?w=600'],
        stock: 50,
        isFeatured: true,
        status: 'active',
        description: 'Mô tả sản phẩm test tự động',
        variants: [
          { color: 'Đen', size: 'L', stock: 25, price: 280000 },
          { color: 'Trắng', size: 'XL', stock: 25, price: 280000 },
        ],
      },
    });
    assert(createProdRes.status === 201 && createProdRes.data.success, 'Create Product (POST /api/products)');
    const testProdId = createProdRes.data?.data?._id;

    // View product details
    if (testProdId) {
      const viewProdRes = await request(`/api/products/${testProdId}`);
      assert(viewProdRes.status === 200 && viewProdRes.data.success, 'View Product Details (GET /api/products/[id])');

      // Update product
      const updateProdRes = await request(`/api/products/${testProdId}`, {
        method: 'PUT',
        body: { price: 360000, salePrice: 290000, stock: 45 },
      });
      assert(updateProdRes.status === 200 && updateProdRes.data.success, 'Update Product (PUT /api/products/[id])');
    }

    // 5. Orders Management API
    console.log('\n[5/9] Testing Orders API (Mục 5)...');
    const getOrdersRes = await request('/api/orders?page=1&limit=10&status=all');
    assert(
      getOrdersRes.status === 200 &&
      getOrdersRes.data.success &&
      Array.isArray(getOrdersRes.data.data),
      'List Orders (GET /api/orders)'
    );

    // Create a new Order
    const createOrderRes = await request('/api/orders', {
      method: 'POST',
      body: {
        customer: {
          name: 'Khách Hàng Test E2E',
          phone: '0999888777',
          email: 'test_e2e@shoptik.vn',
          address: '100 Nguyễn Huệ, Phường Bến Nghé, Quận 1, TP. Hồ Chí Minh',
          province: 'TP. Hồ Chí Minh',
          district: 'Quận 1',
          ward: 'Phường Bến Nghé',
        },
        items: [
          {
            productId: testProdId,
            name: 'Sản Phẩm Test E2E',
            price: 290000,
            quantity: 1,
            image: 'https://images.unsplash.com/photo-1581655353564-df123a1eb820?w=600',
            variant: { color: 'Đen', size: 'L' },
          },
        ],
        subtotal: 290000,
        shippingFee: 22000,
        discountAmount: 0,
        totalAmount: 312000,
        paymentMethod: 'bank_transfer',
        notes: 'Đơn hàng tự động test E2E',
      },
    });
    assert(createOrderRes.status === 201 && createOrderRes.data.success, 'Create Order (POST /api/orders)');
    const testOrderId = createOrderRes.data?.data?._id;
    const testOrderCode = createOrderRes.data?.data?.orderCode;

    // View Order Detail
    if (testOrderId) {
      const viewOrderRes = await request(`/api/orders/${testOrderId}`);
      assert(viewOrderRes.status === 200 && viewOrderRes.data.success, 'View Order Details (GET /api/orders/[id])');

      // Update Order Status
      const updateOrderRes = await request(`/api/orders/${testOrderId}`, {
        method: 'PUT',
        body: { status: 'confirmed' },
      });
      assert(updateOrderRes.status === 200 && updateOrderRes.data.success, 'Update Order Status (PUT /api/orders/[id])');
    }

    // 6. Payment & Webhook SePay API
    console.log('\n[6/9] Testing Payment Polling & Webhook SePay API (Mục 9)...');
    if (testOrderCode) {
      // 6.1 Check payment status before
      const checkBefore = await request(`/api/payment/status?code=${testOrderCode}`);
      assert(checkBefore.status === 200 && checkBefore.data.data.isPaid === false, 'Check Unpaid Status (GET /api/payment/status)');

      // 6.2 Trigger Webhook SePay
      const sepayRes = await request('/api/webhooks/sepay', {
        method: 'POST',
        body: {
          id: 998822,
          gateway: 'MBBank',
          transactionDate: '2026-08-18 12:00:00',
          accountNumber: '0988123456',
          transferType: 'in',
          transferAmount: 312000,
          content: `Thanh toan don hang ${testOrderCode}`,
          referenceCode: `FT_TEST_${Date.now()}`,
        },
      });
      assert(sepayRes.status === 200 && sepayRes.data.success, 'Trigger Webhook SePay (POST /api/webhooks/sepay)');

      // 6.3 Check payment status after webhook
      const checkAfter = await request(`/api/payment/status?code=${testOrderCode}`);
      assert(checkAfter.status === 200 && checkAfter.data.data.isPaid === true, 'Realtime Payment Status Verified (PAID)');
    }

    // 7. Customers CRM API
    console.log('\n[7/9] Testing Customers CRM API (Mục 6)...');
    const getCustRes = await request('/api/customers?page=1&limit=10');
    assert(getCustRes.status === 200 && Array.isArray(getCustRes.data.data), 'List Customers (GET /api/customers)');

    // Create test customer
    const createCustRes = await request('/api/customers', {
      method: 'POST',
      body: {
        name: 'Khách Hàng CRM Test ' + Date.now(),
        phone: '0988' + Math.floor(Math.random() * 900000 + 100000),
        email: 'crm_test@shoptik.vn',
        address: '12 Lê Duẩn, Hải Châu, Đà Nẵng',
      },
    });
    assert(createCustRes.status === 201 && createCustRes.data.success, 'Create Customer (POST /api/customers)');
    const testCustId = createCustRes.data?.data?._id;

    if (testCustId) {
      const viewCustRes = await request(`/api/customers/${testCustId}`);
      assert(viewCustRes.status === 200 && viewCustRes.data.success && Array.isArray(viewCustRes.data.data.orders), 'View Customer Profile & Orders History (GET /api/customers/[id])');

      const updateCustRes = await request(`/api/customers/${testCustId}`, {
        method: 'PUT',
        body: { name: 'Khách Hàng CRM Test (Đã Cập Nhật)' },
      });
      assert(updateCustRes.status === 200 && updateCustRes.data.success, 'Update Customer (PUT /api/customers/[id])');
    }

    // 8. Shipping Management API
    console.log('\n[8/9] Testing Shipping 3 Carriers API (Mục 8)...');
    const shipConfigRes = await request('/api/shipping/config');
    assert(shipConfigRes.status === 200 && shipConfigRes.data.success, 'Get Shipping Config (GET /api/shipping/config)');

    const calcShipRes = await request('/api/shipping/calculate', {
      method: 'POST',
      body: {
        province: 'Hà Nội',
        district: 'Quận Cầu Giấy',
        weight: 500,
        orderValue: 450000,
      },
    });
    assert(
      calcShipRes.status === 200 &&
      calcShipRes.data.success &&
      calcShipRes.data.data.ghn &&
      calcShipRes.data.data.ghtk &&
      calcShipRes.data.data.viettelpost,
      'Compare 3 Shipping Carriers (POST /api/shipping/calculate)'
    );

    const testShipRes = await request('/api/shipping/test', {
      method: 'POST',
      body: { provider: 'ghn' },
    });
    assert(testShipRes.status === 200 && testShipRes.data.success, 'Test Carrier Connection (POST /api/shipping/test)');

    // 9. Theme & Settings API
    console.log('\n[9/9] Testing Theme & Settings API (Mục 1)...');
    const getThemeRes = await request('/api/settings/theme');
    assert(
      getThemeRes.status === 200 &&
      getThemeRes.data.success &&
      (getThemeRes.data.data.themeName || getThemeRes.data.data.preset || getThemeRes.data.data.pageTitles),
      'Get Theme Config (GET /api/settings/theme)'
    );

    const updateThemeRes = await request('/api/settings/theme', {
      method: 'POST',
      body: { themeName: 'emerald-luxury', mode: 'dark' },
    });
    assert(updateThemeRes.status === 200 && updateThemeRes.data.success, 'Update Theme (POST /api/settings/theme)');

    // Clean up test data
    console.log('\n🧹 Cleaning up test records...');
    if (testProdId) await request(`/api/products/${testProdId}`, { method: 'DELETE' });
    if (testCatId) await request(`/api/categories/${testCatId}`, { method: 'DELETE' });
    if (testCustId) await request(`/api/customers/${testCustId}`, { method: 'DELETE' });
    if (testOrderId) await request(`/api/orders/${testOrderId}`, { method: 'DELETE' });
    console.log('✓ Cleaned up temporary test records');

    console.log('\n====================================================');
    console.log(`📊 E2E TEST SUMMARY: ${passed} PASSED, ${failed} FAILED`);
    console.log('====================================================');
    process.exit(failed > 0 ? 1 : 0);
  } catch (error) {
    console.error('Fatal Test Error:', error);
    process.exit(1);
  }
}

runE2ETests();
