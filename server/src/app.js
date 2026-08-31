import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

import { ENV } from './config/env.js';
import { connectDB } from './config/db.js';
import { errorHandler } from './middleware/errorHandler.js';
import { startSubscriptionCronJob } from './jobs/subscriptionChecker.js';

// Route imports
import authRoutes from './routes/auth.routes.js';
import adminOrgRoutes from './routes/admin.organizations.routes.js';
import adminUserRoutes from './routes/admin.users.routes.js';
import adminSubmissionRoutes from './routes/admin.submissions.routes.js';
import adminRenewalRoutes from './routes/admin.renewals.routes.js';
import adminPaymentRoutes from './routes/admin.payments.routes.js';
import adminReportRoutes from './routes/admin.reports.routes.js';
import adminNotificationRoutes from './routes/admin.notifications.routes.js';
import adminAuditRoutes from './routes/admin.audit.routes.js';
import adminSettingsRoutes from './routes/admin.settings.routes.js';
import adminSuperadminRoutes from './routes/admin.superadmin.routes.js';
import orgRoutes from './routes/org.routes.js';
import publicRoutes from './routes/public.routes.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// Security & Parsing Middleware
app.use(
  helmet({
    crossOriginResourcePolicy: { policy: 'cross-origin' },
  })
);

app.use(
  cors({
    origin: [ENV.FRONTEND_URL, 'http://localhost:5173', 'http://127.0.0.1:5173'],
    credentials: true,
  })
);

app.use(cookieParser());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Static file serving for uploads
app.use('/uploads', express.static(path.resolve('uploads')));

// Health check
app.get('/api/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Compliance QR Platform API is operational',
    timestamp: new Date().toISOString(),
  });
});

// API Routes Mounting
app.use('/api/auth', authRoutes);
app.use('/api/admin/organizations', adminOrgRoutes);
app.use('/api/admin/organization-users', adminUserRoutes);
app.use('/api/admin/submissions', adminSubmissionRoutes);
app.use('/api/admin/renewal-requests', adminRenewalRoutes);
app.use('/api/admin/payments', adminPaymentRoutes);
app.use('/api/admin/reports', adminReportRoutes);
app.use('/api/admin/notifications', adminNotificationRoutes);
app.use('/api/admin/audit-logs', adminAuditRoutes);
app.use('/api/admin/settings', adminSettingsRoutes);
app.use('/api/admin/superadmins', adminSuperadminRoutes);
app.use('/api/organization', orgRoutes);
app.use('/api/public', publicRoutes);

// Centralized Error Handling
app.use(errorHandler);

// Serve frontend static files in Docker/Koyeb/Railway production
const clientDistPath = path.resolve(__dirname, '../../client/dist');
if (fs.existsSync(clientDistPath)) {
  app.use(express.static(clientDistPath));
  // SPA fallback: serve index.html for any non-API route
  app.get('*', (req, res) => {
    if (!req.path.startsWith('/api') && !req.path.startsWith('/uploads')) {
      res.sendFile(path.join(clientDistPath, 'index.html'));
    }
  });
  console.log('[Server] Serving frontend from client/dist');
}

// Server startup (only when running locally, not on Vercel serverless)
const startServer = async () => {
  await connectDB();
  startSubscriptionCronJob();

  const PORT = ENV.PORT || 5000;
  app.listen(PORT, () => {
    console.log(`[Server] Compliance QR API running on http://localhost:${PORT}`);
    console.log(`[Server] Environment: ${ENV.NODE_ENV}`);
  });
};

// Start server on Railway/Docker and local development (NOT on Vercel serverless)
// On Vercel, the app is exported below for serverless function
if (process.env.NODE_ENV !== 'test') {
  if (!process.env.VERCEL) {
    // Railway, Docker, and local development
    startServer().catch(err => {
      console.error('[Server] Failed to start:', err.message);
      process.exit(1);
    });
  }
}

export default app;
