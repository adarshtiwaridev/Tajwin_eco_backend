import mongoose from 'mongoose';

const stockAllocationSchema = new mongoose.Schema(
  {
    allocationNumber: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    inventory: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Inventory',
      required: true,
      index: true,
    },
    warehouse: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Warehouse',
      default: null,
    },
    targetType: {
      type: String,
      enum: ['Dealer', 'Retailer', 'EndUser'],
      required: true,
    },
    targetEntityId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      index: true,
    },
    allocatedQuantity: {
      type: Number,
      required: true,
      min: [1, 'Allocated quantity must be at least 1'],
    },
    status: {
      type: String,
      enum: ['Pending', 'Approved', 'Rejected', 'Reallocated', 'Cancelled'],
      default: 'Pending',
      index: true,
    },
    remarks: {
      type: String,
      default: '',
    },
    allocatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    approvedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    rejectedReason: {
      type: String,
      default: '',
    },
  },
  { timestamps: true }
);

export const StockAllocation = mongoose.models.StockAllocation || mongoose.model('StockAllocation', stockAllocationSchema);
export default StockAllocation;
