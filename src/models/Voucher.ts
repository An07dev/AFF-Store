import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IVoucher extends Document {
  code: string;
  name: string;
  description?: string;
  discountType: 'fixed' | 'percent';
  discountValue: number;
  maxDiscountAmount: number;
  minOrderValue: number;
  totalUsageLimit: number;
  usedCount: number;
  limitPerCustomer: number;
  startDate: Date;
  endDate: Date;
  isActive: boolean;
  isPublic: boolean;
  applicableType: 'all' | 'category' | 'specific_products';
  applicableCategories?: string[];
  applicableProducts?: mongoose.Types.ObjectId[];
  createdAt: Date;
  updatedAt: Date;
}

const VoucherSchema: Schema<IVoucher> = new Schema(
  {
    code: {
      type: String,
      required: [true, 'Vui lòng nhập mã Voucher'],
      unique: true,
      trim: true,
      uppercase: true,
      index: true,
    },
    name: {
      type: String,
      required: [true, 'Vui lòng nhập tên/tiêu đề Voucher'],
      trim: true,
    },
    description: {
      type: String,
      default: '',
      trim: true,
    },
    discountType: {
      type: String,
      enum: ['fixed', 'percent'],
      default: 'fixed',
      required: true,
    },
    discountValue: {
      type: Number,
      required: [true, 'Vui lòng nhập giá trị giảm'],
      min: [0, 'Giá trị giảm không được âm'],
    },
    maxDiscountAmount: {
      type: Number,
      default: 0, // 0 means no limit for percent discount
      min: 0,
    },
    minOrderValue: {
      type: Number,
      default: 0,
      min: 0,
    },
    totalUsageLimit: {
      type: Number,
      default: 0, // 0 means unlimited
      min: 0,
    },
    usedCount: {
      type: Number,
      default: 0,
      min: 0,
    },
    limitPerCustomer: {
      type: Number,
      default: 1, // 1 per customer phone
      min: 1,
    },
    startDate: {
      type: Date,
      default: Date.now,
    },
    endDate: {
      type: Date,
      required: [true, 'Vui lòng chọn ngày kết thúc'],
    },
    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },
    isPublic: {
      type: Boolean,
      default: true, // Display on storefront collection bar
      index: true,
    },
    applicableType: {
      type: String,
      enum: ['all', 'category', 'specific_products'],
      default: 'all',
    },
    applicableCategories: {
      type: [String],
      default: [],
    },
    applicableProducts: [
      {
        type: Schema.Types.ObjectId,
        ref: 'Product',
      },
    ],
  },
  {
    timestamps: true,
  }
);

// Prevent re-compilation in Next.js development HMR
const Voucher: Model<IVoucher> =
  mongoose.models.Voucher || mongoose.model<IVoucher>('Voucher', VoucherSchema);

export default Voucher;
