import { v2 as cloudinary } from 'cloudinary';
import { ENV } from '../config/env.js';

// Configure Cloudinary if credentials or URL are provided
const isConfigured = Boolean(
  process.env.CLOUDINARY_URL ||
  (ENV.CLOUDINARY_CLOUD_NAME && ENV.CLOUDINARY_API_KEY && ENV.CLOUDINARY_API_SECRET)
);

if (process.env.CLOUDINARY_URL) {
  cloudinary.config({
    secure: true,
  });
} else if (isConfigured) {
  cloudinary.config({
    cloud_name: ENV.CLOUDINARY_CLOUD_NAME,
    api_key: ENV.CLOUDINARY_API_KEY,
    api_secret: ENV.CLOUDINARY_API_SECRET,
    secure: true,
  });
}

/**
 * Uploads an image buffer to Cloudinary or falls back to Base64 Data URI
 * @param {Buffer} buffer - File buffer from multer memoryStorage
 * @param {string} mimetype - MIME type (e.g. 'image/png')
 * @param {string} folder - Cloudinary folder path
 * @returns {Promise<string>} Image URL (Cloudinary HTTPS URL or Data URI fallback)
 */
export const uploadImageToCloud = async (buffer, mimetype = 'image/png', folder = 'compliance-qr/logos') => {
  if (!buffer) return '';

  // If Cloudinary is configured with credentials, upload to cloud
  if (isConfigured) {
    return new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder,
          resource_type: 'image',
          transformation: [{ quality: 'auto', fetch_format: 'auto' }],
        },
        (error, result) => {
          if (error) {
            console.error('[Cloudinary Upload Error]', error);
            // Fallback to Data URI if cloud fails
            const base64 = buffer.toString('base64');
            return resolve(`data:${mimetype};base64,${base64}`);
          }
          resolve(result.secure_url);
        }
      );
      uploadStream.end(buffer);
    });
  }

  // Graceful fallback for environments without Cloudinary credentials:
  // Converts file buffer directly to Base64 Data URI which works universally in all browsers and databases
  const base64 = buffer.toString('base64');
  return `data:${mimetype};base64,${base64}`;
};
