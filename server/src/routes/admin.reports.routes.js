import { Router } from 'express';
import * as reportController from '../controllers/admin.report.controller.js';
import { authenticate } from '../middleware/auth.js';
import { authorize } from '../middleware/authorize.js';
import { ROLES } from '../constants/roles.js';

const router = Router();

router.use(authenticate, authorize(ROLES.PLATFORM_ADMIN));

router.get('/overview', reportController.getOverviewStats);
router.get('/analytics', reportController.getAnalytics);
router.get('/export/csv', reportController.exportSubmissionsCsv);

export default router;
