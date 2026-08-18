import mongoose, { Schema, Document } from 'mongoose';

export interface IOrderItem {
  productId: mongoose.Types.ObjectId;
  name: string;
  price: number;
  quantity: number;
  image?: string;
  variant?: any;
}

export interface IOrderCustomer {
  name: string;
  phone: string;
  email?: string;
  address: string;
  province?: string;
  district?: string;
  ward?: string;
}

export interface IOrder extends Document {
  orderCode: string;
  customer: IOrderCustomer;
  items: IOrderItem[];
  subtotal: number;
  shippingFee: number;
  discountAmount: number;
  totalAmount: number;
  paymentMethod: 'cod' | 'bank_transfer' | 'online';
  paymentStatus: 'unpaid' | 'paid' | 'refunded';
  status: 'pending' | 'confirmed' | 'shipping' | 'delivered' | 'cancelled';
  shippingProvider?: string;
  trackingCode?: string;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const OrderSchema = new Schema<IOrder>(
  {
    orderCode: { type: String, required: true, unique: true },
    customer: {
      name: { type: String, required: true },
      phone: { type: String, required: true },
      email: { type: String },
      address: { type: String, required: true },
      province: { type: String },
      district: { type: String },
      ward: { type: String },
    },
    items: [
      {
        productId: { type: Schema.Types.ObjectId, ref: 'Product' },
        name: { type: String, required: true },
        price: { type: Number, required: true },
        quantity: { type: Number, required: true, default: 1 },
        image: { type: String },
        variant: { type: Schema.Types.Mixed },
      },
    ],
    subtotal: { type: Number, default: 0 },
    shippingFee: { type: Number, default: 0 },
    discountAmount: { type: Number, default: 0 },
    totalAmount: { type: Number, required: true },
    paymentMethod: {
      type: String,
      enum: ['cod', 'bank_transfer', 'online'],
      default: 'cod',
    },
    paymentStatus: {
      type: String,
      enum: ['unpaid', 'paid', 'refunded'],
      default: 'unpaid',
    },
    status: {
      type: String,
      enum: ['pending', 'confirmed', 'shipping', 'delivered', 'cancelled'],
      default: 'pending',
    },
    shippingProvider: { type: String },
    trackingCode: { type: String },
    notes: { type: String },
  },
  { timestamps: true }
);

export default mongoose.models.Order || mongoose.model<IOrder>('Order', OrderSchema);