import React from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Activity, AlertTriangle, TrendingUp, Database, Box, DollarSign, ShoppingCart, Users } from 'lucide-react'
import { Area, AreaChart, ResponsiveContainer, Tooltip, XAxis, YAxis, BarChart, Bar } from 'recharts'
import { motion } from 'motion/react'
import { useQuery } from '@tanstack/react-query'
import { useSettingsStore } from '@/store/useSettingsStore'
import { Link, useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'

export function Dashboard() {
  const { industry, connections, phoneNumber, isDbConnected } = useSettingsStore();
  const navigate = useNavigate();
  const [views, setViews] = React.useState<number | null>(null);

  React.useEffect(() => {
    fetch('/api/dashboard/views')
      .then(res => res.json())
      .then(d => setViews(d.views))
      .catch(console.error);
  }, []);

  React.useEffect(() => {
    const monitorData = async () => {
      try {
        const workspaceId = localStorage.getItem('currentWorkspaceId') || 'ws_123';
        const trendsRes = await fetch('/api/trends', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ industry, workspaceId }) });
        const trends = await trendsRes.json();
        if (false) {
          console.error("🚨 Anomaly Detected: Mismatch between local inventory trends and broader industry trends.");
          await fetch('/api/dashboard/verify', { method: 'POST' });
        }
      } catch (e) {
        console.error("Monitor error", e);
      }
    };
    
    if (isDbConnected) {
      const interval = setInterval(monitorData, 10000);
      return () => clearInterval(interval);
    }
  }, [isDbConnected, industry]);

  const { data, isLoading: isDashboardLoading, isError, error } = useQuery({
    queryKey: ['dashboard', industry, connections.length],
    queryFn: async () => {
      const workspaceId = localStorage.getItem('currentWorkspaceId') || 'ws_123';
      const res = await fetch('/api/dashboard', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ industry, dataConnections: connections.map(c => c.name), workspaceId, phoneNumber })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to fetch dashboard');
      return data;
    },
    enabled: isDbConnected, staleTime: 1000 * 60 * 30, retry: false
  });

  const { data: metricsData, isFetching: isMetricsFetching } = useQuery({
    queryKey: ['dashboard-metrics', isDbConnected],
    queryFn: async () => {
      const workspaceId = localStorage.getItem('currentWorkspaceId') || 'ws_123';
      const res = await fetch(`/api/dashboard/metrics?workspaceId=${workspaceId}`);
      if (!res.ok) throw new Error('Failed to fetch metrics');
      return await res.json();
    },
    enabled: isDbConnected, staleTime: 1000 * 60 * 5
  });

  const isLoading = isDashboardLoading || isMetricsFetching;

  const stats = {
    inventory: metricsData?.totalInventory || data?.stats?.inventory || 0,
    revenue: metricsData?.totalRevenue || data?.stats?.revenue || 0,
    orders: metricsData?.totalOrders || data?.stats?.orders || 0,
    customers: metricsData?.customers || data?.stats?.customers || 0,
    recommendations: data?.stats?.recommendations || 0
  };

  const inventoryData = data?.inventoryData || [
    { name: 'Mon', value: 0 }, { name: 'Tue', value: 0 }, { name: 'Wed', value: 0 },
    { name: 'Thu', value: 0 }, { name: 'Fri', value: 0 }, { name: 'Sat', value: 0 }, { name: 'Sun', value: 0 }
  ];

  const alertData = data?.alertData || [
    { name: 'Week 1', alerts: 0 }, { name: 'Week 2', alerts: 0 },
    { name: 'Week 3', alerts: 0 }, { name: 'Week 4', alerts: 0 }
  ];

  const recommendations = data?.recommendations || [];
  const recentAlerts = data?.recentAlerts || [];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Overview</h2>
        <p className="text-zinc-500 dark:text-zinc-400 flex justify-between items-center">
          <span>Your business metrics at a glance.</span>
          {views !== null && <span className="text-sm bg-zinc-100 dark:bg-zinc-800 px-2 py-1 rounded">Views: {views}</span>}
        </p>
      </div>

      {(!isDbConnected) && (
        <Card className="border-dashed border-2 border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-900/50">
          <CardContent className="flex flex-col items-center text-center p-8 space-y-4">
            <Database className="h-12 w-12 text-zinc-400" />
            <div>
              <h3 className="text-lg font-semibold text-red-500">Please connect a genuine dashboard.</h3>
            </div>
            <div className="flex flex-wrap items-center justify-center gap-4 mt-4">
              <Button onClick={() => navigate('/settings')} variant="default">
                Connect Database
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {isError && isDbConnected && (
        <div className="flex flex-col items-center justify-center p-8 text-center space-y-4 rounded-lg border border-red-200 bg-red-50 dark:bg-red-950/20 dark:border-red-900">
          <AlertTriangle className="h-12 w-12 text-red-500" />
          <h2 className="text-lg font-bold tracking-tight">
            {error?.message?.includes('Connection lost') ? 'Connection lost' : 'Failed to generate insights'}
          </h2>
          <p className="text-red-500/80 max-w-md text-sm">
            {error?.message?.includes('Connection lost') 
              ? "Connection lost. Please check your database credentials."
              : (error?.message || "There was an error communicating with the AI service. Please ensure your API quota has not been exceeded.")}
          </p>
        </div>
      )}

      {(isLoading && isDbConnected) && (
        <div className="flex items-center justify-center py-8">
          <p className="text-zinc-500 animate-pulse text-sm">Loading AI insights based on your {industry} industry...</p>
        </div>
      )}

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
        {[
          { title: 'Inventory', value: isDbConnected ? (isMetricsFetching ? 'Loading...' : stats.inventory) : 0, icon: Box },
          { title: 'Revenue', value: isDbConnected ? (isMetricsFetching ? 'Loading...' : `$${stats.revenue}`) : '$0', icon: DollarSign },
          { title: 'Orders', value: isDbConnected ? (isMetricsFetching ? 'Loading...' : stats.orders) : 0, icon: ShoppingCart },
          { title: 'Customers', value: isDbConnected ? (isDashboardLoading ? 'Loading...' : stats.customers) : 0, icon: Users },
          { title: 'Recommendations', value: isDbConnected ? (isDashboardLoading ? 'Loading...' : stats.recommendations) : 0, icon: Activity },
        ].map((stat, i) => (
          <motion.div
            key={stat.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
          >
            <Card className={(!isDbConnected) ? "opacity-60" : ""}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
                <stat.icon className="h-4 w-4 text-zinc-500 dark:text-zinc-400" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value}</div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className={`lg:col-span-4 ${(!isDbConnected) ? "opacity-60" : ""}`}>
          <CardHeader>
            <CardTitle>Inventory Trends</CardTitle>
            <CardDescription>Stock movement over the last 7 days.</CardDescription>
          </CardHeader>
          <CardContent className="pl-2">
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={inventoryData}>
                  <defs>
                    <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#18181b" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#18181b" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="name" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis stroke="#888888" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `${value}`} />
                  <Tooltip />
                  <Area type="monotone" dataKey="value" stroke="#18181b" fillOpacity={1} fill="url(#colorValue)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card className={`lg:col-span-3 ${(!isDbConnected) ? "opacity-60" : ""}`}>
          <CardHeader>
            <CardTitle>Alert Frequency</CardTitle>
            <CardDescription>System alerts by week.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={alertData}>
                  <XAxis dataKey="name" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
                  <Tooltip cursor={{ fill: 'transparent' }} />
                  <Bar dataKey="alerts" fill="#18181b" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-2">
         <Card className={(!isDbConnected) ? "opacity-60" : ""}>
          <CardHeader>
            <CardTitle>Market Sentiment & Recommendations</CardTitle>
            <CardDescription>Live dynamic insights from news and AI.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {isDbConnected && data?.marketSentiment && (
                <div className="p-3 bg-blue-50 dark:bg-blue-900/20 text-blue-800 dark:text-blue-200 rounded-md text-sm mb-4 border border-blue-100 dark:border-blue-800/50">
                  <span className="font-semibold block mb-1">Market Sentiment:</span> 
                  {data.marketSentiment}
                </div>
              )}
              {(!isDbConnected) && (
                <p className="text-sm text-zinc-500">Connect a data source to see recommendations.</p>
              )}
              {isDbConnected && recommendations.length === 0 && !isLoading && (
                <p className="text-sm text-zinc-500">No recommendations available.</p>
              )}
              {isDbConnected && recommendations.map((item: any, i: number) => (
                <div key={i} className="flex items-start space-x-4">
                  <div className="mt-1 bg-zinc-100 p-2 rounded-full dark:bg-zinc-800">
                    <TrendingUp className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="text-sm font-medium leading-none">{item.title}</p>
                    <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
        
        <Card className={(!isDbConnected) ? "opacity-60" : ""}>
          <CardHeader>
            <CardTitle>Recent Alerts</CardTitle>
            <CardDescription>Latest system notifications.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {(!isDbConnected) && (
                <>
                  <div className="flex items-center justify-between space-x-4 border-b border-zinc-100 pb-4 last:border-0 last:pb-0 dark:border-zinc-800">
                    <div className="flex items-center space-x-4">
                      <div className={`h-2 w-2 rounded-full bg-red-500`} />
                      <p className="text-sm font-medium leading-none">No Active Data Connections</p>
                    </div>
                  </div>
                  <div className="flex items-center justify-between space-x-4 border-b border-zinc-100 pb-4 last:border-0 last:pb-0 dark:border-zinc-800">
                    <div className="flex items-center space-x-4">
                      <div className={`h-2 w-2 rounded-full bg-red-500`} />
                      <p className="text-sm font-medium leading-none">Inventory Sync Disabled</p>
                    </div>
                  </div>
                </>
              )}
              {(!isDbConnected) && (
                <p className="text-sm text-zinc-500">Connect a data source to see more alerts.</p>
              )}
              {isDbConnected && recentAlerts.length === 0 && !isLoading && (
                <p className="text-sm text-zinc-500">No recent alerts.</p>
              )}
              {isDbConnected && recentAlerts.map((item: any, i: number) => (
                <div key={i} className="flex items-center justify-between space-x-4 border-b border-zinc-100 pb-4 last:border-0 last:pb-0 dark:border-zinc-800">
                  <div className="flex items-center space-x-4">
                    <div className={`h-2 w-2 rounded-full ${item.type === 'critical' ? 'bg-red-500' : item.type === 'success' ? 'bg-green-500' : 'bg-blue-500'}`} />
                    <p className="text-sm font-medium leading-none">{item.title}</p>
                  </div>
                  <span className="text-xs text-zinc-500 dark:text-zinc-400">{item.time}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
