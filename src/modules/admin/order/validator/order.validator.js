import { body, param, query } from 'express-validator';
import { ORDER_STATUS, PAYMENT_STATUS, PAYMENT_METHOD, SHIPPING_STATUS } from '../constants/order.constants.js';

export const validateCreateOrder = [
  body('customerInfo')
    .isObject()
    .withMessage('Customer Info must be an object'),
  body('customerInfo.name')
    .notEmpty()
    .trim()
    .withMessage('Customer Name is required'),
  body('customerInfo.mobile')
    .notEmpty()
    .trim()
    .withMessage('Customer Mobile Number is required'),
  body('customerInfo.email')
    .notEmpty()
    .isEmail()
    .normalizeEmail()
    .withMessage('Valid Customer Email Address is required'),

  body('shippingAddress')
    .isObject()
    .withMessage('Shipping Address must be an object'),
  body('shippingAddress.address')
    .notEmpty()
    .trim()
    .withMessage('Shipping Address is required'),
  body('shippingAddress.city')
    .notEmpty()
    .trim()
    .withMessage('City is required'),
  body('shippingAddress.state')
    .notEmpty()
    .trim()
    .withMessage('State is required'),
  body('shippingAddress.pincode')
    .notEmpty()
    .trim()
    .withMessage('Postal Code is required'),

  body('items')
    .isArray({ min: 1 })
    .withMessage('Items must be a non-empty array'),
  body('items.*.productName')
    .notEmpty()
    .trim()
    .withMessage('Product Name is required for each item'),
  body('items.*.sku')
    .notEmpty()
    .trim()
    .withMessage('Product SKU is required for each item'),
  body('items.*.quantity')
    .isInt({ min: 1 })
    .withMessage('Quantity must be an integer greater than 0'),
  body('items.*.price')
    .isFloat({ min: 0 })
    .withMessage('Price must be a number greater than or equal to 0'),

  body('paymentInfo')
    .isObject()
    .withMessage('Payment Info must be an object'),
  body('paymentInfo.method')
    .notEmpty()
    .isIn(Object.values(PAYMENT_METHOD))
    .withMessage(`Payment method must be one of: ${Object.values(PAYMENT_METHOD).join(', ')}`),
  body('paymentInfo.status')
    .optional()
    .isIn(Object.values(PAYMENT_STATUS))
    .withMessage(`Payment status must be one of: ${Object.values(PAYMENT_STATUS).join(', ')}`),

  body('orderStatus')
    .optional()
    .isIn(Object.values(ORDER_STATUS))
    .withMessage(`Order status must be one of: ${Object.values(ORDER_STATUS).join(', ')}`),

  body('tax')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Tax must be a non-negative number'),
  body('shippingCharge')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Shipping charge must be a non-negative number'),
  body('discount')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Discount must be a non-negative number'),
];

export const validateUpdateOrder = [
  param('orderId')
    .notEmpty()
    .trim()
    .withMessage('Order ID parameter is required'),
  body('customerInfo.email')
    .optional()
    .isEmail()
    .withMessage('Valid Customer Email Address is required'),
  body('items')
    .optional()
    .isArray({ min: 1 })
    .withMessage('Items must be a non-empty array'),
  body('items.*.quantity')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Quantity must be an integer greater than 0'),
  body('items.*.price')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Price must be a number greater than or equal to 0'),
];

export const validateOrderStatus = [
  param('orderId')
    .notEmpty()
    .trim()
    .withMessage('Order ID parameter is required'),
  body('status')
    .notEmpty()
    .isIn(Object.values(ORDER_STATUS))
    .withMessage(`Order status must be one of: ${Object.values(ORDER_STATUS).join(', ')}`),
  body('remarks')
    .optional()
    .isString()
    .trim(),
];

export const validatePaymentUpdate = [
  param('orderId')
    .notEmpty()
    .trim()
    .withMessage('Order ID parameter is required'),
  body('status')
    .optional()
    .isIn(Object.values(PAYMENT_STATUS))
    .withMessage(`Payment status must be one of: ${Object.values(PAYMENT_STATUS).join(', ')}`),
  body('method')
    .optional()
    .isIn(Object.values(PAYMENT_METHOD))
    .withMessage(`Payment method must be one of: ${Object.values(PAYMENT_METHOD).join(', ')}`),
  body('transactionId')
    .optional()
    .isString()
    .trim(),
];

export const validateShippingUpdate = [
  param('orderId')
    .notEmpty()
    .trim()
    .withMessage('Order ID parameter is required'),
  body('courierName')
    .optional()
    .isString()
    .trim(),
  body('trackingNumber')
    .optional()
    .isString()
    .trim(),
  body('dispatchDate')
    .optional()
    .isISO8601()
    .withMessage('Dispatch date must be a valid ISO8601 date'),
  body('estimatedDeliveryDate')
    .optional()
    .isISO8601()
    .withMessage('Estimated delivery date must be a valid ISO8601 date'),
  body('status')
    .optional()
    .isIn(Object.values(SHIPPING_STATUS))
    .withMessage(`Shipping status must be one of: ${Object.values(SHIPPING_STATUS).join(', ')}`),
];

export const validateOrderIdParam = [
  param('orderId')
    .notEmpty()
    .trim()
    .withMessage('Order ID parameter is required'),
];
