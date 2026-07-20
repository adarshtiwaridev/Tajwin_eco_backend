import { Router } from 'express';
import * as ProductController from '../controller/product.controller.js';
import { uploadProductImages, upload } from '../middleware/upload.middleware.js';
import { validateMediaMiddleware } from '../middleware/validateMedia.middleware.js';
import { validateRequest } from '#middlewares/validate.js';
import {
  validateCreateProduct,
  validateUpdateProduct,
  validateChangeStatus,
  validateBulkDelete,
  validateBulkUpdateStatus,
  validateMongoId
} from '../validator/product.validator.js';

const router = Router();

// Dashboard APIs
router.get('/dashboard/stats', ProductController.getDashboardStats);

// Bulk Operations
router.post('/bulk-delete', validateBulkDelete, validateRequest, ProductController.bulkDelete);
router.post('/bulk-status', validateBulkUpdateStatus, validateRequest, ProductController.bulkUpdateStatus);

// Product CRUD
router.post(
  '/',
  uploadProductImages,
  validateMediaMiddleware,
  validateCreateProduct,
  validateRequest,
  ProductController.createProduct
);

router.get('/', ProductController.getAllProducts);

router.get(
  '/:id',
  validateMongoId,
  validateRequest,
  ProductController.getProductById
);

router.put(
  '/:id',
  uploadProductImages,
  validateMediaMiddleware,
  validateUpdateProduct,
  validateRequest,
  ProductController.updateProduct
);

router.delete(
  '/:id',
  validateMongoId,
  validateRequest,
  ProductController.deleteProduct
);

// Product specific actions
router.patch(
  '/:id/restore',
  validateMongoId,
  validateRequest,
  ProductController.restoreProduct
);

router.patch(
  '/:id/status',
  validateChangeStatus,
  validateRequest,
  ProductController.changeStatus
);

// Image management
router.post(
  '/:id/images',
  uploadProductImages,
  validateMediaMiddleware,
  validateMongoId,
  validateRequest,
  ProductController.uploadImages
);

router.delete(
  '/:id/images/:imageId',
  validateMongoId,
  validateRequest,
  ProductController.deleteImage
);

router.patch(
  '/:id/feature-image',
  validateMongoId,
  validateRequest,
  ProductController.featureImage
);

export default router;
