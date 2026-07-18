const fs = require('fs');
let content = fs.readFileSync('server/routes/pipeline.ts', 'utf-8');

content = content.replace(/,\s*stockInsights/, '');
content = content.replace(/,\s*aiAgent\.generateStocks\(industry, metrics\)/, '');
content = content.replace(/stocks:\s*stockInsights/, '');

fs.writeFileSync('server/routes/pipeline.ts', content);
