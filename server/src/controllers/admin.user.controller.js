import bcrypt from 'bcryptjs';
import { asyncHandler } from '../utils/asyncHandler.js';
import * as orgService from '../services/organization.service.js';
import { OrganizationUser } from '../models/OrganizationUser.js';
import { generateTemporaryPassword } from '../utils/tokenGenerator.js';
import { ApiError } from '../utils/ApiError.js';
import { logAudit } from '../services/audit.service.js';

import { AdminUser } from '../models/AdminUser.js';

export const createOrganizationUser = asyncHandler(async (req, res) => {
  const result = await orgService.createOrganizationUser(req.params.id, req.body, req.user);
  res.status(201).json({
    success: true,
    message: 'Organization user created successfully',
    data: result,
  });
});

export const updateOrganizationUser = asyncHandler(async (req, res) => {
  const { id } = req.params;

  // Validation: Unique phone number
  if (req.body.phone) {
    const cleanPhone = req.body.phone.trim();
    if (cleanPhone) {
      const conflict = await OrganizationUser.findOne({ phone: cleanPhone, _id: { $ne: id } });
      if (conflict) {
        throw new ApiError(409, `Phone number "${cleanPhone}" is already registered to another user (${conflict.fullName}).`);
      }
      req.body.phone = cleanPhone;
    }
  }

  // Validation: Unique username
  if (req.body.username) {
    const cleanUsername = req.body.username.trim().toLowerCase();
    if (cleanUsername) {
      const conflict = await OrganizationUser.findOne({ username: cleanUsername, _id: { $ne: id } });
      const adminConflict = await AdminUser.findOne({ username: cleanUsername });
      if (conflict || adminConflict) {
        throw new ApiError(409, `Username "${cleanUsername}" is already taken.`);
      }
      req.body.username = cleanUsername;
    }
  }

  const user = await OrganizationUser.findByIdAndUpdate(id, req.body, { new: true }).select('-passwordHash');
  if (!user) {
    throw new ApiError(404, 'Organization user not found');
  }

  await logAudit({
    actorId: req.user?._id || req.user?.id,
    actorName: req.user?.fullName,
    actorRole: req.user?.role,
    action: 'ORGANIZATION_USER_UPDATED',
    resourceType: 'OrganizationUser',
    resourceId: user._id,
    metadata: req.body,
  });

  res.status(200).json({
    success: true,
    message: 'Organization user updated successfully',
    data: { user },
  });
});

export const resetUserPassword = asyncHandler(async (req, res) => {
  const user = await OrganizationUser.findById(req.params.id);
  if (!user) {
    throw new ApiError(404, 'Organization user not found');
  }

  const temporaryPassword = generateTemporaryPassword();
  const salt = await bcrypt.genSalt(10);
  user.passwordHash = await bcrypt.hash(temporaryPassword, salt);
  user.mustChangePassword = true;
  await user.save();

  await logAudit({
    actorId: req.user._id,
    actorName: req.user.fullName,
    actorRole: req.user.role,
    action: 'USER_PASSWORD_RESET',
    resourceType: 'OrganizationUser',
    resourceId: user._id,
  });

  res.status(200).json({
    success: true,
    message: 'Password reset successfully',
    data: {
      temporaryPassword,
      username: user.username,
    },
  });
});
