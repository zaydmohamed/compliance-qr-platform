import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';

// Look for .env in current directory or in server directory
if (fs.existsSync(path.resolve('server/.env'))) {
  dotenv.config({ path: path.resolve('server/.env') });
} else if (fs.existsSync(path.resolve('.env'))) {
  dotenv.config({ path: path.resolve('.env') });
} else {
  dotenv.config();
}

export const ENV = {
  NODE_ENV: process.env.NODE_ENV || 'production',
  PORT: parseInt(process.env.PORT || '5000', 10),
  MONGODB_URI: process.env.MONGODB_URI || 'mongodb+srv://muzamilrooble_db_user:NRggF8guR8tYi4yn@cluster0.ljbhaun.mongodb.net/compliance-qr?retryWrites=true&w=majority&appName=Cluster0',
  JWT_SECRET: process.env.JWT_SECRET || 'compliance_qr_super_secret_jwt_key_2026_x89f7a2',
  JWT_REFRESH_SECRET: process.env.JWT_REFRESH_SECRET || 'compliance_qr_refresh_super_secret_jwt_key_2026',
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || '1d',
  FRONTEND_URL: process.env.FRONTEND_URL || 'https://compliance-qr-platform.vercel.app',
  PUBLIC_APP_URL: process.env.PUBLIC_APP_URL || process.env.FRONTEND_URL || 'https://compliance-qr-platform.vercel.app',
  SMS_PROVIDER: process.env.SMS_PROVIDER || 'TABAARAK',
  TABAARAK_SMS_NAME: process.env.TABAARAK_SMS_NAME || 'Bile',
  TABAARAK_SMS_PASSWORD: process.env.TABAARAK_SMS_PASSWORD || 'Bile2026@!',
  TABAARAK_SMS_BASE_URL: process.env.TABAARAK_SMS_BASE_URL || 'https://sms.tabaarak.com',
  SMS_API_KEY: process.env.SMS_API_KEY || '',
  SMS_API_SECRET: process.env.SMS_API_SECRET || '',
  SMS_SENDER_ID: process.env.SMS_SENDER_ID || 'COMPLIANCE',
  WHATSAPP_PROVIDER: process.env.WHATSAPP_PROVIDER || 'STUB',
  WHATSAPP_API_KEY: process.env.WHATSAPP_API_KEY || '',
  WHATSAPP_PHONE_NUMBER_ID: process.env.WHATSAPP_PHONE_NUMBER_ID || '',
  APP_TIMEZONE: process.env.APP_TIMEZONE || 'Africa/Mogadishu',
  ADMIN_USERNAME: process.env.ADMIN_USERNAME || 'admin',
  ADMIN_PASSWORD: process.env.ADMIN_PASSWORD || 'Admin@123456',
  ADMIN_FULLNAME: process.env.ADMIN_FULLNAME || 'Platform Admin',
  GEMINI_API_KEY: process.env.GEMINI_API_KEY || '',
  CLOUDINARY_CLOUD_NAME: process.env.CLOUDINARY_CLOUD_NAME || 'v9egcndw',
  CLOUDINARY_API_KEY: process.env.CLOUDINARY_API_KEY || '892956312788338',
  CLOUDINARY_API_SECRET: process.env.CLOUDINARY_API_SECRET || 'kSCuf9hUyr52HkEjoEnQuQH5nIg',
  CLOUDINARY_URL: process.env.CLOUDINARY_URL || 'cloudinary://892956312788338:kSCuf9hUyr52HkEjoEnQuQH5nIg@v9egcndw',
};
