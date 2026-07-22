import mongoose from 'mongoose';
import InventoryRepository from '../repository/inventory.repository.js';
import { calculateInventoryStatus } from '../model/inventory.model.js';
import { ApiError } from '#common/ApiError.js';
import { APIFeatures } from '#utils/apiFeatures.js';

class InventoryService {
  /**
   * Create a new inventory item
   */
  async createInventory(data, adminId) {
    const sku = data.sku ? data.sku.toUpperCase().trim() : '';
    
    // Prevent duplicate SKU
    const existing = await InventoryRepository.findBySku(sku);
    if (existing) {
      throw new ApiError(`Inventory item with SKU '${sku}' already exists`, 400);
    }

    let totalStockQuantity = data.totalStockQuantity !== undefined ? Number(data.totalStockQuantity) : undefined;
    let availableStock = data.availableStock !== undefined ? Number(data.availableStock) : undefined;

    if (totalStockQuantity !== undefined && availableStock === undefined) {
      availableStock = totalStockQuantity;
    } else if (availableStock !== undefined && totalStockQuantity === undefined) {
      totalStockQuantity = availableStock;
    } else if (totalStockQuantity === undefined && availableStock === undefined) {
      totalStockQuantity = 0;
      availableStock = 0;
    }

    if (availableStock < 0 || totalStockQuantity < 0) {
      throw new ApiError('Stock values cannot be negative', 400);
    }

    if (availableStock > totalStockQuantity) {
      throw new ApiError('Total Stock Quantity must be greater than or equal to Available Stock', 400);
    }

    const status = calculateInventoryStatus(availableStock);

    const payload = {
      ...data,
      sku,
      totalStockQuantity,
      availableStock,
      status,
      createdBy: adminId,
      updatedBy: adminId,
    };

    return await InventoryRepository.create(payload);
  }

  /**
   * Get all inventory items with pagination, sorting, search & filtering
   */
  async getAllInventory(queryString = {}) {
    const baseQuery = InventoryRepository.getBaseQuery();
    
    // Check if search is an exact Mongo ObjectId for searching by ID
    const searchVal = queryString.search ? queryString.search.trim() : '';
    let isMongoIdSearch = false;
    if (searchVal && mongoose.Types.ObjectId.isValid(searchVal)) {
      isMongoIdSearch = true;
    }

    let features;
    let totalFeatures;

    if (isMongoIdSearch) {
      const idQuery = InventoryRepository.getBaseQuery().find({ _id: searchVal });
      features = new APIFeatures(idQuery, queryString).filter().sort().limitFields();
      totalFeatures = new APIFeatures(InventoryRepository.getBaseQuery().find({ _id: searchVal }), queryString).filter();
    } else {
      features = new APIFeatures(baseQuery, queryString)
        .filter()
        .search(['productName', 'sku', 'brand', 'category', 'model'])
        .sort()
        .limitFields();

      totalFeatures = new APIFeatures(InventoryRepository.getBaseQuery(), queryString)
        .filter()
        .search(['productName', 'sku', 'brand', 'category', 'model']);
    }

    const totalCount = await totalFeatures.query.countDocuments();

    features.paginate();
    const inventory = await features.query;

    const page = parseInt(queryString.page, 10) || 1;
    const limit = parseInt(queryString.limit, 10) || 10;
    const totalPages = Math.ceil(totalCount / limit) || 1;

    return {
      inventory,
      meta: {
        total: totalCount,
        page,
        limit,
        totalPages,
      },
    };
  }

  /**
   * Get low stock inventory items
   */
  async getLowStock(queryString = {}) {
    const baseQuery = InventoryRepository.getLowStockQuery();

    const features = new APIFeatures(baseQuery, queryString)
      .filter()
      .search(['productName', 'sku', 'brand', 'category'])
      .sort()
      .limitFields();

    const totalFeatures = new APIFeatures(InventoryRepository.getLowStockQuery(), queryString)
      .filter()
      .search(['productName', 'sku', 'brand', 'category']);

    const totalCount = await totalFeatures.query.countDocuments();

    features.paginate();
    const inventory = await features.query;

    const page = parseInt(queryString.page, 10) || 1;
    const limit = parseInt(queryString.limit, 10) || 10;
    const totalPages = Math.ceil(totalCount / limit) || 1;

    return {
      inventory,
      meta: {
        total: totalCount,
        page,
        limit,
        totalPages,
      },
    };
  }

  /**
   * Get out of stock inventory items
   */
  async getOutOfStock(queryString = {}) {
    const baseQuery = InventoryRepository.getOutOfStockQuery();

    const features = new APIFeatures(baseQuery, queryString)
      .filter()
      .search(['productName', 'sku', 'brand', 'category'])
      .sort()
      .limitFields();

    const totalFeatures = new APIFeatures(InventoryRepository.getOutOfStockQuery(), queryString)
      .filter()
      .search(['productName', 'sku', 'brand', 'category']);

    const totalCount = await totalFeatures.query.countDocuments();

    features.paginate();
    const inventory = await features.query;

    const page = parseInt(queryString.page, 10) || 1;
    const limit = parseInt(queryString.limit, 10) || 10;
    const totalPages = Math.ceil(totalCount / limit) || 1;

    return {
      inventory,
      meta: {
        total: totalCount,
        page,
        limit,
        totalPages,
      },
    };
  }

  /**
   * Get inventory item by ID
   */
  async getInventoryById(id) {
    const item = await InventoryRepository.findById(id);
    if (!item) {
      throw new ApiError('Inventory item not found', 404);
    }
    return item;
  }

  /**
   * Update inventory item information
   */
  async updateInventory(id, updateData, adminId) {
    const existingItem = await this.getInventoryById(id);

    // Validate SKU uniqueness if SKU is being updated
    if (updateData.sku && updateData.sku.toUpperCase().trim() !== existingItem.sku) {
      const newSku = updateData.sku.toUpperCase().trim();
      const duplicate = await InventoryRepository.model.findOne({
        sku: newSku,
        _id: { $ne: id },
        deletedAt: null,
      });

      if (duplicate) {
        throw new ApiError(`Inventory item with SKU '${newSku}' already exists`, 400);
      }
      updateData.sku = newSku;
    }

    // Determine target stock values
    const newTotalStock = updateData.totalStockQuantity !== undefined
      ? Number(updateData.totalStockQuantity)
      : existingItem.totalStockQuantity;

    const newAvailableStock = updateData.availableStock !== undefined
      ? Number(updateData.availableStock)
      : existingItem.availableStock;

    if (newAvailableStock < 0 || newTotalStock < 0) {
      throw new ApiError('Stock values cannot be negative', 400);
    }

    if (newAvailableStock > newTotalStock) {
      throw new ApiError('Total Stock Quantity must be greater than or equal to Available Stock', 400);
    }

    updateData.totalStockQuantity = newTotalStock;
    updateData.availableStock = newAvailableStock;
    updateData.status = calculateInventoryStatus(newAvailableStock);
    updateData.updatedBy = adminId;

    return await InventoryRepository.updateById(id, updateData);
  }

  /**
   * Delete inventory item safely (soft delete)
   */
  async deleteInventory(id) {
    await this.getInventoryById(id);
    return await InventoryRepository.deleteById(id, false);
  }

  /**
   * Increase stock quantity
   */
  async increaseStock(id, amount, adminId) {
    const item = await this.getInventoryById(id);
    const qty = Number(amount);

    if (isNaN(qty) || qty <= 0) {
      throw new ApiError('Increase amount must be a positive number', 400);
    }

    const newAvailable = item.availableStock + qty;
    const newTotal = item.totalStockQuantity + qty;
    const newStatus = calculateInventoryStatus(newAvailable);

    return await InventoryRepository.updateById(id, {
      availableStock: newAvailable,
      totalStockQuantity: newTotal,
      status: newStatus,
      updatedBy: adminId,
    });
  }

  /**
   * Decrease stock quantity
   */
  async decreaseStock(id, amount, adminId) {
    const item = await this.getInventoryById(id);
    const qty = Number(amount);

    if (isNaN(qty) || qty <= 0) {
      throw new ApiError('Decrease amount must be a positive number', 400);
    }

    if (item.availableStock < qty) {
      throw new ApiError(
        `Stock Underflow: Cannot decrease stock by ${qty}. Current available stock is ${item.availableStock}.`,
        400
      );
    }

    const newAvailable = item.availableStock - qty;
    const newTotal = Math.max(0, item.totalStockQuantity - qty);
    const newStatus = calculateInventoryStatus(newAvailable);

    return await InventoryRepository.updateById(id, {
      availableStock: newAvailable,
      totalStockQuantity: newTotal,
      status: newStatus,
      updatedBy: adminId,
    });
  }

  /**
   * Update stock directly
   */
  async updateStockDirectly(id, stockData, adminId) {
    const item = await this.getInventoryById(id);

    const newTotalStock = stockData.totalStockQuantity !== undefined
      ? Number(stockData.totalStockQuantity)
      : item.totalStockQuantity;

    const newAvailableStock = stockData.availableStock !== undefined
      ? Number(stockData.availableStock)
      : item.availableStock;

    if (newAvailableStock < 0 || newTotalStock < 0) {
      throw new ApiError('Stock values cannot be negative', 400);
    }

    if (newAvailableStock > newTotalStock) {
      throw new ApiError('Total Stock Quantity must be greater than or equal to Available Stock', 400);
    }

    const newStatus = calculateInventoryStatus(newAvailableStock);

    return await InventoryRepository.updateById(id, {
      totalStockQuantity: newTotalStock,
      availableStock: newAvailableStock,
      status: newStatus,
      updatedBy: adminId,
    });
  }
}

export default new InventoryService();
