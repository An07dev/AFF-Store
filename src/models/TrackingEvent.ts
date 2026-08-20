import mongoose, { Schema, Document, Model } from 'mongoose';

export interface ITrackingEvent extends Document {
  eventName: 'PageView' | 'ViewContent' | 'AddToCart' | 'InitiateCheckout' | 'Purchase';
  eventId: string;
  path: string;
  source: 'facebook' | 'tiktok' | 'google' | 'direct' | 'other';
  utmSource?: string;
  utmMedium?: string;
  utmCampaign?: string;
  productId?: mongoose.Types.ObjectId;
  productName?: string;
  value?: number;
  currency?: string;
  orderId?: string;
  ip?: string;
  userAgent?: string;
  createdAt: Date;
}

const TrackingEventSchema = new Schema<ITrackingEvent>(
  {
    eventName: {
      type: String,
      required: true,
      enum: ['PageView', 'ViewContent', 'AddToCart', 'InitiateCheckout', 'Purchase'],
      index: true,
    },
    eventId: { type: String, required: true, index: true },
    path: { type: String, default: '/' },
    source: {
      type: String,
      enum: ['facebook', 'tiktok', 'google', 'direct', 'other'],
      default: 'direct',
      index: true,
    },
    utmSource: { type: String, default: '' },
    utmMedium: { type: String, default: '' },
    utmCampaign: { type: String, default: '' },
    productId: { type: Schema.Types.ObjectId, ref: 'Product' },
    productName: { type: String, default: '' },
    value: { type: Number, default: 0 },
    currency: { type: String, default: 'VND' },
    orderId: { type: String, default: '' },
    ip: { type: String, default: '' },
    userAgent: { type: String, default: '' },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

// Compound index for fast period filtering
TrackingEventSchema.index({ eventName: 1, createdAt: -1 });
TrackingEventSchema.index({ source: 1, createdAt: -1 });

const TrackingEvent: Model<ITrackingEvent> =
  mongoose.models.TrackingEvent ||
  mongoose.model<ITrackingEvent>('TrackingEvent', TrackingEventSchema);

export default TrackingEvent;
