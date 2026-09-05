import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import FlashSale from '@/models/FlashSale';

export const dynamic = 'force-dynamic';

function parseTimeToMinutes(timeStr: string = '00:00'): number {
  if (!timeStr) return 0;
  const parts = timeStr.split(':').map((p) => parseInt(p, 10) || 0);
  return parts[0] * 60 + (parts[1] || 0);
}

function getVietnamDateString(date: Date = new Date()): string {
  const vnOffset = 7 * 60; // in minutes
  const localOffset = date.getTimezoneOffset();
  const vnTime = new Date(date.getTime() + (vnOffset + localOffset) * 60 * 1000);
  const y = vnTime.getFullYear();
  const m = String(vnTime.getMonth() + 1).padStart(2, '0');
  const d = String(vnTime.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

// GET /api/flash-sale - Lấy dữ liệu Flash Sale public cho Storefront
export async function GET() {
  try {
    await connectToDatabase();

    const flashSale = await FlashSale.findOne({ isActive: true })
      .populate({
        path: 'items.productId',
        select: 'name slug price salePrice images stock soldCount category status',
      })
      .populate({
        path: 'slots.items.productId',
        select: 'name slug price salePrice images stock soldCount category status',
      });

    if (!flashSale) {
      return NextResponse.json({
        success: true,
        data: null,
      });
    }

    const now = new Date();
    const vnOffset = 7 * 60;
    const localOffset = now.getTimezoneOffset();
    const vnTime = new Date(now.getTime() + (vnOffset + localOffset) * 60 * 1000);
    const todayStr = getVietnamDateString(now);
    const currentHour = vnTime.getHours();
    const currentMinute = vnTime.getMinutes();
    const currentSecond = vnTime.getSeconds();
    const currentTotalMinutes = currentHour * 60 + currentMinute;

    const enabledSlots = (flashSale.slots || [])
      .filter((s) => s.enabled)
      .sort((a, b) => parseTimeToMinutes(a.startTime) - parseTimeToMinutes(b.startTime));

    let isLive = false;
    let activeSlot: any = null;
    let nextUpcomingSlot: any = null;
    let timeRemainingSeconds = 0;

    // 1. Find the active live slot right now
    for (const slot of enabledSlots) {
      // Check date matching
      let isDateMatch = true;
      if (slot.dateType === 'specific_date' && slot.specificDate) {
        isDateMatch = todayStr === slot.specificDate;
      } else if (slot.dateType === 'date_range') {
        if (slot.startDate && todayStr < slot.startDate) isDateMatch = false;
        if (slot.endDate && todayStr > slot.endDate) isDateMatch = false;
      }

      if (!isDateMatch) continue;

      const startMin = parseTimeToMinutes(slot.startTime);
      const endMin = parseTimeToMinutes(slot.endTime);

      if (currentTotalMinutes >= startMin && currentTotalMinutes < endMin) {
        isLive = true;
        activeSlot = slot;
        timeRemainingSeconds = Math.max(0, (endMin - currentTotalMinutes) * 60 - currentSecond);
        break;
      } else if (currentTotalMinutes < startMin && !nextUpcomingSlot) {
        nextUpcomingSlot = slot;
      }
    }

    // 2. If no live slot, calculate countdown to next upcoming slot
    if (!isLive && nextUpcomingSlot) {
      const startMin = parseTimeToMinutes(nextUpcomingSlot.startTime);
      timeRemainingSeconds = Math.max(0, (startMin - currentTotalMinutes) * 60 - currentSecond);
    }

    // Determine products to show: ONLY return active Flash Sale items when slot is actively LIVE!
    let activeItems: any[] = [];
    if (isLive && activeSlot) {
      const rawItems =
        activeSlot.items && activeSlot.items.length > 0
          ? activeSlot.items
          : flashSale.items || [];

      activeItems = rawItems
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
    }

    // Format all slots for frontend timeline navigation
    const formattedSlots = enabledSlots.map((s) => {
      const startMin = parseTimeToMinutes(s.startTime);
      const endMin = parseTimeToMinutes(s.endTime);
      let status: 'passed' | 'live' | 'upcoming' = 'upcoming';

      let isDateMatch = true;
      if (s.dateType === 'specific_date' && s.specificDate) {
        isDateMatch = todayStr === s.specificDate;
      } else if (s.dateType === 'date_range') {
        if (s.startDate && todayStr < s.startDate) isDateMatch = false;
        if (s.endDate && todayStr > s.endDate) isDateMatch = false;
      }

      if (!isDateMatch) {
        if (s.dateType === 'specific_date' && s.specificDate && todayStr > s.specificDate) {
          status = 'passed';
        } else if (s.dateType === 'date_range' && s.endDate && todayStr > s.endDate) {
          status = 'passed';
        } else {
          status = 'upcoming';
        }
      } else {
        if (currentTotalMinutes >= endMin) {
          status = 'passed';
        } else if (currentTotalMinutes >= startMin && currentTotalMinutes < endMin) {
          status = 'live';
        } else {
          status = 'upcoming';
        }
      }

      // Slot items preview
      const slotItemCount = s.items?.filter((it: any) => it.isActive)?.length || 0;

      return {
        id: s.id,
        name: s.name || `${s.startTime} - ${s.endTime}`,
        startTime: s.startTime,
        endTime: s.endTime,
        dateType: s.dateType,
        specificDate: s.specificDate,
        startDate: s.startDate,
        endDate: s.endDate,
        status,
        itemCount: slotItemCount,
        items: (s.items || [])
          .filter((it: any) => it.isActive && it.productId)
          .map((it: any) => ({
            _id: it._id,
            productId: it.productId._id || it.productId,
            name: it.productId.name,
            slug: it.productId.slug,
            image: it.productId.images?.[0] || '',
            originalPrice: it.originalPrice || it.productId.price || 0,
            flashPrice: it.flashPrice,
            discountPercent: it.discountPercent,
            flashStock: it.flashStock,
            soldCount: it.soldCount,
            soldPercent: it.flashStock > 0 ? Math.min(98, Math.round(((it.soldCount || 0) / it.flashStock) * 100)) : 20,
          })),
      };
    });

    return NextResponse.json(
      {
        success: true,
        data: {
          _id: flashSale._id,
          title: flashSale.title,
          subtitle: flashSale.subtitle,
          isActive: flashSale.isActive,
          isLive,
          activeSlot: isLive ? activeSlot : null,
          nextSlot: nextUpcomingSlot,
          slots: formattedSlots,
          timeRemainingSeconds,
          items: activeItems,
          fomoSettings: flashSale.fomoSettings,
        },
      },
      {
        headers: {
          'Cache-Control': 'public, s-maxage=15, stale-while-revalidate=45',
        },
      }
    );
  } catch (error: any) {
    console.error('Error fetching public flash sale:', error);
    return NextResponse.json(
      { success: false, message: error.message || 'Lỗi lấy dữ liệu Flash Sale' },
      { status: 500 }
    );
  }
}
