import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import ChatMessage from '@/models/ChatMessage';
import Conversation from '@/models/Conversation';

export async function PUT(request: Request) {
  try {
    await connectToDatabase();
    const body = await request.json();
    const { conversationId, readBy } = body;

    if (!conversationId) {
      return NextResponse.json(
        { success: false, message: 'Thiếu conversationId' },
        { status: 400 }
      );
    }

    if (readBy === 'admin') {
      await ChatMessage.updateMany(
        { conversationId, sender: 'user', isRead: false },
        { $set: { isRead: true } }
      );
      await Conversation.findOneAndUpdate(
        { conversationId },
        { $set: { unreadCountAdmin: 0 } }
      );
    } else {
      await ChatMessage.updateMany(
        { conversationId, sender: 'admin', isRead: false },
        { $set: { isRead: true } }
      );
      await Conversation.findOneAndUpdate(
        { conversationId },
        { $set: { unreadCountUser: 0 } }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Đã đánh dấu đã đọc',
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error.message || 'Lỗi cập nhật trạng thái đã đọc' },
      { status: 500 }
    );
  }
}
