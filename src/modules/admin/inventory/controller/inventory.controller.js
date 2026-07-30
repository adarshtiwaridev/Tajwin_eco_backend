import InventoryService from '../service/inventory.service.js';
import { sendSuccess } from '#common/responseHelper.js';
import { asyncHandler } from '#utils/asyncHandler.js';

// MODULE 1: DASHBOARD
export const getDashboardSummary = asyncHandler(async (req, res) => {
  const data = await InventoryService.getDashboardSummary();
  return sendSuccess(res, 200, 'Dashboard summary retrieved successfully', data);
});

export const getInventoryStats = asyncHandler(async (req, res) => {
  const data = await InventoryService.getInventoryStats();
  return sendSuccess(res, 200, 'Inventory statistics retrieved successfully', data);
});

export const getWarehouseStats = asyncHandler(async (req, res) => {
  const data = await InventoryService.getWarehouseStats();
  return sendSuccess(res, 200, 'Warehouse statistics retrieved successfully', data);
});

export const getDealerStats = asyncHandler(async (req, res) => {
  const data = await InventoryService.getDealerStats();
  return sendSuccess(res, 200, 'Dealer statistics retrieved successfully', data);
});

export const getRetailerStats = asyncHandler(async (req, res) => {
  const data = await InventoryService.getRetailerStats();
  return sendSuccess(res, 200, 'Retailer statistics retrieved successfully', data);
});

export const getEndUserStats = asyncHandler(async (req, res) => {
  const data = await InventoryService.getEndUserStats();
  return sendSuccess(res, 200, 'End user statistics retrieved successfully', data);
});

export const getRecentActivities = asyncHandler(async (req, res) => {
  const data = await InventoryService.getRecentActivities(req.query.limit);
  return sendSuccess(res, 200, 'Recent activities retrieved successfully', data);
});

export const getMonthlySummary = asyncHandler(async (req, res) => {
  const data = await InventoryService.getMonthlySummary(req.query.year);
  return sendSuccess(res, 200, 'Monthly inventory summary retrieved successfully', data);
});

export const getGraphData = asyncHandler(async (req, res) => {
  const data = await InventoryService.getGraphData(req.query.days);
  return sendSuccess(res, 200, 'Inventory graph data retrieved successfully', data);
});

export const getStockTrends = asyncHandler(async (req, res) => {
  const data = await InventoryService.getStockTrends(req.query.startDate, req.query.endDate);
  return sendSuccess(res, 200, 'Stock trend data retrieved successfully', data);
});

export const getLowStockCount = asyncHandler(async (req, res) => {
  const data = await InventoryService.getLowStockCount();
  return sendSuccess(res, 200, 'Low stock count retrieved successfully', data);
});

export const getOutOfStockCount = asyncHandler(async (req, res) => {
  const data = await InventoryService.getOutOfStockCount();
  return sendSuccess(res, 200, 'Out of stock count retrieved successfully', data);
});

// MODULE 2: INVENTORY MANAGEMENT
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

export const getInventoryBySku = asyncHandler(async (req, res) => {
  const item = await InventoryService.getInventoryBySku(req.params.sku);
  return sendSuccess(res, 200, 'Inventory item retrieved by SKU successfully', item);
});

export const getInventoryBySerialNumber = asyncHandler(async (req, res) => {
  const item = await InventoryService.getInventoryBySerialNumber(req.params.serialNumber);
  return sendSuccess(res, 200, 'Inventory item retrieved by serial number successfully', item);
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

export const softDeleteInventory = asyncHandler(async (req, res) => {
  const adminId = req.userId || req.user?._id;
  const item = await InventoryService.softDeleteInventory(req.params.inventoryId, adminId);
  return sendSuccess(res, 200, 'Inventory item soft deleted successfully', item);
});

export const restoreInventory = asyncHandler(async (req, res) => {
  const adminId = req.userId || req.user?._id;
  const item = await InventoryService.restoreInventory(req.params.inventoryId, adminId);
  return sendSuccess(res, 200, 'Inventory item restored successfully', item);
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

export const bulkUploadInventory = asyncHandler(async (req, res) => {
  const adminId = req.userId || req.user?._id;
  const results = await InventoryService.bulkUploadInventory(req.body.items, adminId);
  return sendSuccess(res, 201, 'Bulk inventory upload processed', results);
});

export const bulkDeleteInventory = asyncHandler(async (req, res) => {
  const adminId = req.userId || req.user?._id;
  const result = await InventoryService.bulkDeleteInventory(req.body.inventoryIds, adminId);
  return sendSuccess(res, 200, 'Bulk inventory deletion completed', result);
});

export const bulkUpdateInventory = asyncHandler(async (req, res) => {
  const adminId = req.userId || req.user?._id;
  const results = await InventoryService.bulkUpdateInventory(req.body.updates, adminId);
  return sendSuccess(res, 200, 'Bulk inventory update completed', results);
});

export const duplicateCheck = asyncHandler(async (req, res) => {
  const result = await InventoryService.checkDuplicate(req.query.sku, req.query.serialNumber);
  return sendSuccess(res, 200, 'Duplicate check completed', result);
});

export const validateInventoryPayload = asyncHandler(async (req, res) => {
  const result = await InventoryService.validateInventory(req.body);
  return sendSuccess(res, 200, 'Inventory validation completed', result);
});

export const importInventory = asyncHandler(async (req, res) => {
  const adminId = req.userId || req.user?._id;
  const results = await InventoryService.importInventory(req.body.items || [], adminId);
  return sendSuccess(res, 200, 'Inventory imported successfully', results);
});

export const exportInventory = asyncHandler(async (req, res) => {
  const data = await InventoryService.exportInventory(req.query.format);
  return sendSuccess(res, 200, 'Inventory exported successfully', data);
});

export const getInventoryHistory = asyncHandler(async (req, res) => {
  const data = await InventoryService.getInventoryHistory(req.params.inventoryId);
  return sendSuccess(res, 200, 'Inventory history retrieved successfully', data);
});

export const getInventoryTimeline = asyncHandler(async (req, res) => {
  const data = await InventoryService.getInventoryTimeline(req.params.inventoryId);
  return sendSuccess(res, 200, 'Inventory timeline retrieved successfully', data);
});

export const getInventoryAudit = asyncHandler(async (req, res) => {
  const data = await InventoryService.getInventoryAudit(req.params.inventoryId);
  return sendSuccess(res, 200, 'Inventory audit completed', data);
});

export const cloneInventory = asyncHandler(async (req, res) => {
  const adminId = req.userId || req.user?._id;
  const item = await InventoryService.cloneInventory(req.params.inventoryId, adminId);
  return sendSuccess(res, 201, 'Inventory cloned successfully', item);
});

export const archiveInventory = asyncHandler(async (req, res) => {
  const adminId = req.userId || req.user?._id;
  const item = await InventoryService.archiveInventory(req.params.inventoryId, adminId);
  return sendSuccess(res, 200, 'Inventory archived successfully', item);
});

// MODULE 3: WAREHOUSE MANAGEMENT
export const getWarehouseSummary = asyncHandler(async (req, res) => {
  const data = await InventoryService.getWarehouseSummary();
  return sendSuccess(res, 200, 'Warehouse summary retrieved successfully', data);
});

export const getWarehouseStock = asyncHandler(async (req, res) => {
  const data = await InventoryService.getWarehouseStock(req.params.warehouseId);
  return sendSuccess(res, 200, 'Warehouse stock retrieved successfully', data);
});

export const getWarehouseDetails = asyncHandler(async (req, res) => {
  const data = await InventoryService.getWarehouseDetails(req.params.warehouseId);
  return sendSuccess(res, 200, 'Warehouse details retrieved successfully', data);
});

export const getWarehouseItems = asyncHandler(async (req, res) => {
  const data = await InventoryService.getWarehouseItems(req.params.warehouseId);
  return sendSuccess(res, 200, 'Warehouse items retrieved successfully', data);
});

export const transferStock = asyncHandler(async (req, res) => {
  const adminId = req.userId || req.user?._id;
  const result = await InventoryService.transferStock(req.body, adminId);
  return sendSuccess(res, 200, 'Stock transfer completed successfully', result);
});

export const getWarehouseHistory = asyncHandler(async (req, res) => {
  const data = await InventoryService.getWarehouseHistory(req.params.warehouseId);
  return sendSuccess(res, 200, 'Warehouse history retrieved successfully', data);
});

export const reserveWarehouseStock = asyncHandler(async (req, res) => {
  const adminId = req.userId || req.user?._id;
  const result = await InventoryService.reserveStock(req.body.inventoryId, req.body.quantity, adminId);
  return sendSuccess(res, 200, 'Stock reserved successfully', result);
});

export const adjustWarehouseStock = asyncHandler(async (req, res) => {
  const adminId = req.userId || req.user?._id;
  const result = await InventoryService.adjustStock(req.body.inventoryId, req.body, adminId);
  return sendSuccess(res, 200, 'Warehouse stock adjusted successfully', result);
});

export const recordWarehouseDamage = asyncHandler(async (req, res) => {
  const adminId = req.userId || req.user?._id;
  const result = await InventoryService.recordDamage(req.body.inventoryId, req.body.quantity, req.body.remarks, adminId);
  return sendSuccess(res, 200, 'Warehouse damage recorded successfully', result);
});

export const processWarehouseReturn = asyncHandler(async (req, res) => {
  const adminId = req.userId || req.user?._id;
  const result = await InventoryService.processReturn(req.body.inventoryId, req.body.quantity, req.body.remarks, adminId);
  return sendSuccess(res, 200, 'Warehouse return processed successfully', result);
});

export const getWarehouseCapacity = asyncHandler(async (req, res) => {
  const data = await InventoryService.getWarehouseCapacity(req.params.warehouseId);
  return sendSuccess(res, 200, 'Warehouse capacity retrieved successfully', data);
});

export const getWarehouseActivityLogsByWarehouseId = asyncHandler(async (req, res) => {
  const data = await InventoryService.getWarehouseActivityLogs(req.params.warehouseId);
  return sendSuccess(res, 200, 'Warehouse activity logs retrieved successfully', data);
});

export const searchWarehouses = asyncHandler(async (req, res) => {
  const data = await InventoryService.searchWarehouses(req.query.q);
  return sendSuccess(res, 200, 'Warehouse search results', data);
});

export const filterWarehouses = asyncHandler(async (req, res) => {
  const data = await InventoryService.filterWarehouses(req.query);
  return sendSuccess(res, 200, 'Filtered warehouse list', data);
});

// MODULE 4: STOCK ALLOCATION
export const allocateStock = asyncHandler(async (req, res) => {
  const adminId = req.userId || req.user?._id;
  const result = await InventoryService.allocateStock(req.body, adminId);
  return sendSuccess(res, 201, 'Stock allocated successfully', result);
});

export const reallocateStock = asyncHandler(async (req, res) => {
  const adminId = req.userId || req.user?._id;
  const result = await InventoryService.reallocateStock(req.params.allocationId, req.body.newTargetEntityId, adminId);
  return sendSuccess(res, 200, 'Stock reallocated successfully', result);
});

export const cancelAllocation = asyncHandler(async (req, res) => {
  const adminId = req.userId || req.user?._id;
  const result = await InventoryService.cancelAllocation(req.params.allocationId, adminId);
  return sendSuccess(res, 200, 'Allocation cancelled successfully', result);
});

export const approveAllocation = asyncHandler(async (req, res) => {
  const adminId = req.userId || req.user?._id;
  const result = await InventoryService.approveAllocation(req.params.allocationId, adminId);
  return sendSuccess(res, 200, 'Allocation approved successfully', result);
});

export const rejectAllocation = asyncHandler(async (req, res) => {
  const adminId = req.userId || req.user?._id;
  const result = await InventoryService.rejectAllocation(req.params.allocationId, req.body.reason, adminId);
  return sendSuccess(res, 200, 'Allocation rejected successfully', result);
});

export const getAllocationHistory = asyncHandler(async (req, res) => {
  const data = await InventoryService.getAllocationHistory();
  return sendSuccess(res, 200, 'Allocation history retrieved successfully', data);
});

export const getAllocationTimeline = asyncHandler(async (req, res) => {
  const data = await InventoryService.getAllocationTimeline(req.params.allocationId);
  return sendSuccess(res, 200, 'Allocation timeline retrieved successfully', data);
});

export const getAllocationDetails = asyncHandler(async (req, res) => {
  const data = await InventoryService.getAllocationDetails(req.params.allocationId);
  return sendSuccess(res, 200, 'Allocation details retrieved successfully', data);
});

export const bulkAllocate = asyncHandler(async (req, res) => {
  const adminId = req.userId || req.user?._id;
  const results = await InventoryService.bulkAllocate(req.body.allocations || [], adminId);
  return sendSuccess(res, 201, 'Bulk allocation completed', results);
});

export const updateAllocationStatus = asyncHandler(async (req, res) => {
  const adminId = req.userId || req.user?._id;
  const result = await InventoryService.updateAllocationStatus(req.params.allocationId, req.body.status, adminId);
  return sendSuccess(res, 200, 'Allocation status updated', result);
});

export const getAllocationLogs = asyncHandler(async (req, res) => {
  const data = await InventoryService.getAllocationLogs();
  return sendSuccess(res, 200, 'Allocation logs retrieved successfully', data);
});

export const getAllocationReports = asyncHandler(async (req, res) => {
  const data = await InventoryService.getAllocationReports();
  return sendSuccess(res, 200, 'Allocation reports generated successfully', data);
});

// MODULE 5: DEALER INVENTORY
export const getDealerInventorySummary = asyncHandler(async (req, res) => {
  const data = await InventoryService.getDealerInventorySummary();
  return sendSuccess(res, 200, 'Dealer inventory summary retrieved successfully', data);
});

export const getDealerInventoryDetails = asyncHandler(async (req, res) => {
  const data = await InventoryService.getDealerInventoryDetails(req.params.dealerId);
  return sendSuccess(res, 200, 'Dealer inventory details retrieved successfully', data);
});

export const getDealerInventoryHistory = asyncHandler(async (req, res) => {
  const data = await InventoryService.getDealerInventoryHistory(req.params.dealerId);
  return sendSuccess(res, 200, 'Dealer inventory history retrieved successfully', data);
});

export const getDealerMovements = asyncHandler(async (req, res) => {
  const data = await InventoryService.getDealerMovements(req.params.dealerId);
  return sendSuccess(res, 200, 'Dealer inventory movements retrieved successfully', data);
});

export const getDealerStockCount = asyncHandler(async (req, res) => {
  const data = await InventoryService.getDealerStockCount(req.params.dealerId);
  return sendSuccess(res, 200, 'Dealer stock count retrieved successfully', data);
});

export const processDealerReturn = asyncHandler(async (req, res) => {
  const adminId = req.userId || req.user?._id;
  const result = await InventoryService.processDealerReturn(req.body.dealerId, req.body.inventoryId, req.body.quantity, req.body.remarks, adminId);
  return sendSuccess(res, 200, 'Dealer return processed successfully', result);
});

export const recordDealerDamaged = asyncHandler(async (req, res) => {
  const adminId = req.userId || req.user?._id;
  const result = await InventoryService.recordDealerDamaged(req.body.dealerId, req.body.inventoryId, req.body.quantity, req.body.remarks, adminId);
  return sendSuccess(res, 200, 'Dealer damaged stock recorded successfully', result);
});

export const getDealerAvailableStock = asyncHandler(async (req, res) => {
  const data = await InventoryService.getDealerAvailableStock(req.params.dealerId);
  return sendSuccess(res, 200, 'Dealer available stock retrieved successfully', data);
});

export const getDealerAllocations = asyncHandler(async (req, res) => {
  const data = await InventoryService.getDealerAllocations(req.params.dealerId);
  return sendSuccess(res, 200, 'Dealer allocations retrieved successfully', data);
});

export const searchDealerInventory = asyncHandler(async (req, res) => {
  const data = await InventoryService.searchDealerInventory(req.params.dealerId, req.query.q);
  return sendSuccess(res, 200, 'Dealer inventory search results', data);
});

export const filterDealerInventory = asyncHandler(async (req, res) => {
  const data = await InventoryService.filterDealerInventory(req.params.dealerId, req.query);
  return sendSuccess(res, 200, 'Dealer inventory filter results', data);
});

export const getDealerReports = asyncHandler(async (req, res) => {
  const data = await InventoryService.getDealerReports();
  return sendSuccess(res, 200, 'Dealer reports generated successfully', data);
});

// MODULE 6: RETAILER INVENTORY
export const getRetailerInventorySummary = asyncHandler(async (req, res) => {
  const data = await InventoryService.getRetailerInventorySummary();
  return sendSuccess(res, 200, 'Retailer inventory summary retrieved successfully', data);
});

export const getRetailerInventoryDetails = asyncHandler(async (req, res) => {
  const data = await InventoryService.getRetailerInventoryDetails(req.params.retailerId);
  return sendSuccess(res, 200, 'Retailer inventory details retrieved successfully', data);
});

export const getRetailerInventoryHistory = asyncHandler(async (req, res) => {
  const data = await InventoryService.getRetailerInventoryHistory(req.params.retailerId);
  return sendSuccess(res, 200, 'Retailer inventory history retrieved successfully', data);
});

export const getRetailerMovements = asyncHandler(async (req, res) => {
  const data = await InventoryService.getRetailerMovements(req.params.retailerId);
  return sendSuccess(res, 200, 'Retailer inventory movements retrieved successfully', data);
});

export const getRetailerStockCount = asyncHandler(async (req, res) => {
  const data = await InventoryService.getRetailerStockCount(req.params.retailerId);
  return sendSuccess(res, 200, 'Retailer stock count retrieved successfully', data);
});

export const processRetailerReturn = asyncHandler(async (req, res) => {
  const adminId = req.userId || req.user?._id;
  const result = await InventoryService.processRetailerReturn(req.body.retailerId, req.body.inventoryId, req.body.quantity, req.body.remarks, adminId);
  return sendSuccess(res, 200, 'Retailer return processed successfully', result);
});

export const recordRetailerDamaged = asyncHandler(async (req, res) => {
  const adminId = req.userId || req.user?._id;
  const result = await InventoryService.recordRetailerDamaged(req.body.retailerId, req.body.inventoryId, req.body.quantity, req.body.remarks, adminId);
  return sendSuccess(res, 200, 'Retailer damaged stock recorded successfully', result);
});

export const getRetailerAvailableStock = asyncHandler(async (req, res) => {
  const data = await InventoryService.getRetailerAvailableStock(req.params.retailerId);
  return sendSuccess(res, 200, 'Retailer available stock retrieved successfully', data);
});

export const getRetailerReports = asyncHandler(async (req, res) => {
  const data = await InventoryService.getRetailerReports();
  return sendSuccess(res, 200, 'Retailer reports generated successfully', data);
});

export const searchRetailerInventory = asyncHandler(async (req, res) => {
  const data = await InventoryService.searchRetailerInventory(req.params.retailerId, req.query.q);
  return sendSuccess(res, 200, 'Retailer inventory search results', data);
});

export const filterRetailerInventory = asyncHandler(async (req, res) => {
  const data = await InventoryService.filterRetailerInventory(req.params.retailerId, req.query);
  return sendSuccess(res, 200, 'Retailer inventory filter results', data);
});

// MODULE 7: END USER TRACKING
export const getDeliveredProducts = asyncHandler(async (req, res) => {
  const data = await InventoryService.getDeliveredProducts();
  return sendSuccess(res, 200, 'Delivered products retrieved successfully', data);
});

export const getPendingDeliveries = asyncHandler(async (req, res) => {
  const data = await InventoryService.getPendingDeliveries();
  return sendSuccess(res, 200, 'Pending deliveries retrieved successfully', data);
});

export const getDeliveryDetails = asyncHandler(async (req, res) => {
  const data = await InventoryService.getDeliveryDetails(req.params.deliveryId);
  return sendSuccess(res, 200, 'Delivery details retrieved successfully', data);
});

export const getDeliveryHistory = asyncHandler(async (req, res) => {
  const data = await InventoryService.getDeliveryHistory();
  return sendSuccess(res, 200, 'Delivery history retrieved successfully', data);
});

export const getCustomerInventory = asyncHandler(async (req, res) => {
  const data = await InventoryService.getCustomerInventory(req.params.customerId);
  return sendSuccess(res, 200, 'Customer inventory retrieved successfully', data);
});

export const getWarrantyTracking = asyncHandler(async (req, res) => {
  const data = await InventoryService.getWarrantyTracking(req.params.serialNumber);
  return sendSuccess(res, 200, 'Warranty tracking details retrieved successfully', data);
});

export const getReturnedProducts = asyncHandler(async (req, res) => {
  const data = await InventoryService.getReturnedProducts();
  return sendSuccess(res, 200, 'Returned products retrieved successfully', data);
});

export const getReplacementProducts = asyncHandler(async (req, res) => {
  const data = await InventoryService.getReplacementProducts();
  return sendSuccess(res, 200, 'Replacement products retrieved successfully', data);
});

export const getCustomerPurchaseHistory = asyncHandler(async (req, res) => {
  const data = await InventoryService.getCustomerPurchaseHistory(req.params.customerId);
  return sendSuccess(res, 200, 'Customer purchase history retrieved successfully', data);
});

export const getProductTimeline = asyncHandler(async (req, res) => {
  const data = await InventoryService.getProductTimeline(req.params.serialNumber);
  return sendSuccess(res, 200, 'Product timeline retrieved successfully', data);
});

export const updateDeliveryStatus = asyncHandler(async (req, res) => {
  const adminId = req.userId || req.user?._id;
  const data = await InventoryService.updateDeliveryStatus(req.params.deliveryId, req.body.status, adminId);
  return sendSuccess(res, 200, 'Delivery status updated successfully', data);
});

// MODULE 8: INVENTORY MOVEMENT
export const getMovementHistory = asyncHandler(async (req, res) => {
  const data = await InventoryService.getMovementHistory();
  return sendSuccess(res, 200, 'Movement history retrieved successfully', data);
});

export const getMovementTimeline = asyncHandler(async (req, res) => {
  const data = await InventoryService.getMovementTimeline();
  return sendSuccess(res, 200, 'Movement timeline retrieved successfully', data);
});

export const getMovementDetails = asyncHandler(async (req, res) => {
  const data = await InventoryService.getMovementDetails(req.params.movementId);
  return sendSuccess(res, 200, 'Movement details retrieved successfully', data);
});

export const getMovementsByProduct = asyncHandler(async (req, res) => {
  const data = await InventoryService.getMovementsByProduct(req.params.productId);
  return sendSuccess(res, 200, 'Movements by product retrieved successfully', data);
});

export const getMovementsByWarehouse = asyncHandler(async (req, res) => {
  const data = await InventoryService.getMovementsByWarehouse(req.params.warehouseId);
  return sendSuccess(res, 200, 'Movements by warehouse retrieved successfully', data);
});

export const getMovementsByDealer = asyncHandler(async (req, res) => {
  const data = await InventoryService.getMovementsByDealer(req.params.dealerId);
  return sendSuccess(res, 200, 'Movements by dealer retrieved successfully', data);
});

export const getMovementsByRetailer = asyncHandler(async (req, res) => {
  const data = await InventoryService.getMovementsByRetailer(req.params.retailerId);
  return sendSuccess(res, 200, 'Movements by retailer retrieved successfully', data);
});

export const getMovementsByDate = asyncHandler(async (req, res) => {
  const data = await InventoryService.getMovementsByDate(req.query.startDate, req.query.endDate);
  return sendSuccess(res, 200, 'Movements by date range retrieved successfully', data);
});

export const searchMovements = asyncHandler(async (req, res) => {
  const data = await InventoryService.searchMovements(req.query.q);
  return sendSuccess(res, 200, 'Movement search results', data);
});

export const filterMovements = asyncHandler(async (req, res) => {
  const data = await InventoryService.filterMovements(req.query);
  return sendSuccess(res, 200, 'Movement filter results', data);
});

export const getMovementReports = asyncHandler(async (req, res) => {
  const data = await InventoryService.getMovementReports();
  return sendSuccess(res, 200, 'Movement reports generated successfully', data);
});

export const exportMovements = asyncHandler(async (req, res) => {
  const data = await InventoryService.exportMovements();
  return sendSuccess(res, 200, 'Movements exported successfully', data);
});

export const auditMovements = asyncHandler(async (req, res) => {
  const data = await InventoryService.auditMovements();
  return sendSuccess(res, 200, 'Movement audit completed', data);
});

// MODULE 9: LOW STOCK MANAGEMENT
export const getLowStockList = asyncHandler(async (req, res) => {
  const data = await InventoryService.getLowStockList();
  return sendSuccess(res, 200, 'Low stock list retrieved successfully', data);
});

export const getOutOfStockList = asyncHandler(async (req, res) => {
  const data = await InventoryService.getOutOfStockList();
  return sendSuccess(res, 200, 'Out of stock list retrieved successfully', data);
});

export const getCriticalStock = asyncHandler(async (req, res) => {
  const data = await InventoryService.getCriticalStock();
  return sendSuccess(res, 200, 'Critical stock list retrieved successfully', data);
});

export const getStockAlerts = asyncHandler(async (req, res) => {
  const data = await InventoryService.getStockAlerts();
  return sendSuccess(res, 200, 'Stock alerts retrieved successfully', data);
});

export const updateStockThreshold = asyncHandler(async (req, res) => {
  const adminId = req.userId || req.user?._id;
  const data = await InventoryService.updateStockThreshold(req.params.inventoryId, req.body.minimumStockLevel, req.body.maximumStockLevel, adminId);
  return sendSuccess(res, 200, 'Stock threshold updated successfully', data);
});

export const getLowStockHistory = asyncHandler(async (req, res) => {
  const data = await InventoryService.getLowStockHistory();
  return sendSuccess(res, 200, 'Low stock history retrieved successfully', data);
});

export const getLowStockNotifications = asyncHandler(async (req, res) => {
  const data = await InventoryService.getLowStockNotifications();
  return sendSuccess(res, 200, 'Low stock notifications retrieved successfully', data);
});

export const generateAutoAlerts = asyncHandler(async (req, res) => {
  const data = await InventoryService.generateAutoAlerts();
  return sendSuccess(res, 200, 'Auto alerts generated successfully', data);
});

// MODULE 10 & 11: SEARCH & FILTERS
export const globalSearch = asyncHandler(async (req, res) => {
  const data = await InventoryService.globalSearch(req.query.q, req.query);
  return sendSuccess(res, 200, 'Global search results', data);
});

export const dynamicFilter = asyncHandler(async (req, res) => {
  const data = await InventoryService.dynamicFilter(req.query);
  return sendSuccess(res, 200, 'Filter results', data);
});

// MODULE 12: REPORTS
export const getReport = asyncHandler(async (req, res) => {
  const data = await InventoryService.generateReport(req.params.reportType, req.query);
  return sendSuccess(res, 200, `Report '${req.params.reportType}' generated successfully`, data);
});

// MODULE 13: ACTIVITY LOGS
export const getActivityLogs = asyncHandler(async (req, res) => {
  const data = await InventoryService.getActivityLogs(req.query);
  return sendSuccess(res, 200, 'Activity logs retrieved successfully', data);
});

export const getAuditLogs = asyncHandler(async (req, res) => {
  const data = await InventoryService.getAuditLogs();
  return sendSuccess(res, 200, 'Audit logs retrieved successfully', data);
});

export const getUserActivityLogs = asyncHandler(async (req, res) => {
  const data = await InventoryService.getUserActivityLogs(req.params.userId);
  return sendSuccess(res, 200, 'User activity logs retrieved successfully', data);
});

export const getInventoryActivityLogs = asyncHandler(async (req, res) => {
  const data = await InventoryService.getInventoryActivityLogs(req.params.inventoryId);
  return sendSuccess(res, 200, 'Inventory activity logs retrieved successfully', data);
});

export const getWarehouseActivityLogs = asyncHandler(async (req, res) => {
  const data = await InventoryService.getWarehouseActivityLogsModule(req.params.warehouseId);
  return sendSuccess(res, 200, 'Warehouse activity logs retrieved successfully', data);
});

export const getDealerActivityLogs = asyncHandler(async (req, res) => {
  const data = await InventoryService.getDealerActivityLogs(req.params.dealerId);
  return sendSuccess(res, 200, 'Dealer activity logs retrieved successfully', data);
});

export const getRetailerActivityLogs = asyncHandler(async (req, res) => {
  const data = await InventoryService.getRetailerActivityLogs(req.params.retailerId);
  return sendSuccess(res, 200, 'Retailer activity logs retrieved successfully', data);
});

export const getSystemLogs = asyncHandler(async (req, res) => {
  const data = await InventoryService.getSystemLogs();
  return sendSuccess(res, 200, 'System logs retrieved successfully', data);
});

export const getActivityTimeline = asyncHandler(async (req, res) => {
  const data = await InventoryService.getActivityTimeline();
  return sendSuccess(res, 200, 'Activity timeline retrieved successfully', data);
});

export const filterActivityLogs = asyncHandler(async (req, res) => {
  const data = await InventoryService.filterActivityLogs(req.query);
  return sendSuccess(res, 200, 'Activity logs filtered successfully', data);
});

export const searchActivityLogs = asyncHandler(async (req, res) => {
  const data = await InventoryService.searchActivityLogs(req.query.q);
  return sendSuccess(res, 200, 'Activity logs search results', data);
});

// MODULE 14: NOTIFICATIONS
export const getNotifications = asyncHandler(async (req, res) => {
  const data = await InventoryService.getNotifications(req.query);
  return sendSuccess(res, 200, 'Notifications retrieved successfully', data);
});

export const getUnreadNotifications = asyncHandler(async (req, res) => {
  const data = await InventoryService.getUnreadNotifications();
  return sendSuccess(res, 200, 'Unread notifications retrieved successfully', data);
});

export const markNotificationRead = asyncHandler(async (req, res) => {
  const data = await InventoryService.markNotificationRead(req.params.notificationId);
  return sendSuccess(res, 200, 'Notification marked as read', data);
});

export const deleteNotification = asyncHandler(async (req, res) => {
  await InventoryService.deleteNotification(req.params.notificationId);
  return sendSuccess(res, 200, 'Notification deleted successfully');
});
