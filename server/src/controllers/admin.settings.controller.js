import { asyncHandler } from '../utils/asyncHandler.js';
import { PlatformSettings } from '../models/PlatformSettings.js';
import { logAudit } from '../services/audit.service.js';

export const getSettings = asyncHandler(async (req, res) => {
  let settings = await PlatformSettings.findOne();
  if (!settings) {
    settings = await PlatformSettings.create({});
  }

  res.status(200).json({
    success: true,
    data: { settings },
  });
});

export const getPublicSettings = asyncHandler(async (req, res) => {
  let settings = await PlatformSettings.findOne();
  if (!settings) {
    settings = await PlatformSettings.create({});
  }

  res.status(200).json({
    success: true,
    data: {
      platformName: settings.platformName || 'Compliance QR',
      logo: settings.logo || '',
      contactPhone: settings.contactPhone,
      contactEmail: settings.contactEmail,
    },
  });
});

export const updateSettings = asyncHandler(async (req, res) => {
  let settings = await PlatformSettings.findOne();
  const updateData = { ...req.body };

  if (req.file) {
    updateData.logo = `/uploads/logos/${req.file.filename}`;
  }

  if (!settings) {
    settings = await PlatformSettings.create(updateData);
  } else {
    settings = await PlatformSettings.findByIdAndUpdate(settings._id, updateData, { new: true });
  }

  await logAudit({
    actorId: req.user?._id || req.user?.id,
    actorName: req.user?.fullName,
    actorRole: req.user?.role,
    action: 'PLATFORM_SETTINGS_UPDATED',
    resourceType: 'PlatformSettings',
    resourceId: settings._id,
    metadata: updateData,
  });

  res.status(200).json({
    success: true,
    message: 'Platform branding and settings updated successfully',
    data: { settings },
  });
});
