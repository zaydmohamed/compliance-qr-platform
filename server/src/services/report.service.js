import { Organization } from '../models/Organization.js';
import { CustomerSubmission } from '../models/CustomerSubmission.js';
import { RenewalRequest } from '../models/RenewalRequest.js';
import { Payment } from '../models/Payment.js';
import { Notification } from '../models/Notification.js';
import { Subscription } from '../models/Subscription.js';
import { calculateSubscriptionStatus } from './subscription.service.js';
import { PlatformSettings } from '../models/PlatformSettings.js';
import { SUBMISSION_TYPE, COMPLAINT_STATUS, RENEWAL_STATUS } from '../constants/statuses.js';

export const getAdminOverviewStats = async () => {
  const settings = (await PlatformSettings.findOne()) || {};

  const [
    organizations,
    totalComplaints,
    newComplaints,
    inProgressComplaints,
    resolvedComplaints,
    totalFeedback,
    pendingRenewals,
    approvedRenewals,
    rejectedRenewals,
    totalPaymentsResult,
  ] = await Promise.all([
    Organization.find().populate('activeSubscriptionId').populate('activeQrId'),
    CustomerSubmission.countDocuments({ type: SUBMISSION_TYPE.COMPLAINT }),
    CustomerSubmission.countDocuments({ type: SUBMISSION_TYPE.COMPLAINT, status: COMPLAINT_STATUS.NEW }),
    CustomerSubmission.countDocuments({ type: SUBMISSION_TYPE.COMPLAINT, status: COMPLAINT_STATUS.IN_PROGRESS }),
    CustomerSubmission.countDocuments({ type: SUBMISSION_TYPE.COMPLAINT, status: COMPLAINT_STATUS.RESOLVED }),
    CustomerSubmission.countDocuments({ type: SUBMISSION_TYPE.FEEDBACK }),
    RenewalRequest.countDocuments({ status: RENEWAL_STATUS.PENDING }),
    RenewalRequest.countDocuments({ status: RENEWAL_STATUS.APPROVED }),
    RenewalRequest.countDocuments({ status: RENEWAL_STATUS.REJECTED }),
    Payment.aggregate([{ $group: { _id: null, totalAmount: { $sum: '$amount' } } }]),
  ]);

  let activeCount = 0;
  let expiringCount = 0;
  let expiredCount = 0;
  let inactiveCount = 0;

  const urgentExpiringList = [];

  for (const org of organizations) {
    const subCalc = calculateSubscriptionStatus(org.activeSubscriptionId, settings);
    if (subCalc.status === 'ACTIVE') activeCount++;
    else if (subCalc.status === 'EXPIRING_SOON') {
      expiringCount++;
      urgentExpiringList.push({
        id: org._id,
        name: org.name,
        displayTitle: org.displayTitle,
        phone: org.phone,
        daysRemaining: subCalc.daysRemaining,
        endDate: subCalc.endDate,
        status: subCalc.status,
      });
    } else if (subCalc.status === 'EXPIRED' || subCalc.status === 'GRACE_PERIOD') {
      expiredCount++;
      urgentExpiringList.push({
        id: org._id,
        name: org.name,
        displayTitle: org.displayTitle,
        phone: org.phone,
        daysRemaining: 0,
        endDate: subCalc.endDate,
        status: subCalc.status,
      });
    } else {
      inactiveCount++;
    }
  }

  // Sort urgent list: smallest remaining days first (1 Day, 2 Days, 3 Days...)
  urgentExpiringList.sort((a, b) => a.daysRemaining - b.daysRemaining);

  return {
    organizations: {
      total: organizations.length,
      active: activeCount,
      expiring: expiringCount,
      expired: expiredCount,
      inactive: inactiveCount,
    },
    complaints: {
      total: totalComplaints,
      new: newComplaints,
      inProgress: inProgressComplaints,
      resolved: resolvedComplaints,
    },
    feedback: {
      total: totalFeedback,
    },
    renewals: {
      pending: pendingRenewals,
      approved: approvedRenewals,
      rejected: rejectedRenewals,
    },
    totalRevenue: totalPaymentsResult[0]?.totalAmount || 0,
    urgentExpiringList: urgentExpiringList.slice(0, 10),
  };
};

export const getAdminAnalytics = async () => {
  const [byType, byCategory, monthlySubmissions] = await Promise.all([
    Organization.aggregate([
      { $group: { _id: '$organizationType', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
    ]),
    CustomerSubmission.aggregate([
      { $match: { type: SUBMISSION_TYPE.COMPLAINT } },
      { $group: { _id: '$category', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
    ]),
    CustomerSubmission.aggregate([
      {
        $group: {
          _id: {
            month: { $month: '$createdAt' },
            year: { $year: '$createdAt' },
            type: '$type',
          },
          count: { $sum: 1 },
        },
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } },
    ]),
  ]);

  return {
    organizationsByType: byType.map((item) => ({ type: item._id || 'Other', count: item.count })),
    complaintsByCategory: byCategory.map((item) => ({ category: item._id || 'General', count: item.count })),
    monthlySubmissions,
  };
};

export const getOrganizationOverviewStats = async (organizationId) => {
  const settings = (await PlatformSettings.findOne()) || {};
  const org = await Organization.findById(organizationId).populate('activeSubscriptionId').populate('activeQrId');

  const [
    totalComplaints,
    newComplaints,
    inProgressComplaints,
    resolvedComplaints,
    closedComplaints,
    totalFeedback,
    categoryBreakdown,
    pendingRenewal,
  ] = await Promise.all([
    CustomerSubmission.countDocuments({ organizationId, type: SUBMISSION_TYPE.COMPLAINT }),
    CustomerSubmission.countDocuments({ organizationId, type: SUBMISSION_TYPE.COMPLAINT, status: COMPLAINT_STATUS.NEW }),
    CustomerSubmission.countDocuments({ organizationId, type: SUBMISSION_TYPE.COMPLAINT, status: COMPLAINT_STATUS.IN_PROGRESS }),
    CustomerSubmission.countDocuments({ organizationId, type: SUBMISSION_TYPE.COMPLAINT, status: COMPLAINT_STATUS.RESOLVED }),
    CustomerSubmission.countDocuments({ organizationId, type: SUBMISSION_TYPE.COMPLAINT, status: COMPLAINT_STATUS.CLOSED }),
    CustomerSubmission.countDocuments({ organizationId, type: SUBMISSION_TYPE.FEEDBACK }),
    CustomerSubmission.aggregate([
      { $match: { organizationId, type: SUBMISSION_TYPE.COMPLAINT } },
      { $group: { _id: '$category', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
    ]),
    RenewalRequest.findOne({ organizationId, status: RENEWAL_STATUS.PENDING }),
  ]);

  const subCalc = calculateSubscriptionStatus(org.activeSubscriptionId, settings);

  const mostCommonCategory = categoryBreakdown.length > 0
    ? { category: categoryBreakdown[0]._id || 'General', count: categoryBreakdown[0].count }
    : { category: 'None', count: 0 };

  return {
    complaints: {
      total: totalComplaints,
      new: newComplaints,
      inProgress: inProgressComplaints,
      resolved: resolvedComplaints,
      closed: closedComplaints,
      mostCommonCategory,
    },
    feedback: {
      total: totalFeedback,
    },
    subscription: {
      status: subCalc.status,
      daysRemaining: subCalc.daysRemaining,
      startDate: subCalc.startDate,
      endDate: subCalc.endDate,
      isServiceActive: subCalc.isServiceActive,
    },
    hasPendingRenewal: !!pendingRenewal,
    categories: categoryBreakdown.map((c) => ({ category: c._id || 'General', count: c.count })),
  };
};

/**
 * Generate CSV export of submissions for an organization or all.
 */
export const generateSubmissionsCsv = async (organizationId = null) => {
  const query = {};
  if (organizationId) query.organizationId = organizationId;

  const submissions = await CustomerSubmission.find(query)
    .populate('organizationId', 'name')
    .sort({ createdAt: -1 });

  const headers = [
    'Reference Number',
    'Type',
    'Organization',
    'Category',
    'Customer Phone',
    'Customer Name',
    'Status',
    'Priority',
    'Message',
    'Suggested Solution',
    'Date Submitted',
  ];

  const escapeCsv = (str) => `"${(str || '').toString().replace(/"/g, '""')}"`;

  const rows = submissions.map((s) => [
    escapeCsv(s.referenceNumber),
    escapeCsv(s.type),
    escapeCsv(s.organizationId?.name || 'N/A'),
    escapeCsv(s.category),
    escapeCsv(s.customerPhone),
    escapeCsv(s.customerName),
    escapeCsv(s.status),
    escapeCsv(s.priority),
    escapeCsv(s.message),
    escapeCsv(s.suggestedSolution),
    escapeCsv(s.createdAt ? new Date(s.createdAt).toISOString() : ''),
  ]);

  return [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
};
