import { Router } from 'express';

export const workspaceSettings: Record<string, any> = {};

const router = Router();

router.post('/frequency', (req, res) => {
  const { workspaceId, aiFrequency, phoneNumber } = req.body;
  if (workspaceId) {
    workspaceSettings[workspaceId] = {
      ...workspaceSettings[workspaceId],
      aiFrequency,
      phoneNumber
    };
  }
  res.json({ success: true });
});

export default router;
