import OrderRepository from '../repository/order.repository.js';
import { ApiError } from '#common/ApiError.js';
import {
  ORDER_STATUS,
  PAYMENT_STATUS,
  SHIPPING_STATUS,
  ALLOWED_STATUS_TRANSITIONS,
} from '../constants/order.constants.js';

class OrderService {
  /**
   * Helper to generate a clean, unique Order ID
   */
  generateOrderId() {
    const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    const randomDigits = Math.floor(1000 + Math.random() * 9000);
    return `ORD-${dateStr}-${randomDigits}`;
  }

  /**
   * Create a new Order
   * @param {Object} orderData 
   * @param {string} adminId 
   */
  async createOrder(orderData, adminId) {
    // 1. Verify items array
    if (!Array.isArray(orderData.items) || orderData.items.length === 0) {
      throw new ApiError('Order must contain at least one product item', 400);
    }

    // 2. Format items & calculate item total amounts
    let calculatedSubtotal = 0;
    const formattedItems = orderData.items.map((item) => {
      const qty = Number(item.quantity);
      const price = Number(item.price);

      if (isNaN(qty) || qty <= 0) {
        throw new ApiError(`Invalid quantity for product ${item.productName || item.sku}`, 400);
      }
      if (isNaN(price) || price < 0) {
        throw new ApiError(`Invalid price for product ${item.productName || item.sku}`, 400);
      }

      const totalAmount = qty * price;
      calculatedSubtotal += totalAmount;

      return {
        productId: item.productId || null,
        productName: item.productName,
        sku: (item.sku || '').toUpperCase(),
        quantity: qty,
        price: price,
        totalAmount: totalAmount,
      };
    });

    // 3. Calculate pricing breakdown
    const tax = Number(orderData.pricing?.tax || orderData.tax || 0);
    const shippingCharge = Number(orderData.pricing?.shippingCharge || orderData.shippingCharge || 0);
    const discount = Number(orderData.pricing?.discount || orderData.discount || 0);
    const subtotal = calculatedSubtotal;
    const totalAmount = subtotal + tax + shippingCharge - discount;

    if (totalAmount < 0) {
      throw new ApiError('Order total amount cannot be negative after discount', 400);
    }

    const orderId = orderData.orderId ? orderData.orderId.toUpperCase() : this.generateOrderId();

    // Check if orderId already exists
    const existingOrder = await OrderRepository.findByOrderIdOrId(orderId);
    if (existingOrder) {
      throw new ApiError(`Order ID ${orderId} already exists`, 400);
    }

    const initialStatus = orderData.orderStatus || ORDER_STATUS.PENDING;

    // Build timeline entry
    const initialTimeline = [
      {
        status: initialStatus,
        activity: 'Order Created',
        message: 'Order created in the system by Admin',
        timestamp: new Date(),
        performedBy: adminId || null,
      },
    ];

    const payload = {
      orderId,
      customerInfo: {
        name: orderData.customerInfo.name,
        mobile: orderData.customerInfo.mobile,
        email: orderData.customerInfo.email,
        userId: orderData.customerInfo.userId || null,
      },
      shippingAddress: {
        address: orderData.shippingAddress.address,
        city: orderData.shippingAddress.city,
        state: orderData.shippingAddress.state,
        pincode: orderData.shippingAddress.pincode,
      },
      items: formattedItems,
      paymentInfo: {
        method: orderData.paymentInfo.method,
        status: orderData.paymentInfo.status || PAYMENT_STATUS.PENDING,
        transactionId: orderData.paymentInfo.transactionId || '',
        paymentDate: orderData.paymentInfo.status === PAYMENT_STATUS.PAID ? new Date() : null,
      },
      shippingInfo: {
        courierName: orderData.shippingInfo?.courierName || '',
        trackingNumber: orderData.shippingInfo?.trackingNumber || '',
        dispatchDate: orderData.shippingInfo?.dispatchDate || null,
        estimatedDeliveryDate: orderData.shippingInfo?.estimatedDeliveryDate || null,
        status: orderData.shippingInfo?.status || SHIPPING_STATUS.PENDING,
      },
      orderStatus: initialStatus,
      pricing: {
        subtotal,
        tax,
        shippingCharge,
        discount,
        totalAmount,
      },
      timeline: initialTimeline,
      createdBy: adminId || null,
    };

    return await OrderRepository.create(payload);
  }

  /**
   * Get all orders with pagination, search, sorting, and filters
   */
  async getAllOrders(queryParams) {
    return await OrderRepository.findAllOrders(queryParams);
  }

  /**
   * Get order by ID or Order ID string
   */
  async getOrderById(identifier) {
    const order = await OrderRepository.findByOrderIdOrId(identifier);
    if (!order) {
      throw new ApiError(`Order with ID '${identifier}' not found`, 404);
    }
    return order;
  }

  /**
   * Update full order details
   */
  async updateOrder(identifier, updateData, adminId) {
    const order = await this.getOrderById(identifier);

    // If items or pricing updated, recalculate total
    if (updateData.items || updateData.pricing || updateData.tax || updateData.shippingCharge || updateData.discount) {
      const itemsToProcess = updateData.items || order.items;
      let subtotal = 0;

      const formattedItems = itemsToProcess.map((item) => {
        const qty = Number(item.quantity);
        const price = Number(item.price);
        const totalAmount = qty * price;
        subtotal += totalAmount;
        return {
          productId: item.productId || null,
          productName: item.productName,
          sku: (item.sku || '').toUpperCase(),
          quantity: qty,
          price: price,
          totalAmount: totalAmount,
        };
      });

      const tax = Number(updateData.pricing?.tax ?? updateData.tax ?? order.pricing.tax);
      const shippingCharge = Number(
        updateData.pricing?.shippingCharge ?? updateData.shippingCharge ?? order.pricing.shippingCharge
      );
      const discount = Number(
        updateData.pricing?.discount ?? updateData.discount ?? order.pricing.discount
      );
      const totalAmount = subtotal + tax + shippingCharge - discount;

      updateData.items = formattedItems;
      updateData.pricing = { subtotal, tax, shippingCharge, discount, totalAmount };
    }

    updateData.updatedBy = adminId;

    const updatedOrder = await OrderRepository.updateById(order._id, updateData);

    // Push timeline
    await OrderRepository.addTimelineEvent(order._id, {
      status: updatedOrder.orderStatus,
      activity: 'Order Updated',
      message: 'Order information updated by Admin',
      timestamp: new Date(),
      performedBy: adminId || null,
    });

    return updatedOrder;
  }

  /**
   * Delete order (Soft Delete)
   */
  async deleteOrder(identifier) {
    const order = await this.getOrderById(identifier);
    return await OrderRepository.deleteById(order._id);
  }

  /**
   * Update Order Status with transition validation
   */
  async updateOrderStatus(identifier, newStatus, remarks, adminId) {
    const order = await this.getOrderById(identifier);
    const currentStatus = order.orderStatus;

    if (currentStatus === newStatus) {
      return order;
    }

    // State transition rule check
    const allowedNextStatuses = ALLOWED_STATUS_TRANSITIONS[currentStatus] || [];
    if (!allowedNextStatuses.includes(newStatus)) {
      throw new ApiError(
        `Invalid status transition from '${currentStatus}' to '${newStatus}'. Allowed transitions: [${allowedNextStatuses.join(', ')}]`,
        400
      );
    }

    const updateFields = {
      orderStatus: newStatus,
      updatedBy: adminId,
    };

    // Auto-sync shipping status if applicable
    if (
      [
        ORDER_STATUS.PACKED,
        ORDER_STATUS.SHIPPED,
        ORDER_STATUS.OUT_FOR_DELIVERY,
        ORDER_STATUS.DELIVERED,
      ].includes(newStatus)
    ) {
      updateFields['shippingInfo.status'] = newStatus;
    }

    const updatedOrder = await OrderRepository.updateById(order._id, updateFields);

    // Record timeline activity
    const message = remarks || `Order status updated from ${currentStatus} to ${newStatus}`;
    await OrderRepository.addTimelineEvent(order._id, {
      status: newStatus,
      activity: `Status Changed to ${newStatus}`,
      message,
      timestamp: new Date(),
      performedBy: adminId || null,
    });

    return updatedOrder;
  }

  /**
   * Update Payment Details and Status
   */
  async updatePaymentStatus(identifier, paymentData, adminId) {
    const order = await this.getOrderById(identifier);

    const updateFields = {
      updatedBy: adminId,
    };

    if (paymentData.status) {
      updateFields['paymentInfo.status'] = paymentData.status;
      if (paymentData.status === PAYMENT_STATUS.PAID) {
        updateFields['paymentInfo.paymentDate'] = paymentData.paymentDate || new Date();
      }
    }
    if (paymentData.method) {
      updateFields['paymentInfo.method'] = paymentData.method;
    }
    if (paymentData.transactionId !== undefined) {
      updateFields['paymentInfo.transactionId'] = paymentData.transactionId;
    }

    const updatedOrder = await OrderRepository.updateById(order._id, updateFields);

    const activityMsg = `Payment status updated to ${paymentData.status || order.paymentInfo.status}`;
    await OrderRepository.addTimelineEvent(order._id, {
      status: updatedOrder.orderStatus,
      activity: 'Payment Updated',
      message: paymentData.remarks || activityMsg,
      timestamp: new Date(),
      performedBy: adminId || null,
    });

    return updatedOrder;
  }

  /**
   * Update Shipping Details and Status
   */
  async updateShippingInfo(identifier, shippingData, adminId) {
    const order = await this.getOrderById(identifier);

    const updateFields = {
      updatedBy: adminId,
    };

    if (shippingData.courierName !== undefined) {
      updateFields['shippingInfo.courierName'] = shippingData.courierName;
    }
    if (shippingData.trackingNumber !== undefined) {
      updateFields['shippingInfo.trackingNumber'] = shippingData.trackingNumber;
    }
    if (shippingData.dispatchDate !== undefined) {
      updateFields['shippingInfo.dispatchDate'] = shippingData.dispatchDate;
    }
    if (shippingData.estimatedDeliveryDate !== undefined) {
      updateFields['shippingInfo.estimatedDeliveryDate'] = shippingData.estimatedDeliveryDate;
    }
    if (shippingData.status !== undefined) {
      updateFields['shippingInfo.status'] = shippingData.status;
    }

    const updatedOrder = await OrderRepository.updateById(order._id, updateFields);

    const activityMsg = `Shipping info updated (Courier: ${shippingData.courierName || order.shippingInfo.courierName}, Tracking: ${shippingData.trackingNumber || order.shippingInfo.trackingNumber})`;
    await OrderRepository.addTimelineEvent(order._id, {
      status: updatedOrder.orderStatus,
      activity: 'Shipping Details Updated',
      message: shippingData.remarks || activityMsg,
      timestamp: new Date(),
      performedBy: adminId || null,
    });

    return updatedOrder;
  }

  /**
   * Get Dashboard Statistics
   */
  async getDashboardStats() {
    return await OrderRepository.getDashboardStatistics();
  }

  /**
   * Generate Invoice Data Payload
   */
  async generateInvoice(identifier) {
    const order = await this.getOrderById(identifier);

    return {
      invoiceNumber: `INV-${order.orderId}`,
      invoiceDate: order.createdAt,
      companyInfo: {
        name: 'Tajwin Refurbished Laptops Marketplace',
        address: '101 Tech Hub, Cyber City, Mumbai, Maharashtra - 400001',
        email: 'billing@tajwin.com',
        phone: '+91 98765 43210',
        gstin: '27AAAAA0000A1Z5',
        website: 'https://tajwin.com',
      },
      customerInfo: order.customerInfo,
      shippingAddress: order.shippingAddress,
      orderInfo: {
        orderId: order.orderId,
        orderDate: order.createdAt,
        orderStatus: order.orderStatus,
      },
      paymentInfo: order.paymentInfo,
      items: order.items,
      taxSummary: {
        subtotal: order.pricing.subtotal,
        tax: order.pricing.tax,
        shippingCharge: order.pricing.shippingCharge,
        discount: order.pricing.discount,
        grandTotal: order.pricing.totalAmount,
      },
    };
  }

  /**
   * Get Order Timeline
   */
  async getOrderTimeline(identifier) {
    const order = await this.getOrderById(identifier);
    return {
      orderId: order.orderId,
      currentStatus: order.orderStatus,
      timeline: order.timeline.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp)),
    };
  }
}

export default new OrderService();
