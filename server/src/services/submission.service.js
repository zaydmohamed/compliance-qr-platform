import { CustomerSubmission } from '../models/CustomerSubmission.js';
import { QRCode } from '../models/QRCode.js';
import { Organization } from '../models/Organization.js';
import { Subscription } from '../models/Subscription.js';
import { generateReferenceNumber } from '../utils/referenceNumber.js';
import { QR_STATUS, SUBMISSION_TYPE, NOTIFICATION_CHANNEL } from '../constants/statuses.js';
import { calculateSubscriptionStatus } from './subscription.service.js';
import { dispatchNotification } from './notification.service.js';
import { ApiError } from '../utils/ApiError.js';
import { logAudit } from './audit.service.js';
import { PlatformSettings } from '../models/PlatformSettings.js';

/**
 * Validate QR token and load safe public organization profile for customer view.
 */
export const getPublicOrgByQrToken = async (publicToken) => {
  const qr = await QRCode.findOne({ publicToken }).lean();
  if (!qr || qr.status !== QR_STATUS.ACTIVE) {
    throw new ApiError(404, 'QR code is invalid or has been deactivated.');
  }

  const [organization, settings] = await Promise.all([
    Organization.findById(qr.organizationId).populate('activeSubscriptionId').lean(),
    PlatformSettings.findOne().lean(),
  ]);

  if (!organization) {
    throw new ApiError(404, 'Organization associated with this QR code does not exist.');
  }

  // Check Subscription Status
  const subCalc = calculateSubscriptionStatus(organization.activeSubscriptionId, settings || {});

  if (!subCalc.isServiceActive) {
    return {
      isServiceActive: false,
      organization: {
        name: organization.name,
        displayTitle: organization.displayTitle,
        logo: organization.logo,
      },
      message: 'This service is currently expired or temporarily inactive. Submissions are temporarily closed.',
    };
  }

  // Increment scan count
  await QRCode.findByIdAndUpdate(qr._id, { $inc: { scanCount: 1 } });

  // Return only SAFE public fields
  return {
    isServiceActive: true,
    qrToken: publicToken,
    organization: {
      id: organization._id,
      name: organization.name,
      displayTitle: organization.displayTitle,
      logo: organization.logo,
      branch: organization.branch,
      phone: organization.phone,
      whatsapp: organization.whatsapp,
      complaintCategories: organization.complaintCategories,
    },
  };
};

/**
 * Customer submits CABASHO (Complaint) or TALO (Feedback).
 */
export const createPublicSubmission = async ({
  qrToken,
  type,
  customerName,
  customerPhone,
  category,
  message,
  suggestedSolution,
}) => {
  const qr = await QRCode.findOne({ publicToken: qrToken });
  if (!qr || qr.status !== QR_STATUS.ACTIVE) {
    throw new ApiError(400, 'Invalid or inactive QR code.');
  }

  const organization = await Organization.findById(qr.organizationId).populate('activeSubscriptionId');
  if (!organization) {
    throw new ApiError(404, 'Organization not found.');
  }

  // Enforce service active check
  const settings = (await PlatformSettings.findOne()) || {};
  const subCalc = calculateSubscriptionStatus(organization.activeSubscriptionId, settings);
  if (!subCalc.isServiceActive) {
    throw new ApiError(403, 'Submissions are currently closed as the organization service period has expired.');
  }

  const referenceNumber = generateReferenceNumber(type);

  const submission = await CustomerSubmission.create({
    organizationId: organization._id,
    qrCodeId: qr._id,
    referenceNumber,
    type,
    customerName: customerName?.trim() || 'Anonymous',
    customerPhone: customerPhone?.trim() || '',
    category: category || (type === SUBMISSION_TYPE.COMPLAINT ? 'General' : 'Feedback'),
    message: message.trim(),
    suggestedSolution: suggestedSolution?.trim() || '',
    status: 'NEW',
    priority: 'MEDIUM',
  });

  // Async dispatch notifications (SMS and WhatsApp) to Organization
  const notificationMsg = type === SUBMISSION_TYPE.COMPLAINT
    ? `[CABASHO NEW] Ref: ${referenceNumber}\nOrg: ${organization.name}\nCategory: ${submission.category}\nMessage: ${submission.message}\nFrom: ${submission.customerPhone || 'Anonymous'}`
    : `[TALO NEW] Ref: ${referenceNumber}\nOrg: ${organization.name}\nSuggestion: ${submission.message}\nSolution: ${submission.suggestedSolution || 'N/A'}`;

  if (organization.phone) {
    dispatchNotification({
      organizationId: organization._id,
      submissionId: submission._id,
      channel: NOTIFICATION_CHANNEL.SMS,
      recipient: organization.phone,
      recipientName: organization.name,
      message: notificationMsg,
    }).catch((err) => console.error('[SMS Dispatch Error]', err));
  }

  if (organization.whatsapp) {
    dispatchNotification({
      organizationId: organization._id,
      submissionId: submission._id,
      channel: NOTIFICATION_CHANNEL.WHATSAPP,
      recipient: organization.whatsapp,
      recipientName: organization.name,
      message: notificationMsg,
    }).catch((err) => console.error('[WhatsApp Dispatch Error]', err));
  }

  return {
    referenceNumber: submission.referenceNumber,
    type: submission.type,
    submittedAt: submission.submittedAt,
    organizationName: organization.displayTitle || organization.name,
    whatsappContact: organization.whatsapp,
  };
};

/**
 * List submissions with filtering for Admin (all) or Organization (own only).
 */
export const getSubmissionsList = async ({
  organizationId = null,
  type = null,
  status = null,
  category = null,
  search = null,
  page = 1,
  limit = 10,
}) => {
  const query = {};

  if (organizationId) query.organizationId = organizationId;
  if (type) query.type = type;
  if (status) query.status = status;
  if (category) query.category = category;

  if (search) {
    query.$or = [
      { referenceNumber: { $regex: search, $options: 'i' } },
      { customerName: { $regex: search, $options: 'i' } },
      { customerPhone: { $regex: search, $options: 'i' } },
      { message: { $regex: search, $options: 'i' } },
    ];
  }

  const skip = (page - 1) * limit;
  const [total, submissions] = await Promise.all([
    CustomerSubmission.countDocuments(query),
    CustomerSubmission.find(query)
      .populate('organizationId', 'name displayTitle logo')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit),
  ]);

  return {
    submissions,
    total,
    page: Number(page),
    totalPages: Math.ceil(total / limit),
  };
};

/**
 * Update submission status or priority.
 */
export const updateSubmission = async (id, updateData, user) => {
  const query = { _id: id };
  if (user.role === 'ORGANIZATION_USER') {
    query.organizationId = user.organizationId;
  }

  const submission = await CustomerSubmission.findOne(query);
  if (!submission) {
    throw new ApiError(404, 'Submission not found or access denied');
  }

  if (updateData.status) {
    submission.status = updateData.status;
    if (updateData.status === 'RESOLVED' || updateData.status === 'CLOSED') {
      submission.resolvedAt = new Date();
    }
  }

  if (updateData.priority) submission.priority = updateData.priority;
  if (updateData.notes) {
    if (user.role === 'PLATFORM_ADMIN') submission.adminNotes = updateData.notes;
    else submission.internalNotes = updateData.notes;
  }

  await submission.save();

  await logAudit({
    actorId: user._id || user.id,
    actorName: user.fullName,
    actorRole: user.role,
    action: 'SUBMISSION_STATUS_CHANGED',
    resourceType: 'CustomerSubmission',
    resourceId: submission._id,
    metadata: { newStatus: submission.status, priority: submission.priority },
  });

  return submission;
};
