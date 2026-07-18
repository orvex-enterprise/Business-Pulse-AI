import path from 'path';
import { createServer as createViteServer } from 'vite';
import { app } from './server/app.js';
import { Scheduler } from './server/jobs/scheduler.js';

async function startServer() {
  const PORT = 3000;

  // Start background jobs scheduler
  const scheduler = new Scheduler();
  scheduler.start();

  // Vite middleware for development
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    import('express').then((express) => {
        app.use(express.default.static(distPath));
        app.get('*', (req, res) => {
          res.sendFile(path.join(distPath, 'index.html'));
        });
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
