import mongoose from 'mongoose';

const platformSettingsSchema = new mongoose.Schema(
  {
    platformName: {
      type: String,
      default: 'Compliance QR',
    },
    logo: {
      type: String,
      default: '',
    },
    publicAppUrl: {
      type: String,
      default: 'https://compliance-qr-platform.vercel.app',
    },
    defaultServiceDurationDays: {
      type: Number,
      default: 30,
    },
    defaultGracePeriodDays: {
      type: Number,
      default: 3,
    },
    expiringWarningDays: {
      type: Number,
      default: 3,
    },
    enableSmsNotifications: {
      type: Boolean,
      default: true,
    },
    enableWhatsAppNotifications: {
      type: Boolean,
      default: true,
    },
    defaultComplaintCategories: {
      type: [String],
      default: ['Service', 'Staff', 'Cleanliness', 'Food', 'Security', 'Facilities', 'Payment', 'Other'],
    },
    contactPhone: {
      type: String,
      default: '+252 61 000 0000',
    },
    contactEmail: {
      type: String,
      default: 'support@complianceqr.com',
    },
  },
  { timestamps: true }
);

export const PlatformSettings = mongoose.model('PlatformSettings', platformSettingsSchema);
