import mongoose from 'mongoose';
import { NOTIFICATION_CHANNEL, NOTIFICATION_STATUS, NOTIFICATION_TYPE } from '../constants/statuses.js';

const notificationSchema = new mongoose.Schema(
  {
    organizationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Organization',
      required: [true, 'Organization ID is required'],
      index: true,
    },
    submissionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'CustomerSubmission',
      default: null,
    },
    channel: {
      type: String,
      enum: Object.values(NOTIFICATION_CHANNEL),
      required: [true, 'Notification channel is required'],
    },
    type: {
      type: String,
      enum: Object.values(NOTIFICATION_TYPE),
      default: NOTIFICATION_TYPE.GENERAL,
      index: true,
    },
    recipientType: {
      type: String,
      enum: ['ORGANIZATION', 'CUSTOMER', 'REPRESENTATIVE', 'ADMIN'],
      default: 'ORGANIZATION',
    },
    recipient: {
      type: String,
      required: [true, 'Recipient contact is required'],
    },
    recipientName: {
      type: String,
      default: '',
    },
    message: {
      type: String,
      required: [true, 'Message is required'],
    },
    metadata: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
    status: {
      type: String,
      enum: Object.values(NOTIFICATION_STATUS),
      default: NOTIFICATION_STATUS.PENDING,
      index: true,
    },
    providerResponse: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
    errorMessage: {
      type: String,
      default: '',
    },
    retryCount: {
      type: Number,
      default: 0,
    },
    sentAt: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true }
);

export const Notification = mongoose.model('Notification', notificationSchema);
