import mongoose, { Schema, Document, Model } from 'mongoose';

export interface ILead extends Document {
  orderCode: string;
  name: string;
  phone: string;
  email?: string;
  notes?: string;
  plan: string;
  amount: number;
  paymentStatus: 'pending' | 'paid' | 'failed' | 'cancelled';
  paymentMethod: 'vietqr' | 'bank_transfer' | 'cod' | 'momo' | 'other';
  source?: string;
  ip?: string;
  userAgent?: string;
  isProcessed?: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const LeadSchema: Schema = new Schema<ILead>(
  {
    orderCode: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      index: true,
    },
    name: {
      type: String,
      required: [true, 'Họ tên là bắt buộc'],
      trim: true,
    },
    phone: {
      type: String,
      required: [true, 'Số điện thoại là bắt buộc'],
      trim: true,
      index: true,
    },
    email: {
      type: String,
      trim: true,
      default: '',
    },
    notes: {
      type: String,
      trim: true,
      default: '',
    },
    plan: {
      type: String,
      required: true,
      default: '399k',
      index: true,
    },
    amount: {
      type: Number,
      default: 399000,
    },
    paymentStatus: {
      type: String,
      enum: ['pending', 'paid', 'failed', 'cancelled'],
      default: 'pending',
      index: true,
    },
    paymentMethod: {
      type: String,
      enum: ['vietqr', 'bank_transfer', 'cod', 'momo', 'other'],
      default: 'vietqr',
    },
    source: {
      type: String,
      default: 'landing_page',
    },
    ip: {
      type: String,
      default: '',
    },
    userAgent: {
      type: String,
      default: '',
    },
    isProcessed: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

// Prevent mongoose model overwrite error during hot-reload
export const Lead: Model<ILead> =
  mongoose.models.Lead || mongoose.model<ILead>('Lead', LeadSchema);

export default Lead;
