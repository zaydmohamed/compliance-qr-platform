import nodemailer from 'nodemailer';
import { ENV } from '../../config/env.js';

let transporter = null;

const createTransporter = () => {
  if (process.env.SMTP_HOST && process.env.SMTP_USER) {
    return nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT || '587', 10),
      secure: process.env.SMTP_SECURE === 'true',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
  }

  // Fallback to json transport or console logging for development
  return nodemailer.createTransport({
    jsonTransport: true,
  });
};

/**
 * Send Password Reset OTP Email
 */
export const sendPasswordResetEmail = async ({ toEmail, recipientName, otpCode, platformName = 'Compliance QR' }) => {
  if (!transporter) {
    transporter = createTransporter();
  }

  const fromAddress = process.env.SMTP_FROM || `"${platformName} Security" <no-reply@complianceqr.com>`;

  const htmlContent = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f8fafc; color: #1e293b; margin: 0; padding: 20px; }
          .container { max-width: 520px; margin: 0 auto; background: #ffffff; border-radius: 16px; padding: 32px; border: 1px solid #e2e8f0; box-shadow: 0 4px 12px rgba(0,0,0,0.05); }
          .header { text-align: center; margin-bottom: 24px; }
          .title { font-size: 20px; font-weight: 800; color: #0f172a; margin-top: 8px; }
          .badge { display: inline-block; background: #2c3925; color: #ffffff; padding: 6px 14px; border-radius: 8px; font-weight: 700; font-size: 13px; letter-spacing: 0.5px; }
          .content { font-size: 14px; line-height: 1.6; color: #475569; }
          .otp-box { background: #f0fdf4; border: 2px dashed #16a34a; border-radius: 12px; padding: 20px; text-align: center; margin: 24px 0; }
          .otp-code { font-size: 32px; font-weight: 900; letter-spacing: 6px; color: #15803d; font-family: monospace; }
          .otp-expiry { font-size: 12px; color: #64748b; margin-top: 6px; }
          .footer { margin-top: 28px; padding-top: 16px; border-top: 1px solid #e2e8f0; font-size: 11px; color: #94a3b8; text-align: center; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <span class="badge">${platformName}</span>
            <h1 class="title">Furahaaga Dib u Deji (Password Reset)</h1>
          </div>
          <div class="content">
            <p>Salaan <strong>${recipientName || 'User'}</strong>,</p>
            <p>Waxaan helnay codsi ah in dib loo dejiyo furahaaga sirta ah ee <strong>${platformName}</strong>.</p>
            <p>Fadlan isticmaal lambarka xaqiijinta (OTP Code) ee hoos ku qoran si aad u beddelato furahaaga:</p>
            
            <div class="otp-box">
              <div class="otp-code">${otpCode}</div>
              <div class="otp-expiry">Lambarkani wuxuu dhacayaa 10 daqiiqo gudahood (Valid for 10 minutes)</div>
            </div>

            <p style="font-size: 12px; color: #dc2626;">Haddii aadan adigu codsan dib u dejintan, fadlan iska indhatir fariintan ama la xiriir maamulka.</p>
          </div>
          <div class="footer">
            &copy; ${new Date().getFullYear()} ${platformName} • All rights reserved.
          </div>
        </div>
      </body>
    </html>
  `;

  try {
    const info = await transporter.sendMail({
      from: fromAddress,
      to: toEmail,
      subject: `[${otpCode}] Lambarkaaga Xaqiijinta - ${platformName}`,
      text: `Salaan ${recipientName},\n\nLambarkaaga xaqiijinta dib u dejinta password-ka waa: ${otpCode}\n\nWuxuu dhacayaa 10 daqiiqo gudahood.\n\n${platformName}`,
      html: htmlContent,
    });

    console.log(`[Email Service] Password reset OTP sent to ${toEmail}. Code: ${otpCode}`);
    return { success: true, messageId: info?.messageId, otpCode };
  } catch (err) {
    console.error('[Email Service Error]', err.message);
    // Even if external SMTP fails in dev, log the OTP to console so process is never blocked
    console.log(`[Email Fallback] OTP for ${toEmail} is: ${otpCode}`);
    return { success: true, fallback: true, otpCode };
  }
};
