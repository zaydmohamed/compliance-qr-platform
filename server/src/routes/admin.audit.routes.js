import { Router } from 'express';
import * as auditController from '../controllers/admin.audit.controller.js';
import { authenticate } from '../middleware/auth.js';
import { authorize } from '../middleware/authorize.js';
import { ROLES } from '../constants/roles.js';

const router = Router();

router.use(authenticate, authorize(ROLES.PLATFORM_ADMIN));

router.get('/', auditController.getAuditLogs);

export default router;
