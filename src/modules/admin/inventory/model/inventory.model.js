import mongoose from 'mongoose';

/**
 * Calculates status based on available stock quantity
 * @param {number} availableStock 
 * @param {number} [lowStockThreshold=5] 
 * @returns {'Out of Stock' | 'Low Stock' | 'In Stock'}
 */
export const calculateInventoryStatus = (availableStock, lowStockThreshold = 5) => {
  const stock = Number(availableStock) || 0;
  if (stock <= 0) {
    return 'Out of Stock';
  }
  if (stock <= lowStockThreshold) {
    return 'Low Stock';
  }
  return 'In Stock';
};

const inventorySchema = new mongoose.Schema(
  {
    productName: {
      type: String,
      required: [true, 'Product Name is required'],
      trim: true,
    },
    brand: {
      type: String,
      required: [true, 'Brand is required'],
      trim: true,
    },
    model: {
      type: String,
      trim: true,
      default: '',
    },
    category: {
      type: String,
      required: [true, 'Category is required'],
      trim: true,
    },
    sku: {
      type: String,
      required: [true, 'SKU is required'],
      unique: true,
      uppercase: true,
      trim: true,
      index: true,
    },
    serialNumber: {
      type: String,
      trim: true,
      default: null,
    },
    totalStockQuantity: {
      type: Number,
      required: [true, 'Total Stock Quantity is required'],
      min: [0, 'Total Stock Quantity cannot be negative'],
      default: 0,
    },
    availableStock: {
      type: Number,
      required: [true, 'Available Stock is required'],
      min: [0, 'Available Stock cannot be negative'],
      default: 0,
    },
    status: {
      type: String,
      enum: ['In Stock', 'Low Stock', 'Out of Stock'],
      default: 'Out of Stock',
      index: true,
    },
    remarks: {
      type: String,
      trim: true,
      default: '',
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    deletedAt: {
      type: Date,
      default: null,
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

// Middleware pre-save: Ensure status is in sync & stock invariants hold
inventorySchema.pre('save', function (next) {
  if (this.availableStock > this.totalStockQuantity) {
    return next(new Error('Total Stock Quantity must be greater than or equal to Available Stock'));
  }
  this.status = calculateInventoryStatus(this.availableStock);
  next();
});

const Inventory = mongoose.model('Inventory', inventorySchema);

export default Inventory;
