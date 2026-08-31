import bcrypt from 'bcryptjs';
import { AdminUser } from '../models/AdminUser.js';
import { OrganizationUser } from '../models/OrganizationUser.js';
import { ROLES } from '../constants/roles.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { ApiError } from '../utils/ApiError.js';
import { logAudit } from '../services/audit.service.js';

/**
 * List all Platform Admin / Superadmin accounts
 */
export const getSuperadmins = asyncHandler(async (req, res) => {
  const superadmins = await AdminUser.find()
    .select('-passwordHash')
    .sort({ createdAt: -1 });

  res.status(200).json({
    success: true,
    data: { superadmins },
  });
});

/**
 * Create a new Platform Admin / Superadmin account
 */
export const createSuperadmin = asyncHandler(async (req, res) => {
  const { fullName, username, password, email, phone } = req.body;

  if (!fullName || !fullName.trim()) {
    throw new ApiError(400, 'Full name is required');
  }

  if (!username || !username.trim()) {
    throw new ApiError(400, 'Username is required');
  }

  if (!password || password.length < 6) {
    throw new ApiError(400, 'Password must be at least 6 characters');
  }

  const cleanUsername = username.toLowerCase().trim();
  const cleanEmail = email ? email.trim().toLowerCase() : '';
  const cleanPhone = phone ? phone.trim() : '';

  // Validation: Unique username
  const existingAdmin = await AdminUser.findOne({ username: cleanUsername });
  const existingOrgUser = await OrganizationUser.findOne({ username: cleanUsername });
  if (existingAdmin || existingOrgUser) {
    throw new ApiError(409, `Username "${cleanUsername}" is already taken`);
  }

  // Validation: Unique email
  if (cleanEmail) {
    const existingAdminEmail = await AdminUser.findOne({ email: cleanEmail });
    if (existingAdminEmail) {
      throw new ApiError(409, `Email "${cleanEmail}" is already registered to another superadmin (${existingAdminEmail.fullName})`);
    }
  }

  // Validation: Unique phone
  if (cleanPhone) {
    const existingAdminPhone = await AdminUser.findOne({ phone: cleanPhone });
    if (existingAdminPhone) {
      throw new ApiError(409, `Phone number "${cleanPhone}" is already registered to another superadmin (${existingAdminPhone.fullName})`);
    }
  }

  const salt = await bcrypt.genSalt(10);
  const passwordHash = await bcrypt.hash(password, salt);

  const newAdmin = await AdminUser.create({
    fullName: fullName.trim(),
    username: cleanUsername,
    passwordHash,
    email: cleanEmail,
    phone: cleanPhone,
    role: ROLES.PLATFORM_ADMIN,
    isActive: true,
  });

  await logAudit({
    actorId: req.user._id,
    actorName: req.user.fullName,
    actorRole: req.user.role,
    action: 'SUPERADMIN_CREATED',
    resourceType: 'AdminUser',
    resourceId: newAdmin._id,
    metadata: {
      username: newAdmin.username,
      fullName: newAdmin.fullName,
    },
  });

  const createdUser = newAdmin.toObject();
  delete createdUser.passwordHash;

  res.status(201).json({
    success: true,
    message: 'New superadmin account created successfully',
    data: { superadmin: createdUser },
  });
});

/**
 * Update Superadmin active status
 */
export const updateSuperadminStatus = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { isActive } = req.body;
  const currentUserId = (req.user?._id || req.user?.id)?.toString();

  if (currentUserId && currentUserId === id.toString()) {
    throw new ApiError(400, 'You cannot change your own account active status');
  }

  const admin = await AdminUser.findById(id);
  if (!admin) {
    throw new ApiError(404, 'Superadmin account not found');
  }

  admin.isActive = typeof isActive === 'boolean' ? isActive : !admin.isActive;
  await admin.save();

  await logAudit({
    actorId: req.user?._id || req.user?.id,
    actorName: req.user?.fullName,
    actorRole: req.user?.role,
    action: 'SUPERADMIN_STATUS_UPDATED',
    resourceType: 'AdminUser',
    resourceId: admin._id,
    metadata: {
      username: admin.username,
      isActive: admin.isActive,
    },
  });

  res.status(200).json({
    success: true,
    message: `Superadmin status updated to ${admin.isActive ? 'Active' : 'Inactive'}`,
    data: {
      id: admin._id,
      isActive: admin.isActive,
    },
  });
});

/**
 * Delete a Superadmin account
 */
export const deleteSuperadmin = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const currentUserId = (req.user?._id || req.user?.id)?.toString();

  if (currentUserId && currentUserId === id.toString()) {
    throw new ApiError(400, 'You cannot delete your own logged-in superadmin account');
  }

  const count = await AdminUser.countDocuments({ isActive: true });
  if (count <= 1) {
    throw new ApiError(400, 'Cannot delete the only remaining active superadmin account');
  }

  const admin = await AdminUser.findByIdAndDelete(id);
  if (!admin) {
    throw new ApiError(404, 'Superadmin account not found');
  }

  await logAudit({
    actorId: req.user?._id || req.user?.id,
    actorName: req.user?.fullName,
    actorRole: req.user?.role,
    action: 'SUPERADMIN_DELETED',
    resourceType: 'AdminUser',
    resourceId: id,
    metadata: {
      username: admin.username,
      fullName: admin.fullName,
    },
  });

  res.status(200).json({
    success: true,
    message: 'Superadmin account deleted successfully',
    data: { id, username: admin.username },
  });
});
