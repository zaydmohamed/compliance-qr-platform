import { Router } from 'express';
import * as renewalController from '../controllers/admin.renewal.controller.js';
import { authenticate } from '../middleware/auth.js';
import { authorize } from '../middleware/authorize.js';
import { ROLES } from '../constants/roles.js';
import { validate } from '../middleware/validate.js';
import {
  approveRenewalSchema,
  rejectRenewalSchema,
} from '../validators/renewal.validator.js';

const router = Router();

router.use(authenticate, authorize(ROLES.PLATFORM_ADMIN));

router.get('/', renewalController.getRenewalRequests);
router.get('/:id', renewalController.getRenewalRequestById);
router.post('/:id/approve', validate(approveRenewalSchema), renewalController.approveRenewal);
router.post('/:id/reject', validate(rejectRenewalSchema), renewalController.rejectRenewal);

export default router;
