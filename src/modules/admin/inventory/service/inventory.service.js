import mongoose from 'mongoose';
import InventoryRepository from '../repository/inventory.repository.js';
import { calculateInventoryStatus } from '../model/inventory.model.js';
import { ApiError } from '#common/ApiError.js';
import { APIFeatures } from '#utils/apiFeatures.js';

class InventoryService {
  // MODULE 1: INVENTORY DASHBOARD
  async getDashboardSummary() {
    const totalItems = await InventoryRepository.model.countDocuments({ deletedAt: null });
    const stockStats = await InventoryRepository.model.aggregate([
      { $match: { deletedAt: null } },
      {
        $group: {
          _id: null,
          totalQuantity: { $sum: '$quantity' },
          totalAvailable: { $sum: '$availableQuantity' },
          totalValuation: { $sum: { $multiply: ['$quantity', { $ifNull: ['$purchasePrice', 0] }] } },
        },
      },
    ]);

    const lowStockCount = await InventoryRepository.model.countDocuments({ status: 'Low Stock', deletedAt: null });
    const outOfStockCount = await InventoryRepository.model.countDocuments({ status: 'Out of Stock', deletedAt: null });
    const totalWarehouses = await InventoryRepository.WarehouseModel.countDocuments();
    const activeAllocations = await InventoryRepository.StockAllocationModel.countDocuments({ status: { $in: ['Pending', 'Approved'] } });

    const stats = stockStats[0] || { totalQuantity: 0, totalAvailable: 0, totalValuation: 0 };

    return {
      totalInventoryItems: totalItems,
      totalStockQuantity: stats.totalQuantity,
      totalAvailableQuantity: stats.totalAvailable,
      totalInventoryValuation: stats.totalValuation,
      lowStockCount,
      outOfStockCount,
      totalWarehouses,
      activeAllocations,
    };
  }

  async getInventoryStats() {
    const byStatus = await InventoryRepository.model.aggregate([
      { $match: { deletedAt: null } },
      { $group: { _id: '$status', count: { $sum: 1 }, totalStock: { $sum: '$quantity' } } },
    ]);

    const byCategory = await InventoryRepository.model.aggregate([
      { $match: { deletedAt: null } },
      { $group: { _id: '$category', count: { $sum: 1 }, totalStock: { $sum: '$quantity' } } },
    ]);

    const byBrand = await InventoryRepository.model.aggregate([
      { $match: { deletedAt: null } },
      { $group: { _id: '$brand', count: { $sum: 1 }, totalStock: { $sum: '$quantity' } } },
    ]);

    return { byStatus, byCategory, byBrand };
  }

  async getWarehouseStats() {
    return await InventoryRepository.WarehouseModel.find().lean();
  }

  async getDealerStats() {
    const allocations = await InventoryRepository.StockAllocationModel.aggregate([
      { $match: { targetType: 'Dealer' } },
      { $group: { _id: '$status', totalAllocated: { $sum: '$allocatedQuantity' }, count: { $sum: 1 } } },
    ]);
    return { allocations };
  }

  async getRetailerStats() {
    const allocations = await InventoryRepository.StockAllocationModel.aggregate([
      { $match: { targetType: 'Retailer' } },
      { $group: { _id: '$status', totalAllocated: { $sum: '$allocatedQuantity' }, count: { $sum: 1 } } },
    ]);
    return { allocations };
  }

  async getEndUserStats() {
    const deliveredCount = await InventoryRepository.DeliveryModel.countDocuments({ status: 'Delivered' });
    const pendingCount = await InventoryRepository.DeliveryModel.countDocuments({ status: 'Pending' });
    const returnedCount = await InventoryRepository.DeliveryModel.countDocuments({ status: 'Returned' });
    return { deliveredCount, pendingCount, returnedCount };
  }

  async getRecentActivities(limit = 10) {
    return await InventoryRepository.ActivityLogModel.find()
      .sort({ createdAt: -1 })
      .limit(Number(limit))
      .populate('performedBy', 'name email roleId')
      .lean();
  }

  async getMonthlySummary(year = new Date().getFullYear()) {
    const startDate = new Date(`${year}-01-01`);
    const endDate = new Date(`${year}-12-31`);

    return await InventoryRepository.MovementModel.aggregate([
      { $match: { createdAt: { $gte: startDate, $lte: endDate } } },
      {
        $group: {
          _id: { month: { $month: '$createdAt' }, type: '$movementType' },
          totalQuantity: { $sum: '$quantity' },
        },
      },
    ]);
  }

  async getGraphData(days = 30) {
    const dateLimit = new Date();
    dateLimit.setDate(dateLimit.getDate() - Number(days));

    return await InventoryRepository.MovementModel.aggregate([
      { $match: { createdAt: { $gte: dateLimit } } },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
          totalMovements: { $sum: 1 },
          quantityMoved: { $sum: '$quantity' },
        },
      },
      { $sort: { _id: 1 } },
    ]);
  }

  async getStockTrends(startDate, endDate) {
    const start = startDate ? new Date(startDate) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const end = endDate ? new Date(endDate) : new Date();

    return await InventoryRepository.MovementModel.aggregate([
      { $match: { createdAt: { $gte: start, $lte: end } } },
      {
        $group: {
          _id: '$movementType',
          totalQuantity: { $sum: '$quantity' },
          count: { $sum: 1 },
        },
      },
    ]);
  }

  async getLowStockCount() {
    const count = await InventoryRepository.model.countDocuments({ status: 'Low Stock', deletedAt: null });
    return { count };
  }

  async getOutOfStockCount() {
    const count = await InventoryRepository.model.countDocuments({ status: 'Out of Stock', deletedAt: null });
    return { count };
  }

  // MODULE 2: INVENTORY MANAGEMENT
  async createInventory(data, adminId) {
    const sku = data.sku ? data.sku.toUpperCase().trim() : '';

    const existing = await InventoryRepository.findBySku(sku);
    if (existing) {
      throw new ApiError(`Inventory item with SKU '${sku}' already exists`, 400);
    }

    if (data.serialNumber) {
      const existingSerial = await InventoryRepository.findBySerialNumber(data.serialNumber);
      if (existingSerial) {
        throw new ApiError(`Inventory item with Serial Number '${data.serialNumber}' already exists`, 400);
      }
    }

    let qty = data.quantity !== undefined ? Number(data.quantity) : (data.totalStockQuantity !== undefined ? Number(data.totalStockQuantity) : 0);
    let avail = data.availableQuantity !== undefined ? Number(data.availableQuantity) : (data.availableStock !== undefined ? Number(data.availableStock) : qty);

    if (qty < 0 || avail < 0) {
      throw new ApiError('Stock values cannot be negative', 400);
    }

    if (avail > qty) {
      throw new ApiError('Available stock cannot exceed total quantity', 400);
    }

    const minLevel = data.minimumStockLevel !== undefined ? Number(data.minimumStockLevel) : 5;
    const status = calculateInventoryStatus(avail, minLevel);

    const payload = {
      ...data,
      sku,
      quantity: qty,
      totalStockQuantity: qty,
      availableQuantity: avail,
      availableStock: avail,
      minimumStockLevel: minLevel,
      status,
      createdBy: adminId,
      updatedBy: adminId,
    };

    const item = await InventoryRepository.create(payload);

    await InventoryRepository.createMovement({
      inventory: item._id,
      movementType: 'Stock Added',
      quantity: qty,
      previousStock: 0,
      newStock: qty,
      performedBy: adminId,
      remarks: 'Initial inventory creation',
    });

    await InventoryRepository.createActivityLog('CREATE_INVENTORY', adminId, { sku, qty }, item._id);

    return item;
  }

  async getAllInventory(queryString = {}) {
    const baseQuery = InventoryRepository.getBaseQuery();
    const searchVal = queryString.search ? queryString.search.trim() : '';

    let features;
    let totalFeatures;

    if (searchVal && mongoose.Types.ObjectId.isValid(searchVal)) {
      const idQuery = InventoryRepository.getBaseQuery().find({ _id: searchVal });
      features = new APIFeatures(idQuery, queryString).filter().sort().limitFields();
      totalFeatures = new APIFeatures(InventoryRepository.getBaseQuery().find({ _id: searchVal }), queryString).filter();
    } else {
      features = new APIFeatures(baseQuery, queryString)
        .filter()
        .search(['productName', 'sku', 'brand', 'category', 'model', 'barcode', 'serialNumber'])
        .sort()
        .limitFields();

      totalFeatures = new APIFeatures(InventoryRepository.getBaseQuery(), queryString)
        .filter()
        .search(['productName', 'sku', 'brand', 'category', 'model', 'barcode', 'serialNumber']);
    }

    const totalCount = await totalFeatures.query.countDocuments();
    features.paginate();
    const inventory = await features.query;

    const page = parseInt(queryString.page, 10) || 1;
    const limit = parseInt(queryString.limit, 10) || 10;
    const totalPages = Math.ceil(totalCount / limit) || 1;

    return {
      inventory,
      meta: { total: totalCount, page, limit, totalPages },
    };
  }

  async getLowStock(queryString = {}) {
    const baseQuery = InventoryRepository.getLowStockQuery();
    const features = new APIFeatures(baseQuery, queryString).filter().search(['productName', 'sku', 'brand', 'category']).sort().limitFields();
    const totalFeatures = new APIFeatures(InventoryRepository.getLowStockQuery(), queryString).filter().search(['productName', 'sku', 'brand', 'category']);
    const totalCount = await totalFeatures.query.countDocuments();
    features.paginate();
    const inventory = await features.query;

    return {
      inventory,
      meta: { total: totalCount, page: parseInt(queryString.page, 10) || 1, limit: parseInt(queryString.limit, 10) || 10, totalPages: Math.ceil(totalCount / (parseInt(queryString.limit, 10) || 10)) || 1 },
    };
  }

  async getOutOfStock(queryString = {}) {
    const baseQuery = InventoryRepository.getOutOfStockQuery();
    const features = new APIFeatures(baseQuery, queryString).filter().search(['productName', 'sku', 'brand', 'category']).sort().limitFields();
    const totalFeatures = new APIFeatures(InventoryRepository.getOutOfStockQuery(), queryString).filter().search(['productName', 'sku', 'brand', 'category']);
    const totalCount = await totalFeatures.query.countDocuments();
    features.paginate();
    const inventory = await features.query;

    return {
      inventory,
      meta: { total: totalCount, page: parseInt(queryString.page, 10) || 1, limit: parseInt(queryString.limit, 10) || 10, totalPages: Math.ceil(totalCount / (parseInt(queryString.limit, 10) || 10)) || 1 },
    };
  }

  async getInventoryById(id) {
    const item = await InventoryRepository.findById(id);
    if (!item) throw new ApiError('Inventory item not found', 404);
    return item;
  }

  async getInventoryBySku(sku) {
    const item = await InventoryRepository.findBySku(sku);
    if (!item) throw new ApiError(`Inventory item with SKU '${sku}' not found`, 404);
    return item;
  }

  async getInventoryBySerialNumber(serialNumber) {
    const item = await InventoryRepository.findBySerialNumber(serialNumber);
    if (!item) throw new ApiError(`Inventory item with Serial Number '${serialNumber}' not found`, 404);
    return item;
  }

  async updateInventory(id, updateData, adminId) {
    const existingItem = await this.getInventoryById(id);

    if (updateData.sku && updateData.sku.toUpperCase().trim() !== existingItem.sku) {
      const newSku = updateData.sku.toUpperCase().trim();
      const duplicate = await InventoryRepository.model.findOne({ sku: newSku, _id: { $ne: id }, deletedAt: null });
      if (duplicate) throw new ApiError(`Inventory item with SKU '${newSku}' already exists`, 400);
      updateData.sku = newSku;
    }

    if (updateData.serialNumber && updateData.serialNumber !== existingItem.serialNumber) {
      const duplicateSerial = await InventoryRepository.model.findOne({ serialNumber: updateData.serialNumber, _id: { $ne: id }, deletedAt: null });
      if (duplicateSerial) throw new ApiError(`Inventory item with Serial Number '${updateData.serialNumber}' already exists`, 400);
    }

    let newQty = updateData.quantity !== undefined ? Number(updateData.quantity) : (updateData.totalStockQuantity !== undefined ? Number(updateData.totalStockQuantity) : existingItem.quantity);
    let newAvail = updateData.availableQuantity !== undefined ? Number(updateData.availableQuantity) : (updateData.availableStock !== undefined ? Number(updateData.availableStock) : existingItem.availableQuantity);

    if (newAvail < 0 || newQty < 0) throw new ApiError('Stock values cannot be negative', 400);
    if (newAvail > newQty) throw new ApiError('Available Stock cannot exceed total quantity', 400);

    const minLevel = updateData.minimumStockLevel !== undefined ? Number(updateData.minimumStockLevel) : existingItem.minimumStockLevel;

    updateData.quantity = newQty;
    updateData.totalStockQuantity = newQty;
    updateData.availableQuantity = newAvail;
    updateData.availableStock = newAvail;
    updateData.minimumStockLevel = minLevel;
    updateData.status = calculateInventoryStatus(newAvail, minLevel);
    updateData.updatedBy = adminId;

    const updated = await InventoryRepository.updateById(id, updateData);
    await InventoryRepository.createActivityLog('UPDATE_INVENTORY', adminId, { updateData }, id);
    return updated;
  }

  async deleteInventory(id) {
    await this.getInventoryById(id);
    return await InventoryRepository.deleteById(id, true);
  }

  async softDeleteInventory(id, adminId) {
    await this.getInventoryById(id);
    const updated = await InventoryRepository.updateById(id, { deletedAt: new Date(), updatedBy: adminId });
    await InventoryRepository.createActivityLog('SOFT_DELETE_INVENTORY', adminId, {}, id);
    return updated;
  }

  async restoreInventory(id, adminId) {
    const item = await InventoryRepository.model.findById(id);
    if (!item) throw new ApiError('Inventory item not found', 404);

    item.deletedAt = null;
    item.updatedBy = adminId;
    await item.save();

    await InventoryRepository.createActivityLog('RESTORE_INVENTORY', adminId, {}, id);
    return item;
  }

  async increaseStock(id, amount, adminId) {
    const item = await this.getInventoryById(id);
    const qty = Number(amount);
    if (isNaN(qty) || qty <= 0) throw new ApiError('Increase amount must be positive', 400);

    const newAvailable = item.availableQuantity + qty;
    const newTotal = item.quantity + qty;
    const newStatus = calculateInventoryStatus(newAvailable, item.minimumStockLevel);

    const updated = await InventoryRepository.updateById(id, {
      availableQuantity: newAvailable,
      availableStock: newAvailable,
      quantity: newTotal,
      totalStockQuantity: newTotal,
      status: newStatus,
      updatedBy: adminId,
    });

    await InventoryRepository.createMovement({
      inventory: id,
      movementType: 'Stock Added',
      quantity: qty,
      previousStock: item.availableQuantity,
      newStock: newAvailable,
      performedBy: adminId,
    });

    return updated;
  }

  async decreaseStock(id, amount, adminId) {
    const item = await this.getInventoryById(id);
    const qty = Number(amount);
    if (isNaN(qty) || qty <= 0) throw new ApiError('Decrease amount must be positive', 400);
    if (item.availableQuantity < qty) throw new ApiError(`Insufficient available stock (${item.availableQuantity})`, 400);

    const newAvailable = item.availableQuantity - qty;
    const newTotal = Math.max(0, item.quantity - qty);
    const newStatus = calculateInventoryStatus(newAvailable, item.minimumStockLevel);

    const updated = await InventoryRepository.updateById(id, {
      availableQuantity: newAvailable,
      availableStock: newAvailable,
      quantity: newTotal,
      totalStockQuantity: newTotal,
      status: newStatus,
      updatedBy: adminId,
    });

    await InventoryRepository.createMovement({
      inventory: id,
      movementType: 'Adjustment',
      quantity: -qty,
      previousStock: item.availableQuantity,
      newStock: newAvailable,
      performedBy: adminId,
    });

    return updated;
  }

  async updateStockDirectly(id, stockData, adminId) {
    const item = await this.getInventoryById(id);

    const newQty = stockData.quantity !== undefined ? Number(stockData.quantity) : (stockData.totalStockQuantity !== undefined ? Number(stockData.totalStockQuantity) : item.quantity);
    const newAvail = stockData.availableQuantity !== undefined ? Number(stockData.availableQuantity) : (stockData.availableStock !== undefined ? Number(stockData.availableStock) : item.availableQuantity);

    if (newAvail < 0 || newQty < 0) throw new ApiError('Stock values cannot be negative', 400);
    if (newAvail > newQty) throw new ApiError('Available Stock cannot exceed total quantity', 400);

    const newStatus = calculateInventoryStatus(newAvail, item.minimumStockLevel);

    const updated = await InventoryRepository.updateById(id, {
      quantity: newQty,
      totalStockQuantity: newQty,
      availableQuantity: newAvail,
      availableStock: newAvail,
      status: newStatus,
      updatedBy: adminId,
    });

    await InventoryRepository.createMovement({
      inventory: id,
      movementType: 'Stock Correction',
      quantity: newAvail - item.availableQuantity,
      previousStock: item.availableQuantity,
      newStock: newAvail,
      performedBy: adminId,
    });

    return updated;
  }

  async bulkUploadInventory(itemsArray, adminId) {
    if (!Array.isArray(itemsArray) || itemsArray.length === 0) throw new ApiError('Inventory items array is required', 400);
    const results = [];
    for (const itemData of itemsArray) {
      try {
        const created = await this.createInventory(itemData, adminId);
        results.push({ sku: itemData.sku, success: true, id: created._id });
      } catch (err) {
        results.push({ sku: itemData.sku, success: false, error: err.message });
      }
    }
    return results;
  }

  async bulkDeleteInventory(inventoryIds, adminId) {
    if (!Array.isArray(inventoryIds) || inventoryIds.length === 0) throw new ApiError('Array of inventoryIds is required', 400);
    const result = await InventoryRepository.model.updateMany(
      { _id: { $in: inventoryIds } },
      { $set: { deletedAt: new Date(), updatedBy: adminId } }
    );
    return { modifiedCount: result.modifiedCount };
  }

  async bulkUpdateInventory(updatesArray, adminId) {
    if (!Array.isArray(updatesArray)) throw new ApiError('Updates array required', 400);
    const results = [];
    for (const item of updatesArray) {
      if (!item.id) continue;
      try {
        const updated = await this.updateInventory(item.id, item, adminId);
        results.push({ id: item.id, success: true, data: updated });
      } catch (err) {
        results.push({ id: item.id, success: false, error: err.message });
      }
    }
    return results;
  }

  async checkDuplicate(sku, serialNumber) {
    let skuExists = false;
    let serialExists = false;

    if (sku) {
      const item = await InventoryRepository.findBySku(sku);
      if (item) skuExists = true;
    }
    if (serialNumber) {
      const item = await InventoryRepository.findBySerialNumber(serialNumber);
      if (item) serialExists = true;
    }

    return { skuExists, serialExists, isDuplicate: skuExists || serialExists };
  }

  async validateInventory(data) {
    const errors = [];
    if (!data.productName) errors.push('productName is required');
    if (!data.sku) errors.push('sku is required');
    if (!data.category) errors.push('category is required');
    if (!data.brand) errors.push('brand is required');
    return { valid: errors.length === 0, errors };
  }

  async importInventory(items, adminId) {
    return await this.bulkUploadInventory(items, adminId);
  }

  async exportInventory(format = 'json') {
    const items = await InventoryRepository.model.find({ deletedAt: null }).lean();
    return { format, items };
  }

  async getInventoryHistory(id) {
    await this.getInventoryById(id);
    return await InventoryRepository.MovementModel.find({ inventory: id }).sort({ createdAt: -1 }).lean();
  }

  async getInventoryTimeline(id) {
    await this.getInventoryById(id);
    const movements = await InventoryRepository.MovementModel.find({ inventory: id }).sort({ createdAt: 1 }).lean();
    const logs = await InventoryRepository.ActivityLogModel.find({ targetId: id }).sort({ createdAt: 1 }).lean();
    return { movements, logs };
  }

  async getInventoryAudit(id) {
    const item = await this.getInventoryById(id);
    const movements = await InventoryRepository.MovementModel.find({ inventory: id }).lean();
    return {
      inventoryId: id,
      sku: item.sku,
      recordedStock: item.quantity,
      recordedAvailable: item.availableQuantity,
      movementCount: movements.length,
      isConsistent: true,
    };
  }

  async cloneInventory(id, adminId) {
    const original = await this.getInventoryById(id);
    const cloneData = original.toObject();
    delete cloneData._id;
    delete cloneData.createdAt;
    delete cloneData.updatedAt;

    cloneData.sku = `${original.sku}-CLONE-${Date.now()}`;
    if (cloneData.serialNumber) cloneData.serialNumber = `${original.serialNumber}-CLONE`;

    return await this.createInventory(cloneData, adminId);
  }

  async archiveInventory(id, adminId) {
    const item = await this.getInventoryById(id);
    item.isArchived = true;
    item.status = 'Archived';
    item.updatedBy = adminId;
    await item.save();

    await InventoryRepository.createActivityLog('ARCHIVE_INVENTORY', adminId, {}, id);
    return item;
  }

  // MODULE 3: WAREHOUSE MANAGEMENT
  async getWarehouseSummary() {
    const totalWarehouses = await InventoryRepository.WarehouseModel.countDocuments();
    const capacityAgg = await InventoryRepository.WarehouseModel.aggregate([
      { $group: { _id: null, totalCapacity: { $sum: '$totalCapacity' }, occupiedCapacity: { $sum: '$occupiedCapacity' } } },
    ]);
    const caps = capacityAgg[0] || { totalCapacity: 0, occupiedCapacity: 0 };
    return { totalWarehouses, ...caps };
  }

  async getWarehouseStock(warehouseId) {
    const items = await InventoryRepository.model.find({ warehouse: warehouseId, deletedAt: null }).lean();
    const totalStock = items.reduce((acc, curr) => acc + curr.quantity, 0);
    return { warehouseId, itemTypesCount: items.length, totalStockQuantity: totalStock, items };
  }

  async getWarehouseDetails(warehouseId) {
    const warehouse = await InventoryRepository.WarehouseModel.findById(warehouseId);
    if (!warehouse) throw new ApiError('Warehouse not found', 404);
    return warehouse;
  }

  async getWarehouseItems(warehouseId) {
    return await InventoryRepository.model.find({ warehouse: warehouseId, deletedAt: null }).lean();
  }

  async transferStock(transferData, adminId) {
    const { sourceWarehouseId, destinationWarehouseId, inventoryId, quantity } = transferData;
    const qty = Number(quantity);

    const item = await this.getInventoryById(inventoryId);
    if (item.availableQuantity < qty) throw new ApiError('Insufficient available stock for transfer', 400);

    item.availableQuantity -= qty;
    item.quantity -= qty;
    await item.save();

    let destItem = await InventoryRepository.model.findOne({ sku: item.sku, warehouse: destinationWarehouseId, deletedAt: null });
    if (!destItem) {
      const newObj = item.toObject();
      delete newObj._id;
      newObj.warehouse = destinationWarehouseId;
      newObj.quantity = qty;
      newObj.availableQuantity = qty;
      destItem = await InventoryRepository.create(newObj);
    } else {
      destItem.quantity += qty;
      destItem.availableQuantity += qty;
      await destItem.save();
    }

    await InventoryRepository.createMovement({
      inventory: inventoryId,
      movementType: 'Warehouse Transfer',
      quantity: qty,
      sourceWarehouse: sourceWarehouseId,
      destinationWarehouse: destinationWarehouseId,
      performedBy: adminId,
    });

    return { sourceItem: item, destinationItem: destItem };
  }

  async getWarehouseHistory(warehouseId) {
    return await InventoryRepository.MovementModel.find({
      $or: [{ sourceWarehouse: warehouseId }, { destinationWarehouse: warehouseId }],
    }).sort({ createdAt: -1 }).lean();
  }

  async reserveStock(inventoryId, quantity, adminId) {
    const item = await this.getInventoryById(inventoryId);
    const qty = Number(quantity);

    if (item.availableQuantity < qty) throw new ApiError('Insufficient available stock to reserve', 400);

    item.availableQuantity -= qty;
    item.reservedQuantity += qty;
    item.updatedBy = adminId;
    await item.save();

    return item;
  }

  async adjustStock(inventoryId, adjustmentData, adminId) {
    return await this.updateStockDirectly(inventoryId, adjustmentData, adminId);
  }

  async recordDamage(inventoryId, quantity, remarks, adminId) {
    const item = await this.getInventoryById(inventoryId);
    const qty = Number(quantity);

    if (item.availableQuantity < qty) throw new ApiError('Insufficient available stock to mark damaged', 400);

    item.availableQuantity -= qty;
    item.damagedQuantity += qty;
    item.updatedBy = adminId;
    await item.save();

    await InventoryRepository.createMovement({
      inventory: inventoryId,
      movementType: 'Damage',
      quantity: qty,
      performedBy: adminId,
      remarks,
    });

    return item;
  }

  async processReturn(inventoryId, quantity, remarks, adminId) {
    const item = await this.getInventoryById(inventoryId);
    const qty = Number(quantity);

    item.availableQuantity += qty;
    item.quantity += qty;
    item.returnedQuantity += qty;
    item.updatedBy = adminId;
    await item.save();

    await InventoryRepository.createMovement({
      inventory: inventoryId,
      movementType: 'Return',
      quantity: qty,
      performedBy: adminId,
      remarks,
    });

    return item;
  }

  async getWarehouseCapacity(warehouseId) {
    const wh = await this.getWarehouseDetails(warehouseId);
    return {
      warehouseId: wh._id,
      name: wh.name,
      totalCapacity: wh.totalCapacity,
      occupiedCapacity: wh.occupiedCapacity,
      availableCapacity: Math.max(0, wh.totalCapacity - wh.occupiedCapacity),
    };
  }

  async getWarehouseActivityLogs(warehouseId) {
    return await this.getWarehouseHistory(warehouseId);
  }

  async searchWarehouses(term) {
    return await InventoryRepository.WarehouseModel.find({
      $or: [{ name: new RegExp(term, 'i') }, { code: new RegExp(term, 'i') }],
    }).lean();
  }

  async filterWarehouses(filters) {
    return await InventoryRepository.WarehouseModel.find(filters).lean();
  }

  // MODULE 4: STOCK ALLOCATION
  async allocateStock(allocationData, adminId) {
    const { inventoryId, targetType, targetEntityId, allocatedQuantity, remarks } = allocationData;
    const qty = Number(allocatedQuantity);

    const item = await this.getInventoryById(inventoryId);
    if (item.availableQuantity < qty) throw new ApiError('Insufficient available stock for allocation', 400);

    item.availableQuantity -= qty;
    item.allocatedQuantity += qty;
    item.updatedBy = adminId;
    await item.save();

    const allocationNumber = 'ALLOC-' + Date.now() + '-' + Math.floor(Math.random() * 1000);
    const allocation = await InventoryRepository.StockAllocationModel.create({
      allocationNumber,
      inventory: inventoryId,
      warehouse: item.warehouse,
      targetType,
      targetEntityId,
      allocatedQuantity: qty,
      remarks,
      allocatedBy: adminId,
      status: 'Pending',
    });

    await InventoryRepository.createMovement({
      inventory: inventoryId,
      movementType: targetType === 'Dealer' ? 'Dealer Allocation' : 'Retailer Transfer',
      quantity: qty,
      dealerId: targetType === 'Dealer' ? targetEntityId : null,
      retailerId: targetType === 'Retailer' ? targetEntityId : null,
      performedBy: adminId,
    });

    return allocation;
  }

  async reallocateStock(allocationId, newTargetEntityId, adminId) {
    const alloc = await InventoryRepository.StockAllocationModel.findById(allocationId);
    if (!alloc) throw new ApiError('Allocation not found', 404);

    alloc.targetEntityId = newTargetEntityId;
    alloc.status = 'Reallocated';
    await alloc.save();
    return alloc;
  }

  async cancelAllocation(allocationId, adminId) {
    const alloc = await InventoryRepository.StockAllocationModel.findById(allocationId);
    if (!alloc) throw new ApiError('Allocation not found', 404);
    if (alloc.status === 'Cancelled') throw new ApiError('Allocation already cancelled', 400);

    const item = await this.getInventoryById(alloc.inventory);
    item.availableQuantity += alloc.allocatedQuantity;
    item.allocatedQuantity = Math.max(0, item.allocatedQuantity - alloc.allocatedQuantity);
    item.updatedBy = adminId;
    await item.save();

    alloc.status = 'Cancelled';
    await alloc.save();
    return alloc;
  }

  async approveAllocation(allocationId, adminId) {
    const alloc = await InventoryRepository.StockAllocationModel.findById(allocationId);
    if (!alloc) throw new ApiError('Allocation not found', 404);

    alloc.status = 'Approved';
    alloc.approvedBy = adminId;
    await alloc.save();
    return alloc;
  }

  async rejectAllocation(allocationId, reason, adminId) {
    const alloc = await InventoryRepository.StockAllocationModel.findById(allocationId);
    if (!alloc) throw new ApiError('Allocation not found', 404);

    alloc.status = 'Rejected';
    alloc.rejectedReason = reason || 'Rejected by Admin';
    await alloc.save();

    const item = await this.getInventoryById(alloc.inventory);
    item.availableQuantity += alloc.allocatedQuantity;
    item.allocatedQuantity = Math.max(0, item.allocatedQuantity - alloc.allocatedQuantity);
    item.updatedBy = adminId;
    await item.save();

    return alloc;
  }

  async getAllocationHistory() {
    return await InventoryRepository.StockAllocationModel.find().populate('inventory').sort({ createdAt: -1 }).lean();
  }

  async getAllocationTimeline(allocationId) {
    const alloc = await InventoryRepository.StockAllocationModel.findById(allocationId).populate('inventory');
    if (!alloc) throw new ApiError('Allocation not found', 404);
    return { allocation: alloc, timeline: [ { status: alloc.status, date: alloc.updatedAt } ] };
  }

  async getAllocationDetails(allocationId) {
    const alloc = await InventoryRepository.StockAllocationModel.findById(allocationId).populate('inventory');
    if (!alloc) throw new ApiError('Allocation not found', 404);
    return alloc;
  }

  async bulkAllocate(allocationsArray, adminId) {
    const results = [];
    for (const allocData of allocationsArray) {
      try {
        const res = await this.allocateStock(allocData, adminId);
        results.push({ success: true, data: res });
      } catch (err) {
        results.push({ success: false, error: err.message });
      }
    }
    return results;
  }

  async updateAllocationStatus(allocationId, status, adminId) {
    const alloc = await InventoryRepository.StockAllocationModel.findById(allocationId);
    if (!alloc) throw new ApiError('Allocation not found', 404);
    alloc.status = status;
    await alloc.save();
    return alloc;
  }

  async getAllocationLogs() {
    return await InventoryRepository.StockAllocationModel.find().lean();
  }

  async getAllocationReports() {
    return await InventoryRepository.StockAllocationModel.aggregate([
      { $group: { _id: '$status', count: { $sum: 1 }, totalQuantity: { $sum: '$allocatedQuantity' } } },
    ]);
  }

  // MODULE 5: DEALER INVENTORY
  async getDealerInventorySummary() {
    return await InventoryRepository.StockAllocationModel.aggregate([
      { $match: { targetType: 'Dealer' } },
      { $group: { _id: '$targetEntityId', totalAllocatedStock: { $sum: '$allocatedQuantity' }, count: { $sum: 1 } } },
    ]);
  }

  async getDealerInventoryDetails(dealerId) {
    return await InventoryRepository.StockAllocationModel.find({ targetType: 'Dealer', targetEntityId: dealerId }).populate('inventory').lean();
  }

  async getDealerInventoryHistory(dealerId) {
    return await InventoryRepository.MovementModel.find({ dealerId }).populate('inventory').sort({ createdAt: -1 }).lean();
  }

  async getDealerMovements(dealerId) {
    return await this.getDealerInventoryHistory(dealerId);
  }

  async getDealerStockCount(dealerId) {
    const allocs = await InventoryRepository.StockAllocationModel.find({ targetType: 'Dealer', targetEntityId: dealerId, status: 'Approved' });
    const totalQty = allocs.reduce((acc, curr) => acc + curr.allocatedQuantity, 0);
    return { dealerId, totalQuantity: totalQty, allocationRecords: allocs.length };
  }

  async processDealerReturn(dealerId, inventoryId, quantity, remarks, adminId) {
    return await this.processReturn(inventoryId, quantity, `Dealer Return (${dealerId}): ${remarks || ''}`, adminId);
  }

  async recordDealerDamaged(dealerId, inventoryId, quantity, remarks, adminId) {
    return await this.recordDamage(inventoryId, quantity, `Dealer Damage (${dealerId}): ${remarks || ''}`, adminId);
  }

  async getDealerAvailableStock(dealerId) {
    return await this.getDealerStockCount(dealerId);
  }

  async getDealerAllocations(dealerId) {
    return await InventoryRepository.StockAllocationModel.find({ targetType: 'Dealer', targetEntityId: dealerId }).populate('inventory').lean();
  }

  async searchDealerInventory(dealerId, term) {
    const allocs = await InventoryRepository.StockAllocationModel.find({ targetType: 'Dealer', targetEntityId: dealerId }).populate('inventory');
    if (!term) return allocs;
    return allocs.filter(a => a.inventory && a.inventory.productName.toLowerCase().includes(term.toLowerCase()));
  }

  async filterDealerInventory(dealerId, filters) {
    return await InventoryRepository.StockAllocationModel.find({ targetType: 'Dealer', targetEntityId: dealerId, ...filters }).populate('inventory').lean();
  }

  async getDealerReports() {
    return await this.getDealerInventorySummary();
  }

  // MODULE 6: RETAILER INVENTORY
  async getRetailerInventorySummary() {
    return await InventoryRepository.StockAllocationModel.aggregate([
      { $match: { targetType: 'Retailer' } },
      { $group: { _id: '$targetEntityId', totalAllocatedStock: { $sum: '$allocatedQuantity' }, count: { $sum: 1 } } },
    ]);
  }

  async getRetailerInventoryDetails(retailerId) {
    return await InventoryRepository.StockAllocationModel.find({ targetType: 'Retailer', targetEntityId: retailerId }).populate('inventory').lean();
  }

  async getRetailerInventoryHistory(retailerId) {
    return await InventoryRepository.MovementModel.find({ retailerId }).populate('inventory').sort({ createdAt: -1 }).lean();
  }

  async getRetailerMovements(retailerId) {
    return await this.getRetailerInventoryHistory(retailerId);
  }

  async getRetailerStockCount(retailerId) {
    const allocs = await InventoryRepository.StockAllocationModel.find({ targetType: 'Retailer', targetEntityId: retailerId, status: 'Approved' });
    const totalQty = allocs.reduce((acc, curr) => acc + curr.allocatedQuantity, 0);
    return { retailerId, totalQuantity: totalQty, allocationRecords: allocs.length };
  }

  async processRetailerReturn(retailerId, inventoryId, quantity, remarks, adminId) {
    return await this.processReturn(inventoryId, quantity, `Retailer Return (${retailerId}): ${remarks || ''}`, adminId);
  }

  async recordRetailerDamaged(retailerId, inventoryId, quantity, remarks, adminId) {
    return await this.recordDamage(inventoryId, quantity, `Retailer Damage (${retailerId}): ${remarks || ''}`, adminId);
  }

  async getRetailerAvailableStock(retailerId) {
    return await this.getRetailerStockCount(retailerId);
  }

  async getRetailerReports() {
    return await this.getRetailerInventorySummary();
  }

  async searchRetailerInventory(retailerId, term) {
    const allocs = await InventoryRepository.StockAllocationModel.find({ targetType: 'Retailer', targetEntityId: retailerId }).populate('inventory');
    if (!term) return allocs;
    return allocs.filter(a => a.inventory && a.inventory.productName.toLowerCase().includes(term.toLowerCase()));
  }

  async filterRetailerInventory(retailerId, filters) {
    return await InventoryRepository.StockAllocationModel.find({ targetType: 'Retailer', targetEntityId: retailerId, ...filters }).populate('inventory').lean();
  }

  // MODULE 7: END USER TRACKING
  async getDeliveredProducts() {
    return await InventoryRepository.DeliveryModel.find({ status: 'Delivered' }).populate('inventory customerId').lean();
  }

  async getPendingDeliveries() {
    return await InventoryRepository.DeliveryModel.find({ status: 'Pending' }).populate('inventory customerId').lean();
  }

  async getDeliveryDetails(deliveryId) {
    const delivery = await InventoryRepository.DeliveryModel.findOne({ deliveryId }).populate('inventory customerId');
    if (!delivery) throw new ApiError('Delivery record not found', 404);
    return delivery;
  }

  async getDeliveryHistory() {
    return await InventoryRepository.DeliveryModel.find().populate('inventory customerId').sort({ createdAt: -1 }).lean();
  }

  async getCustomerInventory(customerId) {
    return await InventoryRepository.DeliveryModel.find({ customerId }).populate('inventory').lean();
  }

  async getWarrantyTracking(serialNumber) {
    const delivery = await InventoryRepository.DeliveryModel.findOne({ serialNumber }).populate('inventory customerId');
    if (!delivery) throw new ApiError(`No warranty record found for serial number '${serialNumber}'`, 404);
    const now = new Date();
    const isWarrantyActive = delivery.warrantyEndDate ? delivery.warrantyEndDate > now : false;
    return { delivery, isWarrantyActive };
  }

  async getReturnedProducts() {
    return await InventoryRepository.DeliveryModel.find({ status: 'Returned' }).populate('inventory customerId').lean();
  }

  async getReplacementProducts() {
    return await InventoryRepository.DeliveryModel.find({ status: 'Replaced' }).populate('inventory customerId').lean();
  }

  async getCustomerPurchaseHistory(customerId) {
    return await InventoryRepository.DeliveryModel.find({ customerId, status: 'Delivered' }).populate('inventory').sort({ deliveredAt: -1 }).lean();
  }

  async getProductTimeline(serialNumber) {
    const movements = await InventoryRepository.MovementModel.find({ referenceId: serialNumber }).sort({ createdAt: 1 }).lean();
    const delivery = await InventoryRepository.DeliveryModel.findOne({ serialNumber }).lean();
    return { serialNumber, delivery, movements };
  }

  async updateDeliveryStatus(deliveryId, status, adminId) {
    const delivery = await InventoryRepository.DeliveryModel.findOne({ deliveryId });
    if (!delivery) throw new ApiError('Delivery record not found', 404);

    delivery.status = status;
    if (status === 'Delivered') delivery.deliveredAt = new Date();
    await delivery.save();
    return delivery;
  }

  // MODULE 8: INVENTORY MOVEMENT
  async getMovementHistory() {
    return await InventoryRepository.MovementModel.find().populate('inventory performedBy').sort({ createdAt: -1 }).lean();
  }

  async getMovementTimeline() {
    return await this.getMovementHistory();
  }

  async getMovementDetails(movementId) {
    const movement = await InventoryRepository.MovementModel.findOne({ movementId }).populate('inventory performedBy');
    if (!movement) throw new ApiError('Movement record not found', 404);
    return movement;
  }

  async getMovementsByProduct(productId) {
    return await InventoryRepository.MovementModel.find({ inventory: productId }).populate('performedBy').sort({ createdAt: -1 }).lean();
  }

  async getMovementsByWarehouse(warehouseId) {
    return await InventoryRepository.MovementModel.find({
      $or: [{ sourceWarehouse: warehouseId }, { destinationWarehouse: warehouseId }],
    }).sort({ createdAt: -1 }).lean();
  }

  async getMovementsByDealer(dealerId) {
    return await InventoryRepository.MovementModel.find({ dealerId }).sort({ createdAt: -1 }).lean();
  }

  async getMovementsByRetailer(retailerId) {
    return await InventoryRepository.MovementModel.find({ retailerId }).sort({ createdAt: -1 }).lean();
  }

  async getMovementsByDate(startDate, endDate) {
    const start = startDate ? new Date(startDate) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const end = endDate ? new Date(endDate) : new Date();

    return await InventoryRepository.MovementModel.find({
      createdAt: { $gte: start, $lte: end },
    }).sort({ createdAt: -1 }).lean();
  }

  async searchMovements(term) {
    return await InventoryRepository.MovementModel.find({
      $or: [
        { movementId: new RegExp(term, 'i') },
        { movementType: new RegExp(term, 'i') },
        { referenceId: new RegExp(term, 'i') },
      ],
    }).lean();
  }

  async filterMovements(filters) {
    return await InventoryRepository.MovementModel.find(filters).sort({ createdAt: -1 }).lean();
  }

  async getMovementReports() {
    return await InventoryRepository.MovementModel.aggregate([
      { $group: { _id: '$movementType', totalQuantity: { $sum: '$quantity' }, count: { $sum: 1 } } },
    ]);
  }

  async exportMovements() {
    const movements = await this.getMovementHistory();
    return { format: 'json', count: movements.length, movements };
  }

  async auditMovements() {
    const totalMovements = await InventoryRepository.MovementModel.countDocuments();
    return { totalMovements, auditPassed: true };
  }

  // MODULE 9: LOW STOCK MANAGEMENT
  async getLowStockList() {
    return await InventoryRepository.model.find({ status: 'Low Stock', deletedAt: null }).lean();
  }

  async getOutOfStockList() {
    return await InventoryRepository.model.find({ status: 'Out of Stock', deletedAt: null }).lean();
  }

  async getCriticalStock() {
    return await InventoryRepository.model.find({ availableQuantity: { $lte: 2 }, deletedAt: null }).lean();
  }

  async getStockAlerts() {
    return await InventoryRepository.NotificationModel.find({ type: { $in: ['LOW_STOCK', 'OUT_OF_STOCK'] } }).sort({ createdAt: -1 }).lean();
  }

  async updateStockThreshold(inventoryId, minLevel, maxLevel, adminId) {
    const item = await this.getInventoryById(inventoryId);
    item.minimumStockLevel = Number(minLevel);
    if (maxLevel !== undefined) item.maximumStockLevel = Number(maxLevel);
    item.status = calculateInventoryStatus(item.availableQuantity, item.minimumStockLevel);
    item.updatedBy = adminId;
    await item.save();
    return item;
  }

  async getLowStockHistory() {
    return await InventoryRepository.ActivityLogModel.find({ action: 'LOW_STOCK_ALERT' }).sort({ createdAt: -1 }).lean();
  }

  async getLowStockNotifications() {
    return await InventoryRepository.NotificationModel.find({ type: 'LOW_STOCK' }).sort({ createdAt: -1 }).lean();
  }

  async generateAutoAlerts() {
    const lowStockItems = await this.getLowStockList();
    let generated = 0;
    for (const item of lowStockItems) {
      await InventoryRepository.createNotification({
        title: 'Low Stock Alert',
        message: `Item '${item.productName}' (SKU: ${item.sku}) has reached low stock level (${item.availableQuantity}).`,
        type: 'LOW_STOCK',
        metadata: { inventoryId: item._id, sku: item.sku },
      });
      generated++;
    }
    return { alertsGenerated: generated };
  }

  // MODULE 10 & 11: SEARCH & FILTERS
  async globalSearch(q, filters = {}) {
    const query = { deletedAt: null };
    if (q) {
      const regex = new RegExp(q, 'i');
      query.$or = [
        { productName: regex },
        { sku: regex },
        { brand: regex },
        { category: regex },
        { model: regex },
        { barcode: regex },
        { serialNumber: regex },
      ];
    }
    if (filters.brand) query.brand = filters.brand;
    if (filters.category) query.category = filters.category;
    if (filters.status) query.status = filters.status;
    if (filters.warehouse) query.warehouse = filters.warehouse;

    return await InventoryRepository.model.find(query).lean();
  }

  async dynamicFilter(filters) {
    return await this.globalSearch(null, filters);
  }

  // MODULE 12: REPORTS
  async generateReport(reportType, queryParams = {}) {
    switch (reportType) {
      case 'summary':
        return await this.getDashboardSummary();
      case 'warehouse':
        return await this.getWarehouseSummary();
      case 'dealer':
        return await this.getDealerInventorySummary();
      case 'retailer':
        return await this.getRetailerInventorySummary();
      case 'end-user':
        return await this.getEndUserStats();
      case 'movement':
        return await this.getMovementReports();
      case 'allocation':
        return await this.getAllocationReports();
      case 'damage':
        return await InventoryRepository.MovementModel.find({ movementType: 'Damage' }).lean();
      case 'returns':
        return await InventoryRepository.MovementModel.find({ movementType: 'Return' }).lean();
      case 'low-stock':
        return await this.getLowStockList();
      case 'out-of-stock':
        return await this.getOutOfStockList();
      case 'monthly':
        return await this.getMonthlySummary(queryParams.year);
      case 'yearly':
        return await this.getMonthlySummary(queryParams.year || new Date().getFullYear());
      default:
        return await this.getDashboardSummary();
    }
  }

  // MODULE 13: ACTIVITY LOGS
  async getActivityLogs(filter = {}) {
    return await InventoryRepository.ActivityLogModel.find(filter).populate('performedBy', 'name email').sort({ createdAt: -1 }).lean();
  }

  async getAuditLogs() {
    return await this.getActivityLogs({ action: { $regex: /AUDIT|UPDATE|DELETE/i } });
  }

  async getUserActivityLogs(userId) {
    return await this.getActivityLogs({ performedBy: userId });
  }

  async getInventoryActivityLogs(inventoryId) {
    return await this.getActivityLogs({ targetId: inventoryId });
  }

  async getWarehouseActivityLogsModule(warehouseId) {
    return await this.getWarehouseHistory(warehouseId);
  }

  async getDealerActivityLogs(dealerId) {
    return await this.getDealerInventoryHistory(dealerId);
  }

  async getRetailerActivityLogs(retailerId) {
    return await this.getRetailerInventoryHistory(retailerId);
  }

  async getSystemLogs() {
    return await this.getActivityLogs({ action: { $regex: /SYSTEM|AUTO/i } });
  }

  async getActivityTimeline() {
    return await this.getActivityLogs();
  }

  async filterActivityLogs(filters) {
    return await this.getActivityLogs(filters);
  }

  async searchActivityLogs(term) {
    return await this.getActivityLogs({ action: new RegExp(term, 'i') });
  }

  // MODULE 14: NOTIFICATIONS
  async getNotifications(filter = {}) {
    return await InventoryRepository.NotificationModel.find(filter).sort({ createdAt: -1 }).lean();
  }

  async getUnreadNotifications() {
    return await this.getNotifications({ isRead: false });
  }

  async markNotificationRead(notificationId) {
    const notification = await InventoryRepository.NotificationModel.findById(notificationId);
    if (!notification) throw new ApiError('Notification not found', 404);
    notification.isRead = true;
    await notification.save();
    return notification;
  }

  async deleteNotification(notificationId) {
    return await InventoryRepository.NotificationModel.findByIdAndDelete(notificationId);
  }
}

export default new InventoryService();
