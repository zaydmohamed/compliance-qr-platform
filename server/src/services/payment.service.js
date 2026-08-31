import { Payment } from '../models/Payment.js';
import { Organization } from '../models/Organization.js';
import { extendSubscription } from './subscription.service.js';
import { ApiError } from '../utils/ApiError.js';
import { logAudit } from './audit.service.js';

export const recordManualPayment = async (paymentData, adminUser) => {
  const organization = await Organization.findById(paymentData.organizationId);
  if (!organization) {
    throw new ApiError(404, 'Organization not found');
  }

  const payment = await Payment.create({
    ...paymentData,
    recordedBy: adminUser._id,
  });

  // Calculate duration in days
  const start = new Date(paymentData.periodStartDate);
  const end = new Date(paymentData.periodEndDate);
  const durationDays = Math.max(1, Math.ceil((end - start) / (1000 * 60 * 60 * 24)));

  // Automatically extend subscription
  await extendSubscription(organization._id, durationDays, payment._id);

  await logAudit({
    actorId: adminUser._id,
    actorName: adminUser.fullName,
    actorRole: adminUser.role,
    action: 'PAYMENT_RECORDED',
    resourceType: 'Payment',
    resourceId: payment._id,
    metadata: {
      organizationId: organization._id,
      amount: payment.amount,
      method: payment.paymentMethod,
    },
  });

  return payment;
};

export const getPaymentsList = async ({ organizationId = null, page = 1, limit = 10 }) => {
  const query = {};
  if (organizationId) query.organizationId = organizationId;

  const skip = (page - 1) * limit;
  const [total, payments] = await Promise.all([
    Payment.countDocuments(query),
    Payment.find(query)
      .populate('organizationId', 'name displayTitle phone')
      .populate('recordedBy', 'fullName username')
      .sort({ paymentDate: -1 })
      .skip(skip)
      .limit(limit),
  ]);

  return {
    payments,
    total,
    page: Number(page),
    totalPages: Math.ceil(total / limit),
  };
};
