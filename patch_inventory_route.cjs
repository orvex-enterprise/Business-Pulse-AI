const fs = require('fs');
let content = fs.readFileSync('server/routes/inventory.ts', 'utf-8');

content = content.replace(/import \{ mockRecords \} from '\.\/mockRecords\.js';/, `import { mockRecords } from './mockRecords.js';\nimport { AIAgent } from '../agents/aiAgent.js';\nimport { fetchIndustryNews } from '../services/newsService.js';\nconst agent = new AIAgent();`);

content = content.replace(/router\.post\('\/', async \(req, res\) => \{[\s\S]*?\}\);/, `router.post('/', async (req, res) => {
  try {
    const { industry, workspaceId = 'ws_123' } = req.body;
    
    // Filter records for the workspace
    const workspaceRecords = mockRecords.filter(r => r.workspaceId === workspaceId);
    
    const news = await fetchIndustryNews(industry + ' market trends supply chain');
    const newsDrivenData = await agent.generateNewsDrivenInventory(industry || 'General Business', news, workspaceRecords);
    
    res.json(newsDrivenData);
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Failed to generate inventory' });
  }
});`);

fs.writeFileSync('server/routes/inventory.ts', content);
