import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import Order from '@/models/Order';
import { formatVariantDisplay } from '@/lib/variant-helper';

export async function GET(request: Request) {
  try {
    await connectToDatabase();
    const { searchParams } = new URL(request.url);

    const orderIds = searchParams.get('orderIds');
    const status = searchParams.get('status');
    const search = searchParams.get('search');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');

    const filter: any = {};

    if (orderIds) {
      const ids = orderIds.split(',').map((id) => id.trim()).filter(Boolean);
      if (ids.length > 0) {
        filter._id = { $in: ids };
      }
    } else {
      if (status && status !== 'all') {
        filter.status = status;
      }

      if (search) {
        filter.$or = [
          { orderCode: { $regex: search, $options: 'i' } },
          { 'customer.name': { $regex: search, $options: 'i' } },
          { 'customer.phone': { $regex: search, $options: 'i' } },
        ];
      }

      if (startDate || endDate) {
        filter.createdAt = {};
        if (startDate) filter.createdAt.$gte = new Date(startDate);
        if (endDate) {
          const end = new Date(endDate);
          end.setHours(23, 59, 59, 999);
          filter.createdAt.$lte = end;
        }
      }
    }

    const orders = await Order.find(filter).sort({ createdAt: -1 }).lean();

    // Map status and payment methods to Vietnamese
    const statusTextMap: Record<string, string> = {
      pending: 'Chờ duyệt',
      confirmed: 'Đã xác nhận',
      shipping: 'Đang giao hàng',
      delivering: 'Shipper đang giao',
      delivered: 'Đã giao thành công',
      cancelled: 'Đã hủy',
      returned: 'Đã hoàn hàng',
    };

    const paymentMethodMap: Record<string, string> = {
      cod: 'Thanh toán khi nhận (COD)',
      bank_transfer: 'Chuyển khoản VietQR',
      momo: 'Ví MoMo',
      vnpay: 'VNPAY-QR',
    };

    const paymentStatusMap: Record<string, string> = {
      unpaid: 'Chưa thanh toán',
      paid: 'Đã thanh toán',
      refunded: 'Đã hoàn tiền',
    };

    // CSV Headers
    const headers = [
      'STT',
      'Mã đơn hàng',
      'Thời gian đặt',
      'Tên khách hàng',
      'Số điện thoại',
      'Địa chỉ nhận hàng',
      'Email',
      'Danh sách sản phẩm',
      'Tổng SL món',
      'Tiền hàng (VNĐ)',
      'Phí vận chuyển (VNĐ)',
      'Tổng thanh toán (VNĐ)',
      'Hình thức thanh toán',
      'Trạng thái thanh toán',
      'Đơn vị vận chuyển',
      'Mã vận đơn',
      'Trạng thái đơn hàng',
      'Ghi chú đơn hàng',
    ];

    // Helper to escape CSV values
    const escapeCsv = (val: any): string => {
      if (val === null || val === undefined) return '""';
      const str = String(val).replace(/"/g, '""');
      return `"${str}"`;
    };

    const rows: string[] = [];
    rows.push(headers.map(escapeCsv).join(','));

    orders.forEach((o: any, idx: number) => {
      const itemsDetail = (o.items || [])
        .map((item: any) => {
          const variant = formatVariantDisplay(item);
          const variantStr = variant ? ` [${variant}]` : '';
          return `${item.name || 'Sản phẩm'}${variantStr} (SL: ${item.quantity || 1} x ${(item.price || 0).toLocaleString('vi-VN')}₫)`;
        })
        .join('; ');

      const totalQty = (o.items || []).reduce((sum: number, it: any) => sum + (it.quantity || 1), 0);
      const subtotal = (o.items || []).reduce((sum: number, it: any) => sum + (it.price || 0) * (it.quantity || 1), 0);

      const dateStr = o.createdAt
        ? new Date(o.createdAt).toLocaleString('vi-VN', {
            hour: '2-digit',
            minute: '2-digit',
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
          })
        : '';

      const row = [
        idx + 1,
        o.orderCode || '',
        dateStr,
        o.customer?.name || '',
        o.customer?.phone || '',
        o.customer?.address || '',
        o.customer?.email || '',
        itemsDetail,
        totalQty,
        subtotal,
        o.shippingFee || 0,
        o.totalAmount || 0,
        paymentMethodMap[o.paymentMethod] || o.paymentMethod || 'COD',
        paymentStatusMap[o.paymentStatus] || o.paymentStatus || 'Chưa thanh toán',
        o.shippingCarrier || o.shippingProvider || 'Chưa phân công',
        o.trackingCode || '',
        statusTextMap[o.status] || o.status || 'Chờ duyệt',
        o.notes || '',
      ];

      rows.push(row.map(escapeCsv).join(','));
    });

    // Add UTF-8 BOM (\uFEFF) so Excel natively opens Vietnamese characters with zero encoding issues
    const csvContent = '\uFEFF' + rows.join('\r\n');
    const now = new Date();
    const dateTag = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}${String(now.getDate()).padStart(2, '0')}_${String(now.getHours()).padStart(2, '0')}${String(now.getMinutes()).padStart(2, '0')}`;
    const filename = `Danh_sach_don_hang_ShopTik_${dateTag}.csv`;

    return new Response(csvContent, {
      status: 200,
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': `attachment; filename="${filename}"`,
        'Cache-Control': 'no-cache',
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error.message || 'Lỗi xuất file Excel đơn hàng' },
      { status: 500 }
    );
  }
}
