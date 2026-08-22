import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import FlashSale from '@/models/FlashSale';
import Product from '@/models/Product';

// GET /api/admin/flash-sale - Lấy cấu hình Flash Sale hiện tại
export async function GET() {
  try {
    await connectToDatabase();

    let flashSale = await FlashSale.findOne()
      .populate({
        path: 'items.productId',
        select: 'name slug price salePrice images stock soldCount category',
      })
      .populate({
        path: 'slots.items.productId',
        select: 'name slug price salePrice images stock soldCount category',
      });

    // Nếu chưa có, tự động tạo cấu hình mẫu ban đầu
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
        slots: [
          {
            id: 'slot_1',
            name: 'Săn Sale Sáng',
            startTime: '09:00',
            endTime: '12:00',
            dateType: 'all_days',
            enabled: true,
            items: defaultItems.slice(0, 3),
          },
          {
            id: 'slot_2',
            name: 'Giờ Vàng Nửa Giá',
            startTime: '12:00',
            endTime: '18:00',
            dateType: 'all_days',
            enabled: true,
            items: defaultItems,
          },
          {
            id: 'slot_3',
            name: 'Flash Deal Tối',
            startTime: '18:00',
            endTime: '21:00',
            dateType: 'all_days',
            enabled: true,
            items: defaultItems.slice(2, 6),
          },
          {
            id: 'slot_4',
            name: 'Xả Kho Đêm',
            startTime: '21:00',
            endTime: '23:59',
            dateType: 'all_days',
            enabled: true,
            items: defaultItems.slice(0, 4),
          },
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

      flashSale = await FlashSale.findById(flashSale._id)
        .populate({
          path: 'items.productId',
          select: 'name slug price salePrice images stock soldCount category',
        })
        .populate({
          path: 'slots.items.productId',
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
      slots: body.slots || [],
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
      })
        .populate({
          path: 'items.productId',
          select: 'name slug price salePrice images stock soldCount category',
        })
        .populate({
          path: 'slots.items.productId',
          select: 'name slug price salePrice images stock soldCount category',
        });
    } else {
      flashSale = await FlashSale.create(updateData);
      flashSale = await FlashSale.findById(flashSale._id)
        .populate({
          path: 'items.productId',
          select: 'name slug price salePrice images stock soldCount category',
        })
        .populate({
          path: 'slots.items.productId',
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
