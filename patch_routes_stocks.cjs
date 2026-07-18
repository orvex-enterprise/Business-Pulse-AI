const fs = require('fs');
let code = fs.readFileSync('server/routes/stocks.ts', 'utf-8');

code = code.replace(/import \{ AIAgent \} from '\.\.\/agents\/aiAgent\.js';/, 
"import { AIAgent } from '../agents/aiAgent.js';\nimport { getWorkspaceMetrics } from '../utils/metrics.js';\nimport { fetchIndustryNews } from '../services/newsService.js';");

code = code.replace(/const \{ industry = 'Tech Retail' \} = req\.body;/, 
"const { industry = 'Tech Retail', workspaceId = 'ws_123' } = req.body;\n    const metrics = getWorkspaceMetrics(workspaceId);\n    const news = await fetchIndustryNews(industry + ' market stocks');");

code = code.replace(/const stocks = await agent\.generateStocks\(industry\);/, 
"const stocks = await agent.generateStocks(industry, metrics, news);\n    res.json({ stocks, news });\n    return;");

fs.writeFileSync('server/routes/stocks.ts', code);
