import mongoose from 'mongoose';

const passwordResetSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      index: true,
    },
    userModel: {
      type: String,
      enum: ['AdminUser', 'OrganizationUser'],
      required: true,
    },
    email: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
    },
    otpCode: {
      type: String,
      required: true,
    },
    expiresAt: {
      type: Date,
      required: true,
      index: { expires: 0 }, // TTL index: MongoDB auto-deletes expired OTP documents!
    },
    used: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

export const PasswordReset = mongoose.model('PasswordReset', passwordResetSchema);
