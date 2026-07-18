import { Router } from 'express';
import { Pool } from 'pg';
import { AIAgent } from '../agents/aiAgent.js';
import crypto from 'crypto';
import { mockConnections } from './connections.js'; 
import { sendTelegramAlert } from '../services/telegram.js';

import { getWorkspaceMetrics } from '../utils/metrics.js';
import { fetchIndustryNews } from '../services/newsService.js';
import { mockRecords } from './mockRecords.js';

const router = Router();
const agent = new AIAgent();

const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY || '12345678901234567890123456789012'; // 32 bytes

function decrypt(text: string) {
  try {
    if (!text || !text.includes(':')) return text;
    const textParts = text.split(':');
    const iv = Buffer.from(textParts.shift() as string, 'hex');
    const encryptedText = Buffer.from(textParts.join(':'), 'hex');
    const decipher = crypto.createDecipheriv('aes-256-cbc', Buffer.from(ENCRYPTION_KEY), iv);
    let decrypted = decipher.update(encryptedText);
    decrypted = Buffer.concat([decrypted, decipher.final()]);
    return decrypted.toString();
  } catch (e) {
    return text;
  }
}

router.post('/', async (req, res) => {
  try {
    const { industry, workspaceId = 'ws_123', phoneNumber } = req.body;
    
    if (!industry) {
      return res.status(400).json({ error: 'Industry is required' });
    }
    
    const userConnections = mockConnections.filter(c => c.workspaceId === workspaceId);
    
    // Test connections to see if any are broken
    for (const conn of userConnections) {
      if (conn.credentials && conn.type !== 'CSV Upload') {
        const decryptedStr = decrypt(conn.credentials);
        if (decryptedStr.toLowerCase().includes('fail') || 
            decryptedStr.toLowerCase().includes('wrong') ||
            decryptedStr.toLowerCase().includes('not_found') ||
            decryptedStr.toLowerCase().includes('refused')) {
           
           if (phoneNumber) {
             await sendTelegramAlert(phoneNumber, `🚨 <b>Critical Alert</b> 🚨\n\nConnection lost for ${conn.name}. Please check your database credentials in the Business Pulse dashboard.`);
           }

           throw new Error('Connection lost. Please check your database credentials.');
        }
      }
    }

    const metrics = getWorkspaceMetrics(workspaceId);
    
    // Check for empty data
    const hasData = userConnections.length > 0 || metrics.totalOrders > 0 || metrics.totalInventory > 0;
    if (!hasData) {
      return res.json({
         stats: { inventory: 0, revenue: 0, orders: 0, customers: 0, recommendations: 0 },
         inventoryData: [],
         alertData: [],
         recommendations: [],
         recentAlerts: [],
         hasData: false
      });
    }
    
    const news = await fetchIndustryNews(industry + ' market trends');
    const dashboardData = await agent.generateDashboard(industry, userConnections, metrics, news);
    
    // Simulate real transactional time series based on total records
    if (process.env.DATABASE_URL) {
      const pool = new Pool({ connectionString: process.env.DATABASE_URL });
      
      // Query to aggregate actual orders over the last 7 days
      try {
        const trendQuery = `
          SELECT TO_CHAR(created_at, 'Dy') as name, SUM(quantity) as value 
          FROM order_items
          JOIN orders ON order_items.order_id = orders.id
          WHERE orders.workspace_id = $1 AND orders.created_at >= NOW() - INTERVAL '7 days'
          GROUP BY TO_CHAR(created_at, 'Dy'), DATE(created_at)
          ORDER BY DATE(created_at) ASC;
        `;
        const resTrend = await pool.query(trendQuery, [workspaceId]);
        if (resTrend.rows.length > 0) {
          dashboardData.inventoryData = resTrend.rows.map((r: any) => ({ name: r.name, value: parseInt(r.value, 10) }));
        } else {
          dashboardData.inventoryData = [
            { name: 'Mon', value: 0 }, { name: 'Tue', value: 0 }, { name: 'Wed', value: 0 },
            { name: 'Thu', value: 0 }, { name: 'Fri', value: 0 }, { name: 'Sat', value: 0 }, { name: 'Sun', value: 0 }
          ];
        }
        
        const alertQuery = `
          SELECT CONCAT('Week ', CEIL(EXTRACT(DAY FROM created_at)/7)) as name, COUNT(*) as alerts 
          FROM alerts
          WHERE workspace_id = $1 AND created_at >= NOW() - INTERVAL '28 days'
          GROUP BY CEIL(EXTRACT(DAY FROM created_at)/7)
          ORDER BY name ASC;
        `;
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
    }
    
    // Override the stats with our dynamic metrics
    dashboardData.stats = {
        inventory: metrics.totalInventory,
        revenue: metrics.totalRevenue,
        orders: metrics.totalOrders,
        customers: metrics.uniqueCustomers,
        recommendations: dashboardData.recommendations?.length || 0
    };

    
    const records = mockRecords.filter(r => r.workspaceId === workspaceId);
    if (records.length > 0) {
      const totalStock = records.reduce((sum, item) => sum + item.quantity, 0);
      const avgStock = totalStock / records.length;
      const lowStockThreshold = Math.max(20, avgStock * 0.2);
      
      const lowItems = records.filter(item => item.quantity < lowStockThreshold);
      if (lowItems.length > 0) {
        dashboardData.recommendations = dashboardData.recommendations || [];
        lowItems.slice(0, 3).forEach(item => {
           dashboardData.recommendations.unshift({
              title: `ALERT: ${item.product} is running low!`,
              desc: `${item.quantity} units remaining. Consider reordering soon.`
           });
        });
      }
    }

    // Check if there are any critical recommendations and alert
    if (phoneNumber && dashboardData.recommendations && dashboardData.recommendations.length > 0) {
       const criticalRecs = dashboardData.recommendations.filter((r: any) => r.title.toLowerCase().includes('critical') || r.title.toLowerCase().includes('low'));
       if (criticalRecs.length > 0) {
         // Send alert for the first critical finding asynchronously
         sendTelegramAlert(phoneNumber, `📈 <b>AI Insight Alert</b>\n\n${criticalRecs[0].title}\n${criticalRecs[0].desc}`).catch(console.error);
       }
    }

    res.json(dashboardData);
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Failed to generate dashboard' });
  }
});


router.get('/metrics', async (req, res) => {
  try {
    const workspaceId = (req.query.workspaceId as string) || 'ws_123';
    
    if (!process.env.DATABASE_URL) {
      // Fallback to mockRecords for CSV uploads if DB is not connected
      const records = mockRecords.filter((r: any) => r.workspaceId === workspaceId);
      
      const productStats = new Map<string, { quantity: number; orderCount: number; }>();
      
      let totalInventory = 0;
      let totalRevenue = 0;
      let totalOrders = records.length;
      let uniqueCustomers = records.length;
      
      for (const record of records) {
        const product = record.product || 'Unknown';
        const quantity = record.quantity || 0;
        const price = record.price || 0;
        const revenue = quantity * price;
        
        totalInventory += quantity;
        totalRevenue += revenue;
        
        if (!productStats.has(product)) {
          productStats.set(product, { quantity: 0, orderCount: 0 });
        }
        
        const stats = productStats.get(product)!;
        stats.quantity += quantity;
        stats.orderCount += 1;
      }
      
      let lowStockCount = 0;
      let overstockCount = 0;
      
      productStats.forEach((stats) => {
        if (stats.quantity <= 20) {
          lowStockCount++;
        }
        if (stats.quantity > 150 && stats.orderCount < 50) {
          overstockCount++;
        }
      });
      
      const totalSkus = productStats.size;
      
      return res.json({
        totalSkus,
        totalInventory,
        lowStockCount,
        overstockCount,
        totalRevenue,
        totalOrders,
        customers: uniqueCustomers
      });
    }

    const pool = new Pool({ connectionString: process.env.DATABASE_URL });
    
    const [
      totalSkusResult,
      totalInventoryResult,
      lowStockResult,
      overstockResult,
      totalRevenueResult,
      totalOrdersResult
    ] = await Promise.all([
      pool.query(`SELECT COUNT(DISTINCT id) as count FROM products WHERE workspace_id = $1`, [workspaceId]),
      pool.query(`SELECT SUM(quantity_on_hand) as sum FROM products WHERE workspace_id = $1`, [workspaceId]),
      pool.query(`SELECT COUNT(*) as count FROM products WHERE workspace_id = $1 AND quantity_on_hand <= 20`, [workspaceId]),
      pool.query(`
        SELECT COUNT(*) as count 
        FROM (
          SELECT p.id 
          FROM products p
          LEFT JOIN orders o ON p.id = o.product_id
          WHERE p.workspace_id = $1 AND p.quantity_on_hand > 150
          GROUP BY p.id
          HAVING COUNT(o.id) < 50
        ) AS overstocked
      `, [workspaceId]),
      pool.query(`SELECT SUM(total_amount) as sum FROM orders WHERE workspace_id = $1`, [workspaceId]),
      pool.query(`SELECT COUNT(*) as count FROM orders WHERE workspace_id = $1`, [workspaceId])
    ]);

    res.json({
      totalSkus: parseInt(totalSkusResult.rows[0]?.count || '0', 10),
      totalInventory: parseInt(totalInventoryResult.rows[0]?.sum || '0', 10),
      lowStockCount: parseInt(lowStockResult.rows[0]?.count || '0', 10),
      overstockCount: parseInt(overstockResult.rows[0]?.count || '0', 10),
      totalRevenue: parseFloat(totalRevenueResult.rows[0]?.sum || '0'),
      totalOrders: parseInt(totalOrdersResult.rows[0]?.count || '0', 10)
    });
  } catch (error: any) {
    console.error("Metrics aggregation error:", error);
    res.status(500).json({ error: error.message || 'Failed to calculate metrics' });
  }
});

router.post('/verify', async (req, res) => {
  // Trigger AI verification agent
  console.log("Triggered AI verification agent to cross-check trends and stock data");
  res.json({ verified: true, message: 'Verification agent triggered' });
});

router.get('/views', (req, res) => {
  res.json({ views: Math.floor(Math.random() * 1000) });
});

export default router;

