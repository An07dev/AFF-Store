import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IOrderItem {
  productId?: any;
  name?: string;
  productName?: string;
  variant?: any;
  price: number;
  quantity: number;
  image?: string;
  total?: number;
}

export interface IOrderCustomer {
  name: string;
  phone: string;
  email?: string;
  address?: string;
  province?: string;
  city?: string;
  district?: string;
  ward?: string;
}

export interface IShippingLog {
  time?: string;
  status?: string;
  location?: string;
  description?: string;
  shipperName?: string;
  shipperPhone?: string;
  carrier?: string;
  createdAt?: Date;
}

export interface IOrder extends Document {
  orderCode: string;
  inventoryDeducted?: boolean;
  customer: IOrderCustomer;
  items: IOrderItem[];
  subtotal: number;
  shippingFee: number;
  discountAmount?: number;
  discount?: number;
  totalAmount: number;
  paymentMethod: 'cod' | 'bank_transfer' | 'online' | 'vietqr' | 'momo' | 'other' | string;
  paymentStatus: 'unpaid' | 'paid' | 'pending' | 'failed' | 'refunded' | string;
  status: 'pending' | 'confirmed' | 'shipping' | 'delivering' | 'delivered' | 'cancelled' | 'returned' | string;
  shippingProvider?: string;
  shippingCarrier?: 'ghn' | 'ghtk' | 'viettel_post' | 'manual' | string;
  shippingStatus?: 'pending' | 'picking' | 'delivering' | 'delivered' | 'cancelled' | string;
  trackingCode?: string;
  carrierOrderId?: string;
  paidAt?: Date;
  transactionId?: string;
  voucherCode?: string;
  voucherDiscount?: number;
  shippingLogs?: IShippingLog[];
  notes?: string;
  metadata?: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
}

const OrderSchema = new Schema<IOrder>(
  {
    orderCode: { type: String, required: true, unique: true, index: true },
    inventoryDeducted: { type: Boolean, default: false },
    customer: {
      name: { type: String, required: true, trim: true },
      phone: { type: String, required: true, trim: true, index: true },
      email: { type: String, trim: true, default: '' },
      address: { type: String, trim: true, default: '' },
      province: { type: String, trim: true, default: '' },
      city: { type: String, trim: true, default: '' },
      district: { type: String, trim: true, default: '' },
      ward: { type: String, trim: true, default: '' },
    },
    items: [
      {
        productId: { type: Schema.Types.Mixed },
        name: { type: String },
        productName: { type: String },
        price: { type: Number, required: true, default: 0 },
        quantity: { type: Number, required: true, default: 1 },
        image: { type: String, default: '' },
        variant: { type: Schema.Types.Mixed },
        total: { type: Number, default: 0 },
      },
    ],
    subtotal: { type: Number, default: 0 },
    shippingFee: { type: Number, default: 0 },
    discountAmount: { type: Number, default: 0 },
    discount: { type: Number, default: 0 },
    totalAmount: { type: Number, required: true, default: 0 },
    paymentMethod: {
      type: String,
      default: 'cod',
    },
    paymentStatus: {
      type: String,
      default: 'unpaid',
      index: true,
    },
    status: {
      type: String,
      default: 'pending',
      index: true,
    },
    shippingProvider: { type: String },
    shippingCarrier: { type: String, default: 'manual' },
    trackingCode: { type: String, default: '' },
    carrierOrderId: { type: String, default: '' },
    shippingStatus: { type: String, default: 'pending' },
    paidAt: { type: Date },
    transactionId: { type: String, default: '' },
    voucherCode: { type: String, default: '' },
    voucherDiscount: { type: Number, default: 0 },
    shippingLogs: [
      {
        time: { type: String },
        status: { type: String },
        location: { type: String },
        description: { type: String },
        shipperName: { type: String },
        shipperPhone: { type: String },
        carrier: { type: String },
        createdAt: { type: Date, default: Date.now },
      },
    ],
    notes: { type: String, default: '' },
    metadata: {
      type: Schema.Types.Mixed,
      default: {},
    },
  },
  { timestamps: true }
);

export const Order: Model<IOrder> =
  mongoose.models.Order || mongoose.model<IOrder>('Order', OrderSchema);

export default Order;
