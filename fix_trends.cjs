const fs = require('fs');
let code = fs.readFileSync('src/pages/Trends.tsx', 'utf-8');
code = code.replace(/workspaceId: connections\[0\]\?\.workspaceId \|\| ("|')ws_123("|')/g, "workspaceId: 'ws_123'");
fs.writeFileSync('src/pages/Trends.tsx', code);
