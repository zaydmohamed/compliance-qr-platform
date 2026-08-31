import mongoose from 'mongoose';
import { ORGANIZATION_STATUS } from '../constants/statuses.js';

const organizationSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Organization name is required'],
      trim: true,
    },
    displayTitle: {
      type: String,
      trim: true,
      default: function () {
        return this.name;
      },
    },
    email: {
      type: String,
      trim: true,
      lowercase: true,
      default: '',
    },
    phone: {
      type: String,
      trim: true,
      default: '',
    },
    whatsapp: {
      type: String,
      trim: true,
      default: '',
    },
    logo: {
      type: String,
      default: '',
    },
    organizationType: {
      type: String,
      required: [true, 'Organization category/type is required'],
      enum: ['Hospital', 'Hotel', 'Company', 'University', 'HOSPITAL', 'HOTEL', 'COMPANY', 'UNIVERSITY'],
      default: 'Hospital',
      set: function (val) {
        if (!val) return 'Hospital';
        const formatted = val.charAt(0).toUpperCase() + val.slice(1).toLowerCase();
        return ['Hospital', 'Hotel', 'Company', 'University'].includes(formatted) ? formatted : val;
      },
    },
    address: {
      type: String,
      trim: true,
      default: '',
    },
    branch: {
      type: String,
      trim: true,
      default: 'Main Branch',
    },
    description: {
      type: String,
      trim: true,
      default: '',
    },
    status: {
      type: String,
      enum: Object.values(ORGANIZATION_STATUS),
      default: ORGANIZATION_STATUS.ACTIVE,
    },
    complaintCategories: {
      type: [String],
      default: ['Service', 'Staff', 'Cleanliness', 'Food', 'Security', 'Facilities', 'Payment', 'Other'],
    },
    activeQrId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'QRCode',
      default: null,
    },
    activeSubscriptionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Subscription',
      default: null,
    },
  },
  { timestamps: true }
);

organizationSchema.index({ status: 1 });
organizationSchema.index({ name: 'text', displayTitle: 'text' });

export const Organization = mongoose.model('Organization', organizationSchema);
