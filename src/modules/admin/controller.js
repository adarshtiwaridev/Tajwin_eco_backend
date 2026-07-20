import { AdminService } from './service.js';
import { sendSuccess } from '#common/responseHelper.js';
import { asyncHandler } from '#utils/asyncHandler.js';

export const createDealership = asyncHandler(async (req, res) => {
  const result = await AdminService.createDealership(req.user._id, req.body);
  return sendSuccess(res, 201, 'Dealership created successfully', result);
});

export const getDealershipList = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10, status } = req.query;
  const result = await AdminService.getDealershipList(page, limit, status);
  return sendSuccess(res, 200, 'Dealership list fetched successfully', result.data, result.meta);
});

export const searchDealerships = asyncHandler(async (req, res) => {
  const { query } = req.query;
  const result = await AdminService.searchDealerships(query);
  return sendSuccess(res, 200, 'Search completed', result);
});

export const getDealershipDetails = asyncHandler(async (req, res) => {
  const result = await AdminService.getDealershipDetails(req.params.id);
  return sendSuccess(res, 200, 'Dealership details fetched successfully', result);
});

export const updateDealershipStatus = asyncHandler(async (req, res) => {
  const result = await AdminService.updateDealershipStatus(
    req.params.id, 
    req.body.status, 
    req.body.remarks,
    req.user._id
  );
  return sendSuccess(res, 200, 'Dealership status updated successfully', result);
});

export const verifyDocument = asyncHandler(async (req, res) => {
  const result = await AdminService.verifyDocument(
    req.params.id,
    req.body.documentId,
    req.body.verified
  );
  return sendSuccess(res, 200, 'Document verification status updated', result);
});

export const getDashboardStatistics = asyncHandler(async (req, res) => {
  const stats = await AdminService.getDashboardStatistics();
  return sendSuccess(res, 200, 'Dashboard statistics fetched successfully', stats);
});
