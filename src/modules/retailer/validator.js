import { body, param } from 'express-validator';

export const updateRetailerProfileValidator = [
  body('storeName').optional().notEmpty().withMessage('Store name cannot be empty').trim(),
  body('ownerName').optional().notEmpty().trim(),
  body('phone').optional().notEmpty(),
  body('gstNumber').optional().trim().toUpperCase(),
  body('address.street').optional().trim(),
  body('address.city').optional().trim(),
  body('address.state').optional().trim(),
  body('address.zipCode').optional().trim(),
];

export const registerCustomerValidator = [
  body('name').notEmpty().withMessage('Name is required').trim(),
  body('email').isEmail().withMessage('Invalid email address').normalizeEmail(),
  body('mobile').notEmpty().withMessage('Mobile number is required').trim(),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters long'),
  body('address').notEmpty().withMessage('Address is required').trim(),
  body('city').notEmpty().withMessage('City is required').trim(),
  body('state').notEmpty().withMessage('State is required').trim(),
  body('pincode').notEmpty().withMessage('Pincode is required').trim(),
];

export const updateCustomerValidator = [
  param('id').isMongoId().withMessage('Invalid customer ID'),
  body('name').optional().notEmpty().trim(),
  body('mobile').optional().notEmpty().trim(),
  body('address').optional().trim(),
  body('city').optional().trim(),
  body('state').optional().trim(),
  body('pincode').optional().trim(),
  body('status').optional().isIn(['ACTIVE', 'SUSPENDED']),
];
