import http from 'http';
import { Server } from 'socket.io';
import mongoose from 'mongoose';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load .env.local if exists
function loadEnv() {
  const envPath = path.join(__dirname, '.env.local');
  if (fs.existsSync(envPath)) {
    const content = fs.readFileSync(envPath, 'utf8');
    content.split('\n').forEach((line) => {
      const trimmed = line.trim();
      if (trimmed && !trimmed.startsWith('#')) {
        const [key, ...values] = trimmed.split('=');
        if (key && values.length > 0) {
          process.env[key.trim()] = values.join('=').trim();
        }
      }
    });
  }
}

loadEnv();

const MONGODB_URI =
  process.env.MONGODB_URI ||
  'mongodb+srv://bigmansale2_db_user:mjX8Z79pPTpiQLeq@cluster0.o9kuvob.mongodb.net/webstore?retryWrites=true&w=majority&appName=Cluster0';
const PORT = process.env.PORT_SOCKET || process.env.SOCKET_PORT || 3001;

// Define Mongoose Models inside Socket Server
const ChatMessageSchema = new mongoose.Schema(
  {
    conversationId: { type: String, required: true, index: true },
    sender: { type: String, enum: ['user', 'admin', 'bot'], required: true },
    senderName: { type: String, default: 'Khách hàng' },
    customerName: { type: String, default: 'Khách hàng' },
    customerPhone: { type: String, default: '' },
    text: { type: String, default: '' },
    image: { type: String, default: '' },
    product: {
      name: { type: String },
      price: { type: Number },
      image: { type: String },
      slug: { type: String },
    },
    isRead: { type: Boolean, default: false },
  },
  { timestamps: true }
);

const ConversationSchema = new mongoose.Schema(
  {
    conversationId: { type: String, required: true, unique: true, index: true },
    customerName: { type: String, default: 'Khách hàng' },
    customerPhone: { type: String, default: '' },
    deviceInfo: { type: String, default: '' },
    status: {
      type: String,
      enum: ['unread', 'active', 'has_phone', 'resolved'],
      default: 'unread',
    },
    tags: { type: [String], default: [] },
    adminNotes: { type: String, default: '' },
    unreadCountAdmin: { type: Number, default: 0 },
    unreadCountUser: { type: Number, default: 0 },
    lastMessage: {
      text: { type: String, default: '' },
      image: { type: String, default: '' },
      sender: { type: String, default: 'user' },
      createdAt: { type: Date, default: Date.now },
    },
    productContext: {
      name: { type: String },
      price: { type: Number },
      image: { type: String },
      slug: { type: String },
    },
    lastActive: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

const ChatMessage = mongoose.models.ChatMessage || mongoose.model('ChatMessage', ChatMessageSchema);
const Conversation = mongoose.models.Conversation || mongoose.model('Conversation', ConversationSchema);

// Connect to MongoDB
async function connectDB() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('✅ [Socket Server] MongoDB connected successfully');
  } catch (err) {
    console.error('❌ [Socket Server] MongoDB connection error:', err);
  }
}

connectDB();

const server = http.createServer((req, res) => {
  if (req.url === '/health') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ status: 'ok', time: new Date() }));
    return;
  }
  res.writeHead(200, { 'Content-Type': 'text/plain' });
  res.end('ShopTik Real-time Live Chat Socket.IO Server is running.');
});

const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST'],
  },
  pingTimeout: 60000,
  pingInterval: 25000,
});

io.on('connection', (socket) => {
  console.log(`🔌 Client connected: ${socket.id}`);

  // 1. Join Room
  socket.on('join_room', async (data) => {
    try {
      const { conversationId, role, customerInfo } = data || {};
      socket.data = { conversationId, role, customerInfo };

      if (role === 'admin') {
        socket.join('admin_hub');
        console.log(`👨‍💼 Admin joined admin_hub (${socket.id})`);
        if (conversationId) {
          socket.join(`conv_${conversationId}`);
          console.log(`👨‍💼 Admin focused on conv_${conversationId}`);
        }
      } else {
        if (conversationId) {
          socket.join(`conv_${conversationId}`);
          console.log(`👤 Customer joined conv_${conversationId} (${socket.id})`);

          // Ensure conversation document exists
          if (customerInfo) {
            await Conversation.findOneAndUpdate(
              { conversationId },
              {
                $setOnInsert: {
                  conversationId,
                  customerName: customerInfo.name || 'Khách hàng',
                  customerPhone: customerInfo.phone || '',
                  status: customerInfo.phone ? 'has_phone' : 'unread',
                },
                $set: {
                  lastActive: new Date(),
                  ...(customerInfo.product ? { productContext: customerInfo.product } : {}),
                },
              },
              { upsert: true, new: true }
            );
          }
        }
      }
    } catch (err) {
      console.error('Error in join_room:', err);
    }
  });

  // 2. Send Message
  socket.on('send_message', async (data, callback) => {
    try {
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
      } = data || {};

      if (!conversationId || !sender || (!text?.trim() && !image)) {
        if (typeof callback === 'function') callback({ success: false, error: 'Dữ liệu không hợp lệ' });
        return;
      }

      // Save Message to DB
      const newMsg = await ChatMessage.create({
        conversationId,
        sender,
        senderName: senderName || (sender === 'admin' ? 'Admin CSKH' : customerName || 'Khách hàng'),
        customerName: customerName || 'Khách hàng',
        customerPhone: customerPhone || '',
        text: text?.trim() || '',
        image: image || '',
        product: product || undefined,
        isRead: sender === 'admin',
      });

      const msgObj = newMsg.toObject();
      if (clientMsgId) {
        msgObj.clientMsgId = clientMsgId;
      }

      // Update / Upsert Conversation metadata
      const isUser = sender === 'user';
      const convUpdate = {
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

      const updatedConv = await Conversation.findOneAndUpdate(
        { conversationId },
        {
          $set: convUpdate,
          $inc: incField,
        },
        { upsert: true, new: true }
      );

      // Broadcast message to room conv_{conversationId}
      io.to(`conv_${conversationId}`).emit('receive_message', msgObj);

      // Đồng thời phát tin nhắn tới admin_hub để tất cả Admin trực tuyến nhận ngay lập tức
      io.to('admin_hub').emit('receive_message', msgObj);

      // If sent by user, send alert to Admin Hub
      if (isUser) {
        io.to('admin_hub').emit('new_message_notification', {
          conversationId,
          customerName: newMsg.customerName,
          customerPhone: newMsg.customerPhone,
          text: newMsg.text,
          image: newMsg.image,
          createdAt: newMsg.createdAt,
          conversation: updatedConv,
        });
      }

      if (typeof callback === 'function') {
        callback({ success: true, data: msgObj });
      }
    } catch (err) {
      console.error('Error in send_message:', err);
      if (typeof callback === 'function') {
        callback({ success: false, error: err.message });
      }
    }
  });

  // 3. Typing indicator
  socket.on('typing', (data) => {
    const { conversationId, sender, isTyping } = data || {};
    if (conversationId) {
      socket.to(`conv_${conversationId}`).emit('user_typing', {
        conversationId,
        sender,
        isTyping: !!isTyping,
      });

      // Nếu là khách đang gõ, thông báo cho admin_hub
      if (sender === 'user') {
        socket.to('admin_hub').emit('user_typing', {
          conversationId,
          sender,
          isTyping: !!isTyping,
        });
      }
    }
  });

  // 4. Mark Read
  socket.on('mark_read', async (data) => {
    try {
      const { conversationId, readBy } = data || {};
      if (!conversationId) return;

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

      io.to(`conv_${conversationId}`).emit('messages_read', { conversationId, readBy });
      io.to('admin_hub').emit('conversation_updated', { conversationId, readBy });
    } catch (err) {
      console.error('Error in mark_read:', err);
    }
  });

  // 5. Update Customer Info / Tags / Status
  socket.on('update_conversation', async (data, callback) => {
    try {
      const { conversationId, customerName, customerPhone, tags, status, adminNotes } = data || {};
      if (!conversationId) return;

      const updateData = {};
      if (customerName !== undefined) updateData.customerName = customerName;
      if (customerPhone !== undefined) updateData.customerPhone = customerPhone;
      if (tags !== undefined) updateData.tags = tags;
      if (status !== undefined) updateData.status = status;
      if (adminNotes !== undefined) updateData.adminNotes = adminNotes;

      const updated = await Conversation.findOneAndUpdate(
        { conversationId },
        { $set: updateData },
        { new: true }
      );

      io.to('admin_hub').emit('conversation_updated', { conversationId, conversation: updated });
      io.to(`conv_${conversationId}`).emit('conversation_meta', updated);

      if (typeof callback === 'function') callback({ success: true, data: updated });
    } catch (err) {
      console.error('Error in update_conversation:', err);
      if (typeof callback === 'function') callback({ success: false, error: err.message });
    }
  });

  // 6. Disconnect
  socket.on('disconnect', () => {
    console.log(`🔌 Client disconnected: ${socket.id}`);
  });
});

server.listen(PORT, () => {
  console.log(`🚀 [Socket.IO Server] Listening on http://localhost:${PORT}`);
});
