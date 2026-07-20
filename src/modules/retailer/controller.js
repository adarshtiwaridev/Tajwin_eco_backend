import { RetailerService } from './service.js';
import { sendSuccess } from '#common/responseHelper.js';
import { asyncHandler } from '#utils/asyncHandler.js';

export const getMyProfile = asyncHandler(async (req, res) => {
  const profile = await RetailerService.getRetailerProfile(req.user._id);
  return sendSuccess(res, 200, 'Retailer profile fetched successfully', profile);
});

export const updateMyProfile = asyncHandler(async (req, res) => {
  const updatedProfile = await RetailerService.updateRetailerProfile(req.retailerProfile._id, req.body);
  return sendSuccess(res, 200, 'Retailer profile updated successfully', updatedProfile);
});

export const registerCustomer = asyncHandler(async (req, res) => {
  const result = await RetailerService.registerCustomer(req.retailerProfile._id, req.user._id, req.body);
  return sendSuccess(res, 201, 'Customer registered successfully', result);
});

export const getCustomerList = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10, status } = req.query;
  const result = await RetailerService.getCustomerList(req.retailerProfile._id, page, limit, status);
  return sendSuccess(res, 200, 'Customer list fetched successfully', result.data, result.meta);
});

export const searchCustomers = asyncHandler(async (req, res) => {
  const { query } = req.query;
  const result = await RetailerService.searchCustomers(req.retailerProfile._id, query);
  return sendSuccess(res, 200, 'Search completed', result);
});

export const getCustomerDetails = asyncHandler(async (req, res) => {
  const customer = await RetailerService.getCustomerDetails(req.retailerProfile._id, req.params.id);
  return sendSuccess(res, 200, 'Customer details fetched successfully', customer);
});

export const updateCustomer = asyncHandler(async (req, res) => {
  const customer = await RetailerService.updateCustomer(req.retailerProfile._id, req.params.id, req.body);
  return sendSuccess(res, 200, 'Customer updated successfully', customer);
});

export const getDashboardSummary = asyncHandler(async (req, res) => {
  const stats = await RetailerService.getDashboardSummary(req.retailerProfile._id);
  return sendSuccess(res, 200, 'Dashboard summary fetched successfully', stats);
});
