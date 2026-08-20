import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IReview extends Document {
  product: mongoose.Types.ObjectId;
  orderId?: mongoose.Types.ObjectId | string;
  author: string;
  avatar?: string;
  rating: number;
  variantTitle?: string;
  comment: string;
  images: string[];
  likes: number;
  verified: boolean;
  reply?: {
    content: string;
    createdAt: Date;
  };
  status: 'approved' | 'hidden';
  createdAt: Date;
  updatedAt: Date;
}

const ReviewSchema = new Schema<IReview>(
  {
    product: { type: Schema.Types.ObjectId, ref: 'Product', required: true, index: true },
    orderId: { type: Schema.Types.Mixed, default: null },
    author: { type: String, required: true, trim: true },
    avatar: { type: String, default: '' },
    rating: { type: Number, required: true, min: 1, max: 5, default: 5, index: true },
    variantTitle: { type: String, default: '' },
    comment: { type: String, required: true, trim: true },
    images: [{ type: String }],
    likes: { type: Number, default: 0, min: 0 },
    verified: { type: Boolean, default: true },
    reply: {
      content: { type: String, default: '' },
      createdAt: { type: Date, default: Date.now },
    },
    status: { type: String, enum: ['approved', 'hidden'], default: 'approved', index: true },
  },
  { timestamps: true }
);

const Review: Model<IReview> =
  mongoose.models.Review || mongoose.model<IReview>('Review', ReviewSchema);

export default Review;
