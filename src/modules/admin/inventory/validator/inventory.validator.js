import { body, param } from 'express-validator';

export const validateCreateInventory = [
  body('productName')
    .notEmpty().withMessage('Product Name is required')
    .isString().withMessage('Product Name must be a string')
    .trim(),
  body('brand')
    .notEmpty().withMessage('Brand is required')
    .isString().withMessage('Brand must be a string')
    .trim(),
  body('category')
    .notEmpty().withMessage('Category is required')
    .isString().withMessage('Category must be a string')
    .trim(),
  body('sku')
    .notEmpty().withMessage('SKU is required')
    .isString().withMessage('SKU must be a string')
    .trim(),
  body('model')
    .optional()
    .isString().withMessage('Model must be a string')
    .trim(),
  body('serialNumber')
    .optional({ nullable: true })
    .isString().withMessage('Serial Number must be a string')
    .trim(),
  body('totalStockQuantity')
    .optional()
    .isInt({ min: 0 }).withMessage('Total Stock Quantity must be a non-negative integer'),
  body('availableStock')
    .optional()
    .isInt({ min: 0 }).withMessage('Available Stock must be a non-negative integer'),
  body('remarks')
    .optional()
    .isString().withMessage('Remarks must be a string')
    .trim(),
];

export const validateUpdateInventory = [
  param('inventoryId')
    .isMongoId().withMessage('Invalid Inventory ID'),
  body('productName')
    .optional()
    .notEmpty().withMessage('Product Name cannot be empty')
    .isString().withMessage('Product Name must be a string')
    .trim(),
  body('brand')
    .optional()
    .notEmpty().withMessage('Brand cannot be empty')
    .isString().withMessage('Brand must be a string')
    .trim(),
  body('category')
    .optional()
    .notEmpty().withMessage('Category cannot be empty')
    .isString().withMessage('Category must be a string')
    .trim(),
  body('sku')
    .optional()
    .notEmpty().withMessage('SKU cannot be empty')
    .isString().withMessage('SKU must be a string')
    .trim(),
  body('model')
    .optional()
    .isString().withMessage('Model must be a string')
    .trim(),
  body('serialNumber')
    .optional({ nullable: true })
    .isString().withMessage('Serial Number must be a string')
    .trim(),
  body('totalStockQuantity')
    .optional()
    .isInt({ min: 0 }).withMessage('Total Stock Quantity must be a non-negative integer'),
  body('availableStock')
    .optional()
    .isInt({ min: 0 }).withMessage('Available Stock must be a non-negative integer'),
  body('remarks')
    .optional()
    .isString().withMessage('Remarks must be a string')
    .trim(),
];

export const validateStockQuantityAction = [
  param('inventoryId')
    .isMongoId().withMessage('Invalid Inventory ID'),
  body().custom((value, { req }) => {
    const qty = req.body.quantity !== undefined ? req.body.quantity : req.body.amount;
    if (qty === undefined || qty === null || isNaN(Number(qty)) || Number(qty) <= 0) {
      throw new Error('A valid positive stock quantity (or amount) is required');
    }
    return true;
  }),
];

export const validateDirectStockUpdate = [
  param('inventoryId')
    .isMongoId().withMessage('Invalid Inventory ID'),
  body('totalStockQuantity')
    .optional()
    .isInt({ min: 0 }).withMessage('Total Stock Quantity must be a non-negative integer'),
  body('availableStock')
    .optional()
    .isInt({ min: 0 }).withMessage('Available Stock must be a non-negative integer'),
  body().custom((value, { req }) => {
    if (req.body.totalStockQuantity === undefined && req.body.availableStock === undefined) {
      throw new Error('At least totalStockQuantity or availableStock must be provided');
    }
    return true;
  }),
];

export const validateInventoryIdParam = [
  param('inventoryId')
    .isMongoId().withMessage('Invalid Inventory ID'),
];
