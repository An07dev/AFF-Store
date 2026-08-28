import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import Customer from '@/models/Customer';
import Order from '@/models/Order';
import User from '@/models/User';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectToDatabase();
    const { id } = await params;

    const customer = await Customer.findById(id);
    if (!customer) {
      return NextResponse.json(
        { success: false, message: 'Không tìm thấy thông tin khách hàng' },
        { status: 404 }
      );
    }

    const orderMatch: any[] = [];
    if (customer.phone) orderMatch.push({ 'customer.phone': customer.phone });
    if (customer.email) orderMatch.push({ 'customer.email': customer.email });

    const orders = orderMatch.length > 0 ? await Order.find({ $or: orderMatch }).sort({ createdAt: -1 }).lean() : [];

    // Aggregate purchased products
    const purchasedProductsMap: Record<string, any> = {};
    let totalItemsBought = 0;

    orders.forEach((order: any) => {
      (order.items || []).forEach((item: any) => {
        const qty = item.quantity || 1;
        totalItemsBought += qty;

        const key = item.productId ? String(item.productId) : item.name;
        if (!purchasedProductsMap[key]) {
          purchasedProductsMap[key] = {
            productId: item.productId,
            name: item.name,
            image: item.image,
            price: item.price,
            totalQuantity: qty,
            ordersCount: 1,
            lastPurchasedAt: order.createdAt,
            variants: item.variant ? [item.variant] : [],
          };
        } else {
          purchasedProductsMap[key].totalQuantity += qty;
          purchasedProductsMap[key].ordersCount += 1;
          if (item.variant) {
            purchasedProductsMap[key].variants.push(item.variant);
          }
        }
      });
    });

    const purchasedProducts = Object.values(purchasedProductsMap);

    return NextResponse.json({
      success: true,
      data: {
        ...customer.toObject(),
        totalItemsBought,
        purchasedProducts,
        orders,
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error.message || 'Lỗi tải thông tin khách hàng' },
      { status: 500 }
    );
  }
}

// Toggle Lock Status (PATCH)
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectToDatabase();
    const { id } = await params;
    const body = await request.json();

    const customer = await Customer.findById(id);
    if (!customer) {
      return NextResponse.json(
        { success: false, message: 'Không tìm thấy khách hàng' },
        { status: 404 }
      );
    }

    const newLockedStatus = body.isLocked !== undefined ? Boolean(body.isLocked) : !customer.isLocked;
    const lockReason = body.lockReason !== undefined ? body.lockReason : customer.lockReason || '';

    customer.isLocked = newLockedStatus;
    if (newLockedStatus) {
      customer.lockReason = lockReason || 'Bị khóa bởi Quản trị viên';
    } else {
      customer.lockReason = '';
    }
    await customer.save();

    // Also sync lock status to User collection if account exists with same email/phone
    const searchConditions: any[] = [];
    if (customer.email) searchConditions.push({ email: customer.email });
    if (customer.phone) searchConditions.push({ phone: customer.phone });

    if (searchConditions.length > 0) {
      await User.updateMany(
        { $or: searchConditions },
        {
          $set: {
            isLocked: newLockedStatus,
            lockReason: customer.lockReason,
          },
        }
      );
    }

    return NextResponse.json({
      success: true,
      message: newLockedStatus ? 'Đã khóa tài khoản khách hàng thành công' : 'Đã mở khóa tài khoản khách hàng thành công',
      data: customer,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error.message || 'Lỗi xử lý khóa tài khoản' },
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

    const updated = await Customer.findByIdAndUpdate(id, body, { new: true });
    if (!updated) {
      return NextResponse.json(
        { success: false, message: 'Không tìm thấy khách hàng' },
        { status: 404 }
      );
    }

    // Sync lock status with User collection if updated
    if (body.isLocked !== undefined) {
      const searchConditions: any[] = [];
      if (updated.email) searchConditions.push({ email: updated.email });
      if (updated.phone) searchConditions.push({ phone: updated.phone });

      if (searchConditions.length > 0) {
        await User.updateMany(
          { $or: searchConditions },
          {
            $set: {
              isLocked: updated.isLocked,
              lockReason: updated.lockReason || '',
            },
          }
        );
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Cập nhật khách hàng thành công',
      data: updated,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error.message || 'Lỗi cập nhật khách hàng' },
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

    const deleted = await Customer.findByIdAndDelete(id);
    if (!deleted) {
      return NextResponse.json(
        { success: false, message: 'Không tìm thấy khách hàng' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Xóa khách hàng thành công',
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error.message || 'Lỗi xóa khách hàng' },
      { status: 500 }
    );
  }
}