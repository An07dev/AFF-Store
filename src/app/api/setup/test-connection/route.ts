import { NextResponse } from 'next/server';
import mongoose from 'mongoose';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const uri = body.uri?.trim();

    if (!uri) {
      return NextResponse.json(
        { success: false, message: 'Vui lòng nhập chuỗi kết nối MongoDB (MONGODB_URI)' },
        { status: 400 }
      );
    }

    if (!uri.startsWith('mongodb://') && !uri.startsWith('mongodb+srv://')) {
      return NextResponse.json(
        { success: false, message: 'Định dạng URI không hợp lệ. Chuỗi phải bắt đầu bằng mongodb:// hoặc mongodb+srv://' },
        { status: 400 }
      );
    }

    // Create a temporary isolated connection to test
    console.log('[Test Connection] Đang kiểm tra kết nối tới URI...');
    const testConn = await mongoose.createConnection(uri, {
      serverSelectionTimeoutMS: 6000,
      connectTimeoutMS: 6000,
    }).asPromise();

    const isConnected = testConn.readyState === 1;
    await testConn.close();

    if (isConnected) {
      return NextResponse.json({
        success: true,
        message: '🎉 Kết nối thành công tới Database! CSDL đã sẵn sàng hoạt động.',
      });
    } else {
      return NextResponse.json(
        { success: false, message: 'Không thể thiết lập kết nối tới cơ sở dữ liệu' },
        { status: 400 }
      );
    }
  } catch (error: any) {
    let msg = error.message || 'Lỗi kết nối cơ sở dữ liệu';
    if (msg.includes('bad auth') || msg.includes('Authentication failed')) {
      msg = 'Sai tên đăng nhập hoặc mật khẩu MongoDB. Vui lòng kiểm tra lại.';
    } else if (msg.includes('whitelist') || msg.includes('ETIMEDOUT') || msg.includes('timed out')) {
      msg = 'Hết thời gian kết nối. Bạn hãy đảm bảo đã mở Network Access (0.0.0.0/0) trên MongoDB Atlas.';
    }
    
    return NextResponse.json(
      { success: false, message: msg },
      { status: 400 }
    );
  }
}
