import { Router } from 'express';
import * as DelshipController from './controller.js';
import { authenticate, verifyActiveAccount } from '#middlewares/authMiddleware.js';
import { authorizeRoles, verifyApprovedDealer } from '#middlewares/permissionMiddleware.js';
import { validateRequest } from '#middlewares/validate.js';
import {
  updateDelshipProfileValidator,
  createRetailerValidator,
  updateRetailerStatusValidator,
  updateRetailerVerificationValidator
} from './validator.js';

const router = Router();

// Ensure user is authenticated, active, and is a DEALERSHIP
router.use(authenticate, verifyActiveAccount, authorizeRoles('DEALERSHIP'));

// Dealership Profile Management
router.get('/profile', verifyApprovedDealer, DelshipController.getMyProfile);
router.put('/profile', updateDelshipProfileValidator, validateRequest, DelshipController.updateMyProfile);

// Retailer Onboarding (Requires approved dealership status)
router.use(verifyApprovedDealer);

router.post('/retailers', createRetailerValidator, validateRequest, DelshipController.createRetailer);
router.get('/retailers', DelshipController.getRetailerList);
router.get('/retailers/:id', DelshipController.getRetailerDetails);
router.put('/retailers/:id', updateDelshipProfileValidator, validateRequest, DelshipController.updateRetailer); // Assuming similar fields for basic update

router.patch('/retailers/:id/status', updateRetailerStatusValidator, validateRequest, DelshipController.updateRetailerStatus);
router.patch('/retailers/:id/verify', updateRetailerVerificationValidator, validateRequest, DelshipController.verifyRetailer);
router.delete('/retailers/:id', DelshipController.deleteRetailer);

router.get('/dashboard/overview', DelshipController.getDashboardOverview);

export default router;
