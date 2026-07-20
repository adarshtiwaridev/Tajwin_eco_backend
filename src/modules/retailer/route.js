import { Router } from 'express';
import * as RetailerController from './controller.js';
import { authenticate, verifyActiveAccount } from '#middlewares/authMiddleware.js';
import { authorizeRoles, verifyVerifiedRetailer } from '#middlewares/permissionMiddleware.js';
import { validateRequest } from '#middlewares/validate.js';
import {
  updateRetailerProfileValidator,
  registerCustomerValidator,
  updateCustomerValidator
} from './validator.js';

const router = Router();

// Ensure user is authenticated, active, and is a RETAILER
router.use(authenticate, verifyActiveAccount, authorizeRoles('RETAILER'));

// Retailer Profile Management
router.get('/profile', verifyVerifiedRetailer, RetailerController.getMyProfile);
router.put('/profile', updateRetailerProfileValidator, validateRequest, RetailerController.updateMyProfile);

// Customer (End User) Onboarding & Management (Requires verified retailer status)
router.use(verifyVerifiedRetailer);

router.post('/customers', registerCustomerValidator, validateRequest, RetailerController.registerCustomer);
router.get('/customers', RetailerController.getCustomerList);
router.get('/customers/search', RetailerController.searchCustomers);
router.get('/customers/:id', RetailerController.getCustomerDetails);
router.put('/customers/:id', updateCustomerValidator, validateRequest, RetailerController.updateCustomer);

router.get('/dashboard/summary', RetailerController.getDashboardSummary);

export default router;
