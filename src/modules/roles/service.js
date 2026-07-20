import { RoleRepository } from './repository.js';
import { ApiError as AppError } from '#common/ApiError.js';
import { APIFeatures } from '#utils/apiFeatures.js';

export class RoleService {
  static async createRole(data) {
    const existing = await RoleRepository.findByName(data.name);
    if (existing) {
      throw new AppError('Role with this name already exists', 400);
    }
    return await RoleRepository.create(data);
  }

  static async getAllRoles(queryString) {
    const features = new APIFeatures(RoleRepository.getBaseQuery(), queryString)
      .filter()
      .search(['name', 'description'])
      .sort()
      .limitFields()
      .paginate();

    const roles = await features.query;
    
    // Calculate total for pagination metadata
    const countFeatures = new APIFeatures(RoleRepository.getBaseQuery(), queryString).filter().search(['name', 'description']);
    const total = await countFeatures.query.countDocuments();

    return { roles, total };
  }

  static async getRoleById(id) {
    const role = await RoleRepository.findById(id);
    if (!role) {
      throw new AppError('Role not found', 404);
    }
    return role;
  }

  static async updateRole(id, data) {
    if (data.name) {
      const existing = await RoleRepository.findByName(data.name);
      if (existing && existing._id.toString() !== id) {
        throw new AppError('Role with this name already exists', 400);
      }
    }
    return await RoleRepository.updateById(id, data);
  }

  static async deleteRole(id) {
    // We can use hardDelete = false for Soft Delete
    return await RoleRepository.deleteById(id, false);
  }
}
