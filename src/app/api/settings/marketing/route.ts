import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import Setting from '@/models/Setting';
import { IMarketingConfig, defaultMarketingConfig } from '@/types/marketing';

export async function GET() {
  try {
    await connectToDatabase();
    const settingDoc = await Setting.findOne({ key: 'marketing_settings' });

    let config: IMarketingConfig = defaultMarketingConfig;
    if (settingDoc && settingDoc.value) {
      config = {
        ...defaultMarketingConfig,
        ...settingDoc.value,
      };
    }

    return NextResponse.json({
      success: true,
      data: config,
    });
  } catch (error: any) {
    console.error('Error getting marketing config:', error);
    return NextResponse.json(
      { success: false, message: error.message || 'Lỗi khi tải cấu hình Marketing' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    await connectToDatabase();
    const body = await request.json();

    const config: IMarketingConfig = {
      facebookEnabled: Boolean(body.facebookEnabled),
      facebookPixelId: (body.facebookPixelId || '').trim(),
      facebookAccessToken: (body.facebookAccessToken || '').trim(),
      facebookTestEventCode: (body.facebookTestEventCode || '').trim(),

      tiktokEnabled: Boolean(body.tiktokEnabled),
      tiktokPixelId: (body.tiktokPixelId || '').trim(),
      tiktokAccessToken: (body.tiktokAccessToken || '').trim(),
      tiktokTestEventCode: (body.tiktokTestEventCode || '').trim(),

      googleEnabled: Boolean(body.googleEnabled),
      googleAnalyticsId: (body.googleAnalyticsId || '').trim(),
      googleTagManagerId: (body.googleTagManagerId || '').trim(),

      customHeadScripts: body.customHeadScripts || '',
      customBodyScripts: body.customBodyScripts || '',
    };

    await Setting.findOneAndUpdate(
      { key: 'marketing_settings' },
      { key: 'marketing_settings', value: config },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    return NextResponse.json({
      success: true,
      message: 'Cập nhật cấu hình Marketing & Tracking Pixel thành công!',
      data: config,
    });
  } catch (error: any) {
    console.error('Error saving marketing config:', error);
    return NextResponse.json(
      { success: false, message: error.message || 'Lỗi khi lưu cấu hình Marketing' },
      { status: 500 }
    );
  }
}
