import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import Product from '@/models/Product';
import Category from '@/models/Category';
import FlashSale from '@/models/FlashSale';
import { generateSlug } from '@/lib/utils';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectToDatabase();
    const { id } = await params;

    let productDoc;
    if (id.match(/^[0-9a-fA-F]{24}$/)) {
      productDoc = await Product.findById(id).populate('category', 'name slug').lean();
    } else {
      productDoc = await Product.findOne({ slug: id }).populate('category', 'name slug').lean();
    }

    if (!productDoc) {
      return NextResponse.json(
        { success: false, message: 'Không tìm thấy sản phẩm' },
        { status: 404 }
      );
    }

    const product: any = { ...productDoc };

    // Ensure product.stock accurately reflects total inventory of all variants
    if (Array.isArray(product.variants) && product.variants.length > 0) {
      product.stock = product.variants.reduce((sum: number, v: any) => sum + (Number(v.stock) || 0), 0);
    }
    try {
      const flashSale = await FlashSale.findOne({ isActive: true }).lean();
      if (flashSale) {
        const now = new Date();
        const vnOffset = 7 * 60;
        const localOffset = now.getTimezoneOffset();
        const vnTime = new Date(now.getTime() + (vnOffset + localOffset) * 60 * 1000);
        const todayStr = `${vnTime.getFullYear()}-${String(vnTime.getMonth() + 1).padStart(2, '0')}-${String(vnTime.getDate()).padStart(2, '0')}`;
        const curMin = vnTime.getHours() * 60 + vnTime.getMinutes();

        const pIdStr = product._id.toString();

        const liveSlot = (flashSale.slots || []).find((slot: any) => {
          if (!slot.enabled) return false;
          let isDateMatch = true;
          if (slot.dateType === 'specific_date' && slot.specificDate) {
            isDateMatch = todayStr === slot.specificDate;
          } else if (slot.dateType === 'date_range') {
            if (slot.startDate && todayStr < slot.startDate) isDateMatch = false;
            if (slot.endDate && todayStr > slot.endDate) isDateMatch = false;
          }
          if (!isDateMatch) return false;

          const [sh, sm] = (slot.startTime || '00:00').split(':').map((n: string) => parseInt(n, 10) || 0);
          const [eh, em] = (slot.endTime || '00:00').split(':').map((n: string) => parseInt(n, 10) || 0);
          const startTotal = sh * 60 + sm;
          const endTotal = eh * 60 + em;

          return curMin >= startTotal && curMin < endTotal;
        });

        if (liveSlot && Array.isArray(liveSlot.items)) {
          const item = liveSlot.items.find(
            (it: any) =>
              it.isActive &&
              (it.productId?.toString() === pIdStr ||
                it.productId?._id?.toString() === pIdStr ||
                it.slug === product.slug)
          );
          if (item) {
            product.isFlashSale = true;
            product.flashPrice = item.flashPrice;
            product.flashSale = {
              isLive: true,
              flashPrice: item.flashPrice,
              originalPrice: item.originalPrice || product.price,
              discountPercent: item.discountPercent,
              flashStock: item.flashStock,
              soldCount: item.soldCount,
              endTime: liveSlot.endTime,
              slotName: liveSlot.name,
            };
          }
        }
      }
    } catch (e) {
      console.error('Error attaching flash sale to product detail:', e);
    }

    return NextResponse.json({
      success: true,
      data: product,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error.message || 'Lỗi tải chi tiết sản phẩm' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectToDatabase();
    const { id } = await params;
    const body = await request.json();

    const product = await Product.findById(id);
    if (!product) {
      return NextResponse.json(
        { success: false, message: 'Không tìm thấy sản phẩm để cập nhật' },
        { status: 404 }
      );
    }

    if (body.name && !body.slug && body.name !== product.name) {
      body.slug = generateSlug(body.name);
    }

    if (body.variants && Array.isArray(body.variants)) {
      body.variants = body.variants.map((v: any, idx: number) => {
        const parsedSalePrice =
          v.salePrice !== undefined && v.salePrice !== null && v.salePrice !== ''
            ? Number(v.salePrice)
            : 0;

        const colorVal = v.color || v.attributes?.['Màu sắc'] || v.attributes?.['Màu'];
        const sizeVal = v.size || v.attributes?.['Kích cỡ'] || v.attributes?.['Size'] || v.attributes?.['Kích thước'];
        const title =
          v.title ||
          v.name ||
          (v.attributes ? Object.values(v.attributes).filter(Boolean).join(' / ') : '') ||
          [colorVal, sizeVal].filter(Boolean).join(' / ') ||
          `Biến thể ${idx + 1}`;

        return {
          ...v,
          sku: v.sku?.trim() || `${(product.slug || 'SP').toUpperCase()}-${idx + 1}`,
          title,
          name: title,
          color: colorVal,
          size: sizeVal,
          attributes: v.attributes instanceof Map ? Object.fromEntries(v.attributes) : (v.attributes || {}),
          price: Number(v.price) || Number(body.price) || product.price || 0,
          salePrice: parsedSalePrice,
          stock: Math.max(0, Number(v.stock) || 0),
          image: v.image || '',
        };
      });
    }

    Object.assign(product, body);
    const updated = await product.save();

    return NextResponse.json({
      success: true,
      message: 'Cập nhật sản phẩm thành công',
      data: updated,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error.message || 'Lỗi cập nhật sản phẩm' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectToDatabase();
    const { id } = await params;

    const deleted = await Product.findByIdAndDelete(id);
    if (!deleted) {
      return NextResponse.json(
        { success: false, message: 'Không tìm thấy sản phẩm' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Xóa sản phẩm thành công',
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error.message || 'Lỗi xóa sản phẩm' },
      { status: 500 }
    );
  }
}