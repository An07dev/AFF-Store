import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import User from '@/models/User';
import Customer from '@/models/Customer';
import { hashPassword, generateToken } from '@/lib/auth';

export async function POST(request: Request) {
  try {
    await connectToDatabase();
    const { name, email, phone, password, role } = await request.json();

    if (!name || !email || !password) {
      return NextResponse.json(
        { success: false, message: 'Vui lòng điền đầy đủ họ tên, email và mật khẩu' },
        { status: 400 }
      );
    }

    const cleanEmail = email.toLowerCase().trim();
    const existing = await User.findOne({ email: cleanEmail });
    if (existing) {
      return NextResponse.json(
        { success: false, message: 'Email đã được sử dụng bởi tài khoản khác' },
        { status: 400 }
      );
    }

    const hashedPassword = await hashPassword(password);
    const userRole = role === 'admin' || role === 'staff' ? role : 'customer';
    const newUser = await User.create({
      name: name.trim(),
      email: cleanEmail,
      phone: phone ? phone.trim() : undefined,
      password: hashedPassword,
      role: userRole,
    });

    // Create or sync Customer record
    if (phone) {
      const existingCust = await Customer.findOne({ phone: phone.trim() });
      if (!existingCust) {
        await Customer.create({
          name: name.trim(),
          phone: phone.trim(),
          email: cleanEmail,
        });
      }
    }

    const token = generateToken({
      id: newUser._id,
      email: newUser.email,
      name: newUser.name,
      role: newUser.role,
    });

    return NextResponse.json(
      {
        success: true,
        message: 'Đăng ký tài khoản thành công',
        data: {
          token,
          tokenType: 'Bearer',
          user: {
            id: newUser._id,
            name: newUser.name,
            email: newUser.email,
            phone: newUser.phone,
            role: newUser.role,
          },
        },
      },
      { status: 201 }
    );
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error.message || 'Lỗi đăng ký' },
      { status: 500 }
    );
  }
}