import { NextResponse } from 'next/server';
import mongoose from 'mongoose';
import connectToDatabase from '@/lib/mongodb';
import Review from '@/models/Review';

export async function POST(request: Request) {
  try {
    await connectToDatabase();
    const body = await request.json();
    const { reviewId } = body;

    if (!reviewId || !mongoose.Types.ObjectId.isValid(reviewId)) {
      return NextResponse.json(
        { success: false, message: 'ID đánh giá không hợp lệ' },
        { status: 400 }
      );
    }

    const updated = await Review.findByIdAndUpdate(
      reviewId,
      { $inc: { likes: 1 } },
      { new: true }
    );

    if (!updated) {
      return NextResponse.json(
        { success: false, message: 'Không tìm thấy đánh giá' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: { likes: updated.likes },
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error.message || 'Lỗi khi thích đánh giá' },
      { status: 500 }
    );
  }
}
