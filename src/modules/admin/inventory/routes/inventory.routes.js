import { Router } from 'express';
import * as InventoryController from '../controller/inventory.controller.js';
import { validateRequest } from '#middlewares/validate.js';
import {
  validateCreateInventory,
  validateUpdateInventory,
  validateStockQuantityAction,
  validateDirectStockUpdate,
  validateInventoryIdParam,
} from '../validator/inventory.validator.js';

const router = Router();

// ==========================================
// 1. INVENTORY DASHBOARD
// ==========================================
router.get('/dashboard/summary', InventoryController.getDashboardSummary);
router.get('/dashboard/statistics', InventoryController.getInventoryStats);
router.get('/dashboard/warehouse-stats', InventoryController.getWarehouseStats);
router.get('/dashboard/dealer-stats', InventoryController.getDealerStats);
router.get('/dashboard/retailer-stats', InventoryController.getRetailerStats);
router.get('/dashboard/enduser-stats', InventoryController.getEndUserStats);
router.get('/dashboard/recent-activities', InventoryController.getRecentActivities);
router.get('/dashboard/monthly-summary', InventoryController.getMonthlySummary);
router.get('/dashboard/graph-data', InventoryController.getGraphData);
router.get('/dashboard/stock-trends', InventoryController.getStockTrends);
router.get('/dashboard/low-stock-count', InventoryController.getLowStockCount);
router.get('/dashboard/out-of-stock-count', InventoryController.getOutOfStockCount);

// ==========================================
// 3. WAREHOUSE MANAGEMENT
// ==========================================
router.get('/warehouses/summary', InventoryController.getWarehouseSummary);
router.get('/warehouses/search', InventoryController.searchWarehouses);
router.get('/warehouses/filter', InventoryController.filterWarehouses);
router.post('/warehouses/transfer', InventoryController.transferStock);
router.post('/warehouses/reserve', InventoryController.reserveWarehouseStock);
router.post('/warehouses/adjust', InventoryController.adjustWarehouseStock);
router.post('/warehouses/damage', InventoryController.recordWarehouseDamage);
router.post('/warehouses/returns', InventoryController.processWarehouseReturn);
router.get('/warehouses/:warehouseId/stock', InventoryController.getWarehouseStock);
router.get('/warehouses/:warehouseId/items', InventoryController.getWarehouseItems);
router.get('/warehouses/:warehouseId/history', InventoryController.getWarehouseHistory);
router.get('/warehouses/:warehouseId/capacity', InventoryController.getWarehouseCapacity);
router.get('/warehouses/:warehouseId/activity-log', InventoryController.getWarehouseActivityLogs);
router.get('/warehouses/:warehouseId', InventoryController.getWarehouseDetails);

// ==========================================
// 4. STOCK ALLOCATION
// ==========================================
router.post('/allocations', InventoryController.allocateStock);
router.post('/allocations/bulk', InventoryController.bulkAllocate);
router.get('/allocations/history', InventoryController.getAllocationHistory);
router.get('/allocations/logs', InventoryController.getAllocationLogs);
router.get('/allocations/reports', InventoryController.getAllocationReports);
router.patch('/allocations/:allocationId/reallocate', InventoryController.reallocateStock);
router.patch('/allocations/:allocationId/cancel', InventoryController.cancelAllocation);
router.patch('/allocations/:allocationId/approve', InventoryController.approveAllocation);
router.patch('/allocations/:allocationId/reject', InventoryController.rejectAllocation);
router.patch('/allocations/:allocationId/status', InventoryController.updateAllocationStatus);
router.get('/allocations/:allocationId/timeline', InventoryController.getAllocationTimeline);
router.get('/allocations/:allocationId', InventoryController.getAllocationDetails);

// ==========================================
// 5. DEALER INVENTORY
// ==========================================
router.get('/dealers/summary', InventoryController.getDealerInventorySummary);
router.get('/dealers/search', InventoryController.searchDealerInventory);
router.get('/dealers/filter', InventoryController.filterDealerInventory);
router.get('/dealers/reports', InventoryController.getDealerReports);
router.post('/dealers/returns', InventoryController.processDealerReturn);
router.post('/dealers/damaged', InventoryController.recordDealerDamaged);
router.get('/dealers/:dealerId/stock', InventoryController.getDealerInventoryDetails);
router.get('/dealers/:dealerId/history', InventoryController.getDealerInventoryHistory);
router.get('/dealers/:dealerId/movements', InventoryController.getDealerMovements);
router.get('/dealers/:dealerId/stock-count', InventoryController.getDealerStockCount);
router.get('/dealers/:dealerId/available', InventoryController.getDealerAvailableStock);
router.get('/dealers/:dealerId/allocations', InventoryController.getDealerAllocations);

// ==========================================
// 6. RETAILER INVENTORY
// ==========================================
router.get('/retailers/summary', InventoryController.getRetailerInventorySummary);
router.get('/retailers/search', InventoryController.searchRetailerInventory);
router.get('/retailers/filter', InventoryController.filterRetailerInventory);
router.get('/retailers/reports', InventoryController.getRetailerReports);
router.post('/retailers/returns', InventoryController.processRetailerReturn);
router.post('/retailers/damaged', InventoryController.recordRetailerDamaged);
router.get('/retailers/:retailerId/stock', InventoryController.getRetailerInventoryDetails);
router.get('/retailers/:retailerId/history', InventoryController.getRetailerInventoryHistory);
router.get('/retailers/:retailerId/movements', InventoryController.getRetailerMovements);
router.get('/retailers/:retailerId/stock-count', InventoryController.getRetailerStockCount);
router.get('/retailers/:retailerId/available', InventoryController.getRetailerAvailableStock);

// ==========================================
// 7. END USER TRACKING
// ==========================================
router.get('/end-user/delivered', InventoryController.getDeliveredProducts);
router.get('/end-user/pending', InventoryController.getPendingDeliveries);
router.get('/end-user/deliveries/history', InventoryController.getDeliveryHistory);
router.get('/end-user/returns', InventoryController.getReturnedProducts);
router.get('/end-user/replacements', InventoryController.getReplacementProducts);
router.get('/end-user/deliveries/:deliveryId', InventoryController.getDeliveryDetails);
router.patch('/end-user/deliveries/:deliveryId/status', InventoryController.updateDeliveryStatus);
router.get('/end-user/customer/:customerId/purchases', InventoryController.getCustomerPurchaseHistory);
router.get('/end-user/customer/:customerId', InventoryController.getCustomerInventory);
router.get('/end-user/warranty/:serialNumber', InventoryController.getWarrantyTracking);
router.get('/end-user/products/:serialNumber/timeline', InventoryController.getProductTimeline);

// ==========================================
// 8. INVENTORY MOVEMENT
// ==========================================
router.get('/movements/history', InventoryController.getMovementHistory);
router.get('/movements/timeline', InventoryController.getMovementTimeline);
router.get('/movements/date-range', InventoryController.getMovementsByDate);
router.get('/movements/search', InventoryController.searchMovements);
router.get('/movements/filter', InventoryController.filterMovements);
router.get('/movements/reports', InventoryController.getMovementReports);
router.get('/movements/export', InventoryController.exportMovements);
router.get('/movements/audit', InventoryController.auditMovements);
router.get('/movements/product/:productId', InventoryController.getMovementsByProduct);
router.get('/movements/warehouse/:warehouseId', InventoryController.getMovementsByWarehouse);
router.get('/movements/dealer/:dealerId', InventoryController.getMovementsByDealer);
router.get('/movements/retailer/:retailerId', InventoryController.getMovementsByRetailer);
router.get('/movements/:movementId', InventoryController.getMovementDetails);

// ==========================================
// 9. LOW STOCK MANAGEMENT & ALERTS
// ==========================================
router.get('/low-stock/history', InventoryController.getLowStockHistory);
router.get('/low-stock/notifications', InventoryController.getLowStockNotifications);
router.post('/low-stock/generate-alerts', InventoryController.generateAutoAlerts);
router.get('/low-stock', InventoryController.getLowStockList);
router.get('/out-of-stock', InventoryController.getOutOfStockList);
router.get('/critical-stock', InventoryController.getCriticalStock);
router.get('/stock-alerts', InventoryController.getStockAlerts);

// ==========================================
// 10 & 11. SEARCH & FILTERS
// ==========================================
router.get('/search', InventoryController.globalSearch);
router.get('/filter', InventoryController.dynamicFilter);

// ==========================================
// 12. REPORTS
// ==========================================
router.get('/reports/:reportType', InventoryController.getReport);

// ==========================================
// 13. ACTIVITY LOGS
// ==========================================
router.get('/logs/activity', InventoryController.getActivityLogs);
router.get('/logs/audit', InventoryController.getAuditLogs);
router.get('/logs/system', InventoryController.getSystemLogs);
router.get('/logs/timeline', InventoryController.getActivityTimeline);
router.get('/logs/filter', InventoryController.filterActivityLogs);
router.get('/logs/search', InventoryController.searchActivityLogs);
router.get('/logs/user/:userId', InventoryController.getUserActivityLogs);
router.get('/logs/inventory/:inventoryId', InventoryController.getInventoryActivityLogs);
router.get('/logs/warehouse/:warehouseId', InventoryController.getWarehouseActivityLogs);
router.get('/logs/dealer/:dealerId', InventoryController.getDealerActivityLogs);
router.get('/logs/retailer/:retailerId', InventoryController.getRetailerActivityLogs);

// ==========================================
// 14. NOTIFICATIONS
// ==========================================
router.get('/notifications/unread', InventoryController.getUnreadNotifications);
router.get('/notifications', InventoryController.getNotifications);
router.patch('/notifications/:notificationId/read', InventoryController.markNotificationRead);
router.delete('/notifications/:notificationId', InventoryController.deleteNotification);

// ==========================================
// 2. INVENTORY MANAGEMENT (CRUD & BATCH)
// ==========================================
router.post('/check-duplicate', InventoryController.duplicateCheck);
router.post('/validate', InventoryController.validateInventoryPayload);
router.post('/bulk-upload', InventoryController.bulkUploadInventory);
router.post('/bulk-delete', InventoryController.bulkDeleteInventory);
router.patch('/bulk-update', InventoryController.bulkUpdateInventory);
router.post('/import', InventoryController.importInventory);
router.get('/export', InventoryController.exportInventory);
router.get('/sku/:sku', InventoryController.getInventoryBySku);
router.get('/serial/:serialNumber', InventoryController.getInventoryBySerialNumber);

// Item Specific Operations
router.get('/:inventoryId/history', validateInventoryIdParam, validateRequest, InventoryController.getInventoryHistory);
router.get('/:inventoryId/timeline', validateInventoryIdParam, validateRequest, InventoryController.getInventoryTimeline);
router.get('/:inventoryId/audit', validateInventoryIdParam, validateRequest, InventoryController.getInventoryAudit);
router.post('/:inventoryId/clone', validateInventoryIdParam, validateRequest, InventoryController.cloneInventory);
router.patch('/:inventoryId/archive', validateInventoryIdParam, validateRequest, InventoryController.archiveInventory);
router.patch('/:inventoryId/soft-delete', validateInventoryIdParam, validateRequest, InventoryController.softDeleteInventory);
router.patch('/:inventoryId/restore', validateInventoryIdParam, validateRequest, InventoryController.restoreInventory);
router.patch('/:inventoryId/threshold', validateInventoryIdParam, validateRequest, InventoryController.updateStockThreshold);

router.patch(
  '/:inventoryId/increase-stock',
  validateStockQuantityAction,
  validateRequest,
  InventoryController.increaseStock
);
router.patch(
  '/:inventoryId/decrease-stock',
  validateStockQuantityAction,
  validateRequest,
  InventoryController.decreaseStock
);
router.patch(
  '/:inventoryId/update-stock',
  validateDirectStockUpdate,
  validateRequest,
  InventoryController.updateStockDirectly
);

// Standard CRUD
router.post(
  '/',
  validateCreateInventory,
  validateRequest,
  InventoryController.createInventory
);
router.get('/', InventoryController.getAllInventory);
router.get('/:inventoryId', validateInventoryIdParam, validateRequest, InventoryController.getInventoryById);
router.put('/:inventoryId', validateUpdateInventory, validateRequest, InventoryController.updateInventory);
router.delete('/:inventoryId', validateInventoryIdParam, validateRequest, InventoryController.deleteInventory);

export default router;
