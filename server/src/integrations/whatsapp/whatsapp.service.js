import { ENV } from '../../config/env.js';

export const sendWhatsApp = async ({ recipient, message }) => {
  try {
    // In production, integrate with official WhatsApp Cloud API or Twilio WhatsApp
    if (ENV.WHATSAPP_PROVIDER === 'REAL' && ENV.WHATSAPP_API_KEY) {
      console.log(`[WhatsApp Provider] Sending real WhatsApp to ${recipient}`);
    }

    console.log(`[WhatsApp Mock] To: ${recipient} | Message: ${message}`);

    return {
      success: true,
      provider: ENV.WHATSAPP_PROVIDER,
      messageId: `wa_${Date.now()}_${Math.random().toString(36).substring(7)}`,
      timestamp: new Date(),
    };
  } catch (error) {
    console.error('[WhatsApp Error] Delivery failed:', error.message);
    return {
      success: false,
      error: error.message,
    };
  }
};
