const fs = require('fs');
let content = fs.readFileSync('server/agents/aiAgent.ts', 'utf-8');
content = content.replace(/gemini-3\.5-flash/g, 'gemini-1.5-flash');
fs.writeFileSync('server/agents/aiAgent.ts', content);
