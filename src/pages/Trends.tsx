import React from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ArrowUpRight, TrendingUp, Database } from 'lucide-react'
import { useQuery } from '@tanstack/react-query'
import { useSettingsStore } from '@/store/useSettingsStore'
import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'

export function Trends() {
  const { industry: selectedIndustry, isDbConnected } = useSettingsStore();

  const { data: dbData } = useQuery({
    queryKey: ['metrics-trends', isDbConnected],
    queryFn: async () => {
      const res = await fetch('/api/dashboard/metrics?workspaceId=ws_123');
      if (!res.ok) throw new Error('Failed to fetch metrics');
      return res.json();
    },
    enabled: isDbConnected, staleTime: 1000 * 60 * 5
  });

  const { data: trends, isLoading, isError, error } = useQuery({
    queryKey: ['trends', selectedIndustry],
    queryFn: async () => {
      const res = await fetch('/api/trends', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ industry: selectedIndustry, workspaceId: 'ws_123' })
      });
      if (!res.ok) throw new Error('Failed to fetch trends');
      return res.json();
    },
    enabled: isDbConnected, staleTime: 1000 * 60 * 30, retry: false
  });

  React.useEffect(() => {
    const verifyDataIntegrity = async (uiData: any, databaseData: any) => {
      if (!uiData || !databaseData) return;
      // Simple heuristic for trend vs db discrepancy
      if (!uiData.categories?.length && databaseData.totalInventory > 0) {
        console.warn("🚨 Anomaly Detected: Trends data does not match live database metrics.");
        await fetch('/api/dashboard/verify', { method: 'POST' });
      }
    };
    verifyDataIntegrity(trends, dbData);
  }, [trends, dbData]);

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
        <h2 className="text-2xl font-bold tracking-tight">Failed to generate market trends</h2>
        <p className="text-zinc-500 max-w-md">
          {error?.message || "There was an error communicating with the AI service. Please ensure your API quota has not been exceeded."}
        </p>
      </div>
    )
  }

  if (isLoading || !trends) {
    return <div className="flex items-center justify-center h-[50vh]"><p className="text-zinc-500 animate-pulse">AI Agent is analyzing your new dataset...</p></div>
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Market Trends</h2>
        <p className="text-zinc-500 dark:text-zinc-400">
          Discover emerging opportunities and shifting customer preferences for {selectedIndustry}.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              AI Insight Summary
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-zinc-600 dark:text-zinc-400">
              {trends.summary || `Based on analyzing market data points for ${selectedIndustry}...`}
            </p>
            <div className="flex gap-2">
              <Badge variant="secondary">Growth Strategy</Badge>
              <Badge variant="secondary">Q3 Preparation</Badge>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-zinc-900 text-zinc-50 dark:bg-zinc-50 dark:text-zinc-900">
          <CardHeader>
            <CardTitle>Top Opportunity</CardTitle>
            <CardDescription className="text-zinc-400 dark:text-zinc-500">Highest ROI potential</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold mb-2">{trends.topOpportunityTitle || 'Loading...'}</div>
            <p className="text-sm opacity-90 mb-4">
              {trends.topOpportunityDesc || 'Loading opportunity description...'}
            </p>
            <Badge variant="outline" className="border-zinc-700 dark:border-zinc-300">{trends.topOpportunityLift || 'Calculating Lift...'}</Badge>
          </CardContent>
        </Card>
      </div>

      <h3 className="text-lg font-medium mt-8 mb-4">Product Category Forecasts</h3>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {(trends.categories || []).map((trend: any, i: number) => (
          <Card key={i} className="flex flex-col">
            <CardHeader className="pb-2">
              <div className="flex justify-between items-start gap-4">
                <Badge variant="outline" className="mb-2 shrink-0">{trend.category}</Badge>
                <div className={`flex items-center shrink-0 text-sm font-medium ${trend.growth?.startsWith('+') ? 'text-green-500' : 'text-red-500'}`}>
                  {trend.growth}
                  {trend.growth?.startsWith('+') && <ArrowUpRight className="ml-1 h-3 w-3" />}
                </div>
              </div>
              <CardTitle className="text-base leading-tight">{trend.name}</CardTitle>
            </CardHeader>
            
            <CardContent className="flex flex-col flex-grow">
              {trend.analysis && <p className="text-xs text-zinc-600 dark:text-zinc-400 mt-2 mb-4 italic flex-grow">{trend.analysis}</p>}
              <div className="mt-auto space-y-2 pt-4 border-t border-zinc-100 dark:border-zinc-800">
                <div className="flex justify-between text-sm items-center gap-4">
                  <span className="text-zinc-500 shrink-0">Confidence</span>
                  <span className="font-medium text-right truncate">{trend.confidence}</span>
                </div>
                <div className="flex justify-between text-sm items-center gap-4">
                  <span className="text-zinc-500 shrink-0">AI Suggestion</span>
                  <span className="font-medium text-right truncate">{trend.action}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
