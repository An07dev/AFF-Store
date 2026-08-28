import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import User from '@/models/User';
import Customer from '@/models/Customer';
import { getUserFromRequest } from '@/lib/auth';

export async function GET(request: Request) {
  try {
    await connectToDatabase();
    const { searchParams } = new URL(request.url);
    const queryId = searchParams.get('id') || searchParams.get('userId');
    const queryPhone = searchParams.get('phone');
    const queryEmail = searchParams.get('email');

    // 1. If token provided, try to find user
    const tokenData = getUserFromRequest(request);
    const targetId = tokenData?.id || queryId;

    if (targetId && targetId !== 'guest_user') {
      const user = await User.findById(targetId).select('-password');
      if (user) {
        if (user.isLocked) {
          return NextResponse.json(
            {
              success: false,
              isLocked: true,
              message: user.lockReason
                ? `Tài khoản của bạn đã bị khóa. Lý do: ${user.lockReason}. Vui lòng liên hệ CSKH!`
                : 'Tài khoản của bạn đã bị tạm khóa bởi Quản trị viên.',
            },
            { status: 403 }
          );
        }

        const userData = {
          id: user._id,
          name: user.name,
          email: user.email,
          phone: user.phone,
          role: user.role,
          avatar: user.avatar,
          provider: user.provider || 'local',
          isLocked: user.isLocked || false,
        };
        return NextResponse.json({
          success: true,
          user: userData,
          data: userData,
        });
      }

      const customer = await Customer.findById(targetId);
      if (customer) {
        if (customer.isLocked) {
          return NextResponse.json(
            {
              success: false,
              isLocked: true,
              message: customer.lockReason
                ? `Tài khoản của bạn đã bị khóa. Lý do: ${customer.lockReason}. Vui lòng liên hệ CSKH!`
                : 'Tài khoản của bạn đã bị tạm khóa bởi Quản trị viên.',
            },
            { status: 403 }
          );
        }

        const customerData = {
          id: customer._id,
          name: customer.name,
          email: customer.email || '',
          phone: customer.phone,
          role: 'customer',
          avatar: customer.avatar,
          provider: customer.provider || 'local',
          address: customer.address,
          isLocked: customer.isLocked || false,
        };
        return NextResponse.json({
          success: true,
          user: customerData,
          data: customerData,
        });
      }
    }

    // 2. Query by phone or email if provided
    if (queryPhone || queryEmail) {
      const customer = await Customer.findOne({
        ...(queryPhone ? { phone: queryPhone } : {}),
        ...(queryEmail ? { email: queryEmail } : {}),
      });

      if (customer) {
        if (customer.isLocked) {
          return NextResponse.json(
            {
              success: false,
              isLocked: true,
              message: customer.lockReason
                ? `Tài khoản của bạn đã bị khóa. Lý do: ${customer.lockReason}. Vui lòng liên hệ CSKH!`
                : 'Tài khoản của bạn đã bị tạm khóa bởi Quản trị viên.',
            },
            { status: 403 }
          );
        }

        const customerData = {
          id: customer._id,
          name: customer.name,
          email: customer.email || '',
          phone: customer.phone,
          role: 'customer',
          avatar: customer.avatar,
          provider: customer.provider || 'local',
          address: customer.address,
          isLocked: customer.isLocked || false,
        };
        return NextResponse.json({
          success: true,
          user: customerData,
          data: customerData,
        });
      }
    }

    return NextResponse.json(
      { success: false, message: 'Chưa đăng nhập' },
      { status: 401 }
    );
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error.message || 'Lỗi lấy thông tin' },
      { status: 500 }
    );
  }
}