const fs = require('fs');
let code = fs.readFileSync('server/agents/aiAgent.ts', 'utf-8');
code = code.replace(/\{ name: 'Emerging Tech', growth: '\+45%', confidence: 'High \(92%\)', action: 'Increase Stock', category: 'Core' \}/,
"{ name: 'Emerging Tech', growth: '+45%', confidence: 'High (92%)', action: 'Increase Stock', category: 'Core', analysis: 'Based on recent headlines, this sector is growing rapidly.' }");
fs.writeFileSync('server/agents/aiAgent.ts', code);
