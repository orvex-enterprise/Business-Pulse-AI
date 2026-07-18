import { mockFiles } from '../routes/connections.js';

export function getWorkspaceMetrics(workspaceId: string) {
  const userFiles = mockFiles.filter(f => f.workspaceId === workspaceId);
  let totalRevenue = 0;
  let totalOrders = 0;
  let totalInventory = 0;
  let uniqueCustomers = 0;
  let topProductsList: string[] = [];

  for (const file of userFiles) {
    if (file.topProducts && Array.isArray(file.topProducts)) {
        topProductsList.push(...file.topProducts);
    }
    
    
    totalOrders += file.recordCount || 0;
    if (file.totalRevenue) totalRevenue += file.totalRevenue;
    uniqueCustomers += file.recordCount || 0;
    if (file.totalInventory) totalInventory += file.totalInventory;

    
    
    
  }
  
  // Deduplicate and limit to 3 top products
  topProductsList = Array.from(new Set(topProductsList)).slice(0, 3);



  return {
    totalRevenue,
    totalOrders,
    totalInventory,
    uniqueCustomers,
    topProductsList,
    totalProducts: userFiles.reduce((sum, f) => sum + (f.recordCount || 0), 0)
  };
}
