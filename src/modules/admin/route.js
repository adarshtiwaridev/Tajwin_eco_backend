import { Router } from 'express';
import productRoutes from './product/routes/product.routes.js';
import * as AdminController from './controller.js';
import { authenticate } from '#middlewares/authMiddleware.js';
import { authorizeRoles } from '#middlewares/permissionMiddleware.js';
import { validateRequest } from '#middlewares/validate.js';
import {
  createDealershipValidator,
  updateDealershipStatusValidator,
  verifyDocumentsValidator
} from './validator.js';

const router = Router();

// Only ADMIN role can access these routes
router.use(authenticate, authorizeRoles('ADMIN'));

// Dealership Onboarding & Management
router.post('/dealerships', createDealershipValidator, validateRequest, AdminController.createDealership);
router.get('/dealerships', AdminController.getDealershipList);
router.get('/dealerships/search', AdminController.searchDealerships);
router.get('/dealerships/:id', AdminController.getDealershipDetails);

// Status and Verification
router.patch('/dealerships/:id/status', updateDealershipStatusValidator, validateRequest, AdminController.updateDealershipStatus);
router.patch('/dealerships/:id/verify-document', verifyDocumentsValidator, validateRequest, AdminController.verifyDocument);

// Products Module
router.use('/products', productRoutes);

// Dashboard
router.get('/dashboard/statistics', AdminController.getDashboardStatistics);

export default router;
