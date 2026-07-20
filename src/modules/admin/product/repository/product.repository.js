import { BaseRepository } from '#core/repository.js';
import Product from '../model/product.model.js';
import { PRODUCT_STATUS } from '../constants/product.constants.js';

class ProductRepository extends BaseRepository {
  constructor() {
    super(Product);
  }

  async getDashboardStats() {
    const stats = await this.model.aggregate([
      { $match: { deletedAt: null } },
      {
        $facet: {
          totalProducts: [{ $count: 'count' }],
          activeProducts: [{ $match: { status: PRODUCT_STATUS.ACTIVE } }, { $count: 'count' }],
          draftProducts: [{ $match: { status: PRODUCT_STATUS.DRAFT } }, { $count: 'count' }],
          outOfStock: [{ $match: { stockQuantity: 0 } }, { $count: 'count' }],
          lowStock: [{ $match: { stockQuantity: { $gt: 0, $lte: 5 } } }, { $count: 'count' }],
        },
      },
    ]);

    const result = stats[0];
    return {
      totalProducts: result.totalProducts[0]?.count || 0,
      activeProducts: result.activeProducts[0]?.count || 0,
      draftProducts: result.draftProducts[0]?.count || 0,
      outOfStock: result.outOfStock[0]?.count || 0,
      lowStock: result.lowStock[0]?.count || 0,
    };
  }

  async getRecentlyAdded(limit = 5) {
    return this.model
      .find({ deletedAt: null })
      .sort({ createdAt: -1 })
      .limit(limit)
      .select('name sku brand category sellingPrice stockQuantity status images createdAt');
  }

  async bulkDelete(ids) {
    return this.model.updateMany(
      { _id: { $in: ids }, deletedAt: null },
      { $set: { deletedAt: new Date(), status: PRODUCT_STATUS.INACTIVE } }
    );
  }

  async bulkUpdateStatus(ids, status) {
    return this.model.updateMany(
      { _id: { $in: ids }, deletedAt: null },
      { $set: { status } }
    );
  }

  async findBySkuOrSlug(identifier) {
    return this.model.findOne({
      $or: [{ sku: identifier }, { slug: identifier }],
      deletedAt: null,
    });
  }
}

export default new ProductRepository();
