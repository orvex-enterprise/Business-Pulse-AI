const fs = require('fs');
let code = fs.readFileSync('server/agents/aiAgent.ts', 'utf-8');
code = "import { fetchIndustryNews } from '../services/newsService.js';\n" + code;
fs.writeFileSync('server/agents/aiAgent.ts', code);
