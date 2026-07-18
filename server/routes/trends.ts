import { Router } from 'express';
import { AIAgent } from '../agents/aiAgent.js';
import { getWorkspaceMetrics } from '../utils/metrics.js';

const router = Router();
const agent = new AIAgent();

router.post('/', async (req, res) => {
  try {
    const { industry, workspaceId = 'ws_123' } = req.body;
    
    if (!industry) {
      return res.status(400).json({ error: 'Industry is required' });
    }
    const metrics = getWorkspaceMetrics(workspaceId);
    const trends = await agent.generateTrends(industry, metrics);
    res.json(trends);
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Failed to generate trends' });
  }
});

router.get('/recommendations', (req, res) => {
  res.json({
    trend: "Protein Coffee",
    confidence: 92,
    recommendation: "Add to inventory."
  });
});

export default router;
