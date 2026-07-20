import { body } from 'express-validator';

export const loginValidator = [
  body('email').isEmail().withMessage('Invalid email address').normalizeEmail(),
  body('password').notEmpty().withMessage('Password is required'),
];

export const registerEndUserValidator = [
  body('name').notEmpty().withMessage('Name is required').trim(),
  body('email').isEmail().withMessage('Invalid email address').normalizeEmail(),
  body('mobile').notEmpty().withMessage('Mobile number is required').trim(),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters long'),
  body('confirmPassword').custom((value, { req }) => {
    if (value !== req.body.password) {
      throw new Error('Password confirmation does not match password');
    }
    return true;
  }),
  body('address').notEmpty().withMessage('Address is required').trim(),
  body('city').notEmpty().withMessage('City is required').trim(),
  body('state').notEmpty().withMessage('State is required').trim(),
  body('pincode').notEmpty().withMessage('Pincode is required').trim(),
];

export const forgotPasswordValidator = [
  body('email').isEmail().withMessage('Invalid email address').normalizeEmail(),
];

export const resetPasswordValidator = [
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters long'),
];

export const changePasswordValidator = [
  body('currentPassword').notEmpty().withMessage('Current password is required'),
  body('newPassword').isLength({ min: 6 }).withMessage('New password must be at least 6 characters long'),
];

export const updateProfileValidator = [
  body('name').optional().notEmpty().withMessage('Name cannot be empty').trim(),
  body('mobile').optional().notEmpty().withMessage('Mobile cannot be empty').trim(),
];
