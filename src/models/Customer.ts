import mongoose, { Schema, Document } from 'mongoose';

export interface ICustomer extends Document {
  name: string;
  phone?: string;
  email?: string;
  avatar?: string;
  provider?: 'google' | 'facebook' | 'local';
  isLocked: boolean;
  lockReason?: string;
  address?: string;
  province?: string;
  district?: string;
  ward?: string;
  orderCount: number;
  totalSpent: number;
  totalItemsBought: number;
  lastOrderAt?: Date;
  lastLoginAt?: Date;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const CustomerSchema = new Schema<ICustomer>(
  {
    name: { type: String, required: true },
    phone: { type: String, sparse: true },
    email: { type: String, sparse: true, lowercase: true },
    avatar: { type: String },
    provider: { type: String, enum: ['google', 'facebook', 'local'], default: 'local' },
    isLocked: { type: Boolean, default: false },
    lockReason: { type: String },
    address: { type: String },
    province: { type: String },
    district: { type: String },
    ward: { type: String },
    orderCount: { type: Number, default: 0 },
    totalSpent: { type: Number, default: 0 },
    totalItemsBought: { type: Number, default: 0 },
    lastOrderAt: { type: Date },
    lastLoginAt: { type: Date },
    notes: { type: String },
  },
  { timestamps: true }
);

export default mongoose.models.Customer || mongoose.model<ICustomer>('Customer', CustomerSchema);