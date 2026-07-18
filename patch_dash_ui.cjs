const fs = require('fs');
let content = fs.readFileSync('src/pages/Dashboard.tsx', 'utf-8');

const target = `<CardTitle>Today's Recommendations</CardTitle>
            <CardDescription>AI-driven insights for your business.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {(!isDbConnected) && (
                <p className="text-sm text-zinc-500">Connect a data source to see recommendations.</p>
              )}`;

const replacement = `<CardTitle>Market Sentiment & Recommendations</CardTitle>
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
              )}`;

content = content.replace(target, replacement);

fs.writeFileSync('src/pages/Dashboard.tsx', content);
