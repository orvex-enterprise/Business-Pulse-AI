const fs = require('fs');
const content = fs.readFileSync('server/routes/dashboard.ts', 'utf-8');
const target = `    if (!process.env.DATABASE_URL) {
      // Fallback for when the DB is not yet connected during evaluation
      return res.json({
        totalSkus: 0,
        totalInventory: 0,
        lowStockCount: 0,
        overstockCount: 0,
        totalRevenue: 0,
        totalOrders: 0
      });
    }`;
const replacement = `    if (!process.env.DATABASE_URL) {
      // Fallback to mockRecords for CSV uploads if DB is not connected
      const records = mockRecords.filter((r: any) => r.workspaceId === workspaceId);
      
      const productStats = new Map<string, { quantity: number; orderCount: number; }>();
      
      let totalInventory = 0;
      let totalRevenue = 0;
      let totalOrders = records.length;
      
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
        totalOrders
      });
    }`;
fs.writeFileSync('server/routes/dashboard.ts', content.replace(target, replacement));
