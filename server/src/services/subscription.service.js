import { Subscription } from '../models/Subscription.js';
import { Organization } from '../models/Organization.js';
import { QRCode } from '../models/QRCode.js';
import { SUBSCRIPTION_STATUS, ORGANIZATION_STATUS, QR_STATUS } from '../constants/statuses.js';
import { PlatformSettings } from '../models/PlatformSettings.js';
import { dispatchNotification } from './notification.service.js';
import { NOTIFICATION_CHANNEL } from '../constants/statuses.js';

/**
 * Calculate dynamic status and remaining time for a subscription.
 */
export const calculateSubscriptionStatus = (subscription, settings = { defaultGracePeriodDays: 3, expiringWarningDays: 3 }) => {
  if (!subscription) {
    return {
      status: SUBSCRIPTION_STATUS.INACTIVE,
      daysRemaining: 0,
      isServiceActive: false,
    };
  }

  const now = new Date();
  const endDate = new Date(subscription.endDate);
  const graceDays = subscription.gracePeriodDays ?? settings.defaultGracePeriodDays ?? 3;
  const warningDays = settings.expiringWarningDays ?? 3;

  const msRemaining = endDate.getTime() - now.getTime();
  const daysRemaining = Math.ceil(msRemaining / (1000 * 60 * 60 * 24));

  const graceEndDate = new Date(endDate.getTime() + graceDays * 24 * 60 * 60 * 1000);
  const msGraceRemaining = graceEndDate.getTime() - now.getTime();

  let calculatedStatus = SUBSCRIPTION_STATUS.ACTIVE;
  let isServiceActive = true;

  if (msRemaining <= 0) {
    if (msGraceRemaining > 0 && graceDays > 0) {
      calculatedStatus = SUBSCRIPTION_STATUS.GRACE_PERIOD;
      isServiceActive = false; // block new submissions after formal expiry per spec
    } else {
      calculatedStatus = SUBSCRIPTION_STATUS.INACTIVE;
      isServiceActive = false;
    }
  } else if (daysRemaining <= warningDays) {
    calculatedStatus = SUBSCRIPTION_STATUS.EXPIRING_SOON;
    isServiceActive = true;
  } else {
    calculatedStatus = SUBSCRIPTION_STATUS.ACTIVE;
    isServiceActive = true;
  }

  return {
    status: calculatedStatus,
    daysRemaining: Math.max(0, daysRemaining),
    isServiceActive,
    graceEndDate,
    startDate: subscription.startDate,
    endDate: subscription.endDate,
  };
};

/**
 * Initialize a new 30-day subscription for an organization.
 */
export const startInitialSubscription = async (organizationId, durationDays = 30) => {
  const settings = (await PlatformSettings.findOne()) || { defaultGracePeriodDays: 3, defaultServiceDurationDays: 30 };
  const days = durationDays || settings.defaultServiceDurationDays || 30;

  const startDate = new Date();
  const endDate = new Date(startDate.getTime() + days * 24 * 60 * 60 * 1000);
  const gracePeriodDays = settings.defaultGracePeriodDays || 3;
  const gracePeriodEndDate = new Date(endDate.getTime() + gracePeriodDays * 24 * 60 * 60 * 1000);

  const subscription = await Subscription.create({
    organizationId,
    startDate,
    endDate,
    gracePeriodDays,
    gracePeriodEndDate,
    status: SUBSCRIPTION_STATUS.ACTIVE,
  });

  await Organization.findByIdAndUpdate(organizationId, {
    activeSubscriptionId: subscription._id,
    status: ORGANIZATION_STATUS.ACTIVE,
  });

  return subscription;
};

/**
 * Extend an existing subscription or create a new 30-day active period upon approved renewal.
 */
export const extendSubscription = async (organizationId, durationDays = 30, paymentId = null) => {
  const settings = (await PlatformSettings.findOne()) || { defaultGracePeriodDays: 3 };
  const existingSub = await Subscription.findOne({ organizationId }).sort({ createdAt: -1 });

  const now = new Date();
  let baseStartDate = now;

  // If current subscription endDate is still in the future, extend from that future date
  if (existingSub && new Date(existingSub.endDate) > now) {
    baseStartDate = new Date(existingSub.endDate);
  }

  const endDate = new Date(baseStartDate.getTime() + durationDays * 24 * 60 * 60 * 1000);
  const gracePeriodDays = settings.defaultGracePeriodDays || 3;
  const gracePeriodEndDate = new Date(endDate.getTime() + gracePeriodDays * 24 * 60 * 60 * 1000);

  const newSubscription = await Subscription.create({
    organizationId,
    startDate: baseStartDate,
    endDate,
    gracePeriodDays,
    gracePeriodEndDate,
    status: SUBSCRIPTION_STATUS.ACTIVE,
    lastPaymentId: paymentId,
    renewalCount: (existingSub?.renewalCount || 0) + 1,
  });

  // Re-enable Organization and QR code
  await Organization.findByIdAndUpdate(organizationId, {
    activeSubscriptionId: newSubscription._id,
    status: ORGANIZATION_STATUS.ACTIVE,
  });

  await QRCode.updateMany(
    { organizationId },
    { status: QR_STATUS.ACTIVE }
  );

  return newSubscription;
};

/**
 * Scheduled job logic: inspect all active subscriptions, update status, and send reminders.
 */
export const checkAndProcessSubscriptions = async () => {
  const settings = (await PlatformSettings.findOne()) || { defaultGracePeriodDays: 3, expiringWarningDays: 3 };
  const subscriptions = await Subscription.find().populate('organizationId');

  for (const sub of subscriptions) {
    if (!sub.organizationId) continue;

    const { status, daysRemaining, isServiceActive } = calculateSubscriptionStatus(sub, settings);
    const org = sub.organizationId;

    // Update Subscription status if changed
    if (sub.status !== status) {
      sub.status = status;
      await sub.save();

      // Update Organization status
      let orgStatus = ORGANIZATION_STATUS.ACTIVE;
      if (status === SUBSCRIPTION_STATUS.EXPIRING_SOON) orgStatus = ORGANIZATION_STATUS.EXPIRING_SOON;
      else if (status === SUBSCRIPTION_STATUS.EXPIRED || status === SUBSCRIPTION_STATUS.GRACE_PERIOD) orgStatus = ORGANIZATION_STATUS.EXPIRED;
      else if (status === SUBSCRIPTION_STATUS.INACTIVE) orgStatus = ORGANIZATION_STATUS.INACTIVE;

      await Organization.findByIdAndUpdate(org._id, { status: orgStatus });

      // If inactive, deactivate QR
      if (!isServiceActive) {
        await QRCode.updateMany({ organizationId: org._id }, { status: QR_STATUS.INACTIVE });
      }
    }

    // Send 3-day SMS warning once
    if (status === SUBSCRIPTION_STATUS.EXPIRING_SOON && !sub.reminderSentAt && org.phone) {
      const msg = `Your Compliance QR service for ${org.name} will expire in ${daysRemaining} day(s). Please submit a renewal request to continue service.`;
      await dispatchNotification({
        organizationId: org._id,
        channel: NOTIFICATION_CHANNEL.SMS,
        recipient: org.phone,
        recipientName: org.name,
        message: msg,
      });
      sub.reminderSentAt = new Date();
      await sub.save();
    }

    // Send expiration notification once
    if ((status === SUBSCRIPTION_STATUS.EXPIRED || status === SUBSCRIPTION_STATUS.INACTIVE) && !sub.expirationNotifiedAt && org.phone) {
      const msg = `Your Compliance QR service for ${org.name} has expired. Please log into your dashboard to request a renewal.`;
      await dispatchNotification({
        organizationId: org._id,
        channel: NOTIFICATION_CHANNEL.SMS,
        recipient: org.phone,
        recipientName: org.name,
        message: msg,
      });
      sub.expirationNotifiedAt = new Date();
      await sub.save();
    }
  }
};
