import { getDBShippingConfig } from './configHelper';

// GHTK (Giao Hàng Tiết Kiệm) Integration
const GHTK_API_URL = process.env.GHTK_API_URL || 'https://services.giaohangtietkiem.vn/services';

export async function calculateGHTKFee(province: string, district: string, weight = 500) {
  const dbConfig = await getDBShippingConfig();
  const token = dbConfig.carriers.ghtk.token || process.env.GHTK_TOKEN || '';

  if (token && dbConfig.carriers.ghtk.enabled) {
    try {
      const url = `${GHTK_API_URL}/shipment/fee?province=${encodeURIComponent(province)}&district=${encodeURIComponent(district)}&weight=${weight}`;
      const res = await fetch(url, {
        headers: {
          Token: token,
        },
      });
      const data = await res.json();
      if (data.success && data.fee?.fee) {
        return {
          fee: data.fee.fee,
          serviceName: 'Giao Hàng Tiết Kiệm (GHTK)',
          estimatedTime: '1-2 ngày',
        };
      }
    } catch (e) {
      console.error('GHTK Real Fee API error, using calculated fallback:', e);
    }
  }

  const isInner = province.toLowerCase().includes('hà nội') || province.toLowerCase().includes('hồ chí minh');
  const fee = isInner ? dbConfig.rates.defaultInnerFee : dbConfig.rates.defaultOuterFee;
  return {
    fee,
    serviceName: 'Giao Hàng Tiết Kiệm (GHTK)',
    estimatedTime: isInner ? '1-2 ngày' : '2-4 ngày',
  };
}

export async function createGHTKOrder(orderData: any) {
  const dbConfig = await getDBShippingConfig();
  const token = dbConfig.carriers.ghtk.token || process.env.GHTK_TOKEN || '';
  const isSandbox = dbConfig.carriers.ghtk.environment === 'sandbox';
  const apiUrl = isSandbox
    ? 'https://services-dev.giaohangtietkiem.vn/services'
    : GHTK_API_URL;

  if (token) {
    try {
      const rawValue = (orderData.items || []).reduce(
        (sum: number, item: any) => sum + (Number(item.price || 0) * Number(item.quantity || 1)),
        orderData.subtotal || orderData.totalAmount || 100000
      );

      // If already formatted, use directly, otherwise normalize from orderData
      const payload = orderData.order && orderData.products ? orderData : {
        products: (orderData.items || []).map((item: any) => ({
          name: item.name || 'Sản phẩm',
          weight: 0.2,
          quantity: Number(item.quantity) || 1,
          product_code: String(item.productId || 'SP'),
          price: Number(item.price) || 10000,
        })),
        order: {
          id: orderData.orderCode || `ST_${Date.now()}`,
          pick_name: 'ShopBig Store',
          pick_money: orderData.paymentMethod === 'cod' ? (orderData.totalAmount || 0) : 0,
          pick_address: 'Số 10 đường Phạm Hùng',
          pick_province: 'Hà Nội',
          pick_district: 'Quận Nam Từ Liêm',
          pick_ward: 'Phường Mỹ Đình 1',
          pick_tel: '0364978796',
          pick_hamlet: 'Khác',
          name: orderData.customer?.name || orderData.to_name || 'Khách hàng',
          address: orderData.customer?.address || orderData.to_address || 'Địa chỉ nhận',
          province: orderData.customer?.province || orderData.to_province || 'Hà Nội',
          district: orderData.customer?.district || orderData.to_district || 'Quận Ba Đình',
          ward: orderData.customer?.ward || orderData.to_ward || 'Phường Điện Biên',
          hamlet: 'Khác',
          tel: orderData.customer?.phone || orderData.to_phone || '0336625074',
          email: orderData.customer?.email || '',
          is_freeship: '0',
          value: rawValue || 100000,
          transport: 'road',
          note: orderData.notes || 'Cho xem hàng không thử',
        },
      };

      const res = await fetch(`${apiUrl}/shipment/order/?ver=1.5`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Token: token,
        },
        body: JSON.stringify(payload),
      });
      const result = await res.json();
      if (result.success && result.order?.label) {
        return {
          trackingCode: result.order.label,
          fee: result.order.fee || 20000,
          estimatedDeliveryTime: result.order.estimated_deliver_time,
        };
      } else {
        console.error('GHTK Create Order API returned non-success:', result);
      }
    } catch (e) {
      console.error('GHTK Create Order error:', e);
    }
  }

  const random = Math.floor(10000000 + Math.random() * 90000000);
  return {
    trackingCode: `GHTK.${random}`,
    fee: 20000,
  };
}

export async function trackGHTKOrder(trackingCode: string) {
  const dbConfig = await getDBShippingConfig();
  const token = dbConfig.carriers.ghtk.token || process.env.GHTK_TOKEN || '';

  if (token) {
    try {
      const res = await fetch(`${GHTK_API_URL}/shipment/v2/${encodeURIComponent(trackingCode)}`, {
        headers: {
          Token: token,
        },
      });
      const result = await res.json();
      if (result.success && result.order) {
        return {
          success: true,
          status: result.order.status_text,
          logs: result.order.logs || [],
        };
      }
    } catch (e) {
      console.error('GHTK Tracking error:', e);
    }
  }
  return null;
}

export async function cancelGHTKOrder(trackingCode: string) {
  const dbConfig = await getDBShippingConfig();
  const token = dbConfig.carriers.ghtk.token || process.env.GHTK_TOKEN || '';

  if (token && trackingCode) {
    try {
      const res = await fetch(`${GHTK_API_URL}/shipment/cancel/${encodeURIComponent(trackingCode)}`, {
        method: 'POST',
        headers: { Token: token },
      });
      const result = await res.json();
      return result;
    } catch (e: any) {
      console.error('GHTK Cancel Order error:', e.message);
    }
  }
  return null;
}