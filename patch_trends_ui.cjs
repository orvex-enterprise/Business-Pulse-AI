const fs = require('fs');
let content = fs.readFileSync('src/pages/Trends.tsx', 'utf-8');

let newContent = content.replace(
  `            <p className="text-sm text-zinc-600 dark:text-zinc-400">
              Based on analyzing market data points for <strong>{selectedIndustry}</strong>, we are seeing a strong resurgence in the categories mentioned below. 
              We recommend reallocating marketing spend toward these emerging opportunities.
            </p>`,
  `            <p className="text-sm text-zinc-600 dark:text-zinc-400">
              {trends.summary || \`Based on analyzing market data points for \${selectedIndustry}...\`}
            </p>`
);

newContent = newContent.replace(
  `          <CardContent>
            <div className="text-3xl font-bold mb-2">Bundle Top Items</div>
            <p className="text-sm opacity-90 mb-4">
              Historical data suggests bundling these trending items increases AOV by 32%. Launch before end of month.
            </p>
            <Badge variant="outline" className="border-zinc-700 dark:border-zinc-300">Expected Lift: $45k MRR</Badge>
          </CardContent>`,
  `          <CardContent>
            <div className="text-3xl font-bold mb-2">{trends.topOpportunityTitle || 'Loading...'}</div>
            <p className="text-sm opacity-90 mb-4">
              {trends.topOpportunityDesc || 'Loading opportunity description...'}
            </p>
            <Badge variant="outline" className="border-zinc-700 dark:border-zinc-300">{trends.topOpportunityLift || 'Calculating Lift...'}</Badge>
          </CardContent>`
);

newContent = newContent.replace(
  `{trends.map((trend: any, i: number) => (`,
  `{(trends.categories || []).map((trend: any, i: number) => (`
);

newContent = newContent.replace(
  `// Simple heuristic for trend vs db discrepancy
      if (uiData.length === 0 && databaseData.totalInventory > 0) {`,
  `// Simple heuristic for trend vs db discrepancy
      if (!uiData.categories?.length && databaseData.totalInventory > 0) {`
);

fs.writeFileSync('src/pages/Trends.tsx', newContent);
