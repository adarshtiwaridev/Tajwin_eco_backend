import mongoose from 'mongoose';

const documentSchema = new mongoose.Schema({
  docType: {
    type: String,
    enum: ['GST', 'PAN', 'ADDRESS_PROOF', 'BUSINESS_REGISTRATION'],
    required: true,
  },
  url: {
    type: String,
    required: true,
  },
  verified: {
    type: Boolean,
    default: false,
  }
}, { _id: false });

const delshipSchema = new mongoose.Schema(
  {
    businessName: {
      type: String,
      required: true,
      trim: true,
    },
    dealerCode: {
      type: String,
      unique: true,
      sparse: true,
    },
    gstNumber: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      uppercase: true,
    },
    panNumber: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      uppercase: true,
    },
    cin: {
      type: String,
      trim: true,
    },
    businessType: {
      type: String,
      enum: ['Proprietorship', 'Partnership', 'Private Limited', 'Public Limited', 'LLP'],
      default: 'Proprietorship',
    },
    ownerName: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    phone: {
      type: String,
      required: true,
    },
    alternatePhone: {
      type: String,
    },
    address: {
      street: { type: String, required: true },
      city: { type: String, required: true },
      district: { type: String },
      state: { type: String, required: true },
      zipCode: { type: String, required: true },
      country: { type: String, default: 'India' },
      location: {
        type: { type: String, enum: ['Point'], default: 'Point' },
        coordinates: { type: [Number], required: true }, // [longitude, latitude]
      },
    },
    bankDetails: {
      accountName: { type: String },
      accountNumber: { type: String },
      bankName: { type: String },
      ifscCode: { type: String },
      branch: { type: String },
    },
    logo: {
      type: String,
      default: '',
    },
    documents: [documentSchema],
    profileCompletion: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },
    status: {
      type: String,
      enum: ['pending', 'documents_submitted', 'under_review', 'approved', 'rejected', 'suspended', 'retired'],
      default: 'pending',
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    approvedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    approvedDate: {
      type: Date,
      default: null,
    },
    remarks: {
      type: String,
      default: '',
    },
    isDeleted: {
      type: Boolean,
      default: false,
    },
    deletedAt: {
      type: Date,
      default: null,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    }
  },
  {
    timestamps: true,
  }
);

// Indexes for fast lookups
delshipSchema.index({ status: 1 });
delshipSchema.index({ 'address.location': '2dsphere' });

export const Delship = mongoose.models.Delship || mongoose.model('Delship', delshipSchema);
