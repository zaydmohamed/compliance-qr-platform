import { Router } from 'express';
import * as submissionController from '../controllers/admin.submission.controller.js';
import { authenticate } from '../middleware/auth.js';
import { authorize } from '../middleware/authorize.js';
import { ROLES } from '../constants/roles.js';
import { validate } from '../middleware/validate.js';
import {
  updateSubmissionStatusSchema,
  updateSubmissionPrioritySchema,
} from '../validators/submission.validator.js';

const router = Router();

router.use(authenticate, authorize(ROLES.PLATFORM_ADMIN));

router.get('/', submissionController.getSubmissions);
router.get('/:id', submissionController.getSubmissionById);
router.patch('/:id/status', validate(updateSubmissionStatusSchema), submissionController.updateSubmissionStatus);
router.patch('/:id/priority', validate(updateSubmissionPrioritySchema), submissionController.updateSubmissionPriority);

export default router;
