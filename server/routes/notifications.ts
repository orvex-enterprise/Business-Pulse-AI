import { Router } from 'express';

const router = Router();

router.get('/', (req, res) => {
  res.json([
    { title: 'Inventory Critical: SKU APP-MBP-16', channel: 'WhatsApp', time: '10:42 AM', date: 'Today', priority: 'CRITICAL' },
    { title: 'Weekly Trend Report Ready', channel: 'Email', time: '08:00 AM', date: 'Today', priority: 'LOW' },
  ]);
});

router.post('/settings', (req, res) => {
  res.json({ success: true, message: 'Settings updated' });
});

export default router;
