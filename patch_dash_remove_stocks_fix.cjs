const fs = require('fs');
let content = fs.readFileSync('src/pages/Dashboard.tsx', 'utf-8');

const target = `        const [trendsRes, stocksRes] = await Promise.all([
          fetch('/api/trends', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ industry, workspaceId }) }),
          
        ]);
        const trends = await trendsRes.json();
        
        
        // simple heuristic: if trends and stocks don't map perfectly or sizes differ
        if (false) {`;

content = content.replace(/const \[trendsRes, stocksRes\] = await Promise\.all\(\[[\s\S]*?\]\);/, `const trendsRes = await fetch('/api/trends', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ industry, workspaceId }) });`);

content = content.replace(/const trends = await trendsRes\.json\(\);[\s\S]*?if \(false\) \{/, `const trends = await trendsRes.json();
        if (false) {`);

fs.writeFileSync('src/pages/Dashboard.tsx', content);
