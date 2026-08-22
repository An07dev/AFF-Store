import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import FlashSale from '@/models/FlashSale';
import Product from '@/models/Product';

// GET /api/admin/flash-sale - Lấy thông tin cấu hình Flash Sale hiện tại
export async function GET() {
  try {
    await connectToDatabase();

    let flashSale = await FlashSale.findOne().populate({
      path: 'items.productId',
      select: 'name slug price salePrice images stock soldCount category',
    });

    // Nếu chưa từng tạo Flash Sale nào, tự động seed cấu hình mẫu từ sản phẩm hiện có
    if (!flashSale) {
      const sampleProducts = await Product.find({ status: 'active' }).limit(6);

      const defaultItems = sampleProducts.map((p) => {
        const origPrice = p.price || 300000;
        const discountPct = 35;
        const fPrice = Math.round((origPrice * (100 - discountPct)) / 100000) * 1000;
        return {
          productId: p._id,
          originalPrice: origPrice,
          flashPrice: fPrice > 0 ? fPrice : Math.round(origPrice * 0.65),
          discountPercent: discountPct,
          flashStock: Math.max(20, Math.min(100, p.stock || 50)),
          soldCount: Math.floor(Math.random() * 15) + 8,
          isActive: true,
        };
      });

      flashSale = await FlashSale.create({
        title: '⚡ SIÊU SALE GIỜ VÀNG - GIẢM TỚI 50%',
        subtitle: 'Săn deal chớp nhoáng • Số lượng có hạn • Giá rẻ vô địch',
        isActive: true,
        type: 'daily_slots',
        slots: [
          { id: 'slot_1', startHour: 0, startMinute: 0, endHour: 9, endMinute: 0, label: '00:00 - 09:00', enabled: true },
          { id: 'slot_2', startHour: 9, startMinute: 0, endHour: 12, endMinute: 0, label: '09:00 - 12:00', enabled: true },
          { id: 'slot_3', startHour: 12, startMinute: 0, endHour: 18, endMinute: 0, label: '12:00 - 18:00', enabled: true },
          { id: 'slot_4', startHour: 18, startMinute: 0, endHour: 21, endMinute: 0, label: '18:00 - 21:00', enabled: true },
          { id: 'slot_5', startHour: 21, startMinute: 0, endHour: 24, endMinute: 0, label: '21:00 - 24:00', enabled: true },
        ],
        items: defaultItems,
        fomoSettings: {
          enableLivePurchasePopup: true,
          popupIntervalSeconds: 25,
          enableCheckoutTimer: true,
          checkoutTimerMinutes: 15,
          enableViewerCount: true,
        },
      });

      // Populate after creation
      flashSale = await FlashSale.findById(flashSale._id).populate({
        path: 'items.productId',
        select: 'name slug price salePrice images stock soldCount category',
      });
    }

    return NextResponse.json({
      success: true,
      data: flashSale,
    });
  } catch (error: any) {
    console.error('Error fetching admin flash sale:', error);
    return NextResponse.json(
      { success: false, message: error.message || 'Lỗi lấy thông tin Flash Sale' },
      { status: 500 }
    );
  }
}

// PUT /api/admin/flash-sale - Lưu & cập nhật cấu hình Flash Sale
export async function PUT(req: Request) {
  try {
    await connectToDatabase();
    const body = await req.json();

    let flashSale = await FlashSale.findOne();

    const updateData: any = {
      title: body.title || '⚡ SIÊU SALE GIỜ VÀNG - GIẢM TỚI 50%',
      subtitle: body.subtitle || '',
      isActive: body.isActive !== undefined ? body.isActive : true,
      type: body.type || 'daily_slots',
      slots: body.slots || [],
      startTime: body.startTime || null,
      endTime: body.endTime || null,
      items: body.items || [],
      fomoSettings: body.fomoSettings || {
        enableLivePurchasePopup: true,
        popupIntervalSeconds: 25,
        enableCheckoutTimer: true,
        checkoutTimerMinutes: 15,
        enableViewerCount: true,
      },
    };

    if (flashSale) {
      flashSale = await FlashSale.findByIdAndUpdate(flashSale._id, updateData, {
        new: true,
        runValidators: true,
      }).populate({
        path: 'items.productId',
        select: 'name slug price salePrice images stock soldCount category',
      });
    } else {
      flashSale = await FlashSale.create(updateData);
      flashSale = await FlashSale.findById(flashSale._id).populate({
        path: 'items.productId',
        select: 'name slug price salePrice images stock soldCount category',
      });
    }

    return NextResponse.json({
      success: true,
      message: 'Cập nhật cấu hình Flash Sale thành công!',
      data: flashSale,
    });
  } catch (error: any) {
    console.error('Error updating admin flash sale:', error);
    return NextResponse.json(
      { success: false, message: error.message || 'Lỗi cập nhật cấu hình Flash Sale' },
      { status: 500 }
    );
  }
}
