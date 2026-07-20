import mongoose from 'mongoose';
import { PRODUCT_STATUS, CONDITION_GRADE, STORAGE_TYPE, RAM_TYPE, STOCK_STATUS } from '../constants/product.constants.js';

const mediaSchema = new mongoose.Schema({
  secure_url: { type: String, required: true },
  public_id: { type: String, required: true },
  resource_type: { type: String },
  format: { type: String },
  width: { type: Number },
  height: { type: Number },
  bytes: { type: Number },
  duration: { type: Number }
}, { _id: false });

const productSchema = new mongoose.Schema(
  {
    // Basic Information
    name: {
      type: String,
      required: [true, 'Product name is required'],
      trim: true,
      maxlength: [200, 'Product name cannot exceed 200 characters'],
    },
    brand: {
      type: String,
      required: [true, 'Brand is required'],
      trim: true,
    },
    model: {
      type: String,
      required: [true, 'Model is required'],
      trim: true,
    },
    series: {
      type: String,
      trim: true,
    },
    sku: {
      type: String,
      required: [true, 'SKU is required'],
      unique: true,
      trim: true,
      uppercase: true,
    },
    category: {
      type: String,
      required: [true, 'Category is required'],
      trim: true,
    },
    shortDescription: {
      type: String,
      required: [true, 'Short description is required'],
      maxlength: [500, 'Short description cannot exceed 500 characters'],
    },
    fullDescription: {
      type: String,
      required: [true, 'Full description is required'],
    },

    // Images and Media
    featuredImage: {
      type: mediaSchema,
      required: [true, 'Featured image is required'],
    },
    images: [
      {
        type: mediaSchema,
      },
    ],
    video: {
      type: mediaSchema,
    },

    // Laptop Specifications
    processorBrand: {
      type: String,
      required: [true, 'Processor brand is required'],
    },
    processorModel: {
      type: String,
      required: [true, 'Processor model is required'],
    },
    generation: {
      type: String,
    },
    ramSize: {
      type: Number, // In GB
      required: [true, 'RAM size is required'],
      min: [1, 'RAM size must be at least 1GB'],
    },
    ramType: {
      type: String,
      enum: RAM_TYPE,
      required: [true, 'RAM type is required'],
    },
    storageCapacity: {
      type: Number, // In GB
      required: [true, 'Storage capacity is required'],
      min: [1, 'Storage capacity must be at least 1GB'],
    },
    storageType: {
      type: String,
      enum: STORAGE_TYPE,
      required: [true, 'Storage type is required'],
    },
    screenSize: {
      type: Number, // In inches
      required: [true, 'Screen size is required'],
    },
    resolution: {
      type: String,
      required: [true, 'Resolution is required'],
    },
    graphics: {
      type: String,
      required: [true, 'Graphics information is required'],
    },
    operatingSystem: {
      type: String,
      required: [true, 'Operating system is required'],
    },
    keyboardLayout: {
      type: String,
      default: 'QWERTY',
    },
    colour: {
      type: String,
    },
    webcam: {
      type: Boolean,
      default: true,
    },
    wifi: {
      type: String,
    },
    bluetooth: {
      type: String,
    },
    availablePorts: [
      {
        type: String,
      },
    ],
    batteryBackup: {
      type: String, // e.g., "up to 4 hours"
    },
    batteryHealth: {
      type: String, // e.g., "85%"
    },
    chargerIncluded: {
      type: Boolean,
      default: true,
    },
    chargerType: {
      type: String,
    },

    // Refurbishment Details
    conditionGrade: {
      type: String,
      enum: Object.values(CONDITION_GRADE),
      required: [true, 'Condition grade is required'],
    },
    cosmeticCondition: {
      type: String,
    },
    functionalCondition: {
      type: String,
    },
    refurbishmentNotes: {
      type: String,
    },
    testedAndCertified: {
      type: Boolean,
      default: true,
    },
    previousUsage: {
      type: String,
    },
    partsReplaced: [
      {
        type: String,
      },
    ],
    warranty: {
      type: String,
      required: [true, 'Warranty information is required'],
    },
    returnPolicy: {
      type: String,
    },

    // Pricing
    originalPrice: {
      type: Number,
      required: [true, 'Original price is required'],
      min: [0, 'Original price must be positive'],
    },
    sellingPrice: {
      type: Number,
      required: [true, 'Selling price is required'],
      min: [0, 'Selling price must be positive'],
    },
    discountPercentage: {
      type: Number,
      default: 0,
      min: [0, 'Discount cannot be negative'],
      max: [100, 'Discount cannot exceed 100%'],
    },
    gst: {
      type: Number,
      default: 0,
      min: [0, 'GST cannot be negative'],
    },
    stockQuantity: {
      type: Number,
      required: [true, 'Stock quantity is required'],
      min: [0, 'Stock cannot be negative'],
    },
    stockStatus: {
      type: String,
      enum: STOCK_STATUS,
      default: 'In Stock',
    },

    // Shipping
    weight: {
      type: Number, // In kg
    },
    packageDimensions: {
      length: Number,
      width: Number,
      height: Number,
    },
    shippingCharge: {
      type: Number,
      default: 0,
    },

    // SEO
    metaTitle: {
      type: String,
      maxlength: [100, 'Meta title cannot exceed 100 characters'],
    },
    metaDescription: {
      type: String,
      maxlength: [200, 'Meta description cannot exceed 200 characters'],
    },
    slug: {
      type: String,
      required: true,
      unique: true,
    },
    searchKeywords: [
      {
        type: String,
      },
    ],

    // Product Status
    status: {
      type: String,
      enum: Object.values(PRODUCT_STATUS),
      default: PRODUCT_STATUS.DRAFT,
    },

    // Tracking
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Admin',
      required: true,
    },
    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Admin',
    },
    deletedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Pre-save middleware to automatically calculate discount percentage and stock status
productSchema.pre('save', function (next) {
  if (this.isModified('originalPrice') || this.isModified('sellingPrice')) {
    if (this.originalPrice > this.sellingPrice) {
      this.discountPercentage = Math.round(
        ((this.originalPrice - this.sellingPrice) / this.originalPrice) * 100
      );
    } else {
      this.discountPercentage = 0;
    }
  }

  if (this.isModified('stockQuantity')) {
    if (this.stockQuantity === 0) {
      this.stockStatus = 'Out of Stock';
    } else if (this.stockQuantity > 0 && this.stockStatus === 'Out of Stock') {
      this.stockStatus = 'In Stock';
    }
  }

  next();
});

// Indexes for faster search and filtering
productSchema.index({ name: 'text', brand: 'text', model: 'text', searchKeywords: 'text' });
productSchema.index({ brand: 1 });
productSchema.index({ category: 1 });
productSchema.index({ status: 1 });
productSchema.index({ conditionGrade: 1 });
productSchema.index({ sellingPrice: 1 });

const Product = mongoose.model('Product', productSchema);

export default Product;
