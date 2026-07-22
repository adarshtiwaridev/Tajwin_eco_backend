import { BaseRepository } from '#core/repository.js';
import Inventory from '../model/inventory.model.js';

class InventoryRepository extends BaseRepository {
  constructor() {
    super(Inventory);
  }

  /**
   * Find an active inventory item by SKU
   * @param {string} sku 
   * @returns {Promise<import('mongoose').Document|null>}
   */
  async findBySku(sku) {
    if (!sku) return null;
    return this.model.findOne({
      sku: sku.toUpperCase().trim(),
      deletedAt: null,
    });
  }

  /**
   * Get base query for Low Stock items
   * @returns {import('mongoose').Query}
   */
  getLowStockQuery() {
    return this.model.find({
      status: 'Low Stock',
      deletedAt: null,
    });
  }

  /**
   * Get base query for Out of Stock items
   * @returns {import('mongoose').Query}
   */
  getOutOfStockQuery() {
    return this.model.find({
      status: 'Out of Stock',
      deletedAt: null,
    });
  }
}

export default new InventoryRepository();
