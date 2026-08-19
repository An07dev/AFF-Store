import { getDBShippingConfig } from './configHelper';

// GHN (Giao Hàng Nhanh) Integration
const GHN_API_URL = process.env.GHN_API_URL || 'https://online-gateway.ghn.vn/shiip/public-api';

export async function calculateGHNFee(province: string, district: string, weight = 500) {
  const dbConfig = await getDBShippingConfig();
  const token = dbConfig.carriers.ghn.token || process.env.GHN_TOKEN || '';
  const shopId = dbConfig.carriers.ghn.shopId || process.env.GHN_SHOP_ID || '';

  // If real token is configured, can fetch from GHN fee calculation API
  if (token && shopId && dbConfig.carriers.ghn.enabled) {
    try {
      const res = await fetch(`${GHN_API_URL}/v2/shipping-order/fee`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Token: token,
          ShopId: String(shopId),
        },
        body: JSON.stringify({
          service_type_id: 2, // Standard delivery
          weight,
        }),
      });
      const data = await res.json();
      if (data.code === 200 && data.data?.total) {
        return {
          fee: data.data.total,
          serviceName: 'Giao Nhanh (GHN)',
          estimatedTime: '1 ngày',
        };
      }
    } catch (e) {
      console.error('GHN Real Fee API error, using calculated fallback:', e);
    }
  }

  // Calculated standard rate
  const isInner = province.toLowerCase().includes('hà nội') || province.toLowerCase().includes('hồ chí minh');
  const fee = isInner ? dbConfig.rates.defaultInnerFee : dbConfig.rates.defaultOuterFee;
  return {
    fee,
    serviceName: 'Giao Nhanh (GHN)',
    estimatedTime: isInner ? '1 ngày' : '2-3 ngày',
  };
}

export async function createGHNOrder(orderData: any) {
  const dbConfig = await getDBShippingConfig();
  const token = dbConfig.carriers.ghn.token || process.env.GHN_TOKEN || '';
  const shopId = dbConfig.carriers.ghn.shopId || process.env.GHN_SHOP_ID || '';

  if (token && shopId) {
    try {
      // Normalize payload to GHN requirements
      const payload = {
        payment_type_id: orderData.paymentMethod === 'cod' ? 2 : 1,
        note: orderData.notes || 'Đơn hàng từ ShopTik Store',
        required_note: 'CHOXEMHANGKHONGTHU',
        from_name: 'ShopTik Store',
        from_phone: '0364978796',
        from_address: 'Số 10 Phạm Hùng, Mỹ Đình',
        from_ward_name: 'Mỹ Đình 2',
        from_district_name: 'Nam Từ Liêm',
        from_province_name: 'Hà Nội',
        return_phone: '0364978796',
        return_address: 'Số 10 Phạm Hùng, Mỹ Đình',
        to_name: orderData.customer?.name || orderData.to_name || 'Khách hàng',
        to_phone: orderData.customer?.phone || orderData.to_phone || '0336625074',
        to_address: orderData.customer?.address || orderData.to_address || 'Số 10 Phạm Hùng',
        to_ward_name: orderData.customer?.ward || orderData.to_ward_name || '',
        to_district_name: orderData.customer?.district || orderData.to_district_name || '',
        to_province_name: orderData.customer?.province || orderData.to_province_name || '',
        cod_amount: orderData.paymentMethod === 'cod' ? (orderData.totalAmount || 0) : 0,
        content: `Đơn hàng #${orderData.orderCode || 'ST'}`,
        weight: Number(orderData.weight || 300),
        length: 15,
        width: 10,
        height: 10,
        service_type_id: 2,
        service_id: 0,
        items: (orderData.items || []).map((item: any) => ({
          name: item.name || 'Sản phẩm',
          code: item.productId || 'SP',
          quantity: item.quantity || 1,
          price: item.price || 10000,
          weight: 200,
        })),
      };

      const res = await fetch(`${GHN_API_URL}/v2/shipping-order/create`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Token: token,
          ShopId: String(shopId),
        },
        body: JSON.stringify(payload),
      });
      const result = await res.json();
      if (result.code === 200 && result.data?.order_code) {
        return {
          trackingCode: result.data.order_code,
          fee: result.data.total_fee || 22000,
          expectedDeliveryTime: result.data.expected_delivery_time,
        };
      }
    } catch (e) {
      console.error('GHN Create Order error, falling back:', e);
    }
  }

  const random = Math.floor(1000000000 + Math.random() * 9000000000);
  return {
    trackingCode: `GHN-${random}`,
    fee: 22000,
  };
}

export async function trackGHNOrder(trackingCode: string) {
  const dbConfig = await getDBShippingConfig();
  const token = dbConfig.carriers.ghn.token || process.env.GHN_TOKEN || '';

  if (token) {
    try {
      const res = await fetch(`${GHN_API_URL}/v2/shipping-order/detail`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Token: token,
        },
        body: JSON.stringify({ order_code: trackingCode }),
      });
      const result = await res.json();
      if (result.code === 200 && result.data) {
        return {
          success: true,
          status: result.data.status,
          logs: result.data.log || [],
        };
      }
    } catch (e) {
      console.error('GHN Tracking error:', e);
    }
  }
  return null;
}

export async function cancelGHNOrder(trackingCode: string) {
  const dbConfig = await getDBShippingConfig();
  const token = dbConfig.carriers.ghn.token || process.env.GHN_TOKEN || '';
  const shopId = dbConfig.carriers.ghn.shopId || process.env.GHN_SHOP_ID || '';

  if (token && trackingCode) {
    try {
      const res = await fetch(`${GHN_API_URL}/v2/switch-status/cancel`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Token: token,
          ShopId: String(shopId),
        },
        body: JSON.stringify({ order_codes: [trackingCode] }),
      });
      const result = await res.json();
      return result;
    } catch (e: any) {
      console.error('GHN Cancel Order error:', e.message);
    }
  }
  return null;
}