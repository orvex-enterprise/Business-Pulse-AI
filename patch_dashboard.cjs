const fs = require('fs');
let code = fs.readFileSync('server/routes/dashboard.ts', 'utf-8');

code = code.replace(
  /let globalPool: Pool \| undefined;\s*function getPool\(\) \{[\s\S]*?return globalPool;\s*\}/,
  `let globalPool: Pool | undefined;
function getPool() {
  if (!process.env.DATABASE_URL) return undefined;
  if (!globalPool) {
    globalPool = new Pool({
      connectionString: process.env.DATABASE_URL,
      ssl: process.env.NODE_ENV === 'production' || process.env.DATABASE_URL?.includes('neon.tech') ? { rejectUnauthorized: false } : undefined
    });
  }
  return globalPool;
}

import { mockConnections, decrypt } from './connections.js';
`
);

fs.writeFileSync('server/routes/dashboard.ts', code);
