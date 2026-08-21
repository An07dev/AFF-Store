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

    // 2. TRIGGER AI BOT AUTO-REPLY IF SENDER IS USER
    let botReplyMsg: any = null;
    if (isUser && newMsg.text?.trim()) {
      try {
        const { generateBotResponse } = await import('@/lib/ai/chatBotEngine');
        const botResult = await generateBotResponse({
          text: newMsg.text,
          conversationId,
          customerName: newMsg.customerName,
          productContext: product,
        });

        if (botResult.shouldReply && botResult.replyText) {
          botReplyMsg = await ChatMessage.create({
            conversationId,
            sender: 'bot',
            senderName: botResult.senderName || 'AI Trợ Lý ShopTik',
            customerName: customerName || 'Khách hàng',
            customerPhone: customerPhone || '',
            text: botResult.replyText,
            isRead: false,
          });

          // Update conversation last message with bot reply
          await Conversation.findOneAndUpdate(
            { conversationId },
            {
              $set: {
                lastMessage: {
                  text: botReplyMsg.text,
                  sender: 'bot',
                  createdAt: botReplyMsg.createdAt,
                },
                lastActive: new Date(),
              },
            }
          );
        }
      } catch (botErr) {
        console.error('Error in AI bot auto-reply:', botErr);
      }
    }

    const dataObj = (newMsg as any).toObject ? (newMsg as any).toObject() : newMsg;
    if (clientMsgId) {
      dataObj.clientMsgId = clientMsgId;
    }

    return NextResponse.json({
      success: true,
      data: dataObj,
      botReply: botReplyMsg ? ((botReplyMsg as any).toObject ? (botReplyMsg as any).toObject() : botReplyMsg) : null,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error.message || 'Lỗi gửi tin nhắn' },
      { status: 500 }
    );
  }
}
