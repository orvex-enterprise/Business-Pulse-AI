import express from 'express';
import authRoutes from './routes/auth.js';
import dashboardRoutes from './routes/dashboard.js';
import inventoryRoutes from './routes/inventory.js';
import trendsRoutes from './routes/trends.js';

import notificationsRoutes from './routes/notifications.js';
import connectionsRoutes from './routes/connections.js';
import pipelineRoutes from './routes/pipeline.js';
import settingsRoutes from './routes/settings.js';

export const app = express();
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/inventory', inventoryRoutes);
app.use('/api/trends', trendsRoutes);

app.use('/api/notifications', notificationsRoutes);
app.use('/api/connections', connectionsRoutes);
app.use('/api/pipeline', pipelineRoutes);
app.use('/api/settings', settingsRoutes);

// Catch-all for API routes to return JSON
app.use('/api', (req, res) => {
  res.status(404).json({ error: 'API endpoint not found: ' + req.method + ' ' + req.url });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('Unhandled Server Error:', err);
  res.status(500).json({ error: 'Internal Server Error: ' + err.message });
});
