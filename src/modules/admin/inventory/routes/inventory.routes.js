import { Router } from 'express';
import * as InventoryController from '../controller/inventory.controller.js';
import { validateRequest } from '#middlewares/validate.js';
import {
  validateCreateInventory,
  validateUpdateInventory,
  validateStockQuantityAction,
  validateDirectStockUpdate,
  validateInventoryIdParam,
} from '../validator/inventory.validator.js';

const router = Router();

// Create Inventory
router.post(
  '/',
  validateCreateInventory,
  validateRequest,
  InventoryController.createInventory
);

// List All Inventory (with search, filter, pagination, sort)
router.get('/', InventoryController.getAllInventory);

// Specific Stock Status Filter Routes (Must be declared before /:inventoryId)
router.get('/low-stock', InventoryController.getLowStock);
router.get('/out-of-stock', InventoryController.getOutOfStock);

// Get Single Inventory Item by ID
router.get(
  '/:inventoryId',
  validateInventoryIdParam,
  validateRequest,
  InventoryController.getInventoryById
);

// Update Inventory Details
router.put(
  '/:inventoryId',
  validateUpdateInventory,
  validateRequest,
  InventoryController.updateInventory
);

// Delete Inventory Item
router.delete(
  '/:inventoryId',
  validateInventoryIdParam,
  validateRequest,
  InventoryController.deleteInventory
);

// Stock Management Routes
router.patch(
  '/:inventoryId/increase-stock',
  validateStockQuantityAction,
  validateRequest,
  InventoryController.increaseStock
);

router.patch(
  '/:inventoryId/decrease-stock',
  validateStockQuantityAction,
  validateRequest,
  InventoryController.decreaseStock
);

router.patch(
  '/:inventoryId/update-stock',
  validateDirectStockUpdate,
  validateRequest,
  InventoryController.updateStockDirectly
);

export default router;
