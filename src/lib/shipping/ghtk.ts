// GHTK (Giao Hàng Tiết Kiệm) Integration
const GHTK_API_URL = process.env.GHTK_API_URL || 'https://services.giaohangtietkiem.vn/services';
const GHTK_TOKEN = process.env.GHTK_API_TOKEN || '';

export async function calculateGHTKFee(province: string, district: string, weight = 500) {
  if (GHTK_TOKEN) {
    try {
      const url = `${GHTK_API_URL}/shipment/fee?province=${encodeURIComponent(province)}&district=${encodeURIComponent(district)}&weight=${weight}`;
      const res = await fetch(url, {
        headers: {
          Token: GHTK_TOKEN,
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
  const fee = isInner ? 20000 : 30000;
  return {
    fee,
    serviceName: 'Giao Hàng Tiết Kiệm (GHTK)',
    estimatedTime: isInner ? '1-2 ngày' : '2-4 ngày',
  };
}

export async function createGHTKOrder(data: any) {
  if (GHTK_TOKEN) {
    try {
      const res = await fetch(`${GHTK_API_URL}/shipment/order/?ver=1.5`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Token: GHTK_TOKEN,
        },
        body: JSON.stringify(data),
      });
      const result = await res.json();
      if (result.success && result.order?.label) {
        return {
          trackingCode: result.order.label,
          fee: result.order.fee || 20000,
        };
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
  if (GHTK_TOKEN) {
    try {
      const res = await fetch(`${GHTK_API_URL}/shipment/v2/${encodeURIComponent(trackingCode)}`, {
        headers: {
          Token: GHTK_TOKEN,
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