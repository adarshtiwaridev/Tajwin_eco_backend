import ProductService from '../service/product.service.js';
import { sendSuccess } from '#common/responseHelper.js';
import { asyncHandler } from '#utils/asyncHandler.js';

export const createProduct = asyncHandler(async (req, res) => {
  const adminId = req.user.id;
  const productData = req.body;
  const files = req.files;

  const product = await ProductService.createProduct(productData, files, adminId);
  return sendSuccess(res, 201, 'Product created successfully', product);
});

export const getAllProducts = asyncHandler(async (req, res) => {
  const { products, meta } = await ProductService.getAllProducts(req.query);
  return sendSuccess(res, 200, 'Products retrieved successfully', products, meta);
});

export const getProductById = asyncHandler(async (req, res) => {
  const product = await ProductService.getProductById(req.params.id);
  return sendSuccess(res, 200, 'Product retrieved successfully', product);
});

export const updateProduct = asyncHandler(async (req, res) => {
  const adminId = req.user.id;
  const updateData = req.body;
  const files = req.files;

  const product = await ProductService.updateProduct(req.params.id, updateData, files, adminId);
  return sendSuccess(res, 200, 'Product updated successfully', product);
});

export const deleteProduct = asyncHandler(async (req, res) => {
  await ProductService.deleteProduct(req.params.id);
  return sendSuccess(res, 200, 'Product deleted successfully');
});

export const restoreProduct = asyncHandler(async (req, res) => {
  const product = await ProductService.restoreProduct(req.params.id);
  return sendSuccess(res, 200, 'Product restored successfully', product);
});

export const changeStatus = asyncHandler(async (req, res) => {
  const { status } = req.body;
  const adminId = req.user.id;
  const product = await ProductService.changeStatus(req.params.id, status, adminId);
  return sendSuccess(res, 200, 'Product status updated successfully', product);
});

export const uploadImages = asyncHandler(async (req, res) => {
  const adminId = req.user.id;
  const product = await ProductService.uploadImages(req.params.id, req.files, adminId);
  return sendSuccess(res, 200, 'Images uploaded successfully', product);
});

export const deleteImage = asyncHandler(async (req, res) => {
  const adminId = req.user.id;
  const { imageId } = req.params; // Image URL or ID
  const product = await ProductService.deleteImage(req.params.id, decodeURIComponent(imageId), adminId);
  return sendSuccess(res, 200, 'Image deleted successfully', product);
});

export const featureImage = asyncHandler(async (req, res) => {
  const adminId = req.user.id;
  const { imageUrl } = req.body;
  const product = await ProductService.featureImage(req.params.id, imageUrl, adminId);
  return sendSuccess(res, 200, 'Featured image updated successfully', product);
});

export const bulkDelete = asyncHandler(async (req, res) => {
  const { ids } = req.body;
  const result = await ProductService.bulkDelete(ids);
  return sendSuccess(res, 200, 'Products deleted successfully', result);
});

export const bulkUpdateStatus = asyncHandler(async (req, res) => {
  const { ids, status } = req.body;
  const result = await ProductService.bulkUpdateStatus(ids, status);
  return sendSuccess(res, 200, 'Products status updated successfully', result);
});

export const getDashboardStats = asyncHandler(async (req, res) => {
  const stats = await ProductService.getDashboardStats();
  return sendSuccess(res, 200, 'Dashboard stats retrieved successfully', stats);
});
