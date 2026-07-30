import mongoose from 'mongoose';

export const MovementTypeEnum = [
  'Stock Added',
  'Stock Updated',
  'Warehouse Transfer',
  'Dealer Allocation',
  'Retailer Transfer',
  'Customer Delivery',
  'Return',
  'Replacement',
  'Adjustment',
  'Damage',
  'Lost',
  'Stock Correction',
];

const inventoryMovementSchema = new mongoose.Schema(
  {
    movementId: {
      type: String,
      required: true,
      unique: true,
    },
    inventory: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Inventory',
      required: true,
      index: true,
    },
    movementType: {
      type: String,
      enum: MovementTypeEnum,
      required: true,
      index: true,
    },
    quantity: {
      type: Number,
      required: true,
    },
    sourceWarehouse: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Warehouse',
      default: null,
    },
    destinationWarehouse: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Warehouse',
      default: null,
    },
    dealerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Delship',
      default: null,
    },
    retailerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'RetailerProfile',
      default: null,
    },
    customerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    previousStock: {
      type: Number,
      default: 0,
    },
    newStock: {
      type: Number,
      default: 0,
    },
    performedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    referenceId: {
      type: String,
      default: '',
    },
    remarks: {
      type: String,
      default: '',
    },
  },
  { timestamps: true }
);

export const InventoryMovement = mongoose.models.InventoryMovement || mongoose.model('InventoryMovement', inventoryMovementSchema);
export default InventoryMovement;
