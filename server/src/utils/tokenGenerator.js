import crypto from 'crypto';

/**
 * Generate a cryptographically secure random token for QR code public URLs.
 * Never exposes raw MongoDB IDs.
 */
export const generateSecureToken = (bytes = 16) => {
  return crypto.randomBytes(bytes).toString('hex');
};

/**
 * Generate a secure temporary password with uppercase, lowercase, numbers, and symbols.
 */
export const generateTemporaryPassword = () => {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789!@#$%';
  let password = '';
  for (let i = 0; i < 10; i++) {
    password += chars.charAt(crypto.randomInt(0, chars.length));
  }
  return password;
};
