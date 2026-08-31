import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { AdminUser } from '../models/AdminUser.js';
import { OrganizationUser } from '../models/OrganizationUser.js';
import { ROLES } from '../constants/roles.js';
import { ENV } from '../config/env.js';
import { ApiError } from '../utils/ApiError.js';
import { logAudit } from './audit.service.js';

export const generateAuthToken = (user, role) => {
  return jwt.sign(
    {
      id: user._id,
      role,
      username: user.username,
    },
    ENV.JWT_SECRET,
    { expiresIn: ENV.JWT_EXPIRES_IN }
  );
};

export const login = async ({ username, password }, reqInfo = {}) => {
  const cleanUsername = username.toLowerCase().trim();

  // Try Admin user first
  let user = await AdminUser.findOne({ username: cleanUsername });
  let role = ROLES.PLATFORM_ADMIN;

  if (!user) {
    // Try Organization user
    user = await OrganizationUser.findOne({ username: cleanUsername }).populate(
      'organizationId',
      'name displayTitle logo status branch'
    );
    role = ROLES.ORGANIZATION_USER;
  }

  if (!user) {
    throw new ApiError(401, 'Invalid username or password');
  }

  // Check user active status
  if (role === ROLES.PLATFORM_ADMIN && !user.isActive) {
    throw new ApiError(403, 'Admin account has been deactivated');
  }

  if (role === ROLES.ORGANIZATION_USER && user.status !== 'ACTIVE') {
    throw new ApiError(403, 'Organization account is currently inactive or suspended');
  }

  const isPasswordValid = await user.comparePassword(password);
  if (!isPasswordValid) {
    throw new ApiError(401, 'Invalid username or password');
  }

  // Update last login
  user.lastLoginAt = new Date();
  await user.save();

  const token = generateAuthToken(user, role);

  await logAudit({
    actorId: user._id,
    actorName: user.fullName,
    actorRole: role,
    action: 'USER_LOGIN',
    resourceType: role === ROLES.PLATFORM_ADMIN ? 'AdminUser' : 'OrganizationUser',
    resourceId: user._id,
    ipAddress: reqInfo.ip || '',
    userAgent: reqInfo.userAgent || '',
  });

  return {
    token,
    user: {
      id: user._id,
      fullName: user.fullName,
      username: user.username,
      role,
      mustChangePassword: role === ROLES.ORGANIZATION_USER ? user.mustChangePassword : false,
      organization: role === ROLES.ORGANIZATION_USER ? user.organizationId : null,
    },
  };
};

export const changePassword = async (userId, role, { currentPassword, newPassword }) => {
  let user;
  if (role === ROLES.PLATFORM_ADMIN) {
    user = await AdminUser.findById(userId);
  } else {
    user = await OrganizationUser.findById(userId);
  }

  if (!user) {
    throw new ApiError(404, 'User not found');
  }

  const isCurrentValid = await user.comparePassword(currentPassword);
  if (!isCurrentValid) {
    throw new ApiError(400, 'Current password is incorrect');
  }

  const salt = await bcrypt.genSalt(10);
  user.passwordHash = await bcrypt.hash(newPassword, salt);
  if (role === ROLES.ORGANIZATION_USER) {
    user.mustChangePassword = false;
  }
  await user.save();

  await logAudit({
    actorId: user._id,
    actorName: user.fullName,
    actorRole: role,
    action: 'PASSWORD_CHANGED',
    resourceType: role === ROLES.PLATFORM_ADMIN ? 'AdminUser' : 'OrganizationUser',
    resourceId: user._id,
  });

  return { message: 'Password changed successfully' };
};

export const updateUsername = async (userId, role, newUsername) => {
  const cleanUsername = newUsername.toLowerCase().trim();

  // Check for uniqueness across AdminUser and OrganizationUser
  const existingAdmin = await AdminUser.findOne({ username: cleanUsername });
  const existingOrg = await OrganizationUser.findOne({ username: cleanUsername });

  if (existingAdmin || existingOrg) {
    throw new ApiError(409, 'Username is already taken');
  }

  let user;
  if (role === ROLES.PLATFORM_ADMIN) {
    user = await AdminUser.findByIdAndUpdate(userId, { username: cleanUsername }, { new: true });
  } else {
    user = await OrganizationUser.findByIdAndUpdate(userId, { username: cleanUsername }, { new: true });
  }

  return {
    message: 'Username updated successfully',
    username: user.username,
  };
};

import { PasswordReset } from '../models/PasswordReset.js';
import { PlatformSettings } from '../models/PlatformSettings.js';
import { Organization } from '../models/Organization.js';
import { sendPasswordResetEmail } from '../integrations/email/email.service.js';

/**
 * Step 1: Request Password Reset OTP via Email
 */
export const requestPasswordResetOtp = async ({ identifier }) => {
  const cleanIdentifier = identifier?.toLowerCase().trim();

  if (!cleanIdentifier) {
    throw new ApiError(400, 'Please enter your username or registered email address');
  }

  // 1. Check Platform Admin User by username, email, or phone
  let user = await AdminUser.findOne({
    $or: [
      { username: cleanIdentifier },
      { email: cleanIdentifier },
      { phone: cleanIdentifier },
    ],
  });
  let userModel = 'AdminUser';
  let targetEmail = user?.email;

  // 2. Check Organization User if not found in AdminUser
  if (!user) {
    const orgUser = await OrganizationUser.findOne({
      $or: [
        { username: cleanIdentifier },
        { phone: cleanIdentifier },
      ],
    }).populate('organizationId');

    if (orgUser) {
      user = orgUser;
      userModel = 'OrganizationUser';
      targetEmail = orgUser.organizationId?.email;
    } else {
      // Check by Organization email directly
      const org = await Organization.findOne({
        $or: [
          { email: cleanIdentifier },
          { phone: cleanIdentifier },
        ],
      });
      if (org) {
        const linkedOrgUser = await OrganizationUser.findOne({ organizationId: org._id });
        if (linkedOrgUser) {
          user = linkedOrgUser;
          userModel = 'OrganizationUser';
          targetEmail = org.email;
        }
      }
    }
  }

  if (!user || !targetEmail) {
    throw new ApiError(
      404,
      'No account found with this username or registered email. Please contact your platform administrator.'
    );
  }

  // Generate 6-digit numeric OTP
  const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
  const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

  // Invalidate any previous OTPs for this user
  await PasswordReset.deleteMany({ userId: user._id });

  // Save new OTP
  await PasswordReset.create({
    userId: user._id,
    userModel,
    email: targetEmail.toLowerCase().trim(),
    otpCode,
    expiresAt,
  });

  const settings = (await PlatformSettings.findOne()) || {};
  const platformName = settings.platformName || 'Compliance QR';

  // Send Email
  await sendPasswordResetEmail({
    toEmail: targetEmail,
    recipientName: user.fullName,
    otpCode,
    platformName,
  });

  await logAudit({
    actorId: user._id,
    actorName: user.fullName,
    actorRole: userModel === 'AdminUser' ? ROLES.PLATFORM_ADMIN : ROLES.ORGANIZATION_USER,
    action: 'FORGOT_PASSWORD_OTP_SENT',
    resourceType: userModel,
    resourceId: user._id,
    metadata: { email: targetEmail },
  });

  // Mask email for privacy (e.g. j***e@domain.com)
  const parts = targetEmail.split('@');
  const maskedName = parts[0].length <= 2 ? parts[0] + '***' : parts[0][0] + '***' + parts[0].slice(-1);
  const maskedEmail = `${maskedName}@${parts[1]}`;

  return {
    success: true,
    message: `Verification code (OTP) has been sent to ${maskedEmail}`,
    email: targetEmail,
  };
};

/**
 * Step 2: Verify OTP and Reset Password
 */
export const verifyOtpAndResetPassword = async ({ email, otpCode, newPassword }) => {
  const cleanEmail = email?.toLowerCase().trim();
  const cleanOtp = otpCode?.trim();

  if (!cleanEmail || !cleanOtp) {
    throw new ApiError(400, 'Email address and OTP verification code are required');
  }

  if (!newPassword || newPassword.length < 6) {
    throw new ApiError(400, 'New password must be at least 6 characters');
  }

  const resetRecord = await PasswordReset.findOne({
    email: cleanEmail,
    otpCode: cleanOtp,
    used: false,
    expiresAt: { $gt: new Date() },
  });

  if (!resetRecord) {
    throw new ApiError(400, 'Invalid or expired OTP verification code. Please request a new one.');
  }

  let user;
  if (resetRecord.userModel === 'AdminUser') {
    user = await AdminUser.findById(resetRecord.userId);
  } else {
    user = await OrganizationUser.findById(resetRecord.userId);
  }

  if (!user) {
    throw new ApiError(404, 'User account not found');
  }

  const salt = await bcrypt.genSalt(10);
  user.passwordHash = await bcrypt.hash(newPassword, salt);
  if (resetRecord.userModel === 'OrganizationUser') {
    user.mustChangePassword = false;
  }
  await user.save();

  // Mark OTP as used and delete record
  resetRecord.used = true;
  await resetRecord.save();
  await PasswordReset.deleteMany({ userId: user._id });

  await logAudit({
    actorId: user._id,
    actorName: user.fullName,
    actorRole: resetRecord.userModel === 'AdminUser' ? ROLES.PLATFORM_ADMIN : ROLES.ORGANIZATION_USER,
    action: 'PASSWORD_RESET_SUCCESSFUL',
    resourceType: resetRecord.userModel,
    resourceId: user._id,
  });

  return {
    success: true,
    message: 'Your password has been reset successfully! You can now sign in with your new password.',
  };
};

export const forgotPassword = async (data) => {
  if (data.otpCode) {
    return verifyOtpAndResetPassword(data);
  }
  return requestPasswordResetOtp(data);
};
