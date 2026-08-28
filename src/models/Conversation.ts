import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IConversation extends Document {
  conversationId: string;
  customerName: string;
  customerPhone?: string;
  customerEmail?: string;
  customerAvatar?: string;
  customerProvider?: 'google' | 'facebook' | 'local' | 'guest';
  customerId?: string;
  deviceInfo?: string;
  status: 'unread' | 'active' | 'has_phone' | 'resolved';
  tags: string[];
  adminNotes?: string;
  unreadCountAdmin: number;
  unreadCountUser: number;
  lastMessage?: {
    text: string;
    image?: string;
    sender: 'user' | 'admin' | 'bot';
    createdAt: Date;
  };
  productContext?: {
    name: string;
    price: number;
    image: string;
    slug: string;
  };
  lastActive: Date;
  createdAt: Date;
  updatedAt: Date;
}

const ConversationSchema = new Schema<IConversation>(
  {
    conversationId: { type: String, required: true, unique: true, index: true },
    customerName: { type: String, default: 'Khách hàng' },
    customerPhone: { type: String, default: '' },
    customerEmail: { type: String, default: '' },
    customerAvatar: { type: String, default: '' },
    customerProvider: {
      type: String,
      enum: ['google', 'facebook', 'local', 'guest'],
      default: 'guest',
    },
    customerId: { type: String, default: '' },
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

if (mongoose.models && mongoose.models.Conversation) {
  delete (mongoose.models as any).Conversation;
}

const Conversation: Model<IConversation> =
  mongoose.models.Conversation || mongoose.model<IConversation>('Conversation', ConversationSchema);

export default Conversation;
