const fs = require('fs');
let code = fs.readFileSync('src/pages/Trends.tsx', 'utf-8');

code = code.replace(/body: JSON\.stringify\(\{ industry \}\)/, 'body: JSON.stringify({ industry, workspaceId: connections[0]?.workspaceId || "ws_123" })');

const analysisReplacement = `
            <CardContent>
              {trend.analysis && <p className="text-xs text-zinc-600 dark:text-zinc-400 mt-2 mb-4 italic">{trend.analysis}</p>}
              <div className="flex justify-between text-sm mt-2">
`;

code = code.replace(/<CardContent>\s*<div className="flex justify-between text-sm mt-4">/, analysisReplacement);

fs.writeFileSync('src/pages/Trends.tsx', code);
