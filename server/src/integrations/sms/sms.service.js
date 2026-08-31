import { ENV } from '../../config/env.js';

/**
 * Normalizes Somali phone number to international format (252XXXXXXXXX)
 */
export const normalizePhone = (phone) => {
  if (!phone || typeof phone !== 'string') return '';
  let clean = phone.trim().replace(/[^\d]/g, '');
  if (!clean) return '';

  // If starts with 0 (e.g. 0615xxxxxx), remove leading 0
  if (clean.startsWith('0') && clean.length === 10) {
    clean = clean.slice(1);
  }

  // If 9 digits (e.g. 615xxxxxx), prepend 252
  if (clean.length === 9) {
    return `252${clean}`;
  }

  // If already 12 digits starting with 252 (e.g. 252615xxxxxx)
  if (clean.startsWith('252') && clean.length === 12) {
    return clean;
  }

  return clean;
};

/**
 * In-memory token cache to avoid re-authenticating on every SMS send.
 * Token is refreshed if expired or missing.
 */
let cachedToken = null;
let tokenExpiresAt = 0;

/**
 * Step 1: Authenticate with Tabaarak SMS Gateway and obtain a Bearer token.
 * Endpoint: POST https://sms.tabaarak.com/Auth/SMSLogin
 */
const authenticateTabaarak = async () => {
  // Return cached token if still valid (with 60s buffer)
  if (cachedToken && Date.now() < tokenExpiresAt - 60000) {
    return cachedToken;
  }

  const baseUrl = (ENV.TABAARAK_SMS_BASE_URL || 'https://sms.tabaarak.com').replace(/\/+$/, '');
  const loginEndpoint = `${baseUrl}/Auth/SMSLogin`;

  const loginPayload = {
    Name: ENV.TABAARAK_SMS_NAME || 'Bile',
    Password: ENV.TABAARAK_SMS_PASSWORD || 'Bile2026@!',
  };

  console.log(`[SMS Auth] Authenticating with Tabaarak Gateway...`);

  const response = await fetch(loginEndpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    },
    body: JSON.stringify(loginPayload),
    signal: AbortSignal.timeout(10000),
  });

  const responseText = await response.text();
  let parsed;
  try {
    parsed = JSON.parse(responseText);
  } catch {
    throw new Error(`[SMS Auth] Invalid JSON response from login: ${responseText.slice(0, 200)}`);
  }

  if (!response.ok || !parsed.success || !parsed.data?.token) {
    throw new Error(`[SMS Auth] Login failed (HTTP ${response.status}): ${parsed.message || responseText.slice(0, 200)}`);
  }

  cachedToken = parsed.data.token;
  // Cache token for 4 hours (Tabaarak tokens typically last longer, but we play safe)
  tokenExpiresAt = Date.now() + 4 * 60 * 60 * 1000;

  console.log(`[SMS Auth] Authenticated successfully. Account: ${parsed.data.name || parsed.data.fullName}, Balance: ${parsed.data.balance}`);

  return cachedToken;
};

/**
 * Step 2: Send SMS via Tabaarak SMS Gateway.
 * Endpoint: POST https://sms.tabaarak.com/Sms/sendsms
 * Requires Bearer token from authenticateTabaarak().
 */
export const sendSms = async ({ recipient, message, senderId }) => {
  const normalizedPhone = normalizePhone(recipient);

  if (!normalizedPhone) {
    console.warn(`[SMS Service] Warning: Invalid or empty recipient phone "${recipient}"`);
    return {
      success: false,
      error: 'Invalid recipient phone number',
    };
  }

  try {
    // Step 1: Get auth token
    const token = await authenticateTabaarak();

    // Step 2: Send SMS
    const baseUrl = (ENV.TABAARAK_SMS_BASE_URL || 'https://sms.tabaarak.com').replace(/\/+$/, '');
    const sendEndpoint = `${baseUrl}/Sms/sendsms`;

    // Tabaarak API expects mobile as array of strings (without country code prefix for Somali numbers)
    // The API doc shows format: "61xxxxxxx" — 9-digit local format
    // We'll send the full normalized number as well, the API should handle both
    const mobileNumber = normalizedPhone.startsWith('252') ? normalizedPhone.slice(3) : normalizedPhone;

    const smsPayload = {
      smsMessage: message,
      mobile: [mobileNumber],
    };

    console.log(`[SMS Service] Sending SMS to ${mobileNumber} via Tabaarak Gateway...`);

    const response = await fetch(sendEndpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(smsPayload),
      signal: AbortSignal.timeout(10000),
    });

    const responseText = await response.text();
    let parsed;
    try {
      parsed = JSON.parse(responseText);
    } catch {
      parsed = null;
    }

    if (response.ok && parsed?.success) {
      console.log(`[SMS Service] ✅ SMS sent successfully to ${mobileNumber}. Accepted: ${parsed.data?.acceptedForDelivery}, Total: ${parsed.data?.totalNumber}`);
      return {
        success: true,
        provider: 'TABAARAK',
        recipient: normalizedPhone,
        messageId: `tabaarak_${Date.now()}_${Math.random().toString(36).substring(7)}`,
        data: parsed.data,
        timestamp: new Date(),
      };
    }

    // Auth token may have expired — clear cache and let next call re-authenticate
    if (response.status === 401) {
      console.warn(`[SMS Service] Token expired or invalid. Clearing cache for retry.`);
      cachedToken = null;
      tokenExpiresAt = 0;
    }

    const errorDetail = parsed?.message || responseText?.slice(0, 200) || `HTTP ${response.status}`;
    console.warn(`[SMS Service] ❌ Gateway responded with status ${response.status}: ${errorDetail}`);

    return {
      success: false,
      provider: 'TABAARAK',
      recipient: normalizedPhone,
      error: errorDetail,
      timestamp: new Date(),
    };
  } catch (error) {
    // Clear token cache on auth errors
    if (error.message.includes('[SMS Auth]')) {
      cachedToken = null;
      tokenExpiresAt = 0;
    }

    console.error('[SMS Error] Delivery failed:', error.message);
    return {
      success: false,
      recipient: normalizedPhone,
      error: error.message,
    };
  }
};

/**
 * Check SMS balance from Tabaarak Gateway.
 * Endpoint: GET https://sms.tabaarak.com/sms/GetSmsBalance
 */
export const getSmsBalance = async () => {
  try {
    const token = await authenticateTabaarak();
    const baseUrl = (ENV.TABAARAK_SMS_BASE_URL || 'https://sms.tabaarak.com').replace(/\/+$/, '');

    const response = await fetch(`${baseUrl}/sms/GetSmsBalance`, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      signal: AbortSignal.timeout(10000),
    });

    const parsed = await response.json();
    if (parsed.success) {
      console.log(`[SMS Balance] Balance: ${parsed.data?.balance}, Account Type: ${parsed.data?.accountType}`);
      return parsed.data;
    }

    throw new Error(parsed.message || 'Failed to retrieve SMS balance');
  } catch (error) {
    console.error('[SMS Balance Error]', error.message);
    return null;
  }
};
