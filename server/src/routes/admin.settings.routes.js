import { Router } from 'express';
import * as settingsController from '../controllers/admin.settings.controller.js';
import { authenticate } from '../middleware/auth.js';
import { authorize } from '../middleware/authorize.js';
import { ROLES } from '../constants/roles.js';

import { uploadLogo } from '../middleware/upload.js';

const router = Router();

router.use(authenticate, authorize(ROLES.PLATFORM_ADMIN));

router.get('/', settingsController.getSettings);
router.patch('/', uploadLogo.single('logo'), settingsController.updateSettings);

export default router;
