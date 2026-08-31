import { Router } from 'express';
import * as userController from '../controllers/admin.user.controller.js';
import { authenticate } from '../middleware/auth.js';
import { authorize } from '../middleware/authorize.js';
import { ROLES } from '../constants/roles.js';
import { validate } from '../middleware/validate.js';
import { updateOrgUserSchema } from '../validators/organizationUser.validator.js';

const router = Router();

router.use(authenticate, authorize(ROLES.PLATFORM_ADMIN));

router.patch('/:id', validate(updateOrgUserSchema), userController.updateOrganizationUser);
router.post('/:id/reset-password', userController.resetUserPassword);

export default router;
