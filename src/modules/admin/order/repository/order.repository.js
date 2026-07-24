import mongoose from 'mongoose';
import { BaseRepository } from '#core/repository.js';
import Order from '../model/order.model.js';
import { ORDER_STATUS, PAYMENT_STATUS } from '../constants/order.constants.js';

class OrderRepository extends BaseRepository {
  constructor() {
    super(Order);
  }

  /**
   * Find an active order by Order ID or Mongoose ObjectId
   * @param {string} identifier 
   * @returns {Promise<import('mongoose').Document|null>}
   */
  async findByOrderIdOrId(identifier) {
    if (!identifier) return null;
    const filter = { deletedAt: null };

    if (mongoose.Types.ObjectId.isValid(identifier)) {
      filter.$or = [{ _id: identifier }, { orderId: identifier.toUpperCase() }];
    } else {
      filter.orderId = identifier.toUpperCase();
    }

    return await this.model.findOne(filter);
  }

  /**
   * Find orders with detailed filters, search, sorting, and pagination
   * @param {Object} queryParams 
   * @returns {Promise<{ orders: Array, meta: Object }>}
   */
  async findAllOrders(queryParams = {}) {
    const {
      page = 1,
      limit = 10,
      search,
      orderStatus,
      paymentStatus,
      shippingStatus,
      paymentMethod,
      startDate,
      endDate,
      sort = '-createdAt',
    } = queryParams;

    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const limitNum = Math.max(1, parseInt(limit, 10) || 10);
    const skip = (pageNum - 1) * limitNum;

    const filter = { deletedAt: null };

    // Search by Order ID, Customer Name, Mobile Number, Product Name
    if (search && search.trim()) {
      const searchRegex = new RegExp(search.trim(), 'i');
      filter.$or = [
        { orderId: searchRegex },
        { 'customerInfo.name': searchRegex },
        { 'customerInfo.mobile': searchRegex },
        { 'customerInfo.email': searchRegex },
        { 'items.productName': searchRegex },
        { 'items.sku': searchRegex },
      ];
    }

    // Exact match filters
    if (orderStatus) {
      filter.orderStatus = orderStatus;
    }
    if (paymentStatus) {
      filter['paymentInfo.status'] = paymentStatus;
    }
    if (shippingStatus) {
      filter['shippingInfo.status'] = shippingStatus;
    }
    if (paymentMethod) {
      filter['paymentInfo.method'] = paymentMethod;
    }

    // Date range filter
    if (startDate || endDate) {
      filter.createdAt = {};
      if (startDate) {
        filter.createdAt.$gte = new Date(startDate);
      }
      if (endDate) {
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        filter.createdAt.$lte = end;
      }
    }

    // Format sort
    const sortBy = sort.split(',').join(' ');

    const [orders, total] = await Promise.all([
      this.model
        .find(filter)
        .sort(sortBy)
        .skip(skip)
        .limit(limitNum)
        .lean(),
      this.model.countDocuments(filter),
    ]);

    const totalPages = Math.ceil(total / limitNum);

    return {
      orders,
      meta: {
        total,
        page: pageNum,
        limit: limitNum,
        totalPages,
        hasNextPage: pageNum < totalPages,
        hasPrevPage: pageNum > 1,
      },
    };
  }

  /**
   * Get complete order dashboard statistics
   * @returns {Promise<Object>}
   */
  async getDashboardStatistics() {
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);

    const [
      totalOrders,
      todayOrders,
      statusCounts,
      revenueResult,
      recentOrders,
    ] = await Promise.all([
      // 1. Total Orders
      this.model.countDocuments({ deletedAt: null }),

      // 2. Today's Orders
      this.model.countDocuments({ deletedAt: null, createdAt: { $gte: todayStart } }),

      // 3. Count by Status
      this.model.aggregate([
        { $match: { deletedAt: null } },
        { $group: { _id: '$orderStatus', count: { $sum: 1 } } },
      ]),

      // 4. Total Revenue (Paid orders or non-cancelled orders)
      this.model.aggregate([
        {
          $match: {
            deletedAt: null,
            orderStatus: { $ne: ORDER_STATUS.CANCELLED },
            'paymentInfo.status': PAYMENT_STATUS.PAID,
          },
        },
        { $group: { _id: null, totalRevenue: { $sum: '$pricing.totalAmount' } } },
      ]),

      // 5. Recent 5 Orders for quick preview
      this.model
        .find({ deletedAt: null })
        .sort('-createdAt')
        .limit(5)
        .select('orderId customerInfo.name pricing.totalAmount orderStatus paymentInfo.status createdAt')
        .lean(),
    ]);

    // Map status counts
    const statusSummary = {
      pending: 0,
      confirmed: 0,
      processing: 0,
      packed: 0,
      shipped: 0,
      delivered: 0,
      cancelled: 0,
    };

    statusCounts.forEach((item) => {
      const key = item._id ? item._id.toLowerCase().replace(/\s+/g, '') : null;
      if (key && statusSummary[key] !== undefined) {
        statusSummary[key] = item.count;
      }
    });

    const totalRevenue = revenueResult.length > 0 ? revenueResult[0].totalRevenue : 0;

    return {
      totalOrders,
      todayOrders,
      statusSummary: {
        pending: statusSummary.pending,
        confirmed: statusSummary.confirmed,
        processing: statusSummary.processing,
        packed: statusSummary.packed,
        shipped: statusSummary.shipped,
        delivered: statusSummary.delivered,
        cancelled: statusSummary.cancelled,
      },
      totalRevenue,
      recentOrders,
    };
  }

  /**
   * Add audit event to order timeline
   * @param {string} id 
   * @param {Object} timelineEvent 
   */
  async addTimelineEvent(id, timelineEvent) {
    return await this.model.findByIdAndUpdate(
      id,
      { $push: { timeline: timelineEvent } },
      { new: true, runValidators: true }
    );
  }
}

export default new OrderRepository();
