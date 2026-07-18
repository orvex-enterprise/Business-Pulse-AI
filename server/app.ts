import express from 'express';
import authRoutes from './routes/auth';
import dashboardRoutes from './routes/dashboard';
import inventoryRoutes from './routes/inventory';
import trendsRoutes from './routes/trends';

import notificationsRoutes from './routes/notifications';
import connectionsRoutes from './routes/connections';
import pipelineRoutes from './routes/pipeline';
import settingsRoutes from './routes/settings';

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
