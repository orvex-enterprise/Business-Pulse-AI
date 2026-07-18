const fs = require('fs');
let content = fs.readFileSync('server/routes/stocks.ts', 'utf-8');

content = content.replace(
  `    const stocks = await agent.generateStocks(industry, metrics, news);
    res.json({ stocks, news });
    return;
    res.json(stocks);`,
  `    const stockData = await agent.generateStocks(industry, metrics, news);
    res.json({ ...stockData, news });`
);

fs.writeFileSync('server/routes/stocks.ts', content);
