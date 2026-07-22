import InventoryService from '../service/inventory.service.js';
import { sendSuccess } from '#common/responseHelper.js';
import { asyncHandler } from '#utils/asyncHandler.js';

export const createInventory = asyncHandler(async (req, res) => {
  const adminId = req.userId || req.user?._id;
  const item = await InventoryService.createInventory(req.body, adminId);
  return sendSuccess(res, 201, 'Inventory item created successfully', item);
});

export const getAllInventory = asyncHandler(async (req, res) => {
  const { inventory, meta } = await InventoryService.getAllInventory(req.query);
  return sendSuccess(res, 200, 'Inventory items retrieved successfully', inventory, meta);
});

export const getLowStock = asyncHandler(async (req, res) => {
  const { inventory, meta } = await InventoryService.getLowStock(req.query);
  return sendSuccess(res, 200, 'Low stock inventory items retrieved successfully', inventory, meta);
});

export const getOutOfStock = asyncHandler(async (req, res) => {
  const { inventory, meta } = await InventoryService.getOutOfStock(req.query);
  return sendSuccess(res, 200, 'Out of stock inventory items retrieved successfully', inventory, meta);
});

export const getInventoryById = asyncHandler(async (req, res) => {
  const item = await InventoryService.getInventoryById(req.params.inventoryId);
  return sendSuccess(res, 200, 'Inventory item retrieved successfully', item);
});

export const updateInventory = asyncHandler(async (req, res) => {
  const adminId = req.userId || req.user?._id;
  const item = await InventoryService.updateInventory(req.params.inventoryId, req.body, adminId);
  return sendSuccess(res, 200, 'Inventory item updated successfully', item);
});

export const deleteInventory = asyncHandler(async (req, res) => {
  await InventoryService.deleteInventory(req.params.inventoryId);
  return sendSuccess(res, 200, 'Inventory item deleted successfully');
});

export const increaseStock = asyncHandler(async (req, res) => {
  const adminId = req.userId || req.user?._id;
  const qty = req.body.quantity !== undefined ? req.body.quantity : req.body.amount;
  const item = await InventoryService.increaseStock(req.params.inventoryId, qty, adminId);
  return sendSuccess(res, 200, 'Inventory stock increased successfully', item);
});

export const decreaseStock = asyncHandler(async (req, res) => {
  const adminId = req.userId || req.user?._id;
  const qty = req.body.quantity !== undefined ? req.body.quantity : req.body.amount;
  const item = await InventoryService.decreaseStock(req.params.inventoryId, qty, adminId);
  return sendSuccess(res, 200, 'Inventory stock decreased successfully', item);
});

export const updateStockDirectly = asyncHandler(async (req, res) => {
  const adminId = req.userId || req.user?._id;
  const item = await InventoryService.updateStockDirectly(req.params.inventoryId, req.body, adminId);
  return sendSuccess(res, 200, 'Inventory stock updated successfully', item);
});
