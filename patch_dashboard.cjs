const fs = require('fs');
const content = fs.readFileSync('src/pages/Dashboard.tsx', 'utf-8');

const targetStats = `  const stats = {
    inventory: metricsData?.totalInventory || data?.stats?.inventory || 0,
    revenue: metricsData?.totalRevenue || data?.stats?.revenue || 0,
    orders: metricsData?.totalOrders || data?.stats?.orders || 0,
    customers: metricsData?.customers || data?.stats?.customers || 0,
    recommendations: data?.stats?.recommendations || 0
  };`;
  
let newContent = content.replace(
  `const stats = {`,
  `const stats = {
    inventory: metricsData?.totalInventory || data?.stats?.inventory || 0,
    revenue: metricsData?.totalRevenue || data?.stats?.revenue || 0,
    orders: metricsData?.totalOrders || data?.stats?.orders || 0,
    customers: metricsData?.customers || data?.stats?.customers || 0,
    recommendations: data?.stats?.recommendations || 0
  }; // REMOVE_ME`
);
newContent = newContent.replace(targetStats, '');
newContent = newContent.replace(`}; // REMOVE_ME`, `};`);

fs.writeFileSync('src/pages/Dashboard.tsx', newContent);
