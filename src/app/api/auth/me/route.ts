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

    if (targetId) {
      const user = await User.findById(targetId).select('-password');
      if (user) {
        const userData = {
          id: user._id,
          name: user.name,
          email: user.email,
          phone: user.phone,
          role: user.role,
          avatar: user.avatar,
        };
        return NextResponse.json({
          success: true,
          user: userData,
          data: userData,
        });
      }

      const customer = await Customer.findById(targetId);
      if (customer) {
        const customerData = {
          id: customer._id,
          name: customer.name,
          email: customer.email || 'khachhang@shoptik.vn',
          phone: customer.phone,
          role: 'customer',
          address: customer.address,
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
        const customerData = {
          id: customer._id,
          name: customer.name,
          email: customer.email || 'khachhang@shoptik.vn',
          phone: customer.phone,
          role: 'customer',
          address: customer.address,
        };
        return NextResponse.json({
          success: true,
          user: customerData,
          data: customerData,
        });
      }
    }

    // 3. Fallback to default customer profile without requiring token or login
    const defaultUser = {
      id: 'guest_user',
      name: 'Khách hàng',
      email: 'khachhang@shoptik.vn',
      phone: '0988888888',
      role: 'customer',
      address: 'Số 10 Phạm Hùng, Cầu Giấy, Hà Nội',
    };

    return NextResponse.json({
      success: true,
      user: defaultUser,
      data: defaultUser,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error.message || 'Lỗi lấy thông tin' },
      { status: 500 }
    );
  }
}