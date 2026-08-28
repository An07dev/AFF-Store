import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import User from '@/models/User';
import Customer from '@/models/Customer';
import { comparePassword, generateToken } from '@/lib/auth';

export async function POST(request: Request) {
  try {
    await connectToDatabase();
    const body = await request.json();
    const identifier = body.identifier || body.email || body.phone;
    const password = body.password;

    if (!identifier || !password) {
      return NextResponse.json(
        { success: false, message: 'Vui lòng nhập đầy đủ thông tin đăng nhập' },
        { status: 400 }
      );
    }

    const user = await User.findOne({
      $or: [
        { email: identifier.toLowerCase().trim() },
        { phone: identifier.trim() },
      ],
    });

    if (!user) {
      return NextResponse.json(
        { success: false, message: 'Tài khoản hoặc mật khẩu không chính xác' },
        { status: 401 }
      );
    }

    if (user.isLocked) {
      return NextResponse.json(
        {
          success: false,
          isLocked: true,
          message: user.lockReason
            ? `Tài khoản của bạn đã bị khóa. Lý do: ${user.lockReason}. Vui lòng liên hệ CSKH!`
            : 'Tài khoản của bạn đã bị tạm khóa bởi Quản trị viên. Vui lòng liên hệ CSKH để được hỗ trợ!',
        },
        { status: 403 }
      );
    }

    const isMatch = await comparePassword(password, user.password);
    if (!isMatch) {
      return NextResponse.json(
        { success: false, message: 'Tài khoản hoặc mật khẩu không chính xác' },
        { status: 401 }
      );
    }

    user.lastLoginAt = new Date();
    await user.save();

    // Also update customer lastLoginAt
    await Customer.updateOne(
      {
        $or: [
          { email: user.email },
          ...(user.phone ? [{ phone: user.phone }] : []),
        ],
      },
      { $set: { lastLoginAt: new Date() } }
    );

    const token = generateToken({
      id: user._id,
      email: user.email,
      name: user.name,
      role: user.role,
    });

    return NextResponse.json({
      success: true,
      message: 'Đăng nhập thành công',
      token,
      data: {
        token,
        tokenType: 'Bearer',
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          phone: user.phone,
          avatar: user.avatar,
          role: user.role,
          provider: user.provider || 'local',
          isLocked: user.isLocked,
        },
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error.message || 'Lỗi hệ thống' },
      { status: 500 }
    );
  }
}