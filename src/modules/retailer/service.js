import { RetailerProfile } from './model.js';
import { EndUserProfile } from '#modules/enduser/model.js';
import { User, Role } from '#modules/auth/model.js';
import { ApiError as AppError } from '#common/ApiError.js';
import bcrypt from 'bcryptjs';

export class RetailerService {
  static async getRetailerProfile(userId) {
    const profile = await RetailerProfile.findOne({ userId }).populate('userId', 'name email mobile');
    if (!profile) throw new AppError('Retailer profile not found', 404);
    return profile;
  }

  static async updateRetailerProfile(retailerId, updateData) {
    const profile = await RetailerProfile.findByIdAndUpdate(retailerId, updateData, { new: true });
    return profile;
  }

  static async registerCustomer(retailerId, retailerUserId, data) {
    const existingUser = await User.findOne({ email: data.email });
    if (existingUser) {
      throw new AppError('Email is already registered', 400);
    }

    const endUserRole = await Role.findOne({ name: 'END_USER' });
    if (!endUserRole) {
      throw new AppError('END_USER role not found in the system', 500);
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(data.password, salt);

    const newUser = await User.create({
      name: data.name,
      email: data.email,
      mobile: data.mobile,
      password: hashedPassword,
      roleId: endUserRole._id,
      isActive: true,
      createdBy: retailerUserId,
    });

    const customer = await EndUserProfile.create({
      userId: newUser._id,
      retailerId: retailerId, // Link this customer to the retailer who registered them
      address: {
        street: data.address,
        city: data.city,
        state: data.state,
        zipCode: data.pincode,
      },
      status: 'ACTIVE',
      createdBy: retailerUserId,
    });

    return { user: newUser, profile: customer };
  }

  static async getCustomerList(retailerId, page = 1, limit = 10, status = null) {
    const query = { retailerId };
    if (status) query.status = status;

    const skip = (page - 1) * limit;
    const [data, total] = await Promise.all([
      EndUserProfile.find(query).populate('userId', 'name email mobile isActive').skip(skip).limit(parseInt(limit)).sort({ createdAt: -1 }),
      EndUserProfile.countDocuments(query)
    ]);

    return {
      data,
      meta: { total, page: parseInt(page), limit: parseInt(limit), totalPages: Math.ceil(total / limit) }
    };
  }

  static async searchCustomers(retailerId, searchQuery) {
    if (!searchQuery) return [];
    
    // Find users matching query first, then find their EndUserProfile linked to this retailer
    const regex = new RegExp(searchQuery, 'i');
    const users = await User.find({
      isDeleted: false,
      $or: [
        { name: regex },
        { email: regex },
        { mobile: regex }
      ]
    }).select('_id');

    const userIds = users.map(u => u._id);

    return await EndUserProfile.find({
      retailerId,
      userId: { $in: userIds }
    }).populate('userId', 'name email mobile isActive').limit(20);
  }

  static async getCustomerDetails(retailerId, customerId) {
    const customer = await EndUserProfile.findOne({ _id: customerId, retailerId }).populate('userId', 'name email mobile isActive avatar lastLogin');
    if (!customer) throw new AppError('Customer not found or unauthorized', 404);
    return customer;
  }

  static async updateCustomer(retailerId, customerId, updateData) {
    const customerProfile = await EndUserProfile.findOne({ _id: customerId, retailerId });
    if (!customerProfile) throw new AppError('Customer not found', 404);

    // Update User fields if provided
    const userUpdate = {};
    if (updateData.name) userUpdate.name = updateData.name;
    if (updateData.mobile) userUpdate.mobile = updateData.mobile;
    if (Object.keys(userUpdate).length > 0) {
      await User.findByIdAndUpdate(customerProfile.userId, userUpdate);
    }

    // Update Profile fields
    const profileUpdate = {};
    if (updateData.address) profileUpdate['address.street'] = updateData.address;
    if (updateData.city) profileUpdate['address.city'] = updateData.city;
    if (updateData.state) profileUpdate['address.state'] = updateData.state;
    if (updateData.pincode) profileUpdate['address.zipCode'] = updateData.pincode;
    if (updateData.status) profileUpdate.status = updateData.status;

    const updatedProfile = await EndUserProfile.findByIdAndUpdate(customerId, profileUpdate, { new: true }).populate('userId', 'name email mobile isActive');
    
    return updatedProfile;
  }

  static async getDashboardSummary(retailerId) {
    const [totalCustomers, activeCustomers, suspendedCustomers] = await Promise.all([
      EndUserProfile.countDocuments({ retailerId }),
      EndUserProfile.countDocuments({ retailerId, status: 'ACTIVE' }),
      EndUserProfile.countDocuments({ retailerId, status: 'SUSPENDED' }),
    ]);

    return { totalCustomers, activeCustomers, suspendedCustomers };
  }
}
