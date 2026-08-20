import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import Conversation from '@/models/Conversation';
import ChatMessage from '@/models/ChatMessage';

export async function GET(request: Request) {
  try {
    await connectToDatabase();
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const search = searchParams.get('search');
    const hasPhoneOnly = searchParams.get('hasPhone') === 'true';

    const query: any = {};

    if (status && status !== 'all') {
      query.status = status;
    }

    if (hasPhoneOnly) {
      query.customerPhone = { $exists: true, $ne: '' };
    }

    if (search) {
      const searchRegex = new RegExp(search, 'i');
      query.$or = [
        { customerName: searchRegex },
        { customerPhone: searchRegex },
        { conversationId: searchRegex },
        { tags: searchRegex },
        { 'lastMessage.text': searchRegex },
      ];
    }

    // Try fetching from Conversation collection
    let conversations = await Conversation.find(query)
      .sort({ lastActive: -1 })
      .limit(100)
      .lean();

    // Fallback: If Conversation collection is empty or sparse, sync from ChatMessage aggregation
    if (conversations.length === 0 && !search && (!status || status === 'all')) {
      const aggregated = await ChatMessage.aggregate([
        { $sort: { createdAt: -1 } },
        {
          $group: {
            _id: '$conversationId',
            lastMessage: { $first: '$$ROOT' },
            customerName: { $first: '$customerName' },
            customerPhone: { $first: '$customerPhone' },
            productContext: { $first: '$product' },
            lastActive: { $first: '$createdAt' },
            unreadCountAdmin: {
              $sum: {
                $cond: [{ $and: [{ $eq: ['$isRead', false] }, { $eq: ['$sender', 'user'] }] }, 1, 0],
              },
            },
          },
        },
        { $sort: { lastActive: -1 } },
        { $limit: 50 },
      ]);

      if (aggregated.length > 0) {
        // Populate into Conversation collection for next time
        for (const item of aggregated) {
          await Conversation.findOneAndUpdate(
            { conversationId: item._id },
            {
              $setOnInsert: {
                conversationId: item._id,
                customerName: item.customerName || 'Khách hàng',
                customerPhone: item.customerPhone || '',
                status: item.customerPhone ? 'has_phone' : item.unreadCountAdmin > 0 ? 'unread' : 'active',
                productContext: item.productContext || undefined,
              },
              $set: {
                lastMessage: {
                  text: item.lastMessage?.text || '',
                  image: item.lastMessage?.image || '',
                  sender: item.lastMessage?.sender || 'user',
                  createdAt: item.lastMessage?.createdAt || new Date(),
                },
                unreadCountAdmin: item.unreadCountAdmin || 0,
                lastActive: item.lastActive || new Date(),
              },
            },
            { upsert: true }
          );
        }

        conversations = await Conversation.find(query).sort({ lastActive: -1 }).limit(100).lean();
      }
    }

    return NextResponse.json({
      success: true,
      data: conversations,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error.message || 'Lỗi tải danh sách hội thoại' },
      { status: 500 }
    );
  }
}

export async function PATCH(request: Request) {
  try {
    await connectToDatabase();
    const body = await request.json();
    const { conversationId, customerName, customerPhone, tags, status, adminNotes } = body;

    if (!conversationId) {
      return NextResponse.json(
        { success: false, message: 'Thiếu conversationId' },
        { status: 400 }
      );
    }

    const updateFields: any = {};
    if (customerName !== undefined) updateFields.customerName = customerName;
    if (customerPhone !== undefined) {
      updateFields.customerPhone = customerPhone;
      if (customerPhone && (!status || status === 'unread')) {
        updateFields.status = 'has_phone';
      }
    }
    if (tags !== undefined) updateFields.tags = tags;
    if (status !== undefined) updateFields.status = status;
    if (adminNotes !== undefined) updateFields.adminNotes = adminNotes;

    const updated = await Conversation.findOneAndUpdate(
      { conversationId },
      { $set: updateFields },
      { new: true, upsert: true }
    );

    // Also update sender info in ChatMessages for consistency
    if (customerName || customerPhone) {
      const msgUpdate: any = {};
      if (customerName) {
        msgUpdate.customerName = customerName;
        msgUpdate.senderName = customerName;
      }
      if (customerPhone) msgUpdate.customerPhone = customerPhone;

      await ChatMessage.updateMany(
        { conversationId, sender: 'user' },
        { $set: msgUpdate }
      );
    }

    return NextResponse.json({
      success: true,
      data: updated,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error.message || 'Lỗi cập nhật hội thoại' },
      { status: 500 }
    );
  }
}
