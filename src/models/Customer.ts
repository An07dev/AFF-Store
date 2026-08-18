import mongoose, { Schema, Document } from 'mongoose';

export interface ICustomer extends Document {
  name: string;
  phone: string;
  email?: string;
  address?: string;
  province?: string;
  district?: string;
  ward?: string;
  orderCount: number;
  totalSpent: number;
  lastOrderAt?: Date;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const CustomerSchema = new Schema<ICustomer>(
  {
    name: { type: String, required: true },
    phone: { type: String, required: true, unique: true },
    email: { type: String },
    address: { type: String },
    province: { type: String },
    district: { type: String },
    ward: { type: String },
    orderCount: { type: Number, default: 0 },
    totalSpent: { type: Number, default: 0 },
    lastOrderAt: { type: Date },
    notes: { type: String },
  },
  { timestamps: true }
);

export default mongoose.models.Customer || mongoose.model<ICustomer>('Customer', CustomerSchema);