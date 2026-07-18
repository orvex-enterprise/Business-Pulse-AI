const fs = require('fs');
let content = fs.readFileSync('src/pages/Dashboard.tsx', 'utf-8');

content = content.replace(
  `  const isLoading = isDashboardLoading || isMetricsFetching; // REMOVE_ME
    inventory: metricsData?.totalInventory || data?.stats?.inventory || 0,
    revenue: metricsData?.totalRevenue || data?.stats?.revenue || 0,
    orders: metricsData?.totalOrders || data?.stats?.orders || 0,
    customers: data?.stats?.customers || 0,
    recommendations: data?.stats?.recommendations || 0,
  };`,
  `  const isLoading = isDashboardLoading || isMetricsFetching;
  const stats = {
    inventory: metricsData?.totalInventory || data?.stats?.inventory || 0,
    revenue: metricsData?.totalRevenue || data?.stats?.revenue || 0,
    orders: metricsData?.totalOrders || data?.stats?.orders || 0,
    customers: metricsData?.customers || data?.stats?.customers || 0,
    recommendations: data?.stats?.recommendations || 0
  };`
);

fs.writeFileSync('src/pages/Dashboard.tsx', content);
