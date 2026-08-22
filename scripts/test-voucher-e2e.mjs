/**
 * Automated E2E Test Suite for Voucher & Coupon System (No-Login Fast Checkout)
 * Run with: node scripts/test-voucher-e2e.mjs
 */

const BASE_URL = 'http://localhost:3000';

async function runStep(stepName, fn) {
  console.log('\n========================================');
  console.log(`🚀 RUNNING: ${stepName}`);
  console.log('========================================');
  try {
    await fn();
    console.log(`✅ PASSED: ${stepName}`);
  } catch (err) {
    console.error(`❌ FAILED: ${stepName}`);
    console.error(err);
    process.exit(1);
  }
}

async function main() {
  console.log('🔥 STARTING VOUCHER & COUPON E2E TEST SUITE...\n');

  let testVoucherId = null;
  const testVoucherCode = `VOUCHER_${Date.now()}`;
  const testPhone = '0912345678';

  // 1. ADMIN: GET /api/admin/vouchers
  await runStep('ADMIN: GET /api/admin/vouchers', async () => {
    const res = await fetch(`${BASE_URL}/api/admin/vouchers`);
    if (!res.ok) throw new Error(`HTTP Error ${res.status}`);
    const json = await res.json();
    if (!json.success || !Array.isArray(json.data)) throw new Error('Invalid response structure');
    console.log(`   - Existing Vouchers count: ${json.data.length}`);
    console.log(`   - Stats: ${JSON.stringify(json.stats)}`);
  });

  // 2. ADMIN: POST /api/admin/vouchers (Create Test Voucher)
  await runStep('ADMIN: POST /api/admin/vouchers (Create Fixed & Percent Vouchers)', async () => {
    const payload = {
      code: testVoucherCode,
      name: 'Giảm 50.000đ cho đơn từ 200.000đ',
      description: 'Mã giảm giá thử nghiệm tự động E2E',
      discountType: 'fixed',
      discountValue: 50000,
      minOrderValue: 200000,
      totalUsageLimit: 50,
      limitPerCustomer: 1,
      startDate: new Date().toISOString(),
      endDate: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString(),
      isActive: true,
      isPublic: true,
    };

    const res = await fetch(`${BASE_URL}/api/admin/vouchers`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    if (!res.ok) throw new Error(`HTTP Error ${res.status}`);
    const json = await res.json();
    if (!json.success || !json.data) throw new Error(`Create failed: ${json.message}`);
    testVoucherId = json.data._id;
    console.log(`   - Created Voucher Code: ${json.data.code} (ID: ${testVoucherId})`);
    console.log(`   - Discount: ${json.data.discountValue}đ | Min order: ${json.data.minOrderValue}đ`);
  });

  // 3. STOREFRONT: GET /api/vouchers (Public Vouchers)
  await runStep('STOREFRONT: GET /api/vouchers (Public Collection)', async () => {
    const res = await fetch(`${BASE_URL}/api/vouchers`);
    if (!res.ok) throw new Error(`HTTP Error ${res.status}`);
    const json = await res.json();
    if (!json.success || !Array.isArray(json.data)) throw new Error('Failed to fetch public vouchers');
    const found = json.data.find((v) => v.code === testVoucherCode);
    if (!found) throw new Error(`Created voucher ${testVoucherCode} not found in public collection`);
    console.log(`   - Public active vouchers count: ${json.data.length}`);
    console.log(`   - Found newly created voucher in public list: ${found.code} - ${found.name}`);
  });

  // 4. CHECKOUT: POST /api/vouchers/validate (Under minimum spend -> Should reject)
  await runStep('CHECKOUT: POST /api/vouchers/validate (Order subtotal below minimum)', async () => {
    const res = await fetch(`${BASE_URL}/api/vouchers/validate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        code: testVoucherCode,
        orderSubtotal: 150000, // min is 200,000
        phone: testPhone,
      }),
    });

    const json = await res.json();
    if (json.success) throw new Error('Expected validation to fail due to low subtotal, but it succeeded!');
    console.log(`   - Correctly rejected with message: "${json.message}"`);
  });

  // 5. CHECKOUT: POST /api/vouchers/validate (Eligible subtotal -> Should succeed)
  await runStep('CHECKOUT: POST /api/vouchers/validate (Order subtotal eligible)', async () => {
    const res = await fetch(`${BASE_URL}/api/vouchers/validate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        code: testVoucherCode,
        orderSubtotal: 300000,
        phone: testPhone,
      }),
    });

    const json = await res.json();
    if (!json.success || !json.data) throw new Error(`Validation failed: ${json.message}`);
    if (json.data.discountAmount !== 50000) throw new Error(`Wrong discount amount: expected 50000, got ${json.data.discountAmount}`);
    console.log(`   - Validated successfully! Discount Amount: ${json.data.discountAmount}đ`);
  });

  // 6. CHECKOUT: POST /api/orders (Create Order with Voucher)
  let createdOrderCode = null;
  await runStep('CHECKOUT: POST /api/orders (Create Order applying Voucher)', async () => {
    // Get a sample product for order items
    const prodRes = await fetch(`${BASE_URL}/api/products?limit=1`);
    const prodJson = await prodRes.json();
    const sampleProduct = prodJson.data[0];

    const orderPayload = {
      customer: {
        name: 'Nguyễn Văn Voucher Test',
        phone: testPhone,
        email: 'vouchertest@shoptik.vn',
        address: 'Số 99 Cầu Giấy, Hà Nội',
        province: 'Hà Nội',
        district: 'Quận Cầu Giấy',
        ward: 'Phường Dịch Vọng Hậu',
      },
      items: [
        {
          productId: sampleProduct?._id,
          name: sampleProduct?.name || 'Sản phẩm Test Voucher',
          price: 300000,
          quantity: 1,
          image: sampleProduct?.images?.[0] || '/file.svg',
        },
      ],
      subtotal: 300000,
      shippingFee: 0,
      discountAmount: 50000,
      voucherCode: testVoucherCode,
      totalAmount: 250000, // 300K - 50K = 250K
      paymentMethod: 'cod',
    };

    const res = await fetch(`${BASE_URL}/api/orders`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(orderPayload),
    });

    if (!res.ok) throw new Error(`HTTP Error ${res.status}`);
    const json = await res.json();
    if (!json.success || !json.data) throw new Error(`Order creation failed: ${json.message}`);
    createdOrderCode = json.data.orderCode;
    console.log(`   - Order created successfully! Code: ${createdOrderCode}`);
    console.log(`   - Subtotal: ${json.data.subtotal}đ | Discount: ${json.data.voucherDiscount || json.data.discountAmount}đ | Total: ${json.data.totalAmount}đ`);
    console.log(`   - Stored Voucher Code on Order: ${json.data.voucherCode}`);
  });

  // 7. ANTI-ABUSE TEST: Try validating the same voucher again with the same phone
  await runStep('ANTI-ABUSE: Validate voucher again with same phone (Limit 1 per phone)', async () => {
    // Wait 500ms for async order increment
    await new Promise((r) => setTimeout(r, 600));

    const res = await fetch(`${BASE_URL}/api/vouchers/validate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        code: testVoucherCode,
        orderSubtotal: 300000,
        phone: testPhone,
      }),
    });

    const json = await res.json();
    if (json.success) throw new Error('Expected anti-abuse validation to block phone, but it allowed it!');
    console.log(`   - Anti-abuse successfully blocked duplicate usage: "${json.message}"`);
  });

  console.log('\n========================================');
  console.log('🎉 ALL VOUCHER E2E TESTS PASSED 100%! 🎉');
  console.log('========================================\n');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
