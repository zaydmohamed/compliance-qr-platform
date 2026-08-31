import { RenewalRequest } from '../models/RenewalRequest.js';
import { Organization } from '../models/Organization.js';
import { Payment } from '../models/Payment.js';
import { RENEWAL_STATUS } from '../constants/statuses.js';
import { extendSubscription } from './subscription.service.js';
import { ApiError } from '../utils/ApiError.js';
import { logAudit } from './audit.service.js';

/**
 * Organization User submits a renewal request.
 */
export const createRenewalRequest = async (organizationId, user, notes = '') => {
  // Prevent duplicate pending requests
  const pending = await RenewalRequest.findOne({
    organizationId,
    status: RENEWAL_STATUS.PENDING,
  });

  if (pending) {
    throw new ApiError(400, 'A renewal request is already pending review by the Platform Admin.');
  }

  const renewalRequest = await RenewalRequest.create({
    organizationId,
    requestedBy: user.id || user._id,
    notes,
    status: RENEWAL_STATUS.PENDING,
    requestedAt: new Date(),
  });

  await logAudit({
    actorId: user.id || user._id,
    actorName: user.fullName,
    actorRole: user.role,
    action: 'RENEWAL_REQUESTED',
    resourceType: 'RenewalRequest',
    resourceId: renewalRequest._id,
    metadata: { organizationId },
  });

  return renewalRequest;
};

/**
 * List renewal requests for Admin (all) or Org (own).
 */
export const getRenewalRequestsList = async ({ organizationId = null, status = null, page = 1, limit = 10 }) => {
  const query = {};
  if (organizationId) query.organizationId = organizationId;
  if (status) query.status = status;

  const skip = (page - 1) * limit;
  const [total, requests] = await Promise.all([
    RenewalRequest.countDocuments(query),
    RenewalRequest.find(query)
      .populate('organizationId', 'name displayTitle phone logo')
      .populate('requestedBy', 'fullName username phone')
      .populate('reviewedBy', 'fullName username')
      .populate('paymentId')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit),
  ]);

  return {
    requests,
    total,
    page: Number(page),
    totalPages: Math.ceil(total / limit),
  };
};

/**
 * Platform Admin approves renewal request, records manual payment, and extends 30-day service period.
 */
export const approveRenewalRequest = async (requestId, approvalData, adminUser) => {
  const request = await RenewalRequest.findById(requestId).populate('organizationId');
  if (!request) {
    throw new ApiError(404, 'Renewal request not found');
  }

  if (request.status !== RENEWAL_STATUS.PENDING) {
    throw new ApiError(400, `Cannot approve request with status '${request.status}'`);
  }

  const durationDays = approvalData.durationDays || 30;
  const periodStartDate = new Date();
  const periodEndDate = new Date(periodStartDate.getTime() + durationDays * 24 * 60 * 60 * 1000);

  // 1. Record manual payment
  const payment = await Payment.create({
    organizationId: request.organizationId._id,
    amount: approvalData.amount || 0,
    currency: 'USD',
    paymentMethod: approvalData.paymentMethod || 'Cash',
    referenceNumber: approvalData.referenceNumber || `PAY-${Date.now().toString().slice(-6)}`,
    periodStartDate,
    periodEndDate,
    recordedBy: adminUser._id,
    notes: approvalData.notes || `Approved renewal for ${request.organizationId.name}`,
  });

  // 2. Extend subscription and reactivate same QR code
  const subscription = await extendSubscription(request.organizationId._id, durationDays, payment._id);

  // 3. Mark renewal request as APPROVED
  request.status = RENEWAL_STATUS.APPROVED;
  request.reviewedBy = adminUser._id;
  request.reviewedAt = new Date();
  request.paymentId = payment._id;
  await request.save();

  await logAudit({
    actorId: adminUser._id,
    actorName: adminUser.fullName,
    actorRole: adminUser.role,
    action: 'RENEWAL_APPROVED',
    resourceType: 'RenewalRequest',
    resourceId: request._id,
    metadata: {
      organizationId: request.organizationId._id,
      paymentId: payment._id,
      durationDays,
    },
  });

  return {
    request,
    payment,
    subscription,
  };
};

/**
 * Platform Admin rejects renewal request.
 */
export const rejectRenewalRequest = async (requestId, rejectionReason, adminUser) => {
  const request = await RenewalRequest.findById(requestId);
  if (!request) {
    throw new ApiError(404, 'Renewal request not found');
  }

  if (request.status !== RENEWAL_STATUS.PENDING) {
    throw new ApiError(400, `Cannot reject request with status '${request.status}'`);
  }

  request.status = RENEWAL_STATUS.REJECTED;
  request.reviewedBy = adminUser._id;
  request.reviewedAt = new Date();
  request.rejectionReason = rejectionReason;
  await request.save();

  await logAudit({
    actorId: adminUser._id,
    actorName: adminUser.fullName,
    actorRole: adminUser.role,
    action: 'RENEWAL_REJECTED',
    resourceType: 'RenewalRequest',
    resourceId: request._id,
    metadata: { reason: rejectionReason },
  });

  return request;
};
