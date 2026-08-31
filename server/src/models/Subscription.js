import mongoose from 'mongoose';
import { SUBSCRIPTION_STATUS } from '../constants/statuses.js';

const subscriptionSchema = new mongoose.Schema(
  {
    organizationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Organization',
      required: [true, 'Organization ID is required'],
      index: true,
    },
    startDate: {
      type: Date,
      required: [true, 'Start date is required'],
      default: Date.now,
    },
    endDate: {
      type: Date,
      required: [true, 'End date is required'],
    },
    gracePeriodDays: {
      type: Number,
      default: 3,
    },
    gracePeriodEndDate: {
      type: Date,
      default: null,
    },
    status: {
      type: String,
      enum: Object.values(SUBSCRIPTION_STATUS),
      default: SUBSCRIPTION_STATUS.ACTIVE,
      index: true,
    },
    lastPaymentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Payment',
      default: null,
    },
    renewalCount: {
      type: Number,
      default: 0,
    },
    reminderSentAt: {
      type: Date,
      default: null,
    },
    expirationNotifiedAt: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true }
);

export const Subscription = mongoose.model('Subscription', subscriptionSchema);
