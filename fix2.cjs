const fs = require('fs');
const lines = fs.readFileSync('src/pages/Dashboard.tsx', 'utf-8').split('\n');
const out = [];
let skip = false;
for (let i = 0; i < lines.length; i++) {
  if (lines[i].includes('const isLoading = isDashboardLoading || isMetricsFetching; // REMOVE_ME')) {
    out.push('  const isLoading = isDashboardLoading || isMetricsFetching;');
    out.push('  const stats = {');
    out.push('    inventory: metricsData?.totalInventory || data?.stats?.inventory || 0,');
    out.push('    revenue: metricsData?.totalRevenue || data?.stats?.revenue || 0,');
    out.push('    orders: metricsData?.totalOrders || data?.stats?.orders || 0,');
    out.push('    customers: metricsData?.customers || data?.stats?.customers || 0,');
    out.push('    recommendations: data?.stats?.recommendations || 0');
    out.push('  };');
    skip = true;
    continue;
  }
  if (skip) {
    if (lines[i].trim() === '};') {
      skip = false;
    }
    continue;
  }
  out.push(lines[i]);
}
fs.writeFileSync('src/pages/Dashboard.tsx', out.join('\n'));
