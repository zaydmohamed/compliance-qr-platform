import { Router } from 'express';
import * as orgController from '../controllers/org.controller.js';
import * as qrController from '../controllers/admin.qr.controller.js';
import { authenticate } from '../middleware/auth.js';
import { authorize } from '../middleware/authorize.js';
import { enforceOrgIsolation } from '../middleware/orgIsolation.js';
import { ROLES } from '../constants/roles.js';
import { validate } from '../middleware/validate.js';
import { updateSubmissionStatusSchema } from '../validators/submission.validator.js';
import { createRenewalRequestSchema } from '../validators/renewal.validator.js';

const router = Router();

// Protect and isolate all organization user routes
router.use(authenticate, authorize(ROLES.ORGANIZATION_USER), enforceOrgIsolation);

import { updateOrganizationSchema } from '../validators/organization.validator.js';

router.get('/overview', orgController.getOverview);
router.patch('/profile', validate(updateOrganizationSchema), orgController.updateProfile);
router.get('/submissions', orgController.getSubmissions);
router.get('/submissions/:id', orgController.getSubmissionById);
router.patch('/submissions/:id/status', validate(updateSubmissionStatusSchema), orgController.updateSubmissionStatus);

// QR routes for organization (view & download only)
router.get('/qr', orgController.getQrCode);
router.get('/qr/download', qrController.downloadQrPdf);

// Renewal requests
router.post('/renewal-requests', validate(createRenewalRequestSchema), orgController.requestRenewal);
router.get('/renewal-requests', orgController.getRenewalHistory);

// CSV Export
router.get('/export/csv', orgController.exportCsv);

// Notifications history
router.get('/notifications', orgController.getOrganizationNotifications);

// Organization AI Chatbot Copilot
router.post('/chatbot', orgController.handleOrgChatbot);

export default router;
