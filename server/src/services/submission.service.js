import { CustomerSubmission } from '../models/CustomerSubmission.js';
import { QRCode } from '../models/QRCode.js';
import { Organization } from '../models/Organization.js';
import { Subscription } from '../models/Subscription.js';
import { generateReferenceNumber } from '../utils/referenceNumber.js';
import { QR_STATUS, SUBMISSION_TYPE, NOTIFICATION_CHANNEL, NOTIFICATION_TYPE } from '../constants/statuses.js';
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

  // 1. Organization Notification (SMS, WhatsApp, Email)
  const isComplaint = type === SUBMISSION_TYPE.COMPLAINT;
  const typeLabel = isComplaint ? 'COMPLAINT' : 'SUGGESTION';
  const orgTitle = organization.displayTitle || organization.name;

  const orgSmsMessage = `[${orgTitle.toUpperCase()}]\n\n${typeLabel}\n\nRef: ${referenceNumber}\nCategory: ${submission.category}\n${isComplaint ? 'Details' : 'Suggestion'}: ${submission.message}${!isComplaint && submission.suggestedSolution ? `\nProposed Solution: ${submission.suggestedSolution}` : ''}\nFrom: ${submission.customerPhone || 'Anonymous'}`;

  const orgEmailHtml = `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 520px; margin: 0 auto; background: #ffffff; border-radius: 16px; padding: 28px; border: 1px solid #e2e8f0; box-shadow: 0 4px 12px rgba(0,0,0,0.05);">
      ${organization.logo ? `<div style="text-align: center; margin-bottom: 18px;"><img src="${organization.logo}" alt="${orgTitle}" style="max-height: 75px; max-width: 150px; object-fit: contain; border-radius: 8px;" /></div>` : ''}
      <div style="text-align: center; margin-bottom: 20px;">
        <span style="display: inline-block; padding: 6px 16px; border-radius: 9999px; font-weight: 800; font-size: 13px; letter-spacing: 0.5px; ${isComplaint ? 'background: #fee2e2; color: #b91c1c; border: 1px solid #fca5a5;' : 'background: #e0f2fe; color: #0369a1; border: 1px solid #bae6fd;'}">${typeLabel}</span>
        <h2 style="margin: 10px 0 2px 0; color: #0f172a; font-size: 18px; font-weight: 800;">${orgTitle}</h2>
      </div>
      <div style="background: #f8fafc; border-radius: 12px; padding: 18px; font-size: 13px; line-height: 1.6; color: #334155; border: 1px solid #f1f5f9;">
        <p style="margin: 0 0 10px 0;"><strong>Reference Number:</strong> <span style="font-family: monospace; font-weight: 700; color: #0086ff;">${referenceNumber}</span></p>
        <p style="margin: 0 0 10px 0;"><strong>Category:</strong> ${submission.category}</p>
        <p style="margin: 0 0 10px 0;"><strong>${isComplaint ? 'Complaint Message' : 'Customer Suggestion'}:</strong><br/>${submission.message}</p>
        ${!isComplaint && submission.suggestedSolution ? `<p style="margin: 0 0 10px 0;"><strong>Suggested Solution:</strong><br/>${submission.suggestedSolution}</p>` : ''}
        <p style="margin: 0; padding-top: 8px; border-top: 1px solid #e2e8f0;"><strong>Customer Phone:</strong> ${submission.customerPhone || 'Anonymous'}</p>
      </div>
      <div style="margin-top: 20px; text-align: center; font-size: 11px; color: #94a3b8;">
        Sent via Compliance QR Management Platform
      </div>
    </div>
  `;

  const notificationTasks = [];

  // Dispatch to Organization via SMS
  if (organization.phone) {
    notificationTasks.push(
      dispatchNotification({
        organizationId: organization._id,
        submissionId: submission._id,
        channel: NOTIFICATION_CHANNEL.SMS,
        type: isComplaint ? NOTIFICATION_TYPE.COMPLAINT : NOTIFICATION_TYPE.SUGGESTION,
        recipientType: 'ORGANIZATION',
        recipient: organization.phone,
        recipientName: organization.name,
        message: orgSmsMessage,
        metadata: {
          organizationLogo: organization.logo,
          organizationName: organization.name,
          referenceNumber,
          category: submission.category,
        },
      }).catch((err) => console.error('[Org SMS Dispatch Error]', err.message))
    );
  }

  // Dispatch to Organization via WhatsApp
  if (organization.whatsapp) {
    notificationTasks.push(
      dispatchNotification({
        organizationId: organization._id,
        submissionId: submission._id,
        channel: NOTIFICATION_CHANNEL.WHATSAPP,
        type: isComplaint ? NOTIFICATION_TYPE.COMPLAINT : NOTIFICATION_TYPE.SUGGESTION,
        recipientType: 'ORGANIZATION',
        recipient: organization.whatsapp,
        recipientName: organization.name,
        message: orgSmsMessage,
        metadata: {
          organizationLogo: organization.logo,
          organizationName: organization.name,
          referenceNumber,
          category: submission.category,
        },
      }).catch((err) => console.error('[Org WhatsApp Dispatch Error]', err.message))
    );
  }

  // Dispatch to Organization via Email (if configured)
  if (organization.email) {
    notificationTasks.push(
      dispatchNotification({
        organizationId: organization._id,
        submissionId: submission._id,
        channel: NOTIFICATION_CHANNEL.EMAIL,
        type: isComplaint ? NOTIFICATION_TYPE.COMPLAINT : NOTIFICATION_TYPE.SUGGESTION,
        recipientType: 'ORGANIZATION',
        recipient: organization.email,
        recipientName: organization.name,
        subject: `[${typeLabel}] New ${isComplaint ? 'Complaint' : 'Suggestion'} - Ref: ${referenceNumber}`,
        message: orgSmsMessage,
        html: orgEmailHtml,
        metadata: {
          organizationLogo: organization.logo,
          organizationName: organization.name,
          referenceNumber,
          category: submission.category,
        },
      }).catch((err) => console.error('[Org Email Dispatch Error]', err.message))
    );
  }

  // 2. Customer Thank-You SMS (English)
  if (submission.customerPhone) {
    const thankYouMessage = 'Thank you for sharing your feedback. Your submission has been received successfully. We appreciate your time and value your feedback.';

    notificationTasks.push(
      dispatchNotification({
        organizationId: organization._id,
        submissionId: submission._id,
        channel: NOTIFICATION_CHANNEL.SMS,
        type: NOTIFICATION_TYPE.CUSTOMER_THANK_YOU,
        recipientType: 'CUSTOMER',
        recipient: submission.customerPhone,
        recipientName: submission.customerName || 'Customer',
        message: thankYouMessage,
        metadata: {
          referenceNumber,
          organizationName: organization.name,
          organizationLogo: organization.logo,
        },
      }).catch((err) => console.error('[Customer Thank-You SMS Dispatch Error]', err.message))
    );
  }

  // Await all notification dispatches before returning so serverless doesn't drop requests
  if (notificationTasks.length > 0) {
    await Promise.allSettled(notificationTasks);
  }

  return {
    referenceNumber: submission.referenceNumber,
    type: submission.type,
    submittedAt: submission.submittedAt,
    organizationName: organization.displayTitle || organization.name,
    organizationLogo: organization.logo,
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
