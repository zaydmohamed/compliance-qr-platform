import { Router } from 'express';
import * as publicController from '../controllers/public.controller.js';
import { getPublicSettings } from '../controllers/admin.settings.controller.js';
import { submissionRateLimiter } from '../middleware/rateLimiter.js';
import { validate } from '../middleware/validate.js';
import { publicSubmissionSchema } from '../validators/submission.validator.js';

const router = Router();

router.get('/settings', getPublicSettings);
router.get('/qr/:token', publicController.getPublicOrgByToken);
router.post(
  '/submissions',
  submissionRateLimiter,
  validate(publicSubmissionSchema),
  publicController.submitComplaintOrFeedback
);
router.post('/chatbot', publicController.handlePublicChatbot);

export default router;
