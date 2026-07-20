import { Delship } from '#modules/delship/model.js';
import { User, Role } from '#modules/auth/model.js';
import { ApiError as AppError } from '#common/ApiError.js';
import bcrypt from 'bcryptjs';

export class AdminService {
  static async createDealership(adminId, data) {
    const existingUser = await User.findOne({ email: data.email });
    if (existingUser) {
      throw new AppError('Email is already registered', 400);
    }

    const dealerRole = await Role.findOne({ name: 'DEALERSHIP' });
    if (!dealerRole) {
      throw new AppError('DEALERSHIP role not found', 500);
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(data.password, salt);

    const newUser = await User.create({
      name: data.businessName,
      email: data.email,
      mobile: data.phone,
      password: hashedPassword,
      roleId: dealerRole._id,
      isActive: true,
      createdBy: adminId,
    });

    const dealership = await Delship.create({
      businessName: data.businessName,
      ownerName: data.businessName, // Can be updated by dealer
      email: data.email,
      phone: data.phone,
      gstNumber: 'PENDING_GST_' + Date.now(), // Placeholder until filled
      panNumber: 'PENDING_PAN_' + Date.now(),
      address: {
        street: 'Pending',
        city: 'Pending',
        state: 'Pending',
        zipCode: '000000',
        location: { type: 'Point', coordinates: [0, 0] }
      },
      createdBy: newUser._id, // Linked to the dealer user
      status: 'pending'
    });

    return { user: newUser, dealership };
  }

  static async getDealershipList(page = 1, limit = 10, status = null) {
    const query = { isDeleted: false };
    if (status) query.status = status;

    const skip = (page - 1) * limit;
    const [data, total] = await Promise.all([
      Delship.find(query).skip(skip).limit(parseInt(limit)).sort({ createdAt: -1 }),
      Delship.countDocuments(query)
    ]);

    return {
      data,
      meta: { total, page: parseInt(page), limit: parseInt(limit), totalPages: Math.ceil(total / limit) }
    };
  }

  static async searchDealerships(searchQuery) {
    if (!searchQuery) return [];
    const regex = new RegExp(searchQuery, 'i');
    return await Delship.find({
      isDeleted: false,
      $or: [
        { businessName: regex },
        { email: regex },
        { phone: regex },
        { dealerCode: regex }
      ]
    }).limit(20);
  }

  static async getDealershipDetails(id) {
    const dealership = await Delship.findById(id).populate('createdBy', 'name email mobile isActive');
    if (!dealership) throw new AppError('Dealership not found', 404);
    return dealership;
  }

  static async updateDealershipStatus(id, status, remarks, adminId) {
    const dealership = await Delship.findById(id);
    if (!dealership) throw new AppError('Dealership not found', 404);

    dealership.status = status;
    if (remarks) dealership.remarks = remarks;
    if (status === 'approved') {
      dealership.approvedBy = adminId;
      dealership.approvedDate = new Date();
      if (!dealership.dealerCode) {
        dealership.dealerCode = 'DLR' + Date.now().toString().slice(-6);
      }
    }

    await dealership.save();
    return dealership;
  }

  static async verifyDocument(id, documentId, verified) {
    const dealership = await Delship.findById(id);
    if (!dealership) throw new AppError('Dealership not found', 404);

    const doc = dealership.documents.id(documentId);
    if (!doc) throw new AppError('Document not found', 404);

    doc.verified = verified;
    await dealership.save();
    return dealership;
  }

  static async getDashboardStatistics() {
    const [totalDealerships, pendingDealerships, approvedDealerships, suspendedDealerships] = await Promise.all([
      Delship.countDocuments({ isDeleted: false }),
      Delship.countDocuments({ isDeleted: false, status: 'pending' }),
      Delship.countDocuments({ isDeleted: false, status: 'approved' }),
      Delship.countDocuments({ isDeleted: false, status: 'suspended' }),
    ]);

    return { totalDealerships, pendingDealerships, approvedDealerships, suspendedDealerships };
  }
}
