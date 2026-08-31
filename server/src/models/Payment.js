import mongoose from 'mongoose';
import { PAYMENT_METHOD } from '../constants/statuses.js';

const paymentSchema = new mongoose.Schema(
  {
    organizationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Organization',
      required: [true, 'Organization ID is required'],
      index: true,
    },
    amount: {
      type: Number,
      required: [true, 'Payment amount is required'],
      min: [0, 'Amount must be positive'],
    },
    currency: {
      type: String,
      default: 'USD',
      trim: true,
    },
    paymentDate: {
      type: Date,
      default: Date.now,
    },
    paymentMethod: {
      type: String,
      enum: Object.values(PAYMENT_METHOD),
      default: PAYMENT_METHOD.CASH,
    },
    referenceNumber: {
      type: String,
      trim: true,
      default: '',
    },
    periodStartDate: {
      type: Date,
      required: [true, 'Period start date is required'],
    },
    periodEndDate: {
      type: Date,
      required: [true, 'Period end date is required'],
    },
    recordedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'AdminUser',
      required: [true, 'Recorded by admin ID is required'],
    },
    notes: {
      type: String,
      trim: true,
      default: '',
    },
  },
  { timestamps: true }
);

export const Payment = mongoose.model('Payment', paymentSchema);
