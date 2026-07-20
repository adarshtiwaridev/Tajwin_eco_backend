import { DashboardService } from './service.js';
import { ApiResponse } from '#utils/apiResponse.js';
import { asyncHandler } from '#utils/asyncHandler.js';

export const getDashboard = asyncHandler(async (req, res) => {
  const [stats, activities] = await Promise.all([
    DashboardService.getStatistics(),
    DashboardService.getRecentActivities()
  ]);

  const dashboardData = {
    statistics: stats,
    recentActivities: activities,
    systemHealth: {
      serverStatus: 'Online',
      apiStatus: 'Healthy',
      databaseStatus: 'Connected',
    }
  };

  res.status(200).json(new ApiResponse(200, dashboardData, 'Dashboard data fetched successfully'));
});
