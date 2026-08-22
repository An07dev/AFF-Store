import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IFlashSaleSlot {
  id: string;
  startHour: number;
  startMinute: number;
  endHour: number;
  endMinute: number;
  label: string;
  enabled: boolean;
}

export interface IFlashSaleItem {
  _id?: any;
  productId: mongoose.Types.ObjectId;
  flashPrice: number;
  originalPrice: number;
  discountPercent: number;
  flashStock: number;
  soldCount: number;
  isActive: boolean;
}

export interface IFomoSettings {
  enableLivePurchasePopup: boolean;
  popupIntervalSeconds: number;
  enableCheckoutTimer: boolean;
  checkoutTimerMinutes: number;
  enableViewerCount: boolean;
}

export interface IFlashSale extends Document {
  title: string;
  subtitle?: string;
  isActive: boolean;
  type: 'daily_slots' | 'custom_range';
  slots: IFlashSaleSlot[];
  startTime?: Date;
  endTime?: Date;
  items: IFlashSaleItem[];
  fomoSettings: IFomoSettings;
  stats: {
    totalOrders: number;
    totalRevenue: number;
  };
  createdAt: Date;
  updatedAt: Date;
}

const FlashSaleSlotSchema = new Schema<IFlashSaleSlot>(
  {
    id: { type: String, required: true },
    startHour: { type: Number, required: true, min: 0, max: 23 },
    startMinute: { type: Number, default: 0, min: 0, max: 59 },
    endHour: { type: Number, required: true, min: 0, max: 24 },
    endMinute: { type: Number, default: 0, min: 0, max: 59 },
    label: { type: String, required: true },
    enabled: { type: Boolean, default: true },
  },
  { _id: false }
);

const FlashSaleItemSchema = new Schema<IFlashSaleItem>(
  {
    productId: { type: Schema.Types.ObjectId, ref: 'Product', required: true },
    flashPrice: { type: Number, required: true, min: 0 },
    originalPrice: { type: Number, required: true, min: 0 },
    discountPercent: { type: Number, default: 0, min: 0, max: 100 },
    flashStock: { type: Number, required: true, default: 50, min: 1 },
    soldCount: { type: Number, default: 0, min: 0 },
    isActive: { type: Boolean, default: true },
  },
  { _id: true }
);

const FomoSettingsSchema = new Schema<IFomoSettings>(
  {
    enableLivePurchasePopup: { type: Boolean, default: true },
    popupIntervalSeconds: { type: Number, default: 25, min: 5, max: 120 },
    enableCheckoutTimer: { type: Boolean, default: true },
    checkoutTimerMinutes: { type: Number, default: 15, min: 5, max: 60 },
    enableViewerCount: { type: Boolean, default: true },
  },
  { _id: false }
);

const FlashSaleSchema = new Schema<IFlashSale>(
  {
    title: { type: String, default: '⚡ SIÊU SALE GIỜ VÀNG - GIẢM TỚI 50%' },
    subtitle: { type: String, default: 'Săn deal chớp nhoáng • Số lượng có hạn • Giá rẻ vô địch' },
    isActive: { type: Boolean, default: true },
    type: { type: String, enum: ['daily_slots', 'custom_range'], default: 'daily_slots' },
    slots: {
      type: [FlashSaleSlotSchema],
      default: [
        { id: 'slot_1', startHour: 0, startMinute: 0, endHour: 9, endMinute: 0, label: '00:00 - 09:00', enabled: true },
        { id: 'slot_2', startHour: 9, startMinute: 0, endHour: 12, endMinute: 0, label: '09:00 - 12:00', enabled: true },
        { id: 'slot_3', startHour: 12, startMinute: 0, endHour: 18, endMinute: 0, label: '12:00 - 18:00', enabled: true },
        { id: 'slot_4', startHour: 18, startMinute: 0, endHour: 21, endMinute: 0, label: '18:00 - 21:00', enabled: true },
        { id: 'slot_5', startHour: 21, startMinute: 0, endHour: 24, endMinute: 0, label: '21:00 - 24:00', enabled: true },
      ],
    },
    startTime: { type: Date },
    endTime: { type: Date },
    items: { type: [FlashSaleItemSchema], default: [] },
    fomoSettings: {
      type: FomoSettingsSchema,
      default: () => ({
        enableLivePurchasePopup: true,
        popupIntervalSeconds: 25,
        enableCheckoutTimer: true,
        checkoutTimerMinutes: 15,
        enableViewerCount: true,
      }),
    },
    stats: {
      totalOrders: { type: Number, default: 0 },
      totalRevenue: { type: Number, default: 0 },
    },
  },
  { timestamps: true }
);

if (mongoose.models && mongoose.models.FlashSale) {
  delete (mongoose.models as any).FlashSale;
}

const FlashSale: Model<IFlashSale> = mongoose.model<IFlashSale>('FlashSale', FlashSaleSchema);
export default FlashSale;
