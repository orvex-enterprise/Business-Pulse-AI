import { Router } from 'express';
import { mockRecords } from './mockRecords.js';
import { AIAgent } from '../agents/aiAgent.js';
import { fetchIndustryNews } from '../services/newsService.js';
const agent = new AIAgent();

const router = Router();

router.post('/', async (req, res) => {
  try {
    const { industry, workspaceId = 'ws_123' } = req.body;
    
    // Filter records for the workspace
    const workspaceRecords = mockRecords.filter((r: any) => r.workspaceId === workspaceId);
    
    const news = await fetchIndustryNews(industry + ' market trends supply chain');
    const newsDrivenData = await agent.generateNewsDrivenInventory(industry || 'General Business', news, workspaceRecords);
    
    res.json(newsDrivenData);
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Failed to generate inventory' });
  }
});

export default router;
