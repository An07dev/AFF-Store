import mongoose, { Schema, Document, Model } from 'mongoose';

export interface ILicense extends Document {
  licenseKey: string;
  buyerName: string;
  buyerPhone?: string;
  plan: '399k' | '799k' | 'custom' | string;
  price: number;
  notes?: string;
  status: 'available' | 'active' | 'revoked';
  shopName?: string | null;
  assignedDb?: string | null;
  activatedAt?: Date | null;
  machineFingerprint?: string | null;
  createdBy?: string;
  createdAt: Date;
  updatedAt: Date;
}

const LicenseSchema: Schema = new Schema<ILicense>(
  {
    licenseKey: {
      type: String,
      required: [true, 'License key là bắt buộc'],
      unique: true,
      trim: true,
      uppercase: true,
      index: true,
    },
    buyerName: {
      type: String,
      required: [true, 'Tên người mua / khách hàng là bắt buộc'],
      trim: true,
    },
    buyerPhone: {
      type: String,
      trim: true,
      default: '',
    },
    plan: {
      type: String,
      default: '399k',
      index: true,
    },
    price: {
      type: Number,
      default: 399000,
    },
    notes: {
      type: String,
      trim: true,
      default: '',
    },
    status: {
      type: String,
      enum: ['available', 'active', 'revoked'],
      default: 'available',
      index: true,
    },
    shopName: {
      type: String,
      default: null,
    },
    assignedDb: {
      type: String,
      default: null,
    },
    activatedAt: {
      type: Date,
      default: null,
    },
    machineFingerprint: {
      type: String,
      default: null,
    },
    createdBy: {
      type: String,
      default: 'master_admin',
    },
  },
  {
    timestamps: true,
    collection: '_system_licenses', // Exact collection name on Master MongoDB
  }
);

export const License: Model<ILicense> =
  mongoose.models.License || mongoose.model<ILicense>('License', LicenseSchema);

export default License;
