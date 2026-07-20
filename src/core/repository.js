import { ApiError as AppError } from '#common/ApiError.js';

/**
 * Base Repository class providing common Mongoose operations
 */
export class BaseRepository {
  /**
   * @param {import('mongoose').Model} model - The Mongoose Model
   */
  constructor(model) {
    this.model = model;
  }

  async create(data) {
    return await this.model.create(data);
  }

  async findById(id, populateOptions = null) {
    let query = this.model.findById(id).where({ deletedAt: null });
    if (populateOptions) {
      query = query.populate(populateOptions);
    }
    return await query.exec();
  }

  async findOne(filter, populateOptions = null) {
    let query = this.model.findOne({ ...filter, deletedAt: null });
    if (populateOptions) {
      query = query.populate(populateOptions);
    }
    return await query.exec();
  }

  async findMany(filter = {}, sort = '-createdAt', populateOptions = null) {
    let query = this.model.find({ ...filter, deletedAt: null }).sort(sort);
    if (populateOptions) {
      query = query.populate(populateOptions);
    }
    return await query.exec();
  }

  async updateById(id, updateData, session = null) {
    const options = { new: true, runValidators: true };
    if (session) options.session = session;

    const document = await this.model.findOneAndUpdate(
      { _id: id, deletedAt: null },
      updateData,
      options
    );

    if (!document) {
      throw new AppError('Document not found', 404);
    }
    return document;
  }

  async deleteById(id, hardDelete = false) {
    if (hardDelete) {
      const document = await this.model.findByIdAndDelete(id);
      if (!document) throw new AppError('Document not found', 404);
      return document;
    } else {
      // Soft Delete
      const document = await this.model.findOneAndUpdate(
        { _id: id, deletedAt: null },
        { deletedAt: new Date(), status: 'inactive' },
        { new: true }
      );
      if (!document) throw new AppError('Document not found', 404);
      return document;
    }
  }

  async countDocuments(filter = {}) {
    return await this.model.countDocuments({ ...filter, deletedAt: null });
  }

  /**
   * For use with APIFeatures
   */
  getBaseQuery() {
    return this.model.find({ deletedAt: null });
  }
}
