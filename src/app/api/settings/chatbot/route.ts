import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import Setting from '@/models/Setting';
import { getChatBotConfig } from '@/lib/ai/chatBotEngine';

export async function GET() {
  try {
    const config = await getChatBotConfig();
    return NextResponse.json({
      success: true,
      data: config,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error.message || 'Lỗi tải cấu hình chatbot' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    await connectToDatabase();
    const body = await request.json();

    const updatedSetting = await Setting.findOneAndUpdate(
      { key: 'chatbot_config' },
      {
        $set: {
          key: 'chatbot_config',
          value: {
            enabled: body.enabled !== false,
            botName: body.botName?.trim() || 'AI Trợ Lý ShopBig',
            welcomeMessage:
              body.welcomeMessage?.trim() ||
              'Dạ chào bạn! Em là Trợ lý AI của shop. Em có thể giúp bạn tư vấn chọn size chuẩn xác, tra cứu đơn hàng hoặc giải đáp chính sách cửa hàng 24/7 ạ!',
            geminiApiKey: body.geminiApiKey?.trim() || '',
          },
        },
      },
      { upsert: true, new: true }
    );

    return NextResponse.json({
      success: true,
      message: 'Cập nhật cấu hình AI Chatbot thành công!',
      data: updatedSetting.value,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error.message || 'Lỗi lưu cấu hình chatbot' },
      { status: 500 }
    );
  }
}
