const fs = require('fs');
let content = fs.readFileSync('server/agents/aiAgent.ts', 'utf-8');
content = content.replace(/console\.error\('Failed to generate news-driven inventory', e\);/g, "console.warn('[AI Agent] Rate limit or error on news inventory, using fallback.');");
fs.writeFileSync('server/agents/aiAgent.ts', content);
