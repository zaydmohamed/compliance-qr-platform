/**
 * Phone Number Utilities for Somalia (Country Code 252)
 */

export const SOMALIA_COUNTRY_CODE = '252';

export const isValidSomaliPhone = (phone, allowEmpty = false) => {
  if (!phone || typeof phone !== 'string') {
    return allowEmpty;
  }
  const clean = phone.trim().replace(/\s+/g, '');
  if (!clean) return allowEmpty;

  if (/^\d{9}$/.test(clean)) {
    return true;
  }

  if (/^252\d{9}$/.test(clean)) {
    return true;
  }

  return false;
};

export const normalizeSomaliPhone = (phone) => {
  if (!phone || typeof phone !== 'string') return '';
  const clean = phone.trim().replace(/[^\d]/g, '');
  if (!clean) return '';

  if (clean.startsWith('252') && clean.length === 12) {
    return clean;
  }

  if (clean.length === 9) {
    return `252${clean}`;
  }

  return clean;
};

export const formatSomaliPhoneDisplay = (phone) => {
  const normalized = normalizeSomaliPhone(phone);
  if (normalized.length === 12 && normalized.startsWith('252')) {
    const local = normalized.slice(3);
    return `+252 ${local.slice(0, 2)} ${local.slice(2)}`;
  }
  return phone || '';
};
