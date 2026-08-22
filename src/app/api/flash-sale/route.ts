import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import FlashSale from '@/models/FlashSale';

export const dynamic = 'force-dynamic';

// GET /api/flash-sale - Lấy dữ liệu Flash Sale public cho Storefront
export async function GET() {
  try {
    await connectToDatabase();

    const flashSale = await FlashSale.findOne({ isActive: true }).populate({
      path: 'items.productId',
      select: 'name slug price salePrice images stock soldCount category status',
    });

    if (!flashSale) {
      return NextResponse.json({
        success: true,
        data: null,
      });
    }

    const now = new Date();
    // Get Vietnam Time (UTC+7)
    const vnOffset = 7 * 60; // in minutes
    const localOffset = now.getTimezoneOffset(); // in minutes
    const vnTime = new Date(now.getTime() + (vnOffset + localOffset) * 60 * 1000);
    const currentHour = vnTime.getHours();
    const currentMinute = vnTime.getMinutes();
    const currentSecond = vnTime.getSeconds();

    let isLive = false;
    let activeSlot: any = null;
    let targetEndTime: Date | null = null;
    let timeRemainingSeconds = 0;

    if (flashSale.type === 'custom_range') {
      if (flashSale.startTime && flashSale.endTime) {
        const start = new Date(flashSale.startTime).getTime();
        const end = new Date(flashSale.endTime).getTime();
        const currentMs = now.getTime();

        if (currentMs >= start && currentMs <= end) {
          isLive = true;
          targetEndTime = flashSale.endTime;
          timeRemainingSeconds = Math.max(0, Math.floor((end - currentMs) / 1000));
        }
      }
    } else {
      // Daily slots mode
      const enabledSlots = (flashSale.slots || []).filter((s) => s.enabled);

      for (const slot of enabledSlots) {
        const slotStartMinutes = slot.startHour * 60 + (slot.startMinute || 0);
        const slotEndMinutes = slot.endHour * 60 + (slot.endMinute || 0);
        const currentTotalMinutes = currentHour * 60 + currentMinute;

        if (currentTotalMinutes >= slotStartMinutes && currentTotalMinutes < slotEndMinutes) {
          isLive = true;
          activeSlot = slot;

          // Calculate remaining seconds till slot ends today
          const secondsRemainingInSlot =
            (slotEndMinutes - currentTotalMinutes) * 60 - currentSecond;
          timeRemainingSeconds = Math.max(0, secondsRemainingInSlot);

          const endSlotDate = new Date(vnTime);
          endSlotDate.setHours(slot.endHour, slot.endMinute || 0, 0, 0);
          targetEndTime = endSlotDate;
          break;
        }
      }

      // If no slot matched currently, pick the next upcoming slot or default slot
      if (!isLive && enabledSlots.length > 0) {
        // Find next slot today
        const currentTotalMinutes = currentHour * 60 + currentMinute;
        const upcomingSlot = enabledSlots.find((s) => s.startHour * 60 + (s.startMinute || 0) > currentTotalMinutes);
        activeSlot = upcomingSlot || enabledSlots[0];
      }
    }

    // Filter active items and active products only
    const activeItems = (flashSale.items || [])
      .filter((item: any) => item.isActive && item.productId && item.productId.status !== 'hidden')
      .map((item: any) => {
        const product = item.productId;
        const origPrice = item.originalPrice || product.price || 0;
        const fPrice = item.flashPrice || Math.round(origPrice * 0.7);
        const discountPct =
          item.discountPercent ||
          (origPrice > 0 ? Math.round(((origPrice - fPrice) / origPrice) * 100) : 0);

        const stock = item.flashStock || 50;
        const sold = Math.min(stock, item.soldCount || 0);
        const soldPercent = stock > 0 ? Math.min(98, Math.round((sold / stock) * 100)) : 0;

        return {
          _id: item._id,
          productId: product._id,
          name: product.name,
          slug: product.slug,
          image: product.images?.[0] || '',
          images: product.images || [],
          originalPrice: origPrice,
          flashPrice: fPrice,
          discountPercent: discountPct,
          flashStock: stock,
          soldCount: sold,
          soldPercent: Math.max(15, soldPercent),
        };
      });

    return NextResponse.json({
      success: true,
      data: {
        _id: flashSale._id,
        title: flashSale.title,
        subtitle: flashSale.subtitle,
        isActive: flashSale.isActive,
        type: flashSale.type,
        isLive,
        activeSlot,
        slots: flashSale.slots || [],
        targetEndTime,
        timeRemainingSeconds,
        items: activeItems,
        fomoSettings: flashSale.fomoSettings,
      },
    });
  } catch (error: any) {
    console.error('Error fetching public flash sale:', error);
    return NextResponse.json(
      { success: false, message: error.message || 'Lỗi lấy dữ liệu Flash Sale' },
      { status: 500 }
    );
  }
}
