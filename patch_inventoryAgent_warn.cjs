const fs = require('fs');
let content = fs.readFileSync('server/agents/inventoryAgent.ts', 'utf-8');
content = content.replace(/console\.error\(e\);/g, "console.warn('[Inventory Agent] Analysis fallback used.');");
fs.writeFileSync('server/agents/inventoryAgent.ts', content);
