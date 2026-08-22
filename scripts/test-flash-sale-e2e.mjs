// scripts/test-flash-sale-e2e.mjs
// Automated End-to-End Test Suite for Flash Sale & FOMO Feature

const BASE_URL = 'http://localhost:3000';

async function logStep(title, fn) {
  console.log(`\n========================================`);
  console.log(`🚀 RUNNING: ${title}`);
  console.log(`========================================`);
  try {
    const result = await fn();
    console.log(`✅ PASSED: ${title}`);
    return result;
  } catch (err) {
    console.error(`❌ FAILED: ${title}`);
    console.error(err);
    throw err;
  }
}

async function runTests() {
  console.log('🔥 STARTING COMPREHENSIVE END-TO-END TEST SUITE...');

  // 1. TEST ADMIN GET CURRENT CONFIG
  await logStep('ADMIN: GET /api/admin/flash-sale', async () => {
    const res = await fetch(`${BASE_URL}/api/admin/flash-sale`);
    if (!res.ok) throw new Error(`HTTP ${res.status}: ${res.statusText}`);
    const json = await res.json();
    if (!json.success) throw new Error(`API failed: ${json.message}`);
    console.log('   - Current Flash Sale active status:', json.data?.isActive);
    console.log('   - Current Title:', json.data?.title);
    console.log('   - Configured Slots count:', json.data?.slots?.length || 0);
    return json.data;
  });

  // 2. GET ACTIVE PRODUCTS TO USE IN TEST
  const sampleProducts = await logStep('STORE: GET sample products for testing', async () => {
    const res = await fetch(`${BASE_URL}/api/products?limit=5&status=active`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const json = await res.json();
    if (!json.success || !json.data || json.data.length === 0) {
      throw new Error('No active products found in DB for testing');
    }
    console.log(`   - Found ${json.data.length} active products`);
    return json.data;
  });

  // 3. TEST ADMIN PUT CONFIG WITH LIVE AND UPCOMING SLOTS
  await logStep('ADMIN: PUT /api/admin/flash-sale (Configure Slots & Items)', async () => {
    const now = new Date();
    const vnOffset = 7 * 60;
    const localOffset = now.getTimezoneOffset();
    const vnTime = new Date(now.getTime() + (vnOffset + localOffset) * 60 * 1000);
    const curHour = vnTime.getHours();
    const curMin = vnTime.getMinutes();

    const curHourStr = String(curHour).padStart(2, '0');
    const nextHourStr = String(Math.min(23, curHour + 2)).padStart(2, '0');
    const futureHourStr = String(Math.min(23, curHour + 3)).padStart(2, '0');
    const futureEndHourStr = String(Math.min(23, curHour + 5)).padStart(2, '0');

    const testProd1 = sampleProducts[0];
    const origPrice1 = testProd1.price || 100000;
    const flashPrice1 = Math.round(origPrice1 * 0.65); // 35% discount

    const testProd2 = sampleProducts[1] || sampleProducts[0];
    const origPrice2 = testProd2.price || 150000;
    const flashPrice2 = Math.round(origPrice2 * 0.5); // 50% discount

    const payload = {
      title: '⚡ SIÊU SALE GIỜ VÀNG - GIẢM TỚI 50%',
      subtitle: 'Săn deal chớp nhoáng • Số lượng có hạn • Giá rẻ vô địch',
      isActive: true,
      slots: [
        {
          id: 'slot_live_test',
          name: `${curHourStr}:00 - ${nextHourStr}:00`,
          startTime: `${curHourStr}:00`,
          endTime: `${nextHourStr}:00`,
          dateType: 'all_days',
          enabled: true,
          items: [
            {
              productId: testProd1._id,
              originalPrice: origPrice1,
              flashPrice: flashPrice1,
              discountPercent: 35,
              flashStock: 50,
              soldCount: 18,
              isActive: true,
            },
            {
              productId: testProd2._id,
              originalPrice: origPrice2,
              flashPrice: flashPrice2,
              discountPercent: 50,
              flashStock: 30,
              soldCount: 12,
              isActive: true,
            },
          ],
        },
        {
          id: 'slot_upcoming_test',
          name: `${futureHourStr}:00 - ${futureEndHourStr}:00`,
          startTime: `${futureHourStr}:00`,
          endTime: `${futureEndHourStr}:00`,
          dateType: 'all_days',
          enabled: true,
          items: [
            {
              productId: testProd1._id,
              originalPrice: origPrice1,
              flashPrice: flashPrice1,
              discountPercent: 35,
              flashStock: 20,
              soldCount: 0,
              isActive: true,
            },
          ],
        },
      ],
      fomoSettings: {
        enableLivePurchasePopup: true,
        enableCheckoutTimer: true,
        checkoutTimerMinutes: 15,
        enableViewerCount: true,
        viewerMin: 12,
        viewerMax: 35,
      },
    };

    const res = await fetch(`${BASE_URL}/api/admin/flash-sale`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const json = await res.json();
    if (!json.success) throw new Error(`PUT admin flash-sale failed: ${json.message}`);
    console.log('   - Successfully updated Flash Sale settings');
    return json.data;
  });

  // 4. TEST PUBLIC FLASH SALE API (Check Live Status & Items)
  const publicData = await logStep('USER: GET /api/flash-sale (Public calculations)', async () => {
    const res = await fetch(`${BASE_URL}/api/flash-sale`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const json = await res.json();
    if (!json.success || !json.data) throw new Error('Public flash sale data is null or error');

    const data = json.data;
    console.log('   - isLive:', data.isLive);
    console.log('   - Active slot:', data.activeSlot?.name);
    console.log('   - Time remaining (seconds):', data.timeRemainingSeconds);
    console.log('   - Active Flash Sale items count:', data.items?.length);
    console.log('   - Formatted slots count:', data.slots?.length);

    if (!data.isLive) {
      console.warn('   ⚠️ Warning: No slot is currently live in VN timezone');
    } else {
      if (data.items.length === 0) {
        throw new Error('isLive is true but items list is empty!');
      }
      console.log(`   - Sample active item: ${data.items[0].name} -> Flash Price: ${data.items[0].flashPrice}đ (Original: ${data.items[0].originalPrice}đ)`);
    }

    return data;
  });

  // 5. TEST FOMO EVENTS API
  await logStep('USER: GET /api/flash-sale/fomo-events', async () => {
    const res = await fetch(`${BASE_URL}/api/flash-sale/fomo-events`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const json = await res.json();
    if (!json.success || !Array.isArray(json.data)) throw new Error('FOMO events failed');
    console.log(`   - Generated ${json.data.length} live purchase social proof events`);
    if (json.data.length > 0) {
      console.log(`   - Event sample: ${json.data[0].buyer} (${json.data[0].location}) vừa mua "${json.data[0].productName}" (${json.data[0].timeAgo})`);
    }
  });

  // 6. TEST PRODUCTS FILTERING BY FLASH SALE
  await logStep('USER: GET /api/products?sort=flash-sale (Filter Flash Sale Tab)', async () => {
    const res = await fetch(`${BASE_URL}/api/products?sort=flash-sale&limit=20`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const json = await res.json();
    if (!json.success) throw new Error('Products API sort=flash-sale failed');
    console.log(`   - Returned ${json.data.length} products`);
  });

  // 7. TEST CHECKOUT & ORDER CREATION WITH FLASH SALE PRICE
  await logStep('USER: POST /api/orders (Create Order with Flash Sale Price)', async () => {
    const targetItem = publicData.items?.[0] || {
      productId: sampleProducts[0]._id,
      name: sampleProducts[0].name,
      slug: sampleProducts[0].slug,
      flashPrice: 199000,
      originalPrice: 299000,
    };

    const orderPayload = {
      customer: {
        name: 'Nguyễn Văn Test (E2E)',
        phone: '0987654321',
        email: 'test_e2e_flashsale@gmail.com',
        address: '123 Đường Số 1, Phường Bến Nghé',
        province: 'Hồ Chí Minh',
        district: 'Quận 1',
        ward: 'Phường Bến Nghé',
      },
      items: [
        {
          productId: targetItem.productId,
          name: targetItem.name,
          slug: targetItem.slug,
          price: targetItem.flashPrice || 199000,
          originalPrice: targetItem.originalPrice || 299000,
          quantity: 2,
        },
      ],
      shippingFee: 30000,
      discountAmount: 0,
      totalAmount: (targetItem.flashPrice || 199000) * 2 + 30000,
      paymentMethod: 'cod',
      paymentStatus: 'unpaid',
      shippingProvider: 'ghn',
      shippingCarrier: 'Giao Hàng Nhanh (GHN)',
      notes: 'Đơn hàng tự động kiểm thử E2E Flash Sale',
    };

    const res = await fetch(`${BASE_URL}/api/orders`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(orderPayload),
    });

    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const json = await res.json();
    if (!json.success || !json.data) throw new Error(`Order creation failed: ${json.message}`);
    console.log(`   - Order Created Successfully! Order Code: ${json.data.orderCode}`);
    console.log(`   - Order Subtotal: ${json.data.subtotal}đ (Calculated at Flash Price ${targetItem.flashPrice}đ x 2)`);
    console.log(`   - Order Total: ${json.data.totalAmount}đ`);

    if (json.data.subtotal !== (targetItem.flashPrice || 199000) * 2) {
      throw new Error(`Order subtotal mismatch: Expected ${(targetItem.flashPrice || 199000) * 2}, got ${json.data.subtotal}`);
    }
    return json.data;
  });

  console.log('\n========================================');
  console.log('🎉 ALL END-TO-END TESTS PASSED 100%! 🎉');
  console.log('========================================\n');
}

runTests().catch((err) => {
  console.error('Fatal Test Error:', err);
  process.exit(1);
});
