import mongoose, { Schema, Document } from 'mongoose';

export interface IVariant {
  name?: string;
  color?: string;
  size?: string;
  price?: number;
  stock?: number;
}

export interface IProduct extends Document {
  name: string;
  slug: string;
  price: number;
  salePrice?: number;
  category: mongoose.Types.ObjectId;
  images: string[];
  stock: number;
  soldCount: number;
  description?: string;
  isFeatured: boolean;
  status: 'active' | 'hidden';
  variants: IVariant[];
  createdAt: Date;
  updatedAt: Date;
}

const ProductSchema = new Schema<IProduct>(
  {
    name: { type: String, required: true },
    slug: { type: String, required: true, unique: true },
    price: { type: Number, required: true },
    salePrice: { type: Number },
    category: { type: Schema.Types.ObjectId, ref: 'Category', required: true },
    images: [{ type: String }],
    stock: { type: Number, default: 0 },
    soldCount: { type: Number, default: 0 },
    description: { type: String },
    isFeatured: { type: Boolean, default: false },
    status: { type: String, enum: ['active', 'hidden'], default: 'active' },
    variants: [
      {
        name: { type: String },
        color: { type: String },
        size: { type: String },
        price: { type: Number },
        stock: { type: Number, default: 0 },
      },
    ],
  },
  { timestamps: true }
);

export default mongoose.models.Product || mongoose.model<IProduct>('Product', ProductSchema);