import { RetailerProfile } from './model.js';
import { User, Role } from '#modules/auth/model.js';
import mongoose from 'mongoose';
import { ApiError as AppError } from '#common/ApiError.js';

export class RetailerRepository {
  static async createRetailer(userData, profileData) {
    const session = await mongoose.startSession();
    session.startTransaction();
    
    try {
      const role = await Role.findOne({ name: 'RETAILER' }).session(session);
      if (!role) {
        throw new AppError('RETAILER role does not exist', 500);
      }

      const newUser = await User.create([{
        ...userData,
        roleId: role._id,
      }], { session });

      const newProfile = await RetailerProfile.create([{
        ...profileData,
        userId: newUser[0]._id,
      }], { session });

      await session.commitTransaction();
      return newProfile[0];
    } catch (error) {
      await session.abortTransaction();
      throw error;
    } finally {
      session.endSession();
    }
  }

  static async findByDealership(dealershipId, query = {}) {
    const filter = { dealershipId, ...query };
    return RetailerProfile.find(filter).populate('userId', 'name email');
  }

  static async updateStatus(retailerId, status, dealershipId) {
    // Only update if it belongs to the dealership
    return RetailerProfile.findOneAndUpdate(
      { _id: retailerId, dealershipId },
      { status },
      { new: true }
    ).populate('userId', 'name email');
  }
}
