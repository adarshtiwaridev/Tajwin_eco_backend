import mongoose from 'mongoose';
import { ORDER_STATUS, PAYMENT_STATUS, PAYMENT_METHOD, SHIPPING_STATUS } from '../constants/order.constants.js';

const orderItemSchema = new mongoose.Schema(
  {
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      default: null,
    },
    productName: {
      type: String,
      required: [true, 'Product Name is required'],
      trim: true,
    },
    sku: {
      type: String,
      required: [true, 'SKU is required'],
      uppercase: true,
      trim: true,
    },
    quantity: {
      type: Number,
      required: [true, 'Quantity is required'],
      min: [1, 'Quantity must be at least 1'],
    },
    price: {
      type: Number,
      required: [true, 'Price is required'],
      min: [0, 'Price cannot be negative'],
    },
    totalAmount: {
      type: Number,
      required: [true, 'Item total amount is required'],
      min: [0, 'Item total amount cannot be negative'],
    },
  },
  { _id: true }
);

const timelineEventSchema = new mongoose.Schema(
  {
    status: {
      type: String,
      required: true,
    },
    activity: {
      type: String,
      required: true,
    },
    message: {
      type: String,
      default: '',
    },
    timestamp: {
      type: Date,
      default: Date.now,
    },
    performedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
  },
  { _id: true }
);

const orderSchema = new mongoose.Schema(
  {
    orderId: {
      type: String,
      required: [true, 'Order ID is required'],
      unique: true,
      trim: true,
      uppercase: true,
      index: true,
    },
    customerInfo: {
      name: {
        type: String,
        required: [true, 'Customer Name is required'],
        trim: true,
      },
      mobile: {
        type: String,
        required: [true, 'Customer Mobile Number is required'],
        trim: true,
        index: true,
      },
      email: {
        type: String,
        required: [true, 'Customer Email Address is required'],
        trim: true,
        lowercase: true,
        index: true,
      },
      userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        default: null,
      },
    },
    shippingAddress: {
      address: {
        type: String,
        required: [true, 'Shipping Address is required'],
        trim: true,
      },
      city: {
        type: String,
        required: [true, 'City is required'],
        trim: true,
      },
      state: {
        type: String,
        required: [true, 'State is required'],
        trim: true,
      },
      pincode: {
        type: String,
        required: [true, 'Postal Code is required'],
        trim: true,
      },
    },
    items: {
      type: [orderItemSchema],
      validate: [
        function (val) {
          return Array.isArray(val) && val.length > 0;
        },
        'Order must contain at least one product item',
      ],
    },
    paymentInfo: {
      method: {
        type: String,
        enum: Object.values(PAYMENT_METHOD),
        required: [true, 'Payment method is required'],
      },
      status: {
        type: String,
        enum: Object.values(PAYMENT_STATUS),
        default: PAYMENT_STATUS.PENDING,
        index: true,
      },
      transactionId: {
        type: String,
        trim: true,
        default: '',
      },
      paymentDate: {
        type: Date,
        default: null,
      },
    },
    shippingInfo: {
      courierName: {
        type: String,
        trim: true,
        default: '',
      },
      trackingNumber: {
        type: String,
        trim: true,
        default: '',
      },
      dispatchDate: {
        type: Date,
        default: null,
      },
      estimatedDeliveryDate: {
        type: Date,
        default: null,
      },
      status: {
        type: String,
        enum: Object.values(SHIPPING_STATUS),
        default: SHIPPING_STATUS.PENDING,
        index: true,
      },
    },
    orderStatus: {
      type: String,
      enum: Object.values(ORDER_STATUS),
      default: ORDER_STATUS.PENDING,
      index: true,
    },
    pricing: {
      subtotal: {
        type: Number,
        required: true,
        min: 0,
      },
      tax: {
        type: Number,
        default: 0,
        min: 0,
      },
      shippingCharge: {
        type: Number,
        default: 0,
        min: 0,
      },
      discount: {
        type: Number,
        default: 0,
        min: 0,
      },
      totalAmount: {
        type: Number,
        required: true,
        min: 0,
      },
    },
    timeline: [timelineEventSchema],
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
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Search indexes
orderSchema.index({
  orderId: 'text',
  'customerInfo.name': 'text',
  'customerInfo.mobile': 'text',
  'customerInfo.email': 'text',
  'items.productName': 'text',
});

const Order = mongoose.models.Order || mongoose.model('Order', orderSchema);

export default Order;
