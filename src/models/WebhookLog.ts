import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IWebhookLog extends Document {
  gateway: string;
  transactionId?: string | number;
  transferAmount: number;
  transferContent: string;
  referenceCode?: string;
  matchedOrderCode?: string;
  buyerName?: string;
  buyerPhone?: string;
  buyerEmail?: string;
  generatedLicenseKey?: string;
  emailStatus: 'sent' | 'skipped_no_email' | 'failed' | 'simulated';
  emailError?: string;
  rawPayload: Record<string, any>;
  status: 'success' | 'failed' | 'ignored';
  message: string;
  createdAt: Date;
  updatedAt: Date;
}

const WebhookLogSchema: Schema = new Schema<IWebhookLog>(
  {
    gateway: {
      type: String,
      default: 'sepay',
    },
    transactionId: {
      type: Schema.Types.Mixed,
      index: true,
    },
    transferAmount: {
      type: Number,
      required: true,
    },
    transferContent: {
      type: String,
      required: true,
    },
    referenceCode: {
      type: String,
      default: '',
    },
    matchedOrderCode: {
      type: String,
      default: '',
      index: true,
    },
    buyerName: {
      type: String,
      default: '',
    },
    buyerPhone: {
      type: String,
      default: '',
    },
    buyerEmail: {
      type: String,
      default: '',
    },
    generatedLicenseKey: {
      type: String,
      default: '',
      index: true,
    },
    emailStatus: {
      type: String,
      enum: ['sent', 'skipped_no_email', 'failed', 'simulated'],
      default: 'skipped_no_email',
    },
    emailError: {
      type: String,
      default: '',
    },
    rawPayload: {
      type: Schema.Types.Mixed,
      default: {},
    },
    status: {
      type: String,
      enum: ['success', 'failed', 'ignored'],
      default: 'success',
      index: true,
    },
    message: {
      type: String,
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

export const WebhookLog: Model<IWebhookLog> =
  mongoose.models.WebhookLog || mongoose.model<IWebhookLog>('WebhookLog', WebhookLogSchema);

export default WebhookLog;
