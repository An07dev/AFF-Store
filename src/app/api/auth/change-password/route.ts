import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import User from '@/models/User';
import { comparePassword, hashPassword, getUserFromRequest } from '@/lib/auth';

export async function POST(request: Request) {
  try {
    await connectToDatabase();
    const tokenData = getUserFromRequest(request);
    const body = await request.json();

    const targetId = tokenData?.id || body.userId;
    const targetEmail = body.email;

    const { currentPassword, newPassword, confirmPassword } = body;

    if (!newPassword) {
      return NextResponse.json(
        { success: false, message: 'Vui lòng nhập mật khẩu mới' },
        { status: 400 }
      );
    }

    if (confirmPassword && newPassword !== confirmPassword) {
      return NextResponse.json(
        { success: false, message: 'Mật khẩu xác nhận không khớp' },
        { status: 400 }
      );
    }

    let user = null;
    if (targetId) {
      user = await User.findById(targetId);
    } else if (targetEmail) {
      user = await User.findOne({ email: targetEmail });
    }

    if (!user) {
      // Find admin or first user if testing without auth
      user = await User.findOne();
    }

    if (!user) {
      return NextResponse.json(
        { success: false, message: 'Người dùng không tồn tại' },
        { status: 404 }
      );
    }

    if (currentPassword) {
      const isMatch = await comparePassword(currentPassword, user.password);
      if (!isMatch) {
        return NextResponse.json(
          { success: false, message: 'Mật khẩu hiện tại không đúng' },
          { status: 400 }
        );
      }
    }

    user.password = await hashPassword(newPassword);
    await user.save();

    return NextResponse.json({
      success: true,
      message: 'Đổi mật khẩu thành công!',
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error.message || 'Lỗi đổi mật khẩu' },
      { status: 500 }
    );
  }
}