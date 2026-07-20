import { body, param } from 'express-validator';

export const createDealershipValidator = [
  body('businessName').notEmpty().withMessage('Business name is required').trim(),
  body('email').isEmail().withMessage('Invalid email address').normalizeEmail(),
  body('phone').notEmpty().withMessage('Phone number is required').trim(),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters long'),
];

export const updateDealershipStatusValidator = [
  param('id').isMongoId().withMessage('Invalid dealership ID'),
  body('status').isIn(['approved', 'rejected', 'suspended', 'retired', 'active'])
    .withMessage('Invalid status'),
  body('remarks').optional().isString().trim(),
];

export const verifyDocumentsValidator = [
  param('id').isMongoId().withMessage('Invalid dealership ID'),
  body('documentId').notEmpty().withMessage('Document ID is required'),
  body('verified').isBoolean().withMessage('Verified flag must be boolean'),
];
