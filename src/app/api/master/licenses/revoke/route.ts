import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { License } from '@/models/License';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { licenseKey, action = 'revoke', reason = '' } = body;

    if (!licenseKey) {
      return NextResponse.json(
        { success: false, message: 'Mã bản quyền (licenseKey) là bắt buộc' },
        { status: 400 }
      );
    }

    await connectToDatabase();

    const license = await License.findOne({ licenseKey: String(licenseKey).trim().toUpperCase() });
    if (!license) {
      return NextResponse.json(
        { success: false, message: 'Không tìm thấy mã bản quyền trong hệ thống' },
        { status: 404 }
      );
    }

    let newStatus: 'available' | 'active' | 'revoked' = 'revoked';

    if (action === 'reactivate') {
      // Nếu key đã từng kích hoạt shopName/assignedDb thì về lại active, nếu chưa thì về available
      newStatus = license.assignedDb || license.shopName ? 'active' : 'available';
    } else {
      newStatus = 'revoked';
    }

    license.status = newStatus;
    if (reason) {
      license.notes = license.notes
        ? `${license.notes} | [${action.toUpperCase()}: ${reason}]`
        : `[${action.toUpperCase()}: ${reason}]`;
    }
    await license.save();

    return NextResponse.json({
      success: true,
      message:
        action === 'reactivate'
          ? `Đã mở lại bản quyền ${license.licenseKey} thành công`
          : `Đã thu hồi / khóa bản quyền ${license.licenseKey} thành công`,
      data: license,
    });
  } catch (error: any) {
    console.error('Error toggling license status:', error);
    return NextResponse.json(
      { success: false, message: 'Lỗi khi cập nhật trạng thái bản quyền', error: error.message },
      { status: 500 }
    );
  }
}
