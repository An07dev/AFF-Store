import mongoose, { Schema, Document } from 'mongoose';

export interface IUser extends Document {
  name: string;
  email: string;
  phone?: string;
  password?: string;
  role: 'admin' | 'staff' | 'customer';
  avatar?: string;
  provider?: 'google' | 'facebook' | 'local';
  isLocked: boolean;
  lockReason?: string;
  lastLoginAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new Schema<IUser>(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true, lowercase: true },
    phone: { type: String },
    password: { type: String },
    role: { type: String, enum: ['admin', 'staff', 'customer'], default: 'customer' },
    avatar: { type: String },
    provider: { type: String, enum: ['google', 'facebook', 'local'], default: 'local' },
    isLocked: { type: Boolean, default: false },
    lockReason: { type: String },
    lastLoginAt: { type: Date },
  },
  { timestamps: true }
);

export default mongoose.models.User || mongoose.model<IUser>('User', UserSchema);