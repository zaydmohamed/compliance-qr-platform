import mongoose from 'mongoose';
import { QR_STATUS } from '../constants/statuses.js';

const qrCodeSchema = new mongoose.Schema(
  {
    organizationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Organization',
      required: [true, 'Organization ID is required'],
      index: true,
    },
    publicToken: {
      type: String,
      required: [true, 'Public token is required'],
      unique: true,
      index: true,
    },
    status: {
      type: String,
      enum: Object.values(QR_STATUS),
      default: QR_STATUS.ACTIVE,
    },
    scanCount: {
      type: Number,
      default: 0,
    },
    generatedAt: {
      type: Date,
      default: Date.now,
    },
    regeneratedAt: {
      type: Date,
      default: null,
    },
    expiresAt: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true }
);

export const QRCode = mongoose.model('QRCode', qrCodeSchema);
