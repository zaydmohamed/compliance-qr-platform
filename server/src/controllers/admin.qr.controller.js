import { asyncHandler } from '../utils/asyncHandler.js';
import * as qrService from '../services/qr.service.js';
import { QRCode } from '../models/QRCode.js';
import { Organization } from '../models/Organization.js';
import { QR_STATUS, NOTIFICATION_CHANNEL } from '../constants/statuses.js';
import { dispatchNotification } from '../services/notification.service.js';
import { ApiError } from '../utils/ApiError.js';

export const createQr = asyncHandler(async (req, res) => {
  const qr = await qrService.createQrForOrganization(req.params.id, req.user);
  res.status(201).json({
    success: true,
    message: 'QR Code created successfully',
    data: { qr },
  });
});

export const getOrgQr = asyncHandler(async (req, res) => {
  const orgId = req.params.id || req.organizationId;
  const qr = await QRCode.findOne({ organizationId: orgId, status: { $ne: QR_STATUS.REVOKED } });
  if (!qr) {
    throw new ApiError(404, 'QR code not found for this organization');
  }

  const host = req.get('x-forwarded-host') || req.get('host');
  const proto = req.get('x-forwarded-proto') || (req.secure ? 'https' : 'http');
  const dynamicOrigin = host ? `${proto}://${host}` : null;

  const dataUrl = await qrService.generateQrDataUrl(qr.publicToken, dynamicOrigin);
  const publicUrl = qrService.buildPublicQrUrl(qr.publicToken, dynamicOrigin);

  res.status(200).json({
    success: true,
    data: {
      qr,
      dataUrl,
      publicUrl,
    },
  });
});

export const regenerateQr = asyncHandler(async (req, res) => {
  const newQr = await qrService.regenerateQrCode(req.params.id, req.user);
  const host = req.get('x-forwarded-host') || req.get('host');
  const proto = req.get('x-forwarded-proto') || (req.secure ? 'https' : 'http');
  const dynamicOrigin = host ? `${proto}://${host}` : null;

  const dataUrl = await qrService.generateQrDataUrl(newQr.publicToken, dynamicOrigin);
  const publicUrl = qrService.buildPublicQrUrl(newQr.publicToken, dynamicOrigin);

  res.status(200).json({
    success: true,
    message: 'QR Code regenerated successfully. Previous code has been revoked.',
    data: {
      qr: newQr,
      dataUrl,
      publicUrl,
    },
  });
});

export const activateQr = asyncHandler(async (req, res) => {
  const qr = await qrService.setQrStatus(req.params.id, QR_STATUS.ACTIVE, req.user);
  res.status(200).json({
    success: true,
    message: 'QR Code activated',
    data: { qr },
  });
});

export const deactivateQr = asyncHandler(async (req, res) => {
  const qr = await qrService.setQrStatus(req.params.id, QR_STATUS.INACTIVE, req.user);
  res.status(200).json({
    success: true,
    message: 'QR Code deactivated',
    data: { qr },
  });
});

export const sendQrWhatsApp = asyncHandler(async (req, res) => {
  const org = await Organization.findById(req.params.id);
  if (!org || !org.whatsapp) {
    throw new ApiError(400, 'Organization does not have a registered WhatsApp number');
  }

  const qr = await QRCode.findOne({ organizationId: org._id, status: QR_STATUS.ACTIVE });
  if (!qr) {
    throw new ApiError(404, 'Active QR Code not found');
  }

  const publicUrl = qrService.buildPublicQrUrl(qr.publicToken);
  const message = `Hello ${org.name},\n\nHere is your official QR Code link for customer complaints and feedback:\n${publicUrl}\n\nDisplay this link or print your poster from your dashboard.`;

  const notification = await dispatchNotification({
    organizationId: org._id,
    channel: NOTIFICATION_CHANNEL.WHATSAPP,
    recipient: org.whatsapp,
    recipientName: org.name,
    message,
  });

  res.status(200).json({
    success: true,
    message: 'QR Code link sent via WhatsApp',
    data: { notification },
  });
});

export const downloadQrPdf = asyncHandler(async (req, res) => {
  const orgId = req.params.id || req.organizationId;
  const org = await Organization.findById(orgId);
  const qr = await QRCode.findOne({ organizationId: orgId, status: { $ne: QR_STATUS.REVOKED } });

  if (!org || !qr) {
    throw new ApiError(404, 'Organization or active QR Code not found');
  }

  const host = req.get('x-forwarded-host') || req.get('host');
  const proto = req.get('x-forwarded-proto') || (req.secure ? 'https' : 'http');
  const dynamicOrigin = host ? `${proto}://${host}` : null;

  const pdfBuffer = await qrService.generateQrPdfBuffer(org, qr, dynamicOrigin);

  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader(
    'Content-Disposition',
    `attachment; filename="QR-${org.name.replace(/\s+/g, '_')}.pdf"`
  );
  res.send(pdfBuffer);
});
