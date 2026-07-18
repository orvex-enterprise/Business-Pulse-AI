const fs = require('fs');
let content = fs.readFileSync('server/routes/dashboard.ts', 'utf-8');

const targetMockedData = `    const recordsCount = mockRecords.filter((r: any) => r.workspaceId === workspaceId).length;
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

const replacementMockedData = `    if (process.env.DATABASE_URL) {
      const pool = new Pool({ connectionString: process.env.DATABASE_URL });
      
      // Query to aggregate actual orders over the last 7 days
      try {
        const trendQuery = \`
          SELECT TO_CHAR(created_at, 'Dy') as name, SUM(quantity) as value 
          FROM order_items
          JOIN orders ON order_items.order_id = orders.id
          WHERE orders.workspace_id = $1 AND orders.created_at >= NOW() - INTERVAL '7 days'
          GROUP BY TO_CHAR(created_at, 'Dy'), DATE(created_at)
          ORDER BY DATE(created_at) ASC;
        \`;
        const resTrend = await pool.query(trendQuery, [workspaceId]);
        if (resTrend.rows.length > 0) {
          dashboardData.inventoryData = resTrend.rows.map((r: any) => ({ name: r.name, value: parseInt(r.value, 10) }));
        } else {
          dashboardData.inventoryData = [
            { name: 'Mon', value: 0 }, { name: 'Tue', value: 0 }, { name: 'Wed', value: 0 },
            { name: 'Thu', value: 0 }, { name: 'Fri', value: 0 }, { name: 'Sat', value: 0 }, { name: 'Sun', value: 0 }
          ];
        }
        
        const alertQuery = \`
          SELECT CONCAT('Week ', CEIL(EXTRACT(DAY FROM created_at)/7)) as name, COUNT(*) as alerts 
          FROM alerts
          WHERE workspace_id = $1 AND created_at >= NOW() - INTERVAL '28 days'
          GROUP BY CEIL(EXTRACT(DAY FROM created_at)/7)
          ORDER BY name ASC;
        \`;
        const resAlert = await pool.query(alertQuery, [workspaceId]);
        if (resAlert.rows.length > 0) {
          dashboardData.alertData = resAlert.rows.map((r: any) => ({ name: r.name, alerts: parseInt(r.alerts, 10) }));
        } else {
          dashboardData.alertData = [
            { name: 'Week 1', alerts: 0 }, { name: 'Week 2', alerts: 0 },
            { name: 'Week 3', alerts: 0 }, { name: 'Week 4', alerts: 0 }
          ];
        }
      } catch(e) {
        dashboardData.inventoryData = [
          { name: 'Mon', value: 0 }, { name: 'Tue', value: 0 }, { name: 'Wed', value: 0 },
          { name: 'Thu', value: 0 }, { name: 'Fri', value: 0 }, { name: 'Sat', value: 0 }, { name: 'Sun', value: 0 }
        ];
        dashboardData.alertData = [
          { name: 'Week 1', alerts: 0 }, { name: 'Week 2', alerts: 0 },
          { name: 'Week 3', alerts: 0 }, { name: 'Week 4', alerts: 0 }
        ];
      }
    } else {
      // Fallback for CSV
      dashboardData.inventoryData = [
        { name: 'Mon', value: 0 }, { name: 'Tue', value: 0 }, { name: 'Wed', value: 0 },
        { name: 'Thu', value: 0 }, { name: 'Fri', value: 0 }, { name: 'Sat', value: 0 }, { name: 'Sun', value: 0 }
      ];
      dashboardData.alertData = [
        { name: 'Week 1', alerts: 0 }, { name: 'Week 2', alerts: 0 },
        { name: 'Week 3', alerts: 0 }, { name: 'Week 4', alerts: 0 }
      ];
    }`;

content = content.replace(targetMockedData, replacementMockedData);

fs.writeFileSync('server/routes/dashboard.ts', content);
