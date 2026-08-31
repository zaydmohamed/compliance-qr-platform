import crypto from 'crypto';

/**
 * Generate human-readable unique reference numbers for Complaints and Feedback.
 * Examples:
 * CAB-20260827-A8B2
 * TAL-20260827-X4K9
 */
export const generateReferenceNumber = (type = 'COMPLAINT') => {
  const prefix = type === 'COMPLAINT' ? 'CAB' : 'TAL';
  const now = new Date();
  const dateStr = now.toISOString().slice(0, 10).replace(/-/g, '');
  const randomSuffix = crypto.randomBytes(2).toString('hex').toUpperCase();
  return `${prefix}-${dateStr}-${randomSuffix}`;
};
