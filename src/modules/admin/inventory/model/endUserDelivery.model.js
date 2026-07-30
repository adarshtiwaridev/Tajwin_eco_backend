import mongoose from 'mongoose';

const endUserDeliverySchema = new mongoose.Schema(
  {
    deliveryId: {
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
    serialNumber: {
      type: String,
      default: '',
      index: true,
    },
    customerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    status: {
      type: String,
      enum: ['Pending', 'In Transit', 'Delivered', 'Returned', 'Replaced', 'Cancelled'],
      default: 'Pending',
      index: true,
    },
    warrantyStartDate: {
      type: Date,
      default: Date.now,
    },
    warrantyEndDate: {
      type: Date,
      default: () => new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
    },
    deliveredAt: {
      type: Date,
      default: null,
    },
    deliveredBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    remarks: {
      type: String,
      default: '',
    },
  },
  { timestamps: true }
);

export const EndUserDelivery = mongoose.models.EndUserDelivery || mongoose.model('EndUserDelivery', endUserDeliverySchema);
export default EndUserDelivery;
