const fs = require('fs');
let content = fs.readFileSync('src/pages/Stocks.tsx', 'utf-8');

let newContent = content.replace(
  `          <CardContent>
            <div className="text-2xl font-bold text-green-500">Bullish</div>
          </CardContent>`,
  `          <CardContent>
            <div className={\`text-2xl font-bold \${pageData.sentiment === 'Bearish' ? 'text-red-500' : 'text-green-500'}\`}>
              {pageData.sentiment || 'Loading...'}
            </div>
          </CardContent>`
);

newContent = newContent.replace(
  `          <CardContent>
            <div className="text-2xl font-bold">0.82</div>
          </CardContent>`,
  `          <CardContent>
            <div className="text-2xl font-bold">{pageData.correlation || 'Loading...'}</div>
          </CardContent>`
);

newContent = newContent.replace(
  `// Heuristic: If we lack stock recommendations but have active data
      if (uiData.stocks?.length === 0 && databaseData.totalOrders > 0) {`,
  `// Heuristic: If we lack stock recommendations but have active data
      if (!uiData.stocks?.length && databaseData.totalOrders > 0) {`
);

fs.writeFileSync('src/pages/Stocks.tsx', newContent);
