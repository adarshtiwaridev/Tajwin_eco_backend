import { body, param } from 'express-validator';
import { PRODUCT_STATUS, CONDITION_GRADE, STORAGE_TYPE, RAM_TYPE, STOCK_STATUS } from '../constants/product.constants.js';

export const validateCreateProduct = [
  body('name').trim().notEmpty().withMessage('Product name is required').isLength({ max: 200 }).withMessage('Name too long'),
  body('brand').trim().notEmpty().withMessage('Brand is required'),
  body('model').trim().notEmpty().withMessage('Model is required'),
  body('category').trim().notEmpty().withMessage('Category is required'),
  body('shortDescription').trim().notEmpty().withMessage('Short description is required').isLength({ max: 500 }).withMessage('Short description too long'),
  body('fullDescription').trim().notEmpty().withMessage('Full description is required'),
  
  body('processorBrand').trim().notEmpty().withMessage('Processor brand is required'),
  body('processorModel').trim().notEmpty().withMessage('Processor model is required'),
  body('ramSize').isNumeric().withMessage('RAM size must be a number').custom(val => val >= 1).withMessage('RAM size must be at least 1GB'),
  body('ramType').isIn(RAM_TYPE).withMessage('Invalid RAM type'),
  body('storageCapacity').isNumeric().withMessage('Storage capacity must be a number').custom(val => val >= 1).withMessage('Storage capacity must be at least 1GB'),
  body('storageType').isIn(STORAGE_TYPE).withMessage('Invalid Storage type'),
  body('screenSize').isNumeric().withMessage('Screen size must be a number'),
  body('resolution').trim().notEmpty().withMessage('Resolution is required'),
  body('graphics').trim().notEmpty().withMessage('Graphics is required'),
  body('operatingSystem').trim().notEmpty().withMessage('OS is required'),
  
  body('conditionGrade').isIn(Object.values(CONDITION_GRADE)).withMessage('Invalid condition grade'),
  body('warranty').trim().notEmpty().withMessage('Warranty is required'),
  
  body('originalPrice').isNumeric().withMessage('Original price must be a number').custom(val => val >= 0).withMessage('Price cannot be negative'),
  body('sellingPrice').isNumeric().withMessage('Selling price must be a number').custom(val => val >= 0).withMessage('Price cannot be negative'),
  body('stockQuantity').isNumeric().withMessage('Stock quantity must be a number').custom(val => val >= 0).withMessage('Stock cannot be negative'),
];

export const validateUpdateProduct = [
  param('id').isMongoId().withMessage('Invalid product ID'),
  body('name').optional().trim().notEmpty().withMessage('Product name cannot be empty').isLength({ max: 200 }),
  body('originalPrice').optional().isNumeric().custom(val => val >= 0),
  body('sellingPrice').optional().isNumeric().custom(val => val >= 0),
  body('stockQuantity').optional().isNumeric().custom(val => val >= 0),
];

export const validateChangeStatus = [
  param('id').isMongoId().withMessage('Invalid product ID'),
  body('status').isIn(Object.values(PRODUCT_STATUS)).withMessage('Invalid status'),
];

export const validateBulkDelete = [
  body('ids').isArray({ min: 1 }).withMessage('Provide an array of product IDs'),
  body('ids.*').isMongoId().withMessage('Invalid product ID in array'),
];

export const validateBulkUpdateStatus = [
  body('ids').isArray({ min: 1 }).withMessage('Provide an array of product IDs'),
  body('ids.*').isMongoId().withMessage('Invalid product ID in array'),
  body('status').isIn(Object.values(PRODUCT_STATUS)).withMessage('Invalid status'),
];

export const validateMongoId = [
  param('id').isMongoId().withMessage('Invalid product ID'),
];
