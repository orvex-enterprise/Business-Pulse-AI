const fs = require('fs');
let content = fs.readFileSync('src/pages/Settings.tsx', 'utf-8');
content = content.replace(/queryClient\.invalidateQueries\(\{ queryKey: \['stocks'\] \}\);\n/, '');
fs.writeFileSync('src/pages/Settings.tsx', content);

let dash = fs.readFileSync('src/pages/Dashboard.tsx', 'utf-8');
dash = dash.replace(/broader industry stocks/, 'broader industry trends');
fs.writeFileSync('src/pages/Dashboard.tsx', dash);

let agent = fs.readFileSync('server/agents/aiAgent.ts', 'utf-8');
agent = agent.replace(/console\.log\(`\[AI Agent\] Falling back to mock stocks data\.`\);\n/, '');
fs.writeFileSync('server/agents/aiAgent.ts', agent);
