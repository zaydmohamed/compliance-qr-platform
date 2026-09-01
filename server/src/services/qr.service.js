import QRCodeLib from 'qrcode';
import PDFDocument from 'pdfkit';
import { QRCode } from '../models/QRCode.js';
import { Organization } from '../models/Organization.js';
import { generateSecureToken } from '../utils/tokenGenerator.js';
import { QR_STATUS } from '../constants/statuses.js';
import { ENV } from '../config/env.js';
import { ApiError } from '../utils/ApiError.js';
import { logAudit } from './audit.service.js';

import { PlatformSettings } from '../models/PlatformSettings.js';

const isPrivateHost = (urlStr) => {
  if (!urlStr) return true;
  return (
    urlStr.includes('localhost') ||
    urlStr.includes('127.0.0.1') ||
    urlStr.includes('192.168.') ||
    urlStr.includes('10.') ||
    urlStr.includes('172.16.') ||
    urlStr.includes('172.17.') ||
    urlStr.includes('172.18.') ||
    urlStr.includes('172.19.') ||
    urlStr.includes('172.20.') ||
    urlStr.includes('172.21.') ||
    urlStr.includes('172.22.') ||
    urlStr.includes('172.23.') ||
    urlStr.includes('172.24.') ||
    urlStr.includes('172.25.') ||
    urlStr.includes('172.26.') ||
    urlStr.includes('172.27.') ||
    urlStr.includes('172.28.') ||
    urlStr.includes('172.29.') ||
    urlStr.includes('172.30.') ||
    urlStr.includes('172.31.')
  );
};

/**
 * Generate public URL from token
 */
export const buildPublicQrUrl = (token, dynamicOrigin = null) => {
  let baseUrl = null;

  // 1. If dynamicOrigin is a public web host or tunnel (e.g. *.vercel.app, *.trycloudflare.com, *.ngrok*), use it
  if (dynamicOrigin && !isPrivateHost(dynamicOrigin)) {
    baseUrl = dynamicOrigin;
  }
  // 2. Otherwise check ENV.PUBLIC_APP_URL if it is not a private LAN IP
  else if (ENV.PUBLIC_APP_URL && !isPrivateHost(ENV.PUBLIC_APP_URL)) {
    baseUrl = ENV.PUBLIC_APP_URL;
  }
  // 3. Otherwise check ENV.FRONTEND_URL if not private
  else if (ENV.FRONTEND_URL && !isPrivateHost(ENV.FRONTEND_URL)) {
    baseUrl = ENV.FRONTEND_URL;
  }
  // 4. Default to live production URL
  else {
    baseUrl = 'https://compliance-qr-platform.vercel.app';
  }

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

      let logoBuffer = null;
      if (organization.logo) {
        try {
          const res = await fetch(organization.logo);
          if (res.ok) {
            const arrBuffer = await res.arrayBuffer();
            logoBuffer = Buffer.from(arrBuffer);
          }
        } catch (e) {
          console.warn('[PDF] Failed to fetch organization logo buffer:', e.message);
        }
      }

      // Background decorative top banner
      const bannerHeight = 150;
      doc.rect(0, 0, doc.page.width, bannerHeight).fill('#2C3925');

      let currentY = 18;

      // 1. Logo at the very top (if available)
      if (logoBuffer) {
        try {
          doc.image(logoBuffer, (doc.page.width - 60) / 2, currentY, { fit: [60, 42], align: 'center' });
          currentY += 46;
        } catch (e) {
          currentY += 10;
        }
      } else {
        currentY += 15;
      }

      // 2. Organization Name
      doc.fillColor('#FFFFFF')
        .fontSize(22)
        .font('Helvetica-Bold')
        .text(organization.displayTitle || organization.name, 40, currentY, { align: 'center' });

      currentY += 25;

      // 3. Location / Branch / Address
      const locationText = [organization.branch, organization.address].filter(Boolean).join('  •  ');
      if (locationText) {
        doc.fontSize(11)
          .font('Helvetica')
          .fillColor('#E6F3FF')
          .text(locationText, 40, currentY, { align: 'center' });
      }

      // Card Container
      const cardY = 175;
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
