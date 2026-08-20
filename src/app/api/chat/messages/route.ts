import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import ChatMessage from '@/models/ChatMessage';
import Conversation from '@/models/Conversation';

export async function GET(request: Request) {
  try {
    await connectToDatabase();
    const { searchParams } = new URL(request.url);
    const conversationId = searchParams.get('conversationId');

    if (!conversationId) {
      return NextResponse.json(
        { success: false, message: 'Thiếu conversationId' },
        { status: 400 }
      );
    }

    const messages = await ChatMessage.find({ conversationId })
      .sort({ createdAt: 1 })
      .limit(300);

    return NextResponse.json({
      success: true,
      data: messages,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error.message || 'Lỗi tải tin nhắn' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    await connectToDatabase();
    const body = await request.json();

    const {
      clientMsgId,
      conversationId,
      sender,
      senderName,
      customerName,
      customerPhone,
      text,
      image,
      product,
    } = body;

    if (!conversationId || !sender || (!text?.trim() && !image)) {
      return NextResponse.json(
        { success: false, message: 'Nội dung tin nhắn không hợp lệ' },
        { status: 400 }
      );
    }

    const newMsg = await ChatMessage.create({
      conversationId,
      sender,
      senderName: senderName || (sender === 'admin' ? 'Admin CSKH' : 'Khách hàng'),
      customerName: customerName || 'Khách hàng',
      customerPhone: customerPhone || '',
      text: text?.trim() || '',
      image: image || '',
      product: product || undefined,
      isRead: sender === 'admin',
    });

    // Update Conversation metadata
    const isUser = sender === 'user';
    const convUpdate: any = {
      lastMessage: {
        text: newMsg.text || (newMsg.image ? '[Hình ảnh]' : ''),
        image: newMsg.image || '',
        sender: newMsg.sender,
        createdAt: newMsg.createdAt,
      },
      lastActive: new Date(),
    };

    if (customerName) convUpdate.customerName = customerName;
    if (customerPhone) {
      convUpdate.customerPhone = customerPhone;
      convUpdate.status = 'has_phone';
    }
    if (product) convUpdate.productContext = product;

    const incField = isUser ? { unreadCountAdmin: 1 } : { unreadCountUser: 1 };

    await Conversation.findOneAndUpdate(
      { conversationId },
      {
        $set: convUpdate,
        $inc: incField,
      },
      { upsert: true, new: true }
    );

    const dataObj = (newMsg as any).toObject ? (newMsg as any).toObject() : newMsg;
    if (clientMsgId) {
      dataObj.clientMsgId = clientMsgId;
    }

    return NextResponse.json({
      success: true,
      data: dataObj,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error.message || 'Lỗi gửi tin nhắn' },
      { status: 500 }
    );
  }
}
