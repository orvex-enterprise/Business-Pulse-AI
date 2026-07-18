const fs = require('fs');
let content = fs.readFileSync('server/app.ts', 'utf-8');

content += `
// Catch-all for API routes to return JSON
app.use('/api', (req, res) => {
  res.status(404).json({ error: 'API endpoint not found: ' + req.method + ' ' + req.url });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('Unhandled Server Error:', err);
  res.status(500).json({ error: 'Internal Server Error: ' + err.message });
});
`;

fs.writeFileSync('server/app.ts', content);
