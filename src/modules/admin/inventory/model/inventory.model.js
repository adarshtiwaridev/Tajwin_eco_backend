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
      index: true,
    },
    brand: {
      type: String,
      required: [true, 'Brand is required'],
      trim: true,
      index: true,
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
      index: true,
    },
    sku: {
      type: String,
      required: [true, 'SKU is required'],
      unique: true,
      uppercase: true,
      trim: true,
      index: true,
    },
    barcode: {
      type: String,
      trim: true,
      default: null,
      index: true,
    },
    serialNumber: {
      type: String,
      trim: true,
      default: null,
      sparse: true,
      index: true,
    },
    purchasePrice: {
      type: Number,
      default: 0,
      min: [0, 'Purchase price cannot be negative'],
    },
    sellingPrice: {
      type: Number,
      default: 0,
      min: [0, 'Selling price cannot be negative'],
    },
    warehouse: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Warehouse',
      default: null,
      index: true,
    },
    quantity: {
      type: Number,
      required: [true, 'Quantity is required'],
      min: [0, 'Quantity cannot be negative'],
      default: 0,
    },
    totalStockQuantity: {
      type: Number,
      min: [0, 'Total Stock Quantity cannot be negative'],
      default: 0,
    },
    availableQuantity: {
      type: Number,
      min: [0, 'Available Quantity cannot be negative'],
      default: 0,
    },
    availableStock: {
      type: Number,
      min: [0, 'Available Stock cannot be negative'],
      default: 0,
    },
    reservedQuantity: {
      type: Number,
      min: [0, 'Reserved Quantity cannot be negative'],
      default: 0,
    },
    allocatedQuantity: {
      type: Number,
      min: [0, 'Allocated Quantity cannot be negative'],
      default: 0,
    },
    returnedQuantity: {
      type: Number,
      min: [0, 'Returned Quantity cannot be negative'],
      default: 0,
    },
    damagedQuantity: {
      type: Number,
      min: [0, 'Damaged Quantity cannot be negative'],
      default: 0,
    },
    minimumStockLevel: {
      type: Number,
      default: 5,
      min: [0, 'Minimum stock level cannot be negative'],
    },
    maximumStockLevel: {
      type: Number,
      default: 1000,
      min: [0, 'Maximum stock level cannot be negative'],
    },
    status: {
      type: String,
      enum: ['In Stock', 'Low Stock', 'Out of Stock', 'Archived'],
      default: 'Out of Stock',
      index: true,
    },
    isArchived: {
      type: Boolean,
      default: false,
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

inventorySchema.pre('save', function (next) {
  if (this.totalStockQuantity === undefined || this.totalStockQuantity === 0) {
    this.totalStockQuantity = this.quantity || 0;
  }
  if (this.quantity === undefined || this.quantity === 0) {
    this.quantity = this.totalStockQuantity || 0;
  }
  if (this.availableStock === undefined || this.availableStock === 0) {
    this.availableStock = this.availableQuantity || 0;
  }
  if (this.availableQuantity === undefined || this.availableQuantity === 0) {
    this.availableQuantity = this.availableStock || 0;
  }

  if (this.isArchived) {
    this.status = 'Archived';
  } else {
    this.status = calculateInventoryStatus(this.availableQuantity, this.minimumStockLevel);
  }
  next();
});

const Inventory = mongoose.models.Inventory || mongoose.model('Inventory', inventorySchema);

export default Inventory;
