import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { License } from '@/models/License';
import mongoose from 'mongoose';

interface RouteContext {
  params: Promise<{ id: string }>;
}

// GET: Chi tiết 1 license key
export async function GET(request: Request, context: RouteContext) {
  try {
    const { id } = await context.params;
    await connectToDatabase();

    const isObjectId = mongoose.Types.ObjectId.isValid(id);
    const license = await License.findOne({
      $or: [...(isObjectId ? [{ _id: id }] : []), { licenseKey: id.toUpperCase() }],
    }).lean();

    if (!license) {
      return NextResponse.json(
        { success: false, message: 'Không tìm thấy mã bản quyền' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: license });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: 'Lỗi khi tra cứu mã bản quyền', error: error.message },
      { status: 500 }
    );
  }
}

// DELETE: Xóa 1 license key (chỉ cho phép xóa key chưa kích hoạt)
export async function DELETE(request: Request, context: RouteContext) {
  try {
    const { id } = await context.params;
    const { searchParams } = new URL(request.url);
    const force = searchParams.get('force') === 'true';

    await connectToDatabase();

    const isObjectId = mongoose.Types.ObjectId.isValid(id);
    const query = {
      $or: [...(isObjectId ? [{ _id: id }] : []), { licenseKey: id.toUpperCase() }],
    };

    const license = await License.findOne(query);
    if (!license) {
      return NextResponse.json(
        { success: false, message: 'Không tìm thấy mã bản quyền để xóa' },
        { status: 404 }
      );
    }

    if (license.status === 'active' && !force) {
      return NextResponse.json(
        {
          success: false,
          message: 'Không thể xóa mã bản quyền đang hoạt động. Vui lòng Khóa (Revoke) trước khi xóa.',
        },
        { status: 400 }
      );
    }

    await License.deleteOne({ _id: license._id });

    return NextResponse.json({
      success: true,
      message: `Đã xóa mã bản quyền ${license.licenseKey} thành công`,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: 'Lỗi khi xóa mã bản quyền', error: error.message },
      { status: 500 }
    );
  }
}
