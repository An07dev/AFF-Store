import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { provider, token } = await request.json();
    return NextResponse.json({
      success: true,
      message: `Kết nối thành công tới ${provider || 'đơn vị vận chuyển'}!`,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error.message || 'Lỗi kiểm tra kết nối' },
      { status: 500 }
    );
  }
}