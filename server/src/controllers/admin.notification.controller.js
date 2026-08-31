import { asyncHandler } from '../utils/asyncHandler.js';
import { Notification } from '../models/Notification.js';
import * as notificationService from '../services/notification.service.js';

export const getNotifications = asyncHandler(async (req, res) => {
  const { channel, status, page = 1, limit = 20 } = req.query;
  const query = {};
  if (channel) query.channel = channel;
  if (status) query.status = status;

  const skip = (page - 1) * limit;
  const [total, notifications] = await Promise.all([
    Notification.countDocuments(query),
    Notification.find(query)
      .populate('organizationId', 'name displayTitle')
      .populate('submissionId', 'referenceNumber type')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit),
  ]);

  res.status(200).json({
    success: true,
    data: {
      notifications,
      total,
      page: Number(page),
      totalPages: Math.ceil(total / limit),
    },
  });
});

export const retryNotification = asyncHandler(async (req, res) => {
  const notification = await notificationService.retryNotification(req.params.id, req.user);
  res.status(200).json({
    success: true,
    message: 'Notification retry attempted',
    data: { notification },
  });
});
