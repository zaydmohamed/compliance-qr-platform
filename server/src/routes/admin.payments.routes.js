import { Router } from 'express';
import * as paymentController from '../controllers/admin.payment.controller.js';
import { authenticate } from '../middleware/auth.js';
import { authorize } from '../middleware/authorize.js';
import { ROLES } from '../constants/roles.js';
import { validate } from '../middleware/validate.js';
import { createPaymentSchema } from '../validators/payment.validator.js';

const router = Router();

router.use(authenticate, authorize(ROLES.PLATFORM_ADMIN));

router.post('/', validate(createPaymentSchema), paymentController.recordPayment);
router.get('/', paymentController.getPayments);
router.get('/:id', paymentController.getPaymentById);

export default router;
