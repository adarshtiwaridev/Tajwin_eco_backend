import { body, param } from 'express-validator';

export const updateDelshipProfileValidator = [
  body('businessName').optional().notEmpty().withMessage('Business name cannot be empty').trim(),
  body('gstNumber').optional().trim().toUpperCase(),
  body('panNumber').optional().trim().toUpperCase(),
  body('ownerName').optional().notEmpty().trim(),
  body('phone').optional().notEmpty(),
  body('address.street').optional().notEmpty(),
  body('address.city').optional().notEmpty(),
  body('address.state').optional().notEmpty(),
  body('address.zipCode').optional().notEmpty(),
];

export const createRetailerValidator = [
  body('storeName').notEmpty().withMessage('Store name is required').trim(),
  body('ownerName').notEmpty().withMessage('Owner name is required').trim(),
  body('email').isEmail().withMessage('Invalid email address').normalizeEmail(),
  body('phone').notEmpty().withMessage('Phone number is required').trim(),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters long'),
  body('gstNumber').optional().trim().toUpperCase(),
  body('address.street').optional().trim(),
  body('address.city').optional().trim(),
  body('address.state').optional().trim(),
  body('address.zipCode').optional().trim(),
];

export const updateRetailerStatusValidator = [
  param('id').isMongoId().withMessage('Invalid retailer ID'),
  body('status').isIn(['PENDING', 'VERIFIED', 'ACTIVE', 'SUSPENDED', 'REJECTED']).withMessage('Invalid status'),
];

export const updateRetailerVerificationValidator = [
  param('id').isMongoId().withMessage('Invalid retailer ID'),
  body('verificationStatus').isIn(['UNVERIFIED', 'VERIFIED']).withMessage('Invalid verification status'),
];
