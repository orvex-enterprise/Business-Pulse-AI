const fs = require('fs');
let content = fs.readFileSync('src/pages/Dashboard.tsx', 'utf-8');
content = content.replace(/fetch\('\/api\/stocks', \{ method: 'POST'[\s\S]*?\}\)/, '');
content = content.replace(/const stocksRes = await Promise\.all\(\[/, 'const [trendsRes] = await Promise.all([');
content = content.replace(/const stocks = await stocksRes\.json\(\);/, '');
content = content.replace(/if \(trends\.length !== stocks\.stocks\?\.length\) \{/, 'if (false) {');
fs.writeFileSync('src/pages/Dashboard.tsx', content);
