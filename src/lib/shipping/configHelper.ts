import connectToDatabase from '@/lib/mongodb';
import Setting from '@/models/Setting';

export interface IDBCarrierConfig {
  carriers: {
    ghn: {
      enabled: boolean;
      token: string;
      shopId: string;
      environment: string;
    };
    ghtk: {
      enabled: boolean;
      token: string;
      partnerId: string;
      environment: string;
    };
    viettelpost: {
      enabled: boolean;
      token: string;
      username: string;
      password?: string;
      environment: string;
    };
  };
  rates: {
    defaultInnerFee: number;
    defaultOuterFee: number;
    freeShippingThreshold: number;
    autoPushOrder: boolean;
  };
}

export const DEFAULT_SHIPPING_CONFIG: IDBCarrierConfig = {
  carriers: {
    ghn: {
      enabled: true,
      token: 'f49c1538-9a10-11f1-98fd-3649f7abce24',
      shopId: '6611723',
      environment: 'production',
    },
    ghtk: {
      enabled: true,
      token: '4NH4Qx1qc4M1FRbYh1o2aRJgwWZH3Hc0xRVdMoG',
      partnerId: 'PARTNER_SHOPTIK_01',
      environment: 'production',
    },
    viettelpost: {
      enabled: true,
      token: '',
      username: 'account.dev.vtp.1786954307276@viettelpost.com',
      password: 'Vtp@1234',
      environment: 'production',
    },
  },
  rates: {
    defaultInnerFee: 22000,
    defaultOuterFee: 32000,
    freeShippingThreshold: 500000,
    autoPushOrder: false,
  },
};

export async function getDBShippingConfig(): Promise<IDBCarrierConfig> {
  try {
    await connectToDatabase();
    const setting = await Setting.findOne({ key: 'shipping_config' });
    if (setting && setting.value) {
      return {
        ...DEFAULT_SHIPPING_CONFIG,
        ...setting.value,
        carriers: {
          ghn: {
            ...DEFAULT_SHIPPING_CONFIG.carriers.ghn,
            ...(setting.value.carriers?.ghn || {}),
          },
          ghtk: {
            ...DEFAULT_SHIPPING_CONFIG.carriers.ghtk,
            ...(setting.value.carriers?.ghtk || {}),
          },
          viettelpost: {
            ...DEFAULT_SHIPPING_CONFIG.carriers.viettelpost,
            ...(setting.value.carriers?.viettelpost || {}),
          },
        },
        rates: {
          ...DEFAULT_SHIPPING_CONFIG.rates,
          ...(setting.value.rates || {}),
        },
      };
    }
  } catch (err) {
    console.error('Error loading shipping config from DB, using defaults:', err);
  }
  return DEFAULT_SHIPPING_CONFIG;
}
