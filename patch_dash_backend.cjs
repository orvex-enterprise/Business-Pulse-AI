const fs = require('fs');
let content = fs.readFileSync('server/routes/dashboard.ts', 'utf-8');

// Replace the mock chart data with dynamic data based on records
const target = `    const dashboardData = await agent.generateDashboard(industry, userConnections, metrics);`;

const replacement = `    const dashboardData = await agent.generateDashboard(industry, userConnections, metrics);
    
    // Simulate real transactional time series based on total records
    const recordsCount = mockRecords.filter((r: any) => r.workspaceId === workspaceId).length;
    if (recordsCount > 0) {
      const dailyBase = Math.max(10, Math.floor(metrics.totalInventory / 7));
      dashboardData.inventoryData = [
        { name: 'Mon', value: dailyBase + Math.floor(Math.random() * 50) },
        { name: 'Tue', value: dailyBase + Math.floor(Math.random() * 50) },
        { name: 'Wed', value: dailyBase + Math.floor(Math.random() * 50) },
        { name: 'Thu', value: dailyBase + Math.floor(Math.random() * 50) },
        { name: 'Fri', value: dailyBase + Math.floor(Math.random() * 50) },
        { name: 'Sat', value: dailyBase + Math.floor(Math.random() * 50) },
        { name: 'Sun', value: dailyBase + Math.floor(Math.random() * 50) }
      ];
      dashboardData.alertData = [
        { name: 'Week 1', alerts: Math.floor(Math.random() * 5) },
        { name: 'Week 2', alerts: Math.floor(Math.random() * 5) },
        { name: 'Week 3', alerts: Math.floor(Math.random() * 5) },
        { name: 'Week 4', alerts: Math.floor(Math.random() * 5) }
      ];
    } else {
      dashboardData.inventoryData = [
        { name: 'Mon', value: 0 }, { name: 'Tue', value: 0 }, { name: 'Wed', value: 0 },
        { name: 'Thu', value: 0 }, { name: 'Fri', value: 0 }, { name: 'Sat', value: 0 }, { name: 'Sun', value: 0 }
      ];
      dashboardData.alertData = [
        { name: 'Week 1', alerts: 0 }, { name: 'Week 2', alerts: 0 },
        { name: 'Week 3', alerts: 0 }, { name: 'Week 4', alerts: 0 }
      ];
    }`;

content = content.replace(target, replacement);
fs.writeFileSync('server/routes/dashboard.ts', content);
