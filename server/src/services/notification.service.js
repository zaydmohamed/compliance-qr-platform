import nodemailer from 'nodemailer';
import { Notification } from '../models/Notification.js';
import { NOTIFICATION_CHANNEL, NOTIFICATION_STATUS } from '../constants/statuses.js';
import { sendSms } from '../integrations/sms/sms.service.js';
import { sendWhatsApp } from '../integrations/whatsapp/whatsapp.service.js';
import { logAudit } from './audit.service.js';

let emailTransporter = null;
const getEmailTransporter = () => {
  if (emailTransporter) return emailTransporter;
  if (process.env.SMTP_HOST && process.env.SMTP_USER) {
    emailTransporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT || '587', 10),
      secure: process.env.SMTP_SECURE === 'true',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
  } else {
    emailTransporter = nodemailer.createTransport({ jsonTransport: true });
  }
  return emailTransporter;
};

export const dispatchNotification = async ({
  organizationId,
  submissionId = null,
  channel,
  type = 'GENERAL',
  recipientType = 'ORGANIZATION',
  recipient,
  recipientName = '',
  message,
  subject = '',
  html = '',
  metadata = {},
}) => {
  if (!recipient) return null;

  let notificationRecord;
  try {
    notificationRecord = await Notification.create({
      organizationId,
      submissionId,
      channel,
      type,
      recipientType,
      recipient,
      recipientName,
      message,
      metadata,
      status: NOTIFICATION_STATUS.PENDING,
    });

    let result;
    if (channel === NOTIFICATION_CHANNEL.SMS) {
      result = await sendSms({ recipient, message });
    } else if (channel === NOTIFICATION_CHANNEL.WHATSAPP) {
      result = await sendWhatsApp({ recipient, message });
    } else if (channel === NOTIFICATION_CHANNEL.EMAIL) {
      const transporter = getEmailTransporter();
      const from = process.env.SMTP_FROM || '"Compliance QR Notifications" <no-reply@complianceqr.com>';
      const info = await transporter.sendMail({
        from,
        to: recipient,
        subject: subject || `[${type}] Compliance QR Notification`,
        text: message,
        html: html || undefined,
      });
      result = { success: true, messageId: info?.messageId, timestamp: new Date() };
    }

    if (result && result.success) {
      notificationRecord.status = NOTIFICATION_STATUS.SENT;
      notificationRecord.providerResponse = result;
      notificationRecord.sentAt = new Date();
      console.log(`[Notification Service] ✅ [${channel}] [${type}] to ${recipient} SUCCESS`);
    } else {
      notificationRecord.status = NOTIFICATION_STATUS.FAILED;
      notificationRecord.errorMessage = result?.error || 'Provider delivery failed';
      console.warn(`[Notification Service] ❌ [${channel}] [${type}] to ${recipient} FAILED: ${notificationRecord.errorMessage}`);
    }

    await notificationRecord.save();
    return notificationRecord;
  } catch (error) {
    console.error(`[Notification Service Error] Failed to dispatch ${channel}:`, error.message);
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
