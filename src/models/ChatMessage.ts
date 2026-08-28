import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IChatMessage extends Document {
  conversationId: string;
  sender: 'user' | 'admin' | 'bot';
  senderName: string;
  customerName?: string;
  customerPhone?: string;
  customerEmail?: string;
  customerAvatar?: string;
  customerProvider?: 'google' | 'facebook' | 'local' | 'guest';
  text: string;
  image?: string;
  product?: {
    name: string;
    price: number;
    image: string;
    slug: string;
  };
  suggestedProducts?: Array<{
    name: string;
    price: number;
    salePrice?: number;
    image?: string;
    slug: string;
  }>;
  isRead: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const ChatMessageSchema = new Schema<IChatMessage>(
  {
    conversationId: { type: String, required: true, index: true },
    sender: { type: String, enum: ['user', 'admin', 'bot'], required: true },
    senderName: { type: String, default: 'Khách hàng' },
    customerName: { type: String, default: 'Khách hàng' },
    customerPhone: { type: String, default: '' },
    customerEmail: { type: String, default: '' },
    customerAvatar: { type: String, default: '' },
    customerProvider: {
      type: String,
      enum: ['google', 'facebook', 'local', 'guest'],
      default: 'guest',
    },
    text: { type: String, default: '' },
    image: { type: String, default: '' },
    product: {
      name: { type: String },
      price: { type: Number },
      image: { type: String },
      slug: { type: String },
    },
    suggestedProducts: [
      {
        name: { type: String },
        price: { type: Number },
        salePrice: { type: Number },
        image: { type: String },
        slug: { type: String },
      },
    ],
    isRead: { type: Boolean, default: false },
  },
  { timestamps: true }
);

if (mongoose.models && mongoose.models.ChatMessage) {
  delete (mongoose.models as any).ChatMessage;
}

const ChatMessage: Model<IChatMessage> =
  mongoose.models.ChatMessage || mongoose.model<IChatMessage>('ChatMessage', ChatMessageSchema);

export default ChatMessage;
