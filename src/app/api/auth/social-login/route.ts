import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import User from '@/models/User';
import Customer from '@/models/Customer';
import { generateToken } from '@/lib/auth';

export async function POST(request: Request) {
  try {
    await connectToDatabase();
    const body = await request.json();
    const { provider, email, name, avatar, phone } = body;

    if (!provider || (!email && !phone) || !name) {
      return NextResponse.json(
        { success: false, message: 'Thiếu thông tin đăng nhập mạng xã hội' },
        { status: 400 }
      );
    }

    const cleanEmail = email ? email.toLowerCase().trim() : undefined;
    const cleanPhone = phone ? phone.trim() : undefined;

    // Search existing user
    const searchConditions: any[] = [];
    if (cleanEmail) searchConditions.push({ email: cleanEmail });
    if (cleanPhone) searchConditions.push({ phone: cleanPhone });

    let user = await User.findOne({ $or: searchConditions });

    if (user) {
      // Check if locked
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

      // Update avatar / lastLoginAt / provider if not set
      user.lastLoginAt = new Date();
      if (avatar && !user.avatar) user.avatar = avatar;
      if (!user.provider || user.provider === 'local') user.provider = provider;
      await user.save();
    } else {
      // Create new Customer User
      user = await User.create({
        name: name.trim(),
        email: cleanEmail || `${provider}_${Date.now()}@social.shoptik.vn`,
        phone: cleanPhone,
        avatar: avatar || undefined,
        role: 'customer',
        provider: provider,
        isLocked: false,
        lastLoginAt: new Date(),
        password: `social_auth_${Date.now()}_${Math.random()}`,
      });
    }

    // Also sync or create Customer in Customer collection
    let customer = await Customer.findOne({
      $or: searchConditions,
    });

    if (customer) {
      if (customer.isLocked) {
        return NextResponse.json(
          {
            success: false,
            isLocked: true,
            message: customer.lockReason
              ? `Tài khoản khách hàng đã bị khóa. Lý do: ${customer.lockReason}. Vui lòng liên hệ CSKH!`
              : 'Tài khoản của bạn đã bị tạm khóa bởi Quản trị viên. Vui lòng liên hệ CSKH để được hỗ trợ!',
          },
          { status: 403 }
        );
      }

      customer.lastLoginAt = new Date();
      if (avatar && !customer.avatar) customer.avatar = avatar;
      if (provider) customer.provider = provider;
      await customer.save();
    } else {
      await Customer.create({
        name: name.trim(),
        email: cleanEmail,
        phone: cleanPhone || `social_${Date.now().toString().slice(-8)}`,
        avatar: avatar,
        provider: provider,
        isLocked: false,
        lastLoginAt: new Date(),
        orderCount: 0,
        totalSpent: 0,
        totalItemsBought: 0,
      });
    }

    const token = generateToken({
      id: user._id,
      email: user.email,
      name: user.name,
      role: user.role,
    });

    return NextResponse.json({
      success: true,
      message: `Đăng nhập qua ${provider === 'google' ? 'Google' : 'Facebook'} thành công!`,
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
          provider: user.provider,
          isLocked: user.isLocked,
        },
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error.message || 'Lỗi đăng nhập mạng xã hội' },
      { status: 500 }
    );
  }
}
