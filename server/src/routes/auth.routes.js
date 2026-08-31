import { Router } from 'express';
import * as authController from '../controllers/auth.controller.js';
import { authenticate } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { authRateLimiter } from '../middleware/rateLimiter.js';
import {
  loginSchema,
  changePasswordSchema,
  updateUsernameSchema,
  forgotPasswordSchema,
} from '../validators/auth.validator.js';

const router = Router();

router.post('/login', authRateLimiter, validate(loginSchema), authController.login);
router.post('/forgot-password', authRateLimiter, validate(forgotPasswordSchema), authController.forgotPassword);
router.post('/logout', authController.logout);
router.get('/me', authenticate, authController.getMe);
router.post('/change-password', authenticate, validate(changePasswordSchema), authController.changePassword);
router.patch('/username', authenticate, validate(updateUsernameSchema), authController.updateUsername);

export default router;
