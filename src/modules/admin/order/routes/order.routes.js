import { Router } from 'express';
import * as OrderController from '../controller/order.controller.js';
import { validateRequest } from '#middlewares/validate.js';
import {
  validateCreateOrder,
  validateUpdateOrder,
  validateOrderStatus,
  validatePaymentUpdate,
  validateShippingUpdate,
  validateOrderIdParam,
} from '../validator/order.validator.js';

const router = Router();

// Order Dashboard Statistics (Must be declared before /:orderId)
router.get('/dashboard', OrderController.getDashboard);

// Create New Order
router.post(
  '/',
  validateCreateOrder,
  validateRequest,
  OrderController.createOrder
);

// Get All Orders (with search, filter, pagination, sort)
router.get('/', OrderController.getOrders);

// Get Order Details by ID or Order ID string
router.get(
  '/:orderId',
  validateOrderIdParam,
  validateRequest,
  OrderController.getOrderById
);

// Update Order Details
router.put(
  '/:orderId',
  validateUpdateOrder,
  validateRequest,
  OrderController.updateOrder
);

// Delete Order (Soft Delete)
router.delete(
  '/:orderId',
  validateOrderIdParam,
  validateRequest,
  OrderController.deleteOrder
);

// Update Order Status
router.patch(
  '/:orderId/status',
  validateOrderStatus,
  validateRequest,
  OrderController.updateStatus
);

// Get Payment Details
router.get(
  '/:orderId/payment',
  validateOrderIdParam,
  validateRequest,
  OrderController.getPaymentDetails
);

// Update Payment Status / Method
router.patch(
  '/:orderId/payment',
  validatePaymentUpdate,
  validateRequest,
  OrderController.updatePayment
);

// Get Shipping Information
router.get(
  '/:orderId/shipping',
  validateOrderIdParam,
  validateRequest,
  OrderController.getShippingDetails
);

// Update Shipping Information
router.patch(
  '/:orderId/shipping',
  validateShippingUpdate,
  validateRequest,
  OrderController.updateShipping
);

// Generate Invoice Payload
router.get(
  '/:orderId/invoice',
  validateOrderIdParam,
  validateRequest,
  OrderController.getInvoice
);

// Get Complete Order Timeline
router.get(
  '/:orderId/timeline',
  validateOrderIdParam,
  validateRequest,
  OrderController.getTimeline
);

export default router;
