export interface IMarketingConfig {
  facebookEnabled: boolean;
  facebookPixelId: string;
  facebookAccessToken: string;
  facebookTestEventCode: string;

  tiktokEnabled: boolean;
  tiktokPixelId: string;
  tiktokAccessToken: string;
  tiktokTestEventCode: string;

  googleEnabled: boolean;
  googleAnalyticsId: string;
  googleTagManagerId: string;

  customHeadScripts: string;
  customBodyScripts: string;
}

export const defaultMarketingConfig: IMarketingConfig = {
  facebookEnabled: false,
  facebookPixelId: '',
  facebookAccessToken: '',
  facebookTestEventCode: '',

  tiktokEnabled: false,
  tiktokPixelId: '',
  tiktokAccessToken: '',
  tiktokTestEventCode: '',

  googleEnabled: false,
  googleAnalyticsId: '',
  googleTagManagerId: '',

  customHeadScripts: '',
  customBodyScripts: '',
};
