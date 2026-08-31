import { Router } from 'express';
import * as superadminController from '../controllers/admin.superadmin.controller.js';
import { authenticate } from '../middleware/auth.js';
import { authorize } from '../middleware/authorize.js';
import { ROLES } from '../constants/roles.js';

const router = Router();

// Protect all superadmin management routes
router.use(authenticate, authorize(ROLES.PLATFORM_ADMIN));

router.get('/', superadminController.getSuperadmins);
router.post('/', superadminController.createSuperadmin);
router.patch('/:id/status', superadminController.updateSuperadminStatus);
router.delete('/:id', superadminController.deleteSuperadmin);

export default router;
