import { Router } from 'express';
import * as notificationController from '../controllers/admin.notification.controller.js';
import { authenticate } from '../middleware/auth.js';
import { authorize } from '../middleware/authorize.js';
import { ROLES } from '../constants/roles.js';

const router = Router();

router.use(authenticate, authorize(ROLES.PLATFORM_ADMIN));

router.get('/', notificationController.getNotifications);
router.post('/:id/retry', notificationController.retryNotification);

export default router;
