import mongoose from 'mongoose';

const endUserProfileSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
    },
    retailerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'RetailerProfile',
      default: null, // Null if registered publicly, set if created by retailer
    },
    address: {
      street: String,
      city: String,
      state: String,
      zipCode: String,
    },
    status: {
      type: String,
      enum: ['ACTIVE', 'SUSPENDED'],
      default: 'ACTIVE',
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    }
  },
  { timestamps: true }
);

export const EndUserProfile = mongoose.models.EndUserProfile || mongoose.model('EndUserProfile', endUserProfileSchema);
