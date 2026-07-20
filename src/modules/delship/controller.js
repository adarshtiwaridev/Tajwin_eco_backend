import { DelshipService } from './service.js';
import { sendSuccess } from '#common/responseHelper.js';
import { asyncHandler } from '#utils/asyncHandler.js';

export const getMyProfile = asyncHandler(async (req, res) => {
  const profile = await DelshipService.getDealershipProfile(req.user._id);
  return sendSuccess(res, 200, 'Dealership profile fetched successfully', profile);
});

export const updateMyProfile = asyncHandler(async (req, res) => {
  const updatedProfile = await DelshipService.updateDealershipProfile(req.dealerProfile._id, req.body);
  return sendSuccess(res, 200, 'Dealership profile updated successfully', updatedProfile);
});

export const createRetailer = asyncHandler(async (req, res) => {
  const result = await DelshipService.createRetailer(req.dealerProfile._id, req.user._id, req.body);
  return sendSuccess(res, 201, 'Retailer created successfully', result);
});

export const getRetailerList = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10, status } = req.query;
  const result = await DelshipService.getRetailerList(req.dealerProfile._id, page, limit, status);
  return sendSuccess(res, 200, 'Retailer list fetched successfully', result.data, result.meta);
});

export const getRetailerDetails = asyncHandler(async (req, res) => {
  const retailer = await DelshipService.getRetailerDetails(req.dealerProfile._id, req.params.id);
  return sendSuccess(res, 200, 'Retailer details fetched successfully', retailer);
});

export const updateRetailer = asyncHandler(async (req, res) => {
  const retailer = await DelshipService.updateRetailer(req.dealerProfile._id, req.params.id, req.body);
  return sendSuccess(res, 200, 'Retailer updated successfully', retailer);
});

export const updateRetailerStatus = asyncHandler(async (req, res) => {
  const retailer = await DelshipService.updateRetailerStatus(req.dealerProfile._id, req.params.id, req.body.status);
  return sendSuccess(res, 200, 'Retailer status updated successfully', retailer);
});

export const verifyRetailer = asyncHandler(async (req, res) => {
  const retailer = await DelshipService.verifyRetailer(req.dealerProfile._id, req.params.id, req.body.verificationStatus);
  return sendSuccess(res, 200, 'Retailer verification status updated successfully', retailer);
});

export const deleteRetailer = asyncHandler(async (req, res) => {
  await DelshipService.deleteRetailer(req.dealerProfile._id, req.params.id);
  return sendSuccess(res, 200, 'Retailer deleted successfully');
});

export const getDashboardOverview = asyncHandler(async (req, res) => {
  const stats = await DelshipService.getDashboardOverview(req.dealerProfile._id);
  return sendSuccess(res, 200, 'Dashboard overview fetched successfully', stats);
});
