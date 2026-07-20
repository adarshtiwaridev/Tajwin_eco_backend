import { User, Role } from '#modules/auth/model.js';
// Note: We'll import other models (Order, Product, etc.) once they are created. 
// For now, we stub the data that would come from those models.

export class DashboardService {
  static async getStatistics() {
    const totalUsers = await User.countDocuments({ isDeleted: false });
    const activeRoles = await Role.countDocuments();
    
    // Stubbed statistics for modules that don't exist yet
    const totalOrders = 1250;
    const totalRevenue = 450000;
    const totalProducts = 340;
    
    return {
      users: totalUsers,
      roles: activeRoles,
      orders: totalOrders,
      revenue: totalRevenue,
      products: totalProducts,
    };
  }

  static async getRecentActivities() {
    // Stubbed recent activities
    return [
      { id: 1, action: 'User Registration', description: 'New user joined the platform', date: new Date() },
      { id: 2, action: 'Order Placed', description: 'Order #1002 was placed successfully', date: new Date(Date.now() - 3600000) },
    ];
  }
}
