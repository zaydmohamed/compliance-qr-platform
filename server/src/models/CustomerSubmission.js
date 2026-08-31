import mongoose from 'mongoose';
import {
  SUBMISSION_TYPE,
  COMPLAINT_STATUS,
  COMPLAINT_PRIORITY,
} from '../constants/statuses.js';

const customerSubmissionSchema = new mongoose.Schema(
  {
    organizationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Organization',
      required: [true, 'Organization ID is required'],
      index: true,
    },
    qrCodeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'QRCode',
      required: [true, 'QR Code ID is required'],
    },
    referenceNumber: {
      type: String,
      required: [true, 'Reference number is required'],
      unique: true,
      index: true,
    },
    type: {
      type: String,
      enum: Object.values(SUBMISSION_TYPE),
      required: [true, 'Submission type is required'],
      index: true,
    },
    customerName: {
      type: String,
      trim: true,
      default: 'Anonymous',
    },
    customerPhone: {
      type: String,
      trim: true,
      default: '',
    },
    category: {
      type: String,
      trim: true,
      default: 'General',
    },
    message: {
      type: String,
      required: [true, 'Message content is required'],
      trim: true,
    },
    suggestedSolution: {
      type: String,
      trim: true,
      default: '',
    },
    priority: {
      type: String,
      enum: Object.values(COMPLAINT_PRIORITY),
      default: COMPLAINT_PRIORITY.MEDIUM,
    },
    status: {
      type: String,
      enum: Object.values(COMPLAINT_STATUS),
      default: COMPLAINT_STATUS.NEW,
      index: true,
    },
    adminNotes: {
      type: String,
      trim: true,
      default: '',
    },
    internalNotes: {
      type: String,
      trim: true,
      default: '',
    },
    resolvedAt: {
      type: Date,
      default: null,
    },
    submittedAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

customerSubmissionSchema.index({ organizationId: 1, type: 1, status: 1 });
customerSubmissionSchema.index({ createdAt: -1 });

export const CustomerSubmission = mongoose.model('CustomerSubmission', customerSubmissionSchema);
