import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { Lead } from '@/models/Lead';
import fs from 'fs';
import path from 'path';

// PATCH: Cập nhật trạng thái thanh toán, ghi chú hoặc xử lý lead
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { paymentStatus, isProcessed, notes } = body;

    await connectToDatabase();

    const updateData: Record<string, any> = {};
    if (paymentStatus !== undefined) updateData.paymentStatus = paymentStatus;
    if (isProcessed !== undefined) updateData.isProcessed = isProcessed;
    if (notes !== undefined) updateData.notes = notes;

    const updatedLead = await Lead.findByIdAndUpdate(id, updateData, { new: true });

    // Update local json backup if present
    try {
      const dataDir = path.join(process.cwd(), 'data');
      const leadsFile = path.join(dataDir, 'leads.json');
      if (fs.existsSync(leadsFile)) {
        const fileContent = fs.readFileSync(leadsFile, 'utf-8');
        const leads = JSON.parse(fileContent || '[]');
        const idx = leads.findIndex((l: any) => l._id === id || l.orderCode === updatedLead?.orderCode);
        if (idx !== -1) {
          leads[idx] = { ...leads[idx], ...updateData };
          fs.writeFileSync(leadsFile, JSON.stringify(leads, null, 2), 'utf-8');
        }
      }
    } catch (e) {}

    return NextResponse.json({
      success: true,
      message: 'Cập nhật lead thành công',
      data: updatedLead,
    });
  } catch (error: any) {
    console.error('Error updating lead:', error);
    return NextResponse.json(
      { success: false, message: 'Lỗi cập nhật lead', error: error.message },
      { status: 500 }
    );
  }
}

// DELETE: Xóa lead
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await connectToDatabase();

    const deleted = await Lead.findByIdAndDelete(id);

    // Update local json backup
    try {
      const dataDir = path.join(process.cwd(), 'data');
      const leadsFile = path.join(dataDir, 'leads.json');
      if (fs.existsSync(leadsFile)) {
        const fileContent = fs.readFileSync(leadsFile, 'utf-8');
        let leads = JSON.parse(fileContent || '[]');
        leads = leads.filter((l: any) => l._id !== id && l.orderCode !== deleted?.orderCode);
        fs.writeFileSync(leadsFile, JSON.stringify(leads, null, 2), 'utf-8');
      }
    } catch (e) {}

    return NextResponse.json({
      success: true,
      message: 'Đã xóa thông tin lead thành công',
    });
  } catch (error: any) {
    console.error('Error deleting lead:', error);
    return NextResponse.json(
      { success: false, message: 'Lỗi khi xóa lead', error: error.message },
      { status: 500 }
    );
  }
}
