import { Router } from 'express';
import { AIAgent } from '../agents/aiAgent.js';
import { getWorkspaceMetrics } from '../utils/metrics.js';

const router = Router();
const aiAgent = new AIAgent();

// Mock database to save insights since Prisma isn't fully set up with a DB yet
export const mockInsights: any[] = [];

router.post('/run', async (req, res) => {
  const { workspaceId, industry, hasDataConnection, dataSummary } = req.body;

  if (!workspaceId || !industry) {
    return res.status(400).json({ error: 'Missing workspaceId or industry' });
  }

  // Engine ONLY runs if a database is connected and data exists.
  if (!hasDataConnection) {
    return res.status(400).json({ error: 'Cannot run AI pipeline without a connected data source.' });
  }

  if (!dataSummary || dataSummary === 'insufficient') {
    return res.status(400).json({ error: 'Insufficient data to generate meaningful recommendations.' });
  }

  try {
    const metrics = getWorkspaceMetrics(workspaceId);
    
    // 1. Validate DB -> Extract Data -> Identify Business Type -> Run Agents
    // We pass industry and metrics to the agents.
    const [inventoryInsights, trendInsights] = await Promise.all([
      aiAgent.generateInventory(industry, metrics),
      aiAgent.generateTrends(industry, metrics)
    ]);

    // Save insights
    const savedInsights = {
      workspaceId,
      timestamp: new Date().toISOString(),
      inventory: inventoryInsights,
      trends: trendInsights,
      
    };

    mockInsights.push(savedInsights);

    res.json({
      success: true,
      message: 'AI Pipeline completed successfully',
      data: savedInsights
    });
  } catch (error: any) {
    console.error('AI Pipeline error:', error);
    res.status(500).json({ error: 'Failed to run AI Pipeline', details: error.message });
  }
});

export default router;
