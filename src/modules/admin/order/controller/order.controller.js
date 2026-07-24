import OrderService from '../service/order.service.js';
import { sendSuccess } from '#common/responseHelper.js';
import { asyncHandler } from '#utils/asyncHandler.js';

export const getDashboard = asyncHandler(async (req, res) => {
  const stats = await OrderService.getDashboardStats();
  return sendSuccess(res, 200, 'Order dashboard statistics retrieved successfully', stats);
});

export const createOrder = asyncHandler(async (req, res) => {
  const adminId = req.userId || req.user?._id;
  const order = await OrderService.createOrder(req.body, adminId);
  return sendSuccess(res, 201, 'Order created successfully', order);
});

export const getOrders = asyncHandler(async (req, res) => {
  const { orders, meta } = await OrderService.getAllOrders(req.query);
  return sendSuccess(res, 200, 'Orders retrieved successfully', orders, meta);
});

export const getOrderById = asyncHandler(async (req, res) => {
  const order = await OrderService.getOrderById(req.params.orderId);
  return sendSuccess(res, 200, 'Order details retrieved successfully', order);
});

export const updateOrder = asyncHandler(async (req, res) => {
  const adminId = req.userId || req.user?._id;
  const order = await OrderService.updateOrder(req.params.orderId, req.body, adminId);
  return sendSuccess(res, 200, 'Order updated successfully', order);
});

export const deleteOrder = asyncHandler(async (req, res) => {
  await OrderService.deleteOrder(req.params.orderId);
  return sendSuccess(res, 200, 'Order deleted successfully');
});

export const updateStatus = asyncHandler(async (req, res) => {
  const adminId = req.userId || req.user?._id;
  const { status, remarks } = req.body;
  const order = await OrderService.updateOrderStatus(req.params.orderId, status, remarks, adminId);
  return sendSuccess(res, 200, 'Order status updated successfully', order);
});

export const getPaymentDetails = asyncHandler(async (req, res) => {
  const order = await OrderService.getOrderById(req.params.orderId);
  return sendSuccess(res, 200, 'Payment details retrieved successfully', {
    orderId: order.orderId,
    paymentInfo: order.paymentInfo,
    pricing: order.pricing,
  });
});

export const updatePayment = asyncHandler(async (req, res) => {
  const adminId = req.userId || req.user?._id;
  const order = await OrderService.updatePaymentStatus(req.params.orderId, req.body, adminId);
  return sendSuccess(res, 200, 'Payment status updated successfully', order);
});

export const getShippingDetails = asyncHandler(async (req, res) => {
  const order = await OrderService.getOrderById(req.params.orderId);
  return sendSuccess(res, 200, 'Shipping details retrieved successfully', {
    orderId: order.orderId,
    shippingInfo: order.shippingInfo,
    shippingAddress: order.shippingAddress,
  });
});

export const updateShipping = asyncHandler(async (req, res) => {
  const adminId = req.userId || req.user?._id;
  const order = await OrderService.updateShippingInfo(req.params.orderId, req.body, adminId);
  return sendSuccess(res, 200, 'Shipping details updated successfully', order);
});

export const getInvoice = asyncHandler(async (req, res) => {
  const invoice = await OrderService.generateInvoice(req.params.orderId);
  return sendSuccess(res, 200, 'Order invoice generated successfully', invoice);
});

export const getTimeline = asyncHandler(async (req, res) => {
  const timelineData = await OrderService.getOrderTimeline(req.params.orderId);
  return sendSuccess(res, 200, 'Order timeline retrieved successfully', timelineData);
});
