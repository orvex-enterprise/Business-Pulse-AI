const fs = require('fs');
let code = fs.readFileSync('server/routes/trends.ts', 'utf-8');

code = code.replace(/import \{ AIAgent \} from '\.\.\/agents\/aiAgent\.js';/, 
"import { AIAgent } from '../agents/aiAgent.js';\nimport { getWorkspaceMetrics } from '../utils/metrics.js';");

code = code.replace(/const \{ industry = 'Tech Retail' \} = req\.body;/, 
"const { industry = 'Tech Retail', workspaceId = 'ws_123' } = req.body;\n    const metrics = getWorkspaceMetrics(workspaceId);");

code = code.replace(/const trends = await agent\.generateTrends\(industry\);/, 
"const trends = await agent.generateTrends(industry, metrics);");

fs.writeFileSync('server/routes/trends.ts', code);
