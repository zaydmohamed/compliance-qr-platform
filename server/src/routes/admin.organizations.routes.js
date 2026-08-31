import { Router } from 'express';
import * as orgController from '../controllers/admin.organization.controller.js';
import * as userController from '../controllers/admin.user.controller.js';
import * as qrController from '../controllers/admin.qr.controller.js';
import { authenticate } from '../middleware/auth.js';
import { authorize } from '../middleware/authorize.js';
import { ROLES } from '../constants/roles.js';
import { uploadLogo } from '../middleware/upload.js';
import { validate } from '../middleware/validate.js';
import {
  createOrganizationSchema,
  updateOrganizationSchema,
} from '../validators/organization.validator.js';
import { createOrgUserSchema } from '../validators/organizationUser.validator.js';

const router = Router();

// Protect all admin routes
router.use(authenticate, authorize(ROLES.PLATFORM_ADMIN));

router.post('/', uploadLogo.single('logo'), validate(createOrganizationSchema), orgController.createOrganization);
router.post('/complete-wizard', uploadLogo.single('logo'), orgController.createCompleteOrganization);
router.get('/', orgController.getOrganizations);
router.get('/:id', orgController.getOrganizationById);
router.patch('/:id', uploadLogo.single('logo'), validate(updateOrganizationSchema), orgController.updateOrganization);
router.patch('/:id/status', orgController.updateOrganizationStatus);
router.delete('/:id', orgController.deleteOrganization);

// Linked User creation under Org
router.post('/:id/user', validate(createOrgUserSchema), userController.createOrganizationUser);

// Linked QR endpoints under Org
router.post('/:id/qr', qrController.createQr);
router.get('/:id/qr', qrController.getOrgQr);
router.post('/:id/qr/regenerate', qrController.regenerateQr);
router.post('/:id/qr/activate', qrController.activateQr);
router.post('/:id/qr/deactivate', qrController.deactivateQr);
router.post('/:id/qr/send-whatsapp', qrController.sendQrWhatsApp);
router.get('/:id/qr/download', qrController.downloadQrPdf);

export default router;
