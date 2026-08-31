import { Notification } from '../models/Notification.js';
import { NOTIFICATION_CHANNEL, NOTIFICATION_STATUS } from '../constants/statuses.js';
import { sendSms } from '../integrations/sms/sms.service.js';
import { sendWhatsApp } from '../integrations/whatsapp/whatsapp.service.js';
import { logAudit } from './audit.service.js';

export const dispatchNotification = async ({
  organizationId,
  submissionId = null,
  channel,
  recipient,
  recipientName = '',
  message,
}) => {
  if (!recipient) return null;

  let notificationRecord;
  try {
    notificationRecord = await Notification.create({
      organizationId,
      submissionId,
      channel,
      recipient,
      recipientName,
      message,
      status: NOTIFICATION_STATUS.PENDING,
    });

    let result;
    if (channel === NOTIFICATION_CHANNEL.SMS) {
      result = await sendSms({ recipient, message });
    } else if (channel === NOTIFICATION_CHANNEL.WHATSAPP) {
      result = await sendWhatsApp({ recipient, message });
    }

    if (result && result.success) {
      notificationRecord.status = NOTIFICATION_STATUS.SENT;
      notificationRecord.providerResponse = result;
      notificationRecord.sentAt = new Date();
    } else {
      notificationRecord.status = NOTIFICATION_STATUS.FAILED;
      notificationRecord.errorMessage = result?.error || 'Provider delivery failed';
    }

    await notificationRecord.save();
    return notificationRecord;
  } catch (error) {
    console.error(`[Notification Service] Failed to send ${channel}:`, error.message);
    if (notificationRecord) {
      notificationRecord.status = NOTIFICATION_STATUS.FAILED;
      notificationRecord.errorMessage = error.message;
      await notificationRecord.save().catch(() => {});
    }
    return null;
  }
};

export const retryNotification = async (notificationId, adminUser) => {
  const notification = await Notification.findById(notificationId);
  if (!notification) {
    throw new Error('Notification record not found');
  }

  let result;
  if (notification.channel === NOTIFICATION_CHANNEL.SMS) {
    result = await sendSms({ recipient: notification.recipient, message: notification.message });
  } else if (notification.channel === NOTIFICATION_CHANNEL.WHATSAPP) {
    result = await sendWhatsApp({ recipient: notification.recipient, message: notification.message });
  }

  notification.retryCount += 1;
  if (result && result.success) {
    notification.status = NOTIFICATION_STATUS.SENT;
    notification.providerResponse = result;
    notification.sentAt = new Date();
    notification.errorMessage = '';
  } else {
    notification.status = NOTIFICATION_STATUS.FAILED;
    notification.errorMessage = result?.error || 'Retry failed';
  }

  await notification.save();

  await logAudit({
    actorId: adminUser._id,
    actorName: adminUser.fullName,
    actorRole: adminUser.role,
    action: 'NOTIFICATION_RETRIED',
    resourceType: 'Notification',
    resourceId: notification._id,
    metadata: { channel: notification.channel, status: notification.status },
  });

  return notification;
};
