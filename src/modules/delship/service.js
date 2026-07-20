import { Delship } from './model.js';
import { RetailerProfile } from '#modules/retailer/model.js';
import { User, Role } from '#modules/auth/model.js';
import { ApiError as AppError } from '#common/ApiError.js';
import bcrypt from 'bcryptjs';

export class DelshipService {
  static async getDealershipProfile(userId) {
    const profile = await Delship.findOne({ createdBy: userId }).populate('createdBy', 'name email mobile');
    if (!profile) throw new AppError('Dealership profile not found', 404);
    return profile;
  }

  static async updateDealershipProfile(dealerId, updateData) {
    const profile = await Delship.findByIdAndUpdate(dealerId, updateData, { new: true });
    return profile;
  }

  static async createRetailer(dealerId, dealerUserId, data) {
    const existingUser = await User.findOne({ email: data.email });
    if (existingUser) {
      throw new AppError('Email is already registered', 400);
    }

    const retailerRole = await Role.findOne({ name: 'RETAILER' });
    if (!retailerRole) {
      throw new AppError('RETAILER role not found', 500);
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(data.password, salt);

    const newUser = await User.create({
      name: data.ownerName,
      email: data.email,
      mobile: data.phone,
      password: hashedPassword,
      roleId: retailerRole._id,
      isActive: true,
      createdBy: dealerUserId,
    });

    const retailer = await RetailerProfile.create({
      userId: newUser._id,
      dealershipId: dealerId,
      retailerCode: 'RET' + Date.now().toString().slice(-6),
      storeName: data.storeName,
      ownerName: data.ownerName,
      gstNumber: data.gstNumber,
      email: data.email,
      phone: data.phone,
      address: data.address || {},
      status: 'PENDING',
      verificationStatus: 'UNVERIFIED',
      createdBy: dealerUserId,
    });

    return { user: newUser, retailer };
  }

  static async getRetailerList(dealerId, page = 1, limit = 10, status = null) {
    const query = { dealershipId: dealerId };
    if (status) query.status = status;

    const skip = (page - 1) * limit;
    const [data, total] = await Promise.all([
      RetailerProfile.find(query).skip(skip).limit(parseInt(limit)).sort({ createdAt: -1 }),
      RetailerProfile.countDocuments(query)
    ]);

    return {
      data,
      meta: { total, page: parseInt(page), limit: parseInt(limit), totalPages: Math.ceil(total / limit) }
    };
  }

  static async getRetailerDetails(dealerId, retailerId) {
    const retailer = await RetailerProfile.findOne({ _id: retailerId, dealershipId: dealerId }).populate('userId', 'name email mobile isActive');
    if (!retailer) throw new AppError('Retailer not found or unauthorized', 404);
    return retailer;
  }

  static async updateRetailer(dealerId, retailerId, updateData) {
    const retailer = await RetailerProfile.findOneAndUpdate(
      { _id: retailerId, dealershipId: dealerId },
      updateData,
      { new: true }
    );
    if (!retailer) throw new AppError('Retailer not found', 404);
    return retailer;
  }

  static async updateRetailerStatus(dealerId, retailerId, status) {
    const retailer = await RetailerProfile.findOneAndUpdate(
      { _id: retailerId, dealershipId: dealerId },
      { status },
      { new: true }
    );
    if (!retailer) throw new AppError('Retailer not found', 404);
    return retailer;
  }

  static async verifyRetailer(dealerId, retailerId, verificationStatus) {
    const retailer = await RetailerProfile.findOneAndUpdate(
      { _id: retailerId, dealershipId: dealerId },
      { verificationStatus, status: verificationStatus === 'VERIFIED' ? 'ACTIVE' : 'PENDING' },
      { new: true }
    );
    if (!retailer) throw new AppError('Retailer not found', 404);
    return retailer;
  }

  static async deleteRetailer(dealerId, retailerId) {
    const retailer = await RetailerProfile.findOne({ _id: retailerId, dealershipId: dealerId });
    if (!retailer) throw new AppError('Retailer not found', 404);

    // Soft delete the user
    await User.findByIdAndUpdate(retailer.userId, { isDeleted: true, deletedAt: new Date(), isActive: false });
    
    // Update retailer profile status
    retailer.status = 'REJECTED'; // Or a specific deleted status if added to schema
    retailer.isActive = false;
    await retailer.save();

    return true;
  }

  static async getDashboardOverview(dealerId) {
    const [totalRetailers, activeRetailers, pendingRetailers] = await Promise.all([
      RetailerProfile.countDocuments({ dealershipId: dealerId }),
      RetailerProfile.countDocuments({ dealershipId: dealerId, status: 'ACTIVE' }),
      RetailerProfile.countDocuments({ dealershipId: dealerId, status: 'PENDING' }),
    ]);

    return { totalRetailers, activeRetailers, pendingRetailers };
  }
}
