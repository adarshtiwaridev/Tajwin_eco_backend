import { Router } from 'express';
import * as AuthController from './controller.js';
import { authenticate, validateRefreshToken, verifyActiveAccount } from '#middlewares/authMiddleware.js';
import { validateRequest } from '#middlewares/validate.js';
import {
  loginValidator,
  registerEndUserValidator,
  forgotPasswordValidator,
  resetPasswordValidator,
  changePasswordValidator,
  updateProfileValidator
} from './validator.js';

const router = Router();

// Public routes
router.post('/login', loginValidator, validateRequest, AuthController.login);
router.post('/forgot-password', forgotPasswordValidator, validateRequest, AuthController.forgotPassword);
router.post('/reset-password', resetPasswordValidator, validateRequest, AuthController.resetPassword);

// Token refresh
router.post('/refresh', validateRefreshToken, AuthController.refreshToken);

// Protected routes
router.use(authenticate, verifyActiveAccount); // Apply authentication & active check to all routes below

router.post('/logout', AuthController.logout);
router.get('/profile', AuthController.getProfile);
router.put('/profile', updateProfileValidator, validateRequest, AuthController.updateProfile);
router.post('/change-password', changePasswordValidator, validateRequest, AuthController.changePassword);

export default router;
