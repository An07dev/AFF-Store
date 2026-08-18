import mongoose, { Schema, Document } from 'mongoose';

export interface IUser extends Document {
  name: string;
  email: string;
  phone?: string;
  password?: string;
  role: 'admin' | 'staff' | 'customer';
  avatar?: string;
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new Schema<IUser>(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true, lowercase: true },
    phone: { type: String },
    password: { type: String, required: true },
    role: { type: String, enum: ['admin', 'staff', 'customer'], default: 'customer' },
    avatar: { type: String },
  },
  { timestamps: true }
);

export default mongoose.models.User || mongoose.model<IUser>('User', UserSchema);