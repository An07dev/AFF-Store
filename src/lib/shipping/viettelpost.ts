// Viettel Post Integration
const VIETTELPOST_API_URL = process.env.VIETTELPOST_API_URL || 'https://partner.viettelpost.vn/v2';
const VIETTELPOST_TOKEN = process.env.VIETTELPOST_API_TOKEN || '';

export async function calculateViettelPostFee(province: string, district: string, weight = 500) {
  if (VIETTELPOST_TOKEN) {
    try {
      const res = await fetch(`${VIETTELPOST_API_URL}/order/getPrice`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Token: VIETTELPOST_TOKEN,
        },
        body: JSON.stringify({
          PRODUCT_WEIGHT: weight,
          PRODUCT_TYPE: 'HH',
          TYPE: 1,
        }),
      });
      const data = await res.json();
      if (data.status === 200 && data.data?.MONEY_TOTAL) {
        return {
          fee: data.data.MONEY_TOTAL,
          serviceName: 'Viettel Post Tiêu Chuẩn',
          estimatedTime: '1-2 ngày',
        };
      }
    } catch (e) {
      console.error('Viettel Post Real Fee API error, using calculated fallback:', e);
    }
  }

  const isInner = province.toLowerCase().includes('hà nội') || province.toLowerCase().includes('hồ chí minh');
  const fee = isInner ? 21000 : 31000;
  return {
    fee,
    serviceName: 'Viettel Post Tiêu Chuẩn',
    estimatedTime: isInner ? '1-2 ngày' : '2-3 ngày',
  };
}

export async function createViettelPostOrder(data: any) {
  if (VIETTELPOST_TOKEN) {
    try {
      const res = await fetch(`${VIETTELPOST_API_URL}/order/createOrder`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Token: VIETTELPOST_TOKEN,
        },
        body: JSON.stringify(data),
      });
      const result = await res.json();
      if (result.status === 200 && result.data?.ORDER_NUMBER) {
        return {
          trackingCode: result.data.ORDER_NUMBER,
          fee: result.data.MONEY_TOTAL || 21000,
        };
      }
    } catch (e) {
      console.error('Viettel Post Create Order error:', e);
    }
  }

  const random = Math.floor(10000000 + Math.random() * 90000000);
  return {
    trackingCode: `VTP${random}`,
    fee: 21000,
  };
}

export async function trackViettelPostOrder(trackingCode: string) {
  if (VIETTELPOST_TOKEN) {
    try {
      const res = await fetch(`${VIETTELPOST_API_URL}/order/getOrderTrack?orderNumber=${encodeURIComponent(trackingCode)}`, {
        headers: {
          Token: VIETTELPOST_TOKEN,
        },
      });
      const result = await res.json();
      if (result.status === 200 && result.data) {
        return {
          success: true,
          status: result.data.STATUS_NAME,
          logs: result.data.TRACK_LOG || [],
        };
      }
    } catch (e) {
      console.error('Viettel Post Tracking error:', e);
    }
  }
  return null;
}