import React from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { useQuery } from '@tanstack/react-query'
import { useSettingsStore } from '@/store/useSettingsStore'
import { Database } from 'lucide-react'
import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'

export function Inventory() {
  const { industry, isDbConnected } = useSettingsStore();

  const { data: inventoryData, isLoading, isError, error } = useQuery({
    queryKey: ['inventory', industry, isDbConnected],
    queryFn: async () => {
      const res = await fetch('/api/inventory', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ industry, workspaceId: 'ws_123' })
      });
      if (!res.ok) throw new Error('Failed to fetch inventory');
      return res.json();
    },
    enabled: isDbConnected, staleTime: 1000 * 60 * 30, retry: false
  });

  const { data: metrics } = useQuery({
    queryKey: ['metrics', isDbConnected],
    queryFn: async () => {
      const workspaceId = localStorage.getItem('currentWorkspaceId') || 'ws_123';
      const res = await fetch(`/api/dashboard/metrics?workspaceId=${workspaceId}`);
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
  }, [metrics]);

  if (!isDbConnected) {
    return (
      <div className="flex flex-col items-center justify-center h-[70vh] text-center space-y-4">
        <Database className="h-12 w-12 text-zinc-400" />
        <h2 className="text-2xl font-bold tracking-tight">No Data Sources Connected</h2>
        <p className="text-zinc-500 max-w-md">
          Connect your database or API in Settings to generate personalized AI insights and analytics.
        </p>
        <Button asChild>
          <Link to="/settings">Go to Settings</Link>
        </Button>
      </div>
    )
  }

  if (isError) {
    return (
      <div className="flex flex-col items-center justify-center h-[70vh] text-center space-y-4">
        <Database className="h-12 w-12 text-red-500" />
        <h2 className="text-2xl font-bold tracking-tight">Failed to generate inventory insights</h2>
        <p className="text-zinc-500 max-w-md">
          {error?.message || "There was an error communicating with the AI service. Please ensure your API quota has not been exceeded."}
        </p>
      </div>
    )
  }

  if (isLoading || !inventoryData) {
    return <div className="flex items-center justify-center h-[50vh]"><p className="text-zinc-500 animate-pulse">Loading AI insights based on your {industry} industry...</p></div>
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Inventory Intelligence</h2>
        <p className="text-zinc-500 dark:text-zinc-400">
          AI-driven inventory monitoring and recommendations.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[
          { title: 'Low Stock Items', value: stats.low.toString(), color: 'text-red-500' },
          { title: 'Overstocked Items', value: stats.over.toString(), color: 'text-yellow-500' },
          { title: 'Healthy/Fast Moving', value: stats.fast.toString(), color: 'text-green-500' },
          { title: 'Total SKUs', value: stats.total.toString(), color: 'text-zinc-900 dark:text-zinc-50' },
        ].map((stat) => (
          <Card key={stat.title}>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className={`text-2xl font-bold ${stat.color}`}>{stat.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Product Recommendations</CardTitle>
          {inventoryData?.marketSentiment && (
            <div className="mt-2 p-3 bg-blue-50 dark:bg-blue-900/20 text-blue-800 dark:text-blue-200 rounded-md text-sm border border-blue-100 dark:border-blue-800/50">
              <span className="font-semibold">AI Market Sentiment:</span> {inventoryData.marketSentiment}
            </div>
          )}
          <CardDescription>Actionable insights based on predictive modeling for {industry}.</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Product Name</TableHead>
                <TableHead>SKU</TableHead>
                <TableHead className="text-right">Quantity</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Prediction</TableHead>
                <TableHead>Recommendation</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {inventoryData?.recommendations?.map((product: any) => (
                <TableRow key={product.id}>
                  <TableCell className="font-medium">{product.item_title || product.product_name || product.name}</TableCell>
                  <TableCell>{product.sku || product.id || 'N/A'}</TableCell>
                  <TableCell className="text-right">{product.quantity_on_hand || product.qty_in_stock || product.quantity}</TableCell>
                  <TableCell>
                    <Badge variant={
                      product.status === 'Critical' ? 'destructive' : 
                      product.status === 'Low Stock' ? 'outline' : 
                      product.status === 'Overstocked' ? 'secondary' : 'default'
                    }>
                      {product.status || 'Active'}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-sm text-zinc-500 dark:text-zinc-400">{product.prediction || 'Stable'}</TableCell>
                  <TableCell className="font-medium">{product.action || 'Monitor'}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
