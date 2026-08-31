import bcrypt from 'bcryptjs';
import { Organization } from '../models/Organization.js';
import { OrganizationUser } from '../models/OrganizationUser.js';
import { AdminUser } from '../models/AdminUser.js';
import { QRCode } from '../models/QRCode.js';
import { Subscription } from '../models/Subscription.js';
import { CustomerSubmission } from '../models/CustomerSubmission.js';
import { RenewalRequest } from '../models/RenewalRequest.js';
import { Payment } from '../models/Payment.js';
import { Notification } from '../models/Notification.js';
import { createQrForOrganization } from './qr.service.js';
import { startInitialSubscription, calculateSubscriptionStatus } from './subscription.service.js';
import { generateTemporaryPassword } from '../utils/tokenGenerator.js';
import { ApiError } from '../utils/ApiError.js';
import { logAudit } from './audit.service.js';
import { PlatformSettings } from '../models/PlatformSettings.js';
import { dispatchNotification } from './notification.service.js';
import { NOTIFICATION_CHANNEL, NOTIFICATION_TYPE } from '../constants/statuses.js';
import { ENV } from '../config/env.js';

/**
 * Step 1: Create Organization record
 */
export const createOrganization = async (orgData, logoPath = '', adminUser) => {
  const settings = (await PlatformSettings.findOne()) || {};
  const categories = orgData.complaintCategories && orgData.complaintCategories.length > 0
    ? orgData.complaintCategories
    : settings.defaultComplaintCategories || ['Service', 'Staff', 'Cleanliness', 'Food', 'Security', 'Facilities', 'Payment', 'Other'];

  const cleanEmail = orgData.email ? orgData.email.trim().toLowerCase() : '';
  const cleanPhone = orgData.phone ? orgData.phone.trim() : '';

  // Validation: Unique Organization Email
  if (cleanEmail) {
    const existingOrgEmail = await Organization.findOne({ email: cleanEmail });
    if (existingOrgEmail) {
      throw new ApiError(409, `Email "${cleanEmail}" is already registered by another organization (${existingOrgEmail.name}).`);
    }
  }

  // Validation: Unique Organization Phone
  if (cleanPhone) {
    const existingOrgPhone = await Organization.findOne({ phone: cleanPhone });
    if (existingOrgPhone) {
      throw new ApiError(409, `Phone number "${cleanPhone}" is already registered to another organization (${existingOrgPhone.name}).`);
    }
  }

  const organization = await Organization.create({
    ...orgData,
    email: cleanEmail,
    phone: cleanPhone,
    whatsapp: orgData.whatsapp ? orgData.whatsapp.trim() : '',
    logo: logoPath || orgData.logo || '',
    complaintCategories: categories,
  });

  await logAudit({
    actorId: adminUser._id,
    actorName: adminUser.fullName,
    actorRole: adminUser.role,
    action: 'ORGANIZATION_CREATED',
    resourceType: 'Organization',
    resourceId: organization._id,
    metadata: { name: organization.name, type: organization.organizationType },
  });

  return organization;
};

/**
 * Step 2: Create Organization User for the organization
 */
export const createOrganizationUser = async (organizationId, userData, adminUser) => {
  const organization = await Organization.findById(organizationId);
  if (!organization) {
    throw new ApiError(404, 'Organization not found');
  }

  const cleanUsername = userData.username.toLowerCase().trim();
  const cleanPhone = userData.phone ? userData.phone.trim() : '';

  // Validation: Unique Username across OrganizationUser & AdminUser
  const existingOrgUser = await OrganizationUser.findOne({ username: cleanUsername });
  const existingAdminUser = await AdminUser.findOne({ username: cleanUsername });
  if (existingOrgUser || existingAdminUser) {
    throw new ApiError(409, `Username "${cleanUsername}" is already taken.`);
  }

  // Validation: Unique Phone Number for Organization User
  if (cleanPhone) {
    const existingPhoneUser = await OrganizationUser.findOne({ phone: cleanPhone });
    if (existingPhoneUser) {
      throw new ApiError(409, `Phone number "${cleanPhone}" is already registered to another representative user (${existingPhoneUser.fullName}).`);
    }
  }

  // Generate temporary password if not explicitly supplied
  const tempPassword = userData.password || generateTemporaryPassword();
  const salt = await bcrypt.genSalt(10);
  const passwordHash = await bcrypt.hash(tempPassword, salt);

  const orgUser = await OrganizationUser.create({
    organizationId,
    fullName: userData.fullName.trim(),
    username: cleanUsername,
    phone: cleanPhone,
    passwordHash,
    mustChangePassword: true,
    status: 'ACTIVE',
  });

  await logAudit({
    actorId: adminUser._id,
    actorName: adminUser.fullName,
    actorRole: adminUser.role,
    action: 'ORGANIZATION_USER_CREATED',
    resourceType: 'OrganizationUser',
    resourceId: orgUser._id,
    metadata: { organizationId, username: orgUser.username },
  });

  return {
    user: {
      id: orgUser._id,
      fullName: orgUser.fullName,
      username: orgUser.username,
      phone: orgUser.phone,
      organizationId: orgUser.organizationId,
    },
    temporaryPassword: tempPassword,
  };
};

/**
 * Complete Guided Wizard: Creates Org + OrgUser + Generates QR + Starts 30-day subscription in one unified transaction/workflow.
 */
export const createCompleteOrganization = async ({ orgData, userData, logoPath }, adminUser) => {
  // Pre-validate all unique constraints before creating any database record
  const cleanOrgEmail = orgData?.email ? orgData.email.trim().toLowerCase() : '';
  const cleanOrgPhone = orgData?.phone ? orgData.phone.trim() : '';
  const cleanUserUsername = userData?.username ? userData.username.toLowerCase().trim() : '';
  const cleanUserPhone = userData?.phone ? userData.phone.trim() : '';

  if (cleanOrgEmail) {
    const existingOrgEmail = await Organization.findOne({ email: cleanOrgEmail });
    if (existingOrgEmail) {
      throw new ApiError(409, `Organization email "${cleanOrgEmail}" is already registered by "${existingOrgEmail.name}".`);
    }
  }

  if (cleanOrgPhone) {
    const existingOrgPhone = await Organization.findOne({ phone: cleanOrgPhone });
    if (existingOrgPhone) {
      throw new ApiError(409, `Organization phone "${cleanOrgPhone}" is already registered to "${existingOrgPhone.name}".`);
    }
  }

  if (cleanUserUsername) {
    const existingOrgUser = await OrganizationUser.findOne({ username: cleanUserUsername });
    const existingAdminUser = await AdminUser.findOne({ username: cleanUserUsername });
    if (existingOrgUser || existingAdminUser) {
      throw new ApiError(409, `Representative username "${cleanUserUsername}" is already taken.`);
    }
  }

  if (cleanUserPhone) {
    const existingPhoneUser = await OrganizationUser.findOne({ phone: cleanUserPhone });
    if (existingPhoneUser) {
      throw new ApiError(409, `Representative phone "${cleanUserPhone}" is already registered to user "${existingPhoneUser.fullName}".`);
    }
  }

  // 1. Create Organization
  const organization = await createOrganization(orgData, logoPath, adminUser);

  // 2. Create Org User
  const userResult = await createOrganizationUser(organization._id, userData, adminUser);

  // 3. Generate QR Code
  const qrCode = await createQrForOrganization(organization._id, adminUser);

  // 4. Start 30-Day Service Period
  const subscription = await startInitialSubscription(organization._id, 30);

  // 5. Send Organization Account Creation SMS
  const loginUrl = `${ENV.PUBLIC_APP_URL || ENV.FRONTEND_URL || 'https://compliance-qr-platform.vercel.app'}/login`;
  const accountCreationMessage = `Your Complaint QR account has been created successfully. You can now use your account to manage complaints and suggestions.\n\nPortal: ${loginUrl}\nUsername: ${userResult.user.username}\nTemporary Password: ${userResult.temporaryPassword}`;

  const notificationTasks = [];

  // Send to Organization Registered Phone
  if (organization.phone) {
    notificationTasks.push(
      dispatchNotification({
        organizationId: organization._id,
        channel: NOTIFICATION_CHANNEL.SMS,
        type: NOTIFICATION_TYPE.ACCOUNT_CREATION,
        recipientType: 'ORGANIZATION',
        recipient: organization.phone,
        recipientName: organization.name,
        message: accountCreationMessage,
        metadata: {
          organizationName: organization.name,
          username: userResult.user.username,
        },
      }).catch((err) => console.error('[Org Account Creation SMS Dispatch Error]', err.message))
    );
  }

  // Also send to representative phone if distinct from organization phone
  if (userResult.user.phone && userResult.user.phone !== organization.phone) {
    notificationTasks.push(
      dispatchNotification({
        organizationId: organization._id,
        channel: NOTIFICATION_CHANNEL.SMS,
        type: NOTIFICATION_TYPE.ACCOUNT_CREATION,
        recipientType: 'REPRESENTATIVE',
        recipient: userResult.user.phone,
        recipientName: userResult.user.fullName,
        message: accountCreationMessage,
        metadata: {
          organizationName: organization.name,
          username: userResult.user.username,
        },
      }).catch((err) => console.error('[Representative Account Creation SMS Dispatch Error]', err.message))
    );
  }

  // Await all notification dispatches before returning to prevent serverless premature termination
  if (notificationTasks.length > 0) {
    await Promise.allSettled(notificationTasks);
  }

  return {
    organization,
    user: userResult.user,
    temporaryPassword: userResult.temporaryPassword,
    qrCode,
    subscription,
  };
};

/**
 * List organizations with filtering, pagination, and real-time subscription status.
 */
export const getOrganizationsList = async ({ search, type, status, page = 1, limit = 10 }) => {
  const query = {};

  if (search) {
    query.$or = [
      { name: { $regex: search, $options: 'i' } },
      { displayTitle: { $regex: search, $options: 'i' } },
      { phone: { $regex: search, $options: 'i' } },
    ];
  }

  if (type) query.organizationType = type;
  if (status) query.status = status;

  const skip = (page - 1) * limit;
  const [total, organizations] = await Promise.all([
    Organization.countDocuments(query),
    Organization.find(query)
      .populate('activeQrId')
      .populate('activeSubscriptionId')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit),
  ]);

  const settings = (await PlatformSettings.findOne()) || {};

  // Enrich with dynamic calculated subscription days
  const enriched = organizations.map((org) => {
    const sub = org.activeSubscriptionId;
    const subCalc = calculateSubscriptionStatus(sub, settings);
    return {
      ...org.toObject(),
      subscriptionStatus: subCalc.status,
      daysRemaining: subCalc.daysRemaining,
      isServiceActive: subCalc.isServiceActive,
      serviceEndDate: subCalc.endDate,
    };
  });

  return {
    organizations: enriched,
    total,
    page: Number(page),
    totalPages: Math.ceil(total / limit),
  };
};

/**
 * Get single organization details with full relationship context.
 */
export const getOrganizationById = async (id) => {
  const organization = await Organization.findById(id)
    .populate('activeQrId')
    .populate('activeSubscriptionId');

  if (!organization) {
    throw new ApiError(404, 'Organization not found');
  }

  const [orgUser, settings] = await Promise.all([
    OrganizationUser.findOne({ organizationId: id }).select('-passwordHash'),
    PlatformSettings.findOne(),
  ]);

  const subCalc = calculateSubscriptionStatus(organization.activeSubscriptionId, settings || {});

  return {
    organization: {
      ...organization.toObject(),
      subscriptionStatus: subCalc.status,
      daysRemaining: subCalc.daysRemaining,
      isServiceActive: subCalc.isServiceActive,
      serviceEndDate: subCalc.endDate,
    },
    user: orgUser,
  };
};

/**
 * Update organization information (Admin only).
 */
export const updateOrganization = async (id, updateData, logoPath = null, adminUser) => {
  const org = await Organization.findById(id);
  if (!org) {
    throw new ApiError(404, 'Organization not found');
  }

  if (logoPath) {
    updateData.logo = logoPath;
  }

  // Validate unique email if provided
  if (updateData.email !== undefined) {
    const cleanEmail = updateData.email ? updateData.email.trim().toLowerCase() : '';
    if (cleanEmail) {
      const conflict = await Organization.findOne({ email: cleanEmail, _id: { $ne: id } });
      if (conflict) {
        throw new ApiError(409, `Email "${cleanEmail}" is already registered by another organization (${conflict.name}).`);
      }
    }
    updateData.email = cleanEmail;
  }

  // Validate unique phone if provided
  if (updateData.phone !== undefined) {
    const cleanPhone = updateData.phone ? updateData.phone.trim() : '';
    if (cleanPhone) {
      const conflict = await Organization.findOne({ phone: cleanPhone, _id: { $ne: id } });
      if (conflict) {
        throw new ApiError(409, `Phone number "${cleanPhone}" is already registered to another organization (${conflict.name}).`);
      }
    }
    updateData.phone = cleanPhone;
  }

  const updatedOrg = await Organization.findByIdAndUpdate(id, updateData, { new: true })
    .populate('activeQrId')
    .populate('activeSubscriptionId');

  await logAudit({
    actorId: adminUser._id,
    actorName: adminUser.fullName,
    actorRole: adminUser.role,
    action: 'ORGANIZATION_UPDATED',
    resourceType: 'Organization',
    resourceId: id,
    metadata: updateData,
  });

  return updatedOrg;
};

/**
 * Delete organization and all associated data (Admin only).
 */
export const deleteOrganization = async (id, adminUser) => {
  const organization = await Organization.findById(id);
  if (!organization) {
    throw new ApiError(404, 'Organization not found');
  }

  // Cascade delete all related records
  await Promise.all([
    Organization.findByIdAndDelete(id),
    OrganizationUser.deleteMany({ organizationId: id }),
    QRCode.deleteMany({ organizationId: id }),
    Subscription.deleteMany({ organizationId: id }),
    RenewalRequest.deleteMany({ organizationId: id }),
    Payment.deleteMany({ organizationId: id }),
    Notification.deleteMany({ organizationId: id }),
    CustomerSubmission.deleteMany({ organizationId: id }),
  ]);

  await logAudit({
    actorId: adminUser._id,
    actorName: adminUser.fullName,
    actorRole: adminUser.role,
    action: 'ORGANIZATION_DELETED',
    resourceType: 'Organization',
    resourceId: id,
    metadata: {
      name: organization.name,
      displayTitle: organization.displayTitle,
      organizationType: organization.organizationType,
    },
  });

  return { id, name: organization.name };
};

