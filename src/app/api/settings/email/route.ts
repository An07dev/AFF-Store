import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import Setting from '@/models/Setting';
import { defaultEmailSettings, IEmailSettings } from '@/lib/email';

export async function GET() {
  try {
    await connectToDatabase();
    const setting = await Setting.findOne({ key: 'email_settings' });
    const config: IEmailSettings = setting?.value || defaultEmailSettings;

    // Mask password before returning to client for safety
    const safeConfig = {
      ...defaultEmailSettings,
      ...config,
      pass: config.pass ? '••••••••' : '',
    };

    return NextResponse.json({
      success: true,
      data: safeConfig,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error.message || 'Lỗi tải cấu hình email' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    await connectToDatabase();
    const body = await request.json();

    const existing = await Setting.findOne({ key: 'email_settings' });
    const currentVal = existing?.value || defaultEmailSettings;

    // If user left password masked as '••••••••', keep existing password
    let finalPass = body.pass;
    if (finalPass === '••••••••' || !finalPass) {
      finalPass = currentVal.pass || defaultEmailSettings.pass;
    }

    const updatedConfig: IEmailSettings = {
      enabled: body.enabled !== undefined ? !!body.enabled : true,
      host: body.host?.trim() || 'smtp.gmail.com',
      port: Number(body.port) || 465,
      secure: body.port === 465 || !!body.secure,
      user: body.user?.trim() || '',
      pass: finalPass?.trim() || '',
      senderName: body.senderName?.trim() || 'ShopBig Store',
      senderEmail: body.senderEmail?.trim() || body.user?.trim() || '',
      adminNotificationEmail: body.adminNotificationEmail?.trim() || body.user?.trim() || '',
      sendToCustomer: body.sendToCustomer !== undefined ? !!body.sendToCustomer : true,
      sendToAdmin: body.sendToAdmin !== undefined ? !!body.sendToAdmin : true,
    };

    const updated = await Setting.findOneAndUpdate(
      { key: 'email_settings' },
      { value: updatedConfig },
      { upsert: true, new: true }
    );

    return NextResponse.json({
      success: true,
      message: 'Cập nhật cấu hình Email SMTP thành công!',
      data: {
        ...updated.value,
        pass: updated.value.pass ? '••••••••' : '',
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error.message || 'Lỗi lưu cấu hình email' },
      { status: 500 }
    );
  }
}
