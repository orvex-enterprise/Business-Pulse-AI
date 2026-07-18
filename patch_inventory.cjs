const fs = require('fs');
const content = fs.readFileSync('src/pages/Inventory.tsx', 'utf-8');

const updatedContent = content.replace(
  `  const stats = React.useMemo(() => {
    if (!inventoryItems || !Array.isArray(inventoryItems)) return { low: 0, over: 0, fast: 0, total: 0 };
    let low = 0, over = 0, fast = 0;
    inventoryItems.forEach((product: any) => {
      const qty = product.quantity_on_hand || 0;
      if (qty < 10) low++;
      if (qty > 100) over++;
      if (qty >= 10 && qty <= 100) fast++;
    });
    return { low, over, fast, total: inventoryItems.length };
  }, [inventoryItems]);`,
  `  const { data: metrics } = useQuery({
    queryKey: ['metrics', isDbConnected],
    queryFn: async () => {
      const workspaceId = localStorage.getItem('currentWorkspaceId') || 'ws_123';
      const res = await fetch(\`/api/dashboard/metrics?workspaceId=\${workspaceId}\`);
      if (!res.ok) throw new Error('Failed to fetch metrics');
      return res.json();
    },
    enabled: isDbConnected, staleTime: 1000 * 60 * 5, retry: false
  });

  const stats = React.useMemo(() => {
    if (!metrics) return { low: 0, over: 0, fast: 0, total: 0 };
    return {
      low: metrics.lowStockCount || 0,
      over: metrics.overstockCount || 0,
      total: metrics.totalSkus || 0,
      fast: (metrics.totalSkus || 0) - (metrics.lowStockCount || 0) - (metrics.overstockCount || 0)
    };
  }, [metrics]);`
).replace(
  `                  <TableCell className="font-medium">{product.item_title}</TableCell>
                  <TableCell>{product.id}</TableCell>
                  <TableCell className="text-right">{product.quantity_on_hand}</TableCell>`,
  `                  <TableCell className="font-medium">{product.item_title || product.product_name || product.name}</TableCell>
                  <TableCell>{product.sku || product.id || 'N/A'}</TableCell>
                  <TableCell className="text-right">{product.quantity_on_hand || product.qty_in_stock || product.quantity}</TableCell>`
);

fs.writeFileSync('src/pages/Inventory.tsx', updatedContent);
