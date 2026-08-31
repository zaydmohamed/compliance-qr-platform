import QRCodeLib from 'qrcode';
import PDFDocument from 'pdfkit';
import { QRCode } from '../models/QRCode.js';
import { Organization } from '../models/Organization.js';
import { generateSecureToken } from '../utils/tokenGenerator.js';
import { QR_STATUS } from '../constants/statuses.js';
import { ENV } from '../config/env.js';
import { ApiError } from '../utils/ApiError.js';
import { logAudit } from './audit.service.js';

/**
 * Generate public URL from token
 */
export const buildPublicQrUrl = (token, dynamicOrigin = null) => {
  const baseUrl = dynamicOrigin || ENV.PUBLIC_APP_URL || ENV.FRONTEND_URL || 'https://compliance-qr-platform.vercel.app';
  return `${baseUrl.replace(/\/+$/, '')}/c/${token}`;
};

/**
 * Create a new QR code linked to an organization.
 */
export const createQrForOrganization = async (organizationId, adminUser = null) => {
  const token = generateSecureToken(16);
  const qr = await QRCode.create({
    organizationId,
    publicToken: token,
    status: QR_STATUS.ACTIVE,
    generatedAt: new Date(),
  });

  await Organization.findByIdAndUpdate(organizationId, {
    activeQrId: qr._id,
  });

  if (adminUser) {
    await logAudit({
      actorId: adminUser._id,
      actorName: adminUser.fullName,
      actorRole: adminUser.role,
      action: 'QR_CREATED',
      resourceType: 'QRCode',
      resourceId: qr._id,
      metadata: { organizationId, publicToken: token },
    });
  }

  return qr;
};

/**
 * Regenerate QR code (Admin only). Revokes existing and creates new token.
 */
export const regenerateQrCode = async (organizationId, adminUser) => {
  // Revoke old QRs
  await QRCode.updateMany({ organizationId }, { status: QR_STATUS.REVOKED });

  const newToken = generateSecureToken(16);
  const newQr = await QRCode.create({
    organizationId,
    publicToken: newToken,
    status: QR_STATUS.ACTIVE,
    generatedAt: new Date(),
    regeneratedAt: new Date(),
  });

  await Organization.findByIdAndUpdate(organizationId, {
    activeQrId: newQr._id,
  });

  await logAudit({
    actorId: adminUser._id,
    actorName: adminUser.fullName,
    actorRole: adminUser.role,
    action: 'QR_REGENERATED',
    resourceType: 'QRCode',
    resourceId: newQr._id,
    metadata: { organizationId, newToken },
  });

  return newQr;
};

/**
 * Activate/Deactivate QR code (Admin only).
 */
export const setQrStatus = async (organizationId, status, adminUser) => {
  const qr = await QRCode.findOne({ organizationId, status: { $ne: QR_STATUS.REVOKED } });
  if (!qr) {
    throw new ApiError(404, 'Active QR code not found for this organization');
  }

  qr.status = status;
  await qr.save();

  await logAudit({
    actorId: adminUser._id,
    actorName: adminUser.fullName,
    actorRole: adminUser.role,
    action: status === QR_STATUS.ACTIVE ? 'QR_ACTIVATED' : 'QR_DEACTIVATED',
    resourceType: 'QRCode',
    resourceId: qr._id,
    metadata: { organizationId, status },
  });

  return qr;
};

/**
 * Generate QR code Data URL (PNG base64).
 */
export const generateQrDataUrl = async (token, dynamicOrigin = null) => {
  const url = buildPublicQrUrl(token, dynamicOrigin);
  return QRCodeLib.toDataURL(url, {
    errorCorrectionLevel: 'H',
    margin: 2,
    width: 400,
    color: {
      dark: '#2C3925', // Brand primary dark green
      light: '#FFFFFF',
    },
  });
};

/**
 * Generate Printable PDF for organization QR display.
 */
export const generateQrPdfBuffer = async (organization, qrCode, dynamicOrigin = null) => {
  return new Promise(async (resolve, reject) => {
    try {
      const doc = new PDFDocument({
        size: 'A4',
        margin: 40,
      });

      const buffers = [];
      doc.on('data', (chunk) => buffers.push(chunk));
      doc.on('end', () => resolve(Buffer.concat(buffers)));

      const publicUrl = buildPublicQrUrl(qrCode.publicToken, dynamicOrigin);
      const qrBuffer = await QRCodeLib.toBuffer(publicUrl, {
        errorCorrectionLevel: 'H',
        margin: 1,
        width: 300,
        color: {
          dark: '#2C3925',
          light: '#FFFFFF',
        },
      });

      // Background decorative banner
      doc.rect(0, 0, doc.page.width, 140).fill('#2C3925');

      // Title & Org Name
      doc.fillColor('#FFFFFF')
        .fontSize(24)
        .font('Helvetica-Bold')
        .text(organization.displayTitle || organization.name, 40, 45, { align: 'center' });

      if (organization.branch) {
        doc.fontSize(13)
          .font('Helvetica')
          .fillColor('#E6F3FF')
          .text(organization.branch, { align: 'center' });
      }

      doc.moveDown(4);

      // Card Container
      const cardY = 170;
      doc.roundedRect(60, cardY, doc.page.width - 120, 560, 16)
        .lineWidth(2)
        .strokeColor('#0086FF')
        .fillAndStroke('#FFFFFF', '#0086FF');

      // Header inside card
      doc.fillColor('#2F2E2D')
        .fontSize(18)
        .font('Helvetica-Bold')
        .text('NALA WADAAG CABASHO AMA TALO', 80, cardY + 30, { align: 'center' });

      doc.fillColor('#5A5856')
        .fontSize(11)
        .font('Helvetica')
        .text('Scan the QR code below to submit your complaint or suggestion directly.', { align: 'center' });

      // Embed QR Code
      const qrY = cardY + 90;
      doc.image(qrBuffer, (doc.page.width - 240) / 2, qrY, { width: 240 });

      // Scan Instructions
      doc.fillColor('#0086FF')
        .fontSize(13)
        .font('Helvetica-Bold')
        .text('TALO & CABASHO', 80, qrY + 255, { align: 'center' });

      doc.fillColor('#2F2E2D')
        .fontSize(10)
        .font('Helvetica')
        .text('1. Open your camera or QR Scanner\n2. Scan this code\n3. Share your feedback instantly', { align: 'center' });

      // Contact details
      doc.moveDown(1.5);
      const contactText = [];
      if (organization.phone) contactText.push(`Phone: ${organization.phone}`);
      if (organization.whatsapp) contactText.push(`WhatsApp: ${organization.whatsapp}`);
      if (organization.address) contactText.push(`Address: ${organization.address}`);

      if (contactText.length > 0) {
        doc.fontSize(9)
          .fillColor('#5A5856')
          .text(contactText.join('  |  '), { align: 'center' });
      }

      // Footer
      doc.fontSize(8)
        .fillColor('#8C8986')
        .text('Powered by Compliance QR Code Platform', 40, doc.page.height - 30, { align: 'center' });

      doc.end();
    } catch (err) {
      reject(err);
    }
  });
};
