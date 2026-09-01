import app from '../server/src/app.js';
import { connectDB } from '../server/src/config/db.js';

// Pre-register all Mongoose models for Serverless population
import '../server/src/models/AdminUser.js';
import '../server/src/models/AuditLog.js';
import '../server/src/models/CustomerSubmission.js';
import '../server/src/models/Notification.js';
import '../server/src/models/Organization.js';
import '../server/src/models/OrganizationUser.js';
import '../server/src/models/PasswordReset.js';
import '../server/src/models/Payment.js';
import '../server/src/models/PlatformSettings.js';
import '../server/src/models/QRCode.js';
import '../server/src/models/RenewalRequest.js';
import '../server/src/models/Subscription.js';

const handler = async (req, res) => {
  try {
    await connectDB();
  } catch (err) {
    console.error('[Serverless DB Error]:', err.message);
    return res.status(500).json({
      success: false,
      message: 'Database connection failed. Please ensure MONGODB_URI is configured and IP whitelist includes 0.0.0.0/0.',
      error: err.message,
    });
  }

  // Ensure request URL works with Express router on Vercel
  if (req.url && !req.url.startsWith('/api')) {
    req.url = `/api${req.url.startsWith('/') ? '' : '/'}${req.url}`;
  }

  return app(req, res);
};

export default handler;
