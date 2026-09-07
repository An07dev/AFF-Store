import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { Lead } from '@/models/Lead';
import { Customer } from '@/models/Customer';
import fs from 'fs';
import path from 'path';

// POST: Lưu thông tin khách hàng đặt mua gói từ Landing Page
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, phone, email, notes, plan, paymentMethod } = body;

    if (!name || !phone) {
      return NextResponse.json(
        { success: false, message: 'Họ tên và số điện thoại là bắt buộc' },
        { status: 400 }
      );
    }

    const cleanName = String(name).trim();
    const cleanPhone = String(phone).trim().replace(/[\s.-]/g, '');
    const cleanEmail = email ? String(email).trim().toLowerCase() : '';
    const cleanNotes = notes ? String(notes).trim() : '';
    const cleanPlan = plan || '399k';

    const prefix = cleanPlan === '799k' ? 'ST799K_' : 'ST399K_';
    const amount = cleanPlan === '799k' ? 799000 : 399000;
    const orderCode = prefix + Math.floor(100000 + Math.random() * 900000);

    const clientIp =
      request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
      request.headers.get('x-real-ip') ||
      '';
    const userAgent = request.headers.get('user-agent') || '';

    // 1. Lưu vào MongoDB qua Mongoose
    let savedLead = null;
    try {
      await connectToDatabase();

      // Tạo Lead mới
      savedLead = await Lead.create({
        orderCode,
        name: cleanName,
        phone: cleanPhone,
        email: cleanEmail,
        notes: cleanNotes,
        plan: cleanPlan,
        amount,
        paymentStatus: 'pending',
        paymentMethod: paymentMethod || 'vietqr',
        source: 'landing_page',
        ip: clientIp,
        userAgent,
      });
    } catch (dbErr) {
      console.error('MongoDB Lead save error:', dbErr);
    }

    // 2. Backup cục bộ vào JSON phòng trường hợp mạng chập chờn
    const leadRecord = {
      orderCode,
      name: cleanName,
      phone: cleanPhone,
      email: cleanEmail,
      notes: cleanNotes,
      plan: cleanPlan,
      amount,
      paymentStatus: 'pending',
      createdAt: new Date().toISOString(),
    };

    try {
      const dataDir = path.join(process.cwd(), 'data');
      if (!fs.existsSync(dataDir)) {
        fs.mkdirSync(dataDir, { recursive: true });
      }
      const leadsFile = path.join(dataDir, 'leads.json');
      let leads = [];
      if (fs.existsSync(leadsFile)) {
        const fileContent = fs.readFileSync(leadsFile, 'utf-8');
        leads = JSON.parse(fileContent || '[]');
      }
      leads.push(leadRecord);
      fs.writeFileSync(leadsFile, JSON.stringify(leads, null, 2), 'utf-8');
    } catch (fsErr) {
      console.warn('Local lead save skipped:', fsErr);
    }

    return NextResponse.json({
      success: true,
      orderCode,
      message: 'Đăng ký thành công',
      lead: savedLead || leadRecord,
    });
  } catch (error: any) {
    console.error('Error creating landing lead:', error);
    const fallbackCode = 'ST399K_' + Math.floor(100000 + Math.random() * 900000);
    return NextResponse.json({
      success: true,
      orderCode: fallbackCode,
      message: 'Đăng ký thành công (fallback)',
    });
  }
}

// GET: Lấy danh sách khách hàng đặt mua gói (có phân trang & bộ lọc)
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10));
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get('limit') || '20', 10)));
    const plan = searchParams.get('plan');
    const paymentStatus = searchParams.get('paymentStatus');
    const query = searchParams.get('q');

    await connectToDatabase();

    const filter: Record<string, any> = {};

    if (plan) {
      filter.plan = plan;
    }
    if (paymentStatus) {
      filter.paymentStatus = paymentStatus;
    }
    if (query) {
      filter.$or = [
        { name: { $regex: query, $options: 'i' } },
        { phone: { $regex: query, $options: 'i' } },
        { orderCode: { $regex: query, $options: 'i' } },
      ];
    }

    const skip = (page - 1) * limit;
    const [leads, total] = await Promise.all([
      Lead.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
      Lead.countDocuments(filter),
    ]);

    return NextResponse.json({
      success: true,
      data: leads,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error: any) {
    console.error('Error fetching leads:', error);

    // Fallback: đọc từ file local nếu có
    try {
      const dataDir = path.join(process.cwd(), 'data');
      const leadsFile = path.join(dataDir, 'leads.json');
      if (fs.existsSync(leadsFile)) {
        const fileContent = fs.readFileSync(leadsFile, 'utf-8');
        const leads = JSON.parse(fileContent || '[]');
        return NextResponse.json({
          success: true,
          data: leads,
          pagination: { page: 1, limit: leads.length, total: leads.length, totalPages: 1 },
          fallback: true,
        });
      }
    } catch {
      // ignore
    }

    return NextResponse.json(
      { success: false, message: 'Lỗi khi lấy danh sách lead', error: error.message },
      { status: 500 }
    );
  }
}