const fs = require('fs');
let content = fs.readFileSync('server/routes/dashboard.ts', 'utf-8');

content = content.replace(/import \{ getWorkspaceMetrics \} from '\.\.\/utils\/metrics\.js';/, `import { getWorkspaceMetrics } from '../utils/metrics.js';\nimport { fetchIndustryNews } from '../services/newsService.js';`);

content = content.replace(/const dashboardData = await agent\.generateDashboard\(industry, userConnections, metrics\);/, `const news = await fetchIndustryNews(industry + ' market trends');
    const dashboardData = await agent.generateDashboard(industry, userConnections, metrics, news);`);

fs.writeFileSync('server/routes/dashboard.ts', content);
