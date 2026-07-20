import mongoose from 'mongoose';

const retailerProfileSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
    },
    dealershipId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Delship',
      required: true,
    },
    retailerCode: {
      type: String,
      unique: true,
      sparse: true,
    },
    storeName: {
      type: String,
      required: true,
      trim: true,
    },
    ownerName: {
      type: String,
      required: true,
      trim: true,
    },
    gstNumber: {
      type: String,
      trim: true,
      uppercase: true,
    },
    email: {
      type: String,
      lowercase: true,
      trim: true,
    },
    phone: {
      type: String,
      required: true,
    },
    address: {
      street: String,
      city: String,
      state: String,
      zip: String,
    },
    status: {
      type: String,
      enum: ['PENDING', 'VERIFIED', 'ACTIVE', 'SUSPENDED', 'REJECTED'],
      default: 'PENDING',
    },
    verificationStatus: {
      type: String,
      enum: ['UNVERIFIED', 'VERIFIED'],
      default: 'UNVERIFIED',
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User', // The dealership user who created this retailer
      required: true,
    },
    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    }
  },
  { timestamps: true }
);

export const RetailerProfile = mongoose.models.RetailerProfile || mongoose.model('RetailerProfile', retailerProfileSchema);
